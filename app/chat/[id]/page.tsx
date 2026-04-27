'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { socket } from "@/app/lib/socket";
import { supabase } from '@/app/lib/supabase';

export default function ChatRoomPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params?.id as string;
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState({ id: '', nickname: '로딩중...' });
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 1. 현재 로그인한 내 정보 가져오기
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('user')
                    .select('nickname')
                    .eq('id', user.id)
                    .single();
                
                setCurrentUser({
                    id: user.id,
                    nickname: profile?.nickname || '익명'
                });
            }
        };
        fetchUser();
    }, []);

    // 2. 참여자 목록 로드
    const fetchParticipants = async () => {
        if (!roomId) return;
        try {
            const isNumeric = /^\d+$/.test(roomId);
            if (isNumeric) {
                const { data } = await supabase
                    .from('meeting_participant')
                    .select(`role, user_id, user:user_id ( id, nickname, bio )`)
                    .eq('meeting', parseInt(roomId, 10));
                if (data) setParticipants(data);
            } else {
                const { data } = await supabase
                    .from('chat_room_participant')
                    .select(`user_id, user:user_id ( id, nickname, bio )`)
                    .eq('room_id', roomId);
                if (data) setParticipants(data);
            }
        } catch (err) {
            console.error("참여자 목록 로드 에러:", err);
        }
    };

    useEffect(() => { fetchParticipants(); }, [roomId]);

    // 3. 메시지 로드 및 소켓 설정
    useEffect(() => {
        if (!roomId || !currentUser.id) return;
        
        const fetchOldMessages = async () => {
            const { data } = await supabase
                .from('chat_message')
                .select(`*, user:sender_id ( nickname )`)
                .eq('room_id', roomId)
                .order('sent_at', { ascending: true });

            if (data) {
                const formatted = data.map((msg: any) => ({
                    id: msg.id,
                    sender: msg.user?.nickname || '알 수 없는 유저',
                    content: msg.content,
                    time: new Date(msg.sent_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
                    isMine: msg.sender_id === currentUser.id,
                }));
                setMessages(formatted);
            }
            setLoading(false);
        };

        fetchOldMessages();
        socket.emit('join_room', roomId);
        
        const handleReceiveMessage = (data: any) => {
            if (data.sender_id !== currentUser.id) {
                setMessages((prev) => [...prev, {
                    id: Date.now(),
                    sender: data.sender,
                    content: data.message,
                    time: data.time,
                    isMine: false,
                }]);
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        return () => { socket.off('receive_message', handleReceiveMessage); };
    }, [roomId, currentUser.id]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    // 4. 메시지 전송
    const handleSendMessage = async () => {
        if (!message.trim() || !currentUser.id) return;

        const opponent = participants.find(p => (p.user?.id || p.user_id) !== currentUser.id);
        const opponentId = opponent?.user?.id || opponent?.user_id;
        const timeNow = new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

        if (opponentId) {
            await supabase.from("notifications").insert([{ user_id: opponentId, sender_id: currentUser.id, type: "chat" }]);
        }

        socket.emit('send_message', { 
            room: roomId, message, sender_id: currentUser.id, sender: currentUser.nickname, time: timeNow, receiver_id: opponentId 
        });

        setMessages((prev) => [...prev, {
            id: Date.now(), sender: currentUser.nickname, content: message, time: timeNow, isMine: true,
        }]);

        setMessage('');
    };

    // 5. [핵심 추가] 방 나가기 로직
    const handleLeaveRoom = async () => {
        if (!window.confirm("정말 이 채팅방을 나가시겠습니까? 참여 목록에서 삭제됩니다.")) return;

        try {
            const isNumeric = /^\d+$/.test(roomId);
            const table = isNumeric ? 'meeting_participant' : 'chat_room_participant';
            const column = isNumeric ? 'meeting' : 'room_id';
            const filterValue = isNumeric ? parseInt(roomId, 10) : roomId;

            // 내 참여 정보 삭제
            const { error } = await supabase
                .from(table)
                .delete()
                .eq(column, filterValue)
                .eq('user_id', currentUser.id);

            if (error) throw error;

            // 남은 인원 확인 후 방 삭제 (선택 사항)
            const { data: remaining } = await supabase.from(table).select('id').eq(column, filterValue);
            if (!remaining || remaining.length === 0) {
                if (!isNumeric) {
                    await supabase.from('chat_room').delete().eq('id', roomId);
                }
            }

            alert("채팅방을 나갔습니다.");
            router.push('/chat');
        } catch (err) {
            console.error("나가기 실패:", err);
            alert("방을 나가는 중 오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600 animate-pulse">낙낙 로딩 중...</div>;

    return (
        <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden relative font-sans">
            <div className="flex-1 w-full max-w-2xl mx-auto h-full flex flex-col p-4">
                <div className="flex-1 bg-white rounded-[40px] border border-neutral-200 shadow-2xl flex flex-col relative overflow-hidden">
                    <header className="flex items-center justify-between px-8 py-6 border-b border-neutral-50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/chat')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-xl font-bold">←</button>
                            <h1 className="text-xl font-black text-gray-950">Chat Room 💬</h1>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full font-black text-xl">⋮</button>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[#fdfdfd]">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                                {!msg.isMine && <span className="text-[11px] font-bold text-gray-400 mb-1 ml-1">{msg.sender}</span>}
                                <div className={`flex items-end gap-2 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                                    <div className={`px-5 py-3 rounded-[24px] text-[14px] font-medium max-w-[260px] shadow-sm ${
                                        msg.isMine ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-neutral-100 text-gray-900 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-300 pb-1 font-medium">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </main>

                    <footer className="p-6 border-t border-neutral-50 bg-white">
                        <div className="flex items-center gap-3 bg-neutral-50 rounded-[28px] px-6 py-3 border border-neutral-100 focus-within:border-blue-300 transition-all">
                            <input 
                                className="flex-1 bg-transparent text-sm outline-none py-2 font-medium" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="따뜻한 메시지를 남겨보세요..." 
                            />
                            <button onClick={handleSendMessage} className="bg-blue-600 text-white px-6 py-2.5 rounded-[20px] text-xs font-black shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all">전송</button>
                        </div>
                    </footer>
                </div>
            </div>

            {/* 사이드바 - 나가기 버튼 추가 */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
                    <div className="relative w-80 h-full bg-white shadow-2xl flex flex-col p-8 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="font-black text-gray-950 text-2xl tracking-tighter">참여자 ({participants.length})</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 text-2xl hover:rotate-90 transition-transform">✕</button>
                        </div>
                        
                        <div className="space-y-5 overflow-y-auto flex-1 no-scrollbar">
                            {participants.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-blue-50/50 transition-all cursor-pointer" onClick={() => router.push(`/profile/${p.user?.id || p.user_id}`)}>
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-md">
                                        {p.user?.nickname?.[0] || '👤'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[15px] font-black text-gray-900 truncate">{p.user?.nickname || "알 수 없음"}</span>
                                            {p.role === 'host' && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">HOST</span>}
                                        </div>
                                        <p className="text-[12px] text-gray-400 truncate mt-0.5 font-medium">{p.user?.bio || "KNOCK KNOCK 유저입니다."}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* [나가기 버튼 영역] */}
                        <div className="mt-8 space-y-3">
                            <button onClick={handleLeaveRoom} className="w-full py-5 bg-red-50 text-red-600 rounded-[24px] text-sm font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">방 나가기</button>
                            <button onClick={() => setIsSidebarOpen(false)} className="w-full py-5 bg-neutral-100 text-gray-500 rounded-[24px] text-sm font-black">닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { supabase } from '@/app/lib/supabase';

// Railway 혹은 로컬 소켓 서버 주소
const socket = io("http://localhost:5000");

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

    // 2. 참여자 목록 (단체/개인 통합 로직)
    useEffect(() => {
        if (!roomId) return;

        const fetchParticipants = async () => {
            try {
                // 단체 채팅(숫자 ID) 판별
                const isNumeric = /^\d+$/.test(roomId);
                
                if (isNumeric) {
                    const { data, error } = await supabase
                        .from('meeting_participant')
                        .select(`
                            role,
                            user_id,
                            user:user_id ( id, nickname, bio )
                        `)
                        .eq('meeting', parseInt(roomId, 10));

                    if (!error && data && data.length > 0) {
                        setParticipants(data);
                        return;
                    }
                }

                // 개인 채팅 참여자 조회
                const { data: privateData } = await supabase
                    .from('chat_room_participant')
                    .select(`
                        user_id,
                        user:user_id ( id, nickname, bio )
                    `)
                    .eq('room_id', roomId);
                
                if (privateData) setParticipants(privateData);

            } catch (err) {
                console.error("참여자 목록 로드 에러:", err);
            }
        };

        fetchParticipants();
    }, [roomId]);

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
    const handleSendMessage = () => {
        if (!message.trim() || !currentUser.id) return;
        const timeNow = new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

        socket.emit('send_message', { 
            room: roomId, message, sender_id: currentUser.id, sender: currentUser.nickname, time: timeNow 
        });

        setMessages((prev) => [...prev, {
            id: Date.now(), sender: currentUser.nickname, content: message, time: timeNow, isMine: true,
        }]);
        setMessage('');
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600 animate-pulse">낙낙 로딩 중...</div>;

    return (
        <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden relative">
            <div className="flex-1 w-full max-w-2xl mx-auto h-full flex flex-col p-4">
                <div className="flex-1 bg-white rounded-3xl border border-neutral-200 shadow-lg flex flex-col relative overflow-hidden">
                    
                    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/chat')} className="p-2 hover:bg-neutral-100 rounded-full">←</button>
                            <h1 className="text-lg font-bold text-gray-950">채팅방 💬</h1>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full font-black">⋮</button>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                                {!msg.isMine && <span className="text-[11px] text-gray-400 mb-1 ml-1">{msg.sender}</span>}
                                <div className={`flex items-end gap-2 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[240px] ${
                                        msg.isMine ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-neutral-100 text-gray-900 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-gray-300 pb-1">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </main>

                    <footer className="p-4 border-t border-neutral-100">
                        <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl px-4 py-2 border border-neutral-200">
                            <input 
                                className="flex-1 bg-transparent text-sm outline-none py-2" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="메시지를 입력하세요..." 
                            />
                            <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">전송</button>
                        </div>
                    </footer>
                </div>
            </div>

            {/* 참여자 사이드바 - 프로필 연결 포함 */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <div className="relative w-80 h-full bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-right">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-black text-gray-950 text-xl">참여자 ({participants.length})</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400">✕</button>
                        </div>
                        
                        <div className="space-y-4 overflow-y-auto flex-1 no-scrollbar">
                            {participants.map((p, i) => (
                                <div 
                                    key={i} 
                                    className="flex items-center gap-4 border-b border-neutral-50 pb-4 cursor-pointer hover:bg-blue-50/50 p-2 rounded-2xl transition-all"
                                    onClick={() => {
                                        const targetId = p.user?.id || p.user_id;
                                        if (targetId) router.push(`/profile/${targetId}`);
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                        {p.user?.nickname?.[0] || '👤'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900 truncate">{p.user?.nickname || "알 수 없음"}</span>
                                            {p.role === 'host' && <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">방장</span>}
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate mt-1">{p.user?.bio || "자기소개가 없어요."}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="mt-6 w-full py-4 bg-neutral-950 text-white rounded-2xl text-sm font-bold">닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
}
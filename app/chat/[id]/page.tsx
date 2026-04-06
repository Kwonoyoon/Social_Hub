'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { supabase } from '@/app/lib/supabase';

// 백엔드 서버 주소 (포트 5000)
const socket = io("http://localhost:5000");

const INITIAL_MESSAGES = [
    { id: 'system-1', sender: '시스템', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712010.png', type: 'text', content: '채팅방에 입장하셨습니다.', time: '', isMine: false },
];

export default function ChatRoomPolished() {
    const router = useRouter();
    const params = useParams();
    const roomId = params?.id as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]); // 참여자 목록 상태

    // 내 정보 상태 관리
    const [currentUser, setCurrentUser] = useState({
        id: '', 
        nickname: '로딩중...',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 1. 내 정보(UUID) 가져오기
    useEffect(() => {
        const fetchMyInfo = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: userData } = await supabase
                    .from('user')
                    .select('nickname')
                    .eq('id', user.id)
                    .single();

                if (userData) {
                    setCurrentUser({
                        id: user.id,
                        nickname: userData.nickname,
                        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.nickname}`
                    });
                }
            }
        };
        fetchMyInfo();
    }, []);

    // 2. 과거 대화 내역 DB에서 불러오기
    useEffect(() => {
        const fetchOldMessages = async () => {
            if (!roomId || !currentUser.id) return;

            const { data, error } = await supabase
                .from('chat_message')
                .select(`
                    *,
                    user:sender_id ( nickname )
                `)
                .eq('room_id', roomId)
                .order('sent_at', { ascending: true });

            if (data) {
                const formattedMsgs = data.map((msg: any) => ({
                    id: msg.id,
                    sender: msg.user?.nickname || '알 수 없는 유저',
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.user?.nickname}`,
                    type: 'text',
                    content: msg.content,
                    time: new Date(msg.sent_at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
                    isMine: msg.sender_id === currentUser.id,
                }));
                setMessages([...INITIAL_MESSAGES, ...formattedMsgs]);
            }
        };

        fetchOldMessages();
    }, [roomId, currentUser.id]);

    // 3. 소켓 연결 및 실시간 메시지 수신
    useEffect(() => {
        if (!roomId || !currentUser.id) return;

        socket.emit('join_room', roomId);

        const handleReceive = (data: any) => {
            if (data.sender_id !== currentUser.id) {
                const incomingMessage = {
                    id: Date.now(),
                    sender: data.sender,
                    avatar: data.avatar,
                    type: 'text',
                    content: data.message,
                    time: data.time,
                    isMine: false,
                };
                setMessages((prev) => [...prev, incomingMessage]);
            }
        };

        socket.on('receive_message', handleReceive);

        return () => {
            socket.off('receive_message', handleReceive);
        };
    }, [roomId, currentUser.id]);

    // 4. 사이드바 열릴 때 참여자 정보 가져오기
    useEffect(() => {
        const fetchParticipants = async () => {
            if (!roomId) return;
            const { data } = await supabase
                .from('chat_room_participant')
                .select(`user:user_id ( id, nickname )`)
                .eq('room_id', roomId);
            
            if (data) {
                const list = data.map((p: any) => ({
                    id: p.user.id,
                    nickname: p.user.nickname,
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user.nickname}`
                }));
                setParticipants(list);
            }
        };

        if (isSidebarOpen) fetchParticipants();
    }, [isSidebarOpen, roomId]);

    // 메시지 수신 시 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 5. 메시지 전송 로직
    const handleSendMessage = () => {
        if (!message.trim() || !currentUser.id) return;

        const timeNow = new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

        socket.emit('send_message', {
            room: roomId,
            message: message,
            sender_id: currentUser.id,
            sender: currentUser.nickname,
            avatar: currentUser.avatar,
            type: 'text',
            time: timeNow
        });

        const newMessage = {
            id: Date.now(),
            sender: currentUser.nickname,
            avatar: currentUser.avatar,
            type: 'text',
            content: message,
            time: timeNow,
            isMine: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setMessage('');
    };

    // 6. 채팅방 나가기 로직
    const handleLeaveChat = async () => {
        if (!confirm("정말 채팅방을 나가시겠습니까?\n나간 채팅방은 목록에서 삭제됩니다.")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/chat/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    roomId: roomId
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("성공적으로 나갔습니다.");
                router.push('/chat'); // 리스트 페이지로 이동
            } else {
                alert("나가기 처리에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden relative">
            <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-12 h-full min-h-0 flex flex-col">
                <div className="flex-1 bg-white rounded-3xl border border-neutral-200 shadow-lg flex flex-col relative overflow-hidden min-h-0">
                    
                    {/* 상단 헤더 */}
                    <header className="flex-shrink-0 flex items-center justify-between px-6 lg:px-8 py-5 border-b border-neutral-100 bg-white z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/chat')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-950 flex items-center gap-2">
                                    KNOCK KNOCK 채팅방 <span className="text-blue-600">💬</span>
                                </h1>
                                <p className="text-sm lg:text-base text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    {currentUser.nickname}님으로 접속 중
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 7a2 2 0 100-4 2 2 0 000 4zM12 14a2 2 0 100-4 2 2 0 000 4zM12 21a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </button>
                    </header>

                    {/* 채팅 메시지 영역 */}
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-white no-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 lg:gap-5 ${msg.isMine ? 'justify-end' : ''}`}>
                                {!msg.isMine && (
                                    <img src={msg.avatar} alt={msg.sender} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-neutral-100 shadow-sm bg-neutral-100" />
                                )}
                                <div className={`flex flex-col ${msg.isMine ? 'items-end' : ''}`}>
                                    <span className="text-sm lg:text-base font-medium text-gray-700 mb-1.5">{msg.sender}</span>
                                    <div className={`flex items-end gap-2.5 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                                        <div className={`px-5 py-3.5 lg:px-6 lg:py-4 border rounded-2xl lg:rounded-3xl shadow-sm max-w-[240px] md:max-w-md lg:max-w-xl text-sm lg:text-base ${msg.isMine ? 'bg-blue-600 border-blue-600 text-white rounded-tr-none' : 'bg-white border-neutral-200 text-gray-950 rounded-tl-none'}`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-xs lg:text-sm text-gray-400 mb-1 flex-shrink-0">{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </main>

                    {/* 하단 입력창 */}
                    <footer className="flex-shrink-0 border-t border-neutral-100 bg-white px-6 py-4 lg:px-8 lg:py-6 z-20">
                        <div className="flex items-center gap-3">
                            <button className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 border-[2.5px] border-gray-800 rounded-[14px] lg:rounded-2xl flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-[14px] lg:rounded-2xl flex items-center pl-5 pr-2 py-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent text-gray-950 text-sm lg:text-base focus:outline-none placeholder-gray-400 py-2"
                                    placeholder="메시지를 입력하세요..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button onClick={handleSendMessage} className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 bg-blue-600 hover:bg-blue-700 rounded-[10px] lg:rounded-xl flex items-center justify-center text-white ml-2 transition-colors shadow-lg shadow-blue-100">
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* --- 우측 사이드바 UI --- */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
                        onClick={() => setIsSidebarOpen(false)} 
                    />
                    
                    <div className="relative w-[320px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <header className="px-6 py-6 border-b border-neutral-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">채팅방 정보</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-50 rounded-full text-gray-400">
                                ✕
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                                참여자 {participants.length}명
                            </h3>
                            <div className="space-y-5">
                                {participants.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <img src={member.avatar} className="w-10 h-10 rounded-full border border-neutral-100 bg-neutral-50" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900">
                                                {member.nickname} 
                                                {member.id === currentUser.id && <span className="text-blue-500 ml-1">나</span>}
                                            </p>
                                            <p className="text-[11px] text-gray-400">멤버</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <footer className="p-6 border-t border-neutral-50 space-y-3">
                            <button className="w-full py-4 bg-neutral-50 hover:bg-neutral-100 text-gray-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                채팅방 초대하기
                            </button>
                            <button 
                                onClick={handleLeaveChat} // 👈 나가기 API 연결
                                className="w-full py-4 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                채팅방 나가기
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
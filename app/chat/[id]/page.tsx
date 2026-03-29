'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io } from 'socket.io-client';
// 💡 Supabase 불러오기 (경로가 다르면 파일 위치에 맞게 수정해주세요!)
import { supabase } from '@/app/lib/supabase'; 

const socket = io("http://localhost:5000");

// --- 더미 데이터 영역 (초기 화면용) ---
const INITIAL_MESSAGES = [
    { id: 1, sender: '시스템', avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712010.png', type: 'text', content: '채팅방에 입장하셨습니다.', time: '', isMine: false },
];

const DUMMY_PARTICIPANTS = [
    { id: 1, name: '방장', role: '방장', isMe: false, avatar: 'https://loremflickr.com/200/200/girl,face?random=10' },
];

// 예쁜 색감이 들어간 첨부 칩 컴포넌트
const AttachmentChip = ({ text, icon, iconColor }: { text: string; icon: React.ReactNode; iconColor: string }) => (
    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors text-sm font-medium text-gray-700 bg-white shadow-sm">
        <div className={iconColor}>{icon}</div>
        {text}
    </button>
);

export default function ChatRoomPolished() {
    const router = useRouter();
    const params = useParams();
    const roomId = params?.id as string; 

    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [message, setMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
    
    // 💡 로그인한 내 진짜 정보를 담아둘 공간
    const [currentUser, setCurrentUser] = useState({
        nickname: '로딩중...',
        avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' // 기본 프로필 사진
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 💡 1. 페이지 접속 시 Supabase에서 내 닉네임 가져오기
    useEffect(() => {
        const fetchMyInfo = async () => {
            // 현재 로그인된 유저 확인
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // user 테이블에서 내 nickname 찾아오기
                const { data: userData, error } = await supabase
                    .from('user') // ERD에 적힌 테이블 이름
                    .select('nickname')
                    .eq('id', user.id)
                    .single();

                if (userData) {
                    setCurrentUser({
                        nickname: userData.nickname,
                        // DB에 프사 컬럼이 없으므로, 닉네임 기반으로 랜덤 로봇 프사 생성 (임시)
                        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.nickname}`
                    });
                }
            } else {
                setCurrentUser({ nickname: '익명유저', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' });
            }
        };

        fetchMyInfo();
    }, []);

    // 💡 2. 소켓 연결 및 메시지 수신 세팅
    useEffect(() => {
        if (!roomId) return;

        socket.emit('join_room', roomId);

        socket.on('receive_message', (data) => {
            const incomingMessage = {
                id: Date.now(), 
                sender: data.sender, // 👈 보낸 사람의 진짜 닉네임
                avatar: data.avatar, // 👈 보낸 사람의 프로필 사진
                type: data.type || 'text',
                content: data.message,
                time: data.time,
                isMine: false, 
            };
            setMessages((prev) => [...prev, incomingMessage]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 💡 3. 메시지 보낼 때 내 진짜 정보 같이 쏘기
    const handleSendMessage = () => {
        if (!message.trim()) return;

        const timeNow = new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

        socket.emit('send_message', { 
            room: roomId, 
            message: message,
            sender: currentUser.nickname, // 👈 고정된 '나' 대신 진짜 닉네임 전송!
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
        
        setMessages([...messages, newMessage]);
        setMessage('');
        setIsAttachmentOpen(false);
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden">
            {/* 화면 중앙 메인 컨테이너 */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-12 h-full min-h-0 flex flex-col">
                <div className="flex-1 bg-white rounded-3xl border border-neutral-200 shadow-lg flex flex-col relative overflow-hidden min-h-0">
                    
                    {/* 헤더 */}
                    <header className="flex-shrink-0 flex items-center justify-between px-6 lg:px-8 py-5 border-b border-neutral-100 bg-white z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.push('/chat')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-950 flex items-center gap-2">
                                    knock knock 채팅방 <span className="text-blue-600">💬</span>
                                </h1>
                                <p className="text-sm lg:text-base text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    {currentUser.nickname}님 환영합니다!
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 7a2 2 0 100-4 2 2 0 000 4zM12 14a2 2 0 100-4 2 2 0 000 4zM12 21a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </button>
                    </header>

                    {/* 메시지 리스트 영역 */}
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-white">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 lg:gap-5 ${msg.isMine ? 'justify-end' : ''}`}>
                                <img src={msg.avatar} alt={msg.sender} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-neutral-100 shadow-sm bg-neutral-100" />
                                <div className={`flex flex-col ${msg.isMine ? 'items-end' : ''}`}>
                                    <span className="text-sm lg:text-base font-medium text-gray-700 mb-1.5">{msg.sender}</span>
                                    <div className={`flex items-end gap-2.5 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                                        <div className={`px-5 py-3.5 lg:px-6 lg:py-4 bg-white border border-neutral-200 rounded-2xl lg:rounded-3xl text-gray-950 shadow-sm max-w-[240px] md:max-w-md lg:max-w-xl text-sm lg:text-base ${msg.isMine ? 'bg-blue-50 border-blue-100 text-blue-900 rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                            {msg.type === 'text' && msg.content}
                                        </div>
                                        <span className="text-xs lg:text-sm text-gray-400 mb-1 flex-shrink-0">{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </main>

                    {/* 하단 입력 영역 */}
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
                                <button onClick={handleSendMessage} className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 bg-blue-600 hover:bg-blue-700 rounded-[10px] lg:rounded-xl flex items-center justify-center text-white ml-2 transition-colors">
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
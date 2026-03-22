'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 더미 데이터 초기값
const INITIAL_MESSAGES = [
  { id: 1, sender: 'K-POP러버', avatar: 'https://loremflickr.com/200/200/girl,face?random=10', type: 'text', content: '이번 컴백 대박이다 진짜', time: '오전 2:15', isMine: false },
  { id: 2, sender: '아이돌팬', avatar: 'https://loremflickr.com/200/200/woman,face?random=11', type: 'text', content: '노래 계속 듣게 됨 ㅠㅠ', time: '오전 2:25', isMine: false }
];

const DUMMY_PARTICIPANTS = [
  { id: 1, name: 'K-POP러버', role: '방장', isMe: false, avatar: 'https://loremflickr.com/200/200/girl,face?random=10' },
  { id: 2, name: '아이돌팬', role: '멤버', isMe: false, avatar: 'https://loremflickr.com/200/200/woman,face?random=11' },
  { id: 3, name: '나', role: '멤버', isMe: true, avatar: 'https://loremflickr.com/200/200/man,face?random=13' }
];

const AttachmentChip = ({ text, icon, color }: { text: string; icon?: React.ReactNode; color: string }) => (
  <button className={`flex items-center gap-2.5 px-6 py-3 rounded-full border text-sm transition-colors ${color} hover:bg-neutral-50`}>
    {icon}
    {text}
  </button>
);

export default function ChatRoomPolished() {
  const router = useRouter();
  
  // 🌟 메시지 목록을 관리하는 상태 추가
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  
  // 🌟 채팅 전송 함수
  const handleSendMessage = () => {
    // 빈 메시지면 안 보내지도록 처리
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: '나',
      avatar: 'https://loremflickr.com/200/200/man,face?random=13', // 내 프로필 더미 이미지
      type: 'text',
      content: message,
      // 현재 시간을 오전/오후 형식으로 구하기
      time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
      isMine: true,
    };

    // 기존 메시지 배열에 새 메시지 추가
    setMessages([...messages, newMessage]);
    // 입력창 비우기
    setMessage('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 relative">
      <div className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto p-16 relative">
        <div className="flex-1 bg-white rounded-3xl border border-neutral-100 shadow-md flex flex-col overflow-hidden relative">
          
          <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-6 bg-white border-b border-neutral-100">
            <div className="flex items-center gap-5">
              <button onClick={() => router.push('/chat')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-950 flex items-center gap-2">K-POP 러버스 <span className="text-purple-500">🎤</span></h1>
                <p className="text-base text-gray-500 flex items-center gap-1.5 mt-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  3명
                </p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-10 space-y-10">
            {/* 🌟 기존 DUMMY_MESSAGES 대신 상태값인 messages를 사용하도록 수정 */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-5 ${msg.isMine ? 'justify-end' : ''}`}>
                <img src={msg.avatar} alt={msg.sender} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm" />
                <div className={`flex flex-col ${msg.isMine ? 'items-end' : ''}`}>
                  <span className="text-base font-medium text-gray-700 mb-1.5">{msg.sender}</span>
                  <div className={`flex items-end gap-2.5 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                    <div className={`px-7 py-4.5 bg-white border border-neutral-200 rounded-3xl text-gray-950 shadow-sm max-w-2xl ${msg.isMine ? 'bg-purple-50 rounded-tr-sm border-purple-100 text-purple-950' : 'rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                    <span className="text-sm text-gray-400 mb-1 flex-shrink-0">{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </main>

          <footer className="sticky bottom-0 bg-white border-t border-neutral-100 px-8 py-6 rounded-b-3xl">
            {isAttachmentOpen && (
              <div className="flex items-center gap-4 mb-5 px-3 animate-fade-in-up">
                <AttachmentChip text="사진" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>} color="text-blue-600 border-blue-100 bg-blue-50" />
                <AttachmentChip text="음성" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2"/></svg>} color="text-green-600 border-green-100 bg-green-50" />
                <AttachmentChip text="일정" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/></svg>} color="text-purple-600 border-purple-100 bg-purple-50" />
                <AttachmentChip text="이모티콘" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>} color="text-yellow-600 border-yellow-100 bg-yellow-50" />
              </div>
            )}

            <div className="flex items-center gap-4 bg-neutral-100 rounded-2xl p-2 border-none shadow-inner">
              <button 
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                className={`p-3.5 rounded-xl transition-colors flex items-center justify-center ${isAttachmentOpen ? 'bg-neutral-300 text-gray-700' : 'bg-neutral-200 hover:bg-neutral-300 text-gray-500'}`}
              >
                <svg className={`w-5 h-5 transition-transform duration-200 ${isAttachmentOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
              
              <input
                type="text"
                className="flex-1 bg-transparent text-gray-950 text-base focus:outline-none placeholder-gray-400 py-2"
                placeholder="메시지를 입력하세요..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // 🌟 엔터키 치면 전송되게 추가
              />

              {/* 🌟 전송 버튼 클릭 시 메시지 추가되게 연결 */}
              <button 
                onClick={handleSendMessage}
                className="p-3.5 bg-purple-500 hover:bg-purple-600 rounded-xl text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </footer>

          {isSidebarOpen && <div className="absolute inset-0 bg-black/40 z-30 transition-opacity rounded-3xl" onClick={() => setIsSidebarOpen(false)} />}
          <div className={`absolute top-0 right-0 h-full w-[380px] bg-white z-40 rounded-r-3xl shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-gray-900">채팅방 정보</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-gray-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <p className="text-sm font-semibold text-gray-500 mb-6">참여자 {DUMMY_PARTICIPANTS.length}명</p>
              <ul className="space-y-6">
                {DUMMY_PARTICIPANTS.map((user) => (
                  <li key={user.id} className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-neutral-100" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-medium text-gray-900">{user.name}</span>
                        {user.role === '방장' && <span className="text-yellow-500 text-lg">👑</span>}
                      </div>
                      <span className="text-sm text-gray-400">{user.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border-t border-neutral-100 space-y-3">
              <button className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-gray-700 font-medium"><svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>채팅방 초대하기</button>
              <button className="w-full flex items-center gap-3 px-5 py-4 rounded-xl hover:bg-red-50 transition-colors text-red-500 font-medium"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>채팅방 나가기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
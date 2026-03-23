'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- 더미 데이터 영역 ---
const INITIAL_MESSAGES = [
  { id: 1, sender: 'K-POP리버', avatar: 'https://loremflickr.com/200/200/girl,face?random=10', type: 'text', content: '이번 컴백 대박이다 진짜', time: '오전 2:15', isMine: false },
  { id: 2, sender: '아이돌팬', avatar: 'https://loremflickr.com/200/200/woman,face?random=11', type: 'text', content: '노래 계속 듣게 됨 ㅠㅠ', time: '오전 2:25', isMine: false },
  { id: 3, sender: 'K-POP리버', avatar: 'https://loremflickr.com/200/200/girl,face?random=10', type: 'emoji', content: '맞아맞아 🎤', time: '오전 2:28', isMine: false },
  { id: 4, sender: '아이돌팬', avatar: 'https://loremflickr.com/200/200/woman,face?random=11', type: 'image', content: 'https://loremflickr.com/400/300/performance,stage?random=12', time: '오전 2:31', isMine: false }
];

const DUMMY_PARTICIPANTS = [
  { id: 1, name: 'K-POP리버', role: '방장', isMe: false, avatar: 'https://loremflickr.com/200/200/girl,face?random=10' },
  { id: 2, name: '아이돌팬', role: '멤버', isMe: false, avatar: 'https://loremflickr.com/200/200/woman,face?random=11' },
  { id: 3, name: '나', role: '멤버', isMe: true, avatar: 'https://loremflickr.com/200/200/man,face?random=13' }
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
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  
  // 새 메시지 올 때마다 자동으로 아래로 스크롤해주는 기능
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      sender: '나',
      avatar: 'https://loremflickr.com/200/200/man,face?random=13',
      type: 'text',
      content: message,
      time: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
      isMine: true,
    };
    setMessages([...messages, newMessage]);
    setMessage('');
    setIsAttachmentOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden">
      
      {/* 화면 중앙에 배치되는 메인 컨테이너 */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto p-4 lg:p-12 h-full min-h-0 flex flex-col">
        
        {/* 실제 채팅 카드가 되는 하얀 배경 박스 */}
        <div className="flex-1 bg-white rounded-3xl border border-neutral-200 shadow-lg flex flex-col relative overflow-hidden min-h-0">
          
          {/* 1. 헤더 (고정) - 🌟 좌우 대칭이 완벽하게 맞도록 불필요한 마진 제거 및 패딩 재설정 */}
          <header className="flex-shrink-0 flex items-center justify-between px-6 lg:px-8 py-5 border-b border-neutral-100 bg-white z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/chat')} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-950 flex items-center gap-2">
                  K-POP 러버스 <span className="text-blue-600">🎤</span>
                </h1>
                <p className="text-sm lg:text-base text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {DUMMY_PARTICIPANTS.length}명
                </p>
              </div>
            </div>
            
            {/* 🌟 완벽한 대칭과 간격을 가진 정품 점 3개 아이콘으로 교체 */}
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7a2 2 0 100-4 2 2 0 000 4zM12 14a2 2 0 100-4 2 2 0 000 4zM12 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </header>

          {/* 2. 메시지 리스트 영역 */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 lg:gap-5 ${msg.isMine ? 'justify-end' : ''}`}>
                <img src={msg.avatar} alt={msg.sender} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-neutral-100 shadow-sm" />
                <div className={`flex flex-col ${msg.isMine ? 'items-end' : ''}`}>
                  <span className="text-sm lg:text-base font-medium text-gray-700 mb-1.5">{msg.sender}</span>
                  <div className={`flex items-end gap-2.5 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                    <div className={`px-5 py-3.5 lg:px-6 lg:py-4 bg-white border border-neutral-200 rounded-2xl lg:rounded-3xl text-gray-950 shadow-sm max-w-[240px] md:max-w-md lg:max-w-xl text-sm lg:text-base ${msg.isMine ? 'bg-blue-50 border-blue-100 text-blue-900 rounded-tr-sm' : 'rounded-tl-sm'}`}>
                      {msg.type === 'text' && msg.content}
                      {msg.type === 'emoji' && <span className="text-2xl lg:text-3xl">{msg.content}</span>}
                      {msg.type === 'image' && <img src={msg.content} alt="사진 메시지" className="rounded-xl max-w-full" />}
                    </div>
                    <span className="text-xs lg:text-sm text-gray-400 mb-1 flex-shrink-0">{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* 스크롤이 자동으로 내려가게 하는 투명한 빈 태그 */}
            <div ref={messagesEndRef} />
          </main>

          {/* 3. 하단 입력 영역 (고정) */}
          <footer className="flex-shrink-0 border-t border-neutral-100 bg-white px-6 py-4 lg:px-8 lg:py-6 z-20">
            
            {/* 첨부 메뉴 */}
            {isAttachmentOpen && (
              <div className="flex flex-wrap items-center gap-3 mb-4 animate-fade-in-up">
                <AttachmentChip 
                  text="사진" 
                  iconColor="text-blue-500" 
                  icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} 
                />
                <AttachmentChip 
                  text="음성" 
                  iconColor="text-emerald-500" 
                  icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>} 
                />
                <AttachmentChip 
                  text="일정" 
                  iconColor="text-indigo-500" 
                  icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} 
                />
                <AttachmentChip 
                  text="이모티콘" 
                  iconColor="text-amber-500" 
                  icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} 
                />
              </div>
            )}

            {/* 입력창 바 */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
                className="w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 border-[2.5px] border-gray-800 rounded-[14px] lg:rounded-2xl flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <svg className={`w-6 h-6 transition-transform duration-200 ${isAttachmentOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                <button 
                  onClick={handleSendMessage} 
                  className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 bg-blue-600 hover:bg-blue-700 rounded-[10px] lg:rounded-xl flex items-center justify-center text-white ml-2 transition-colors"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </footer>

          {/* 사이드바 영역 */}
          {isSidebarOpen && <div className="absolute inset-0 bg-black/40 z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}
          <div className={`absolute top-0 right-0 h-full w-[320px] lg:w-[380px] bg-white z-40 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between px-6 py-5 lg:px-8 lg:py-6 border-b border-neutral-100">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">채팅방 정보</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-gray-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <p className="text-xs lg:text-sm font-semibold text-gray-500 mb-6">참여자 {DUMMY_PARTICIPANTS.length}명</p>
              <ul className="space-y-6">
                {DUMMY_PARTICIPANTS.map((user) => (
                  <li key={user.id} className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border border-neutral-100" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm lg:text-base font-medium text-gray-900">{user.name}</span>
                        {user.role === '방장' && <span className="text-yellow-500 text-base lg:text-lg">👑</span>}
                      </div>
                      <span className="text-xs lg:text-sm text-gray-400">{user.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border-t border-neutral-100 space-y-3">
              <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-gray-700 text-sm font-medium"><svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>채팅방 초대하기</button>
              <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl hover:bg-red-50 transition-colors text-red-500 text-sm font-medium"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>채팅방 나가기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
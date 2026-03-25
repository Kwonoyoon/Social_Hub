'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';

const DUMMY_CHATS = [
    { id: 1, type: 'group', title: '영화 덕후 모임', titleIcon: '🎬', memberCount: 12, lastMessage: '이번 주말 영화 추천 받습니다!', time: '30분 전', unreadCount: 5, avatarColor: 'bg-neutral-900', avatarText: '🎬' },
    { id: 2, type: 'private', title: '이서연', lastMessage: '내일 카페에서 만날까?', time: '1시간 전', unreadCount: 1, isOnline: true, avatarColor: 'bg-neutral-100 border border-neutral-200', avatarText: '👩', textColor: 'text-gray-900' },
    { id: 3, type: 'group', title: 'K-POP 러버스', titleIcon: '🎤', memberCount: 8, lastMessage: '신곡 나왔어요!!', time: '2시간 전', unreadCount: 0, avatarColor: 'bg-neutral-900', avatarText: '🎤' },
    { id: 4, type: 'private', title: '강하늘', lastMessage: '오케이 내일 보자!', time: '어제', unreadCount: 0, isOnline: false, avatarColor: 'bg-neutral-100 border border-neutral-200', avatarText: '🧑', textColor: 'text-gray-900' },
    { id: 5, type: 'group', title: '게임 같이해요', titleIcon: '🎮', memberCount: 15, lastMessage: '저녁 9시에 롤 할 사람~', time: '어제', unreadCount: 3, avatarColor: 'bg-neutral-900', avatarText: '🎮' },
    { id: 6, type: 'private', title: '민지', lastMessage: '숙제 끝!', time: '3분 전', unreadCount: 0, isOnline: true, avatarColor: 'bg-neutral-100 border border-neutral-200', avatarText: '👩‍💻', textColor: 'text-gray-900' },
    { id: 7, type: 'group', title: '독서 토론', titleIcon: '📖', memberCount: 10, lastMessage: '이번 주 모임은 언제죠?', time: '20분 전', unreadCount: 2, avatarColor: 'bg-neutral-900', avatarText: '📖' }
];

const AiRobotBadge = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2C9.24 2 7 4.24 7 7V17H17V7C17 4.24 14.76 2 12 2Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="white" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
        <circle cx="14" cy="10" r="1" fill="currentColor" />
        <path d="M10 14.5C10 14.5 10.5 15.5 12 15.5C13.5 15.5 14 14.5 14 14.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9H7" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 9H18" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const FilterChip = ({ text, icon, isActive }: { text: string; icon?: React.ReactNode; isActive?: boolean }) => (
    <button className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs whitespace-nowrap transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium' : 'bg-white text-gray-700 border-neutral-200 hover:bg-neutral-50'}`}>
        {icon}
        {text}
    </button>
);

export default function ChatListPolished() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">
            {/* p-16을 p-5로 줄여서 모바일 여백 확보 */}
            <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto p-5 md:p-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-950 mb-4">채팅</h1>
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3 border-none rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            placeholder="채팅방 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* 칩들이 옆으로 넘어가도록 overflow-x-auto 추가 */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <FilterChip text="전체" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2"/></svg>} isActive />
                        <FilterChip text="그룹" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/></svg>} />
                        <FilterChip text="개인" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2"/></svg>} />
                        <FilterChip text="알림" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2"/></svg>} />
                    </div>
                </header>

                <main className="flex-1 pb-20">
                    <ul className="flex flex-col gap-3">
                        {DUMMY_CHATS.map((chat) => (
                            <li 
                                key={chat.id} 
                                onClick={() => router.push(`/chat/${chat.id}`)}
                                className="p-4 flex items-center gap-4 bg-white rounded-2xl border border-neutral-100 hover:bg-neutral-50 active:scale-[0.98] cursor-pointer transition-all shadow-sm"
                            >
                                {/* 아바타 크기를 20->14로 조절 */}
                                <div className="relative flex-shrink-0 w-14 h-14">
                                    <div className={`h-full w-full rounded-full flex items-center justify-center text-2xl ${chat.avatarColor}`}>
                                        <span className={chat.textColor}>{chat.avatarText}</span>
                                    </div>
                                    {chat.type === 'private' && chat.isOnline && (
                                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white shadow"></span>
                                    )}
                                    {chat.type === 'group' && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 rounded-full p-1 border-2 border-white text-white shadow">
                                            <AiRobotBadge className="h-2.5 w-2.5" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <h2 className="text-base font-bold text-gray-950 truncate">
                                                {chat.title} {chat.titleIcon}
                                            </h2>
                                            {chat.type === 'group' && (
                                                <span className="text-[11px] text-gray-400 font-medium">
                                                    {chat.memberCount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                                            {chat.time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <p className="text-sm text-gray-500 truncate">
                                            {chat.lastMessage}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[18px] text-center">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
            <BottomNav />
        </div>
    );
}
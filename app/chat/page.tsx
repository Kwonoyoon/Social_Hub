'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav'; // 🌟 만들어둔 하단바 부품 불러오기

// --- 더미 데이터 영역 ---
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
    <button className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium' : 'bg-white text-gray-700 border-neutral-200 hover:bg-neutral-50'}`}>
        {icon}
        {text}
    </button>
);

export default function ChatListPolished() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">
            <div className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto p-16">
                <header className="mb-14">
                    <h1 className="text-4xl font-bold text-gray-950 mb-7">채팅</h1>
                    <div className="relative max-w-xl mb-7">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-5 py-4 border-none rounded-2xl bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                            placeholder="채팅방 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <FilterChip text="전체" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2"/></svg>} isActive />
                        <FilterChip text="그룹" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/></svg>} />
                        <FilterChip text="개인" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2"/></svg>} />
                        <FilterChip text="알림" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2"/></svg>} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto pb-32">
                    <ul className="grid grid-cols-1 gap-6 border-t border-neutral-100 pt-10">
                        {DUMMY_CHATS.map((chat) => (
                            <li 
                                key={chat.id} 
                                onClick={() => router.push(`/chat/${chat.id}`)}
                                className="p-8 flex items-start gap-9 bg-white rounded-3xl border border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md"
                            >
                                <div className="relative flex-shrink-0 w-20 h-20">
                                    <div className={`h-full w-full rounded-full flex items-center justify-center text-4xl ${chat.avatarColor}`}>
                                        <span className={chat.textColor}>{chat.avatarText}</span>
                                    </div>
                                    {chat.type === 'private' && chat.isOnline && (
                                        <span className="absolute bottom-1 right-1 block h-6 w-6 rounded-full bg-green-500 border-4 border-white shadow"></span>
                                    )}
                                    {chat.type === 'group' && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2 border-4 border-white text-white shadow-lg">
                                            <AiRobotBadge className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pt-2">
                                    <div className="flex justify-between items-baseline mb-3">
                                        <div className="flex items-center gap-3 truncate">
                                            <h2 className="text-2xl font-semibold text-gray-950 truncate">
                                                {chat.title} {chat.titleIcon && chat.titleIcon}
                                            </h2>
                                            {chat.type === 'group' && (
                                                <span className="bg-neutral-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
                                                    {chat.memberCount}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                                            {chat.time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-base text-gray-600 truncate pr-6">
                                            {chat.lastMessage}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <span className="bg-pink-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 min-w-[24px] text-center shadow">
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

            {/* 🌟 기존의 복잡했던 하단바 코드가 하나로 깔끔하게 들어갑니다! */}
            <BottomNav />
        </div>
    );
}
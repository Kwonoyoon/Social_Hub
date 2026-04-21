'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';

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

const FilterChip = ({ text, icon, isActive, onClick }: { text: string; icon?: React.ReactNode; isActive?: boolean; onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs whitespace-nowrap transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-blue-200 font-medium' : 'bg-white text-gray-700 border-neutral-200 hover:bg-neutral-50'}`}
    >
        {icon}
        {text}
    </button>
);

export default function ChatListPolished() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('전체');
    const [chatRooms, setChatRooms] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            const storedId = localStorage.getItem('userId');
            if (!storedId) return;
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:5000/api/chat/list?userId=${storedId}`);
                const data = await res.json();
                if (Array.isArray(data)) setChatRooms(data);
            } catch (err) {
                console.error("채팅 목록 불러오기 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChatRooms();
    }, []);

    const filteredRooms = chatRooms.filter(chat => {
        const matchesTab = activeTab === '전체' || 
                          (activeTab === '그룹' && chat.type === 'group') || 
                          (activeTab === '개인' && chat.type === 'private');
        const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // 💡 아바타 클릭 시 참여자 모달 오픈
    const handleAvatarClick = (e: React.MouseEvent, participants: any[]) => {
        e.stopPropagation(); // 리스트 클릭(채팅방 입장) 방지
        setSelectedParticipants(participants || []);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">
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
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <FilterChip text="전체" isActive={activeTab === '전체'} onClick={() => setActiveTab('전체')} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2"/></svg>} />
                        <FilterChip text="그룹" isActive={activeTab === '그룹'} onClick={() => setActiveTab('그룹')} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2"/></svg>} />
                        <FilterChip text="개인" isActive={activeTab === '개인'} onClick={() => setActiveTab('개인')} icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2"/></svg>} />
                    </div>
                </header>

                <main className="flex-1 pb-20">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400 font-bold text-sm">목록을 불러오는 중입니다...</div>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {filteredRooms.map((chat) => (
                                <li 
                                    key={chat.id} 
                                    onClick={() => router.push(`/chat/${chat.id}`)}
                                    className="p-4 flex items-center gap-4 bg-white rounded-2xl border border-neutral-100 hover:bg-neutral-50 active:scale-[0.98] cursor-pointer transition-all shadow-sm"
                                >
                                    {/* 💡 아바타 클릭 시 참여자 명단이 뜨도록 수정 */}
                                    <div 
                                        onClick={(e) => handleAvatarClick(e, chat.participants)}
                                        className="relative flex-shrink-0 w-14 h-14 hover:opacity-80 transition-opacity"
                                    >
                                        <div className={`h-full w-full rounded-full flex items-center justify-center text-2xl ${chat.avatarColor || 'bg-blue-100'}`}>
                                            <span className={chat.textColor || 'text-blue-600'}>{chat.avatarText || '💬'}</span>
                                        </div>
                                        {chat.type === 'group' && (
                                            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 rounded-full p-1 border-2 border-white text-white shadow">
                                                <AiRobotBadge className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h2 className="text-base font-bold text-gray-950 truncate">{chat.title}</h2>
                                            <span className="text-[11px] text-gray-400 flex-shrink-0">{chat.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                                            {chat.unreadCount > 0 && (
                                                <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
            </div>

            {/* 참여자 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">참여자 명단</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto p-2">
                            {selectedParticipants && selectedParticipants.length > 0 ? (
                                selectedParticipants.map((user) => (
                                    <div key={user.id} onClick={() => router.push(`/profile/${user.id}`)} className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors group">
                                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold bg-neutral-100 group-hover:bg-blue-100">{user.name?.[0] || '?'}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.role || '멤버'}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-gray-400 text-sm">정보를 불러올 수 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
}
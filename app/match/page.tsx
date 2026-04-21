"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/app/lib/supabase';

interface LikeUser {
    userId: string;
    nickname: string;
    university?: string;
    mbti?: string;
    interests: string[];
    matchScore: number;
    avatar?: string;
}

export default function MatchPage() {
    const [likes, setLikes] = useState<LikeUser[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [myUuid, setMyUuid] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const storedId = session?.user.id || localStorage.getItem('userId');
            
            if (!storedId) {
                alert("로그인 정보가 유실되었습니다.");
                router.push('/');
                return;
            }
            
            setMyUuid(storedId);

            try {
                const res = await fetch(`http://localhost:5000/api/match?userId=${storedId}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const strangersOnly = data.filter((user: LikeUser) => String(user.userId) !== String(storedId));
                    setLikes(strangersOnly.slice(0, 4));
                }
            } catch (err) {
                console.error("매칭 로드 실패:", err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetch();
    }, [router]);

    const handleAction = async (action: 'like' | 'dislike') => {
        const targetUser = likes[currentIndex];
        if (!targetUser || !myUuid) return;

        try {
            const res = await fetch(`http://localhost:5000/api/match/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: myUuid,
                    receiverId: targetUser.userId,
                    action: action
                })
            });

            const data = await res.json();
            if (action === 'like' && data.roomId) {
                router.push(`/chat/${data.roomId}`);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } catch (err) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const currentUser = likes[currentIndex];

    if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse text-2xl">MATCHING...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50 p-4 md:p-6 overflow-y-auto">
            <header className="flex items-center gap-4 py-2 mb-4 flex-shrink-0 max-w-lg mx-auto w-full">
                <button onClick={() => router.back()} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <h1 className="text-xl font-black text-gray-900">✨ 오늘 너의 운명은?</h1>
            </header>

            {!currentUser ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <span className="text-6xl mb-4">🏜️</span>
                    <p className="text-lg font-black text-gray-800">추천할 유저가 없어요!</p>
                    <button onClick={() => router.push('/mypage')} className="mt-4 text-indigo-600 font-black">내 프로필로 가기</button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-lg mx-auto w-full pb-10">
                    <div 
                        onClick={() => router.push(`/profile/${currentUser.userId}`)}
                        className="w-full bg-white rounded-[48px] shadow-2xl border border-neutral-100 flex flex-col items-center p-8 md:p-12 text-center relative cursor-pointer hover:scale-[1.01] transition-all min-h-fit"
                    >
                        <div className="absolute top-8 right-8 bg-indigo-600 text-white px-4 py-1.5 rounded-full font-black text-lg">
                            {Math.round(currentUser.matchScore)}%
                        </div>

                        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center text-6xl mb-8 shadow-inner overflow-hidden border-4 border-white">
                            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="avatar" /> : "👤"}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">{currentUser.nickname}</h2>
                            <p className="text-gray-400 font-bold text-base">{currentUser.university || "세명대학교"} · {currentUser.mbti}</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 w-full px-2">
                            {currentUser.interests.map((tag, i) => (
                                <span key={i} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-black text-xs whitespace-nowrap">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleAction('dislike'); }} 
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-300 hover:text-red-500 border border-neutral-100 transition-all active:scale-90"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleAction('like'); }} 
                            className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl text-white hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
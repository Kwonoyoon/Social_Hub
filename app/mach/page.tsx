"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        // ✅ 1. 컴포넌트가 마운트된 후(클라이언트 브라우저 환경) localStorage 확인
        const checkAuthAndFetch = async () => {
            const storedId = localStorage.getItem('userId');
            
            // 디버깅용: F12 콘솔창에서 ID가 찍히는지 확인해보세요!
            console.log("📍 로컬스토리지에서 가져온 ID:", storedId);

            if (!storedId) {
                // ⚠️ 바로 alert 띄우지 않고 0.5초 정도 유예를 줌 (Next.js 하이드레이션 대응)
                setTimeout(() => {
                    if (!localStorage.getItem('userId')) {
                        alert("로그인 정보가 유실되었습니다. 다시 로그인해주세요.");
                        router.push('/');
                    }
                }, 500);
                return;
            }
            
            setMyUuid(storedId);

            // 2. API 호출
            try {
                const res = await fetch(`http://localhost:5000/api/match?userId=${storedId}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    // 내 정보가 섞여 나오지 않도록 한 번 더 필터링
                    const strangersOnly = data.filter((user: LikeUser) => String(user.userId) !== String(storedId));
                    setLikes(strangersOnly);
                } else {
                    console.error("데이터 형식이 배열이 아닙니다:", data);
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

            // 하트 클릭 시 매칭 성공이면 즉시 1:1 채팅방 이동
            if (action === 'like' && data.roomId) {
                router.push(`/chat/${data.roomId}`);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } catch (err) {
            console.error("액션 처리 실패:", err);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const currentUser = likes[currentIndex];

    // ✅ 로딩 중일 때 보여줄 화면
    if (isLoading && !myUuid) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-neutral-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-black">로그인 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen h-[100svh] bg-neutral-50 p-4 md:p-6 overflow-hidden">
            <header className="flex items-center gap-4 py-2 mb-4 md:mb-8 flex-shrink-0">
                <button onClick={() => router.back()} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <h1 className="text-xl md:text-2xl font-black text-gray-900">✨ 오늘 너의 운명은?</h1>
            </header>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold">궁합 분석 중...</p>
                </div>
            ) : !currentUser ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <span className="text-5xl md:text-6xl mb-4">🏜️</span>
                    <p className="text-lg font-black text-gray-800">주변에 더 이상 추천할 유저가 없어요!</p>
                    <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 font-black hover:underline">메인으로 가기</button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-10 animate-in fade-in zoom-in duration-300 max-w-lg mx-auto w-full">
                    <div className="w-full bg-white rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-neutral-100 flex flex-col items-center p-6 md:p-10 text-center relative max-h-[70vh]">
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-indigo-600 text-white px-3 py-1 md:px-5 md:py-1.5 rounded-full font-black text-sm md:text-lg shadow-md">
                            {Math.round(currentUser.matchScore)}%
                        </div>

                        <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-50 rounded-full flex items-center justify-center text-5xl md:text-6xl mb-4 md:mb-6 shadow-inner flex-shrink-0">
                            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" /> : "👤"}
                        </div>

                        <div className="overflow-y-auto w-full">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{currentUser.nickname}</h2>
                            <p className="text-sm md:text-base text-gray-400 font-black mb-4">{currentUser.university || "세명대학교"} · {currentUser.mbti}</p>

                            <div className="flex flex-wrap justify-center gap-2">
                                {currentUser.interests.map((tag, i) => (
                                    <span key={i} className="bg-indigo-50 text-indigo-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full font-black text-xs md:text-sm border border-indigo-100">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-10 pb-4 flex-shrink-0 z-40">
                        <button 
                            type="button"
                            onClick={() => handleAction('dislike')}
                            className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-red-500 active:scale-90 transition-all border border-neutral-100"
                        >
                            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleAction('like')}
                            className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 text-white hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
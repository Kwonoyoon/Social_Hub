"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // 경로가 @/lib/supabase 인지 ../lib/supabase 인지 확인해줘!

export default function MyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    const [userData, setUserData] = useState({
        nickname: "사용자",
        userId: "@user",
        bio: "체험형 기반 소셜 허브 '낙낙' 개발 중🚀",
        movie: "데이터 없음",
        music: "데이터 없음",
        hobby: "데이터 없음",
        mbti: "데이터 없음"
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                
                // 1. 현재 세션 확인
                const { data: { session }, error: authError } = await supabase.auth.getSession();

                if (authError || !session) {
                    console.log("세션 정보가 없거나 에러입니다.");
                    router.push('/onboarding'); 
                    return;
                }

                // 2. DB 조회 (406 에러 방지를 위해 배열로 조회)
                const { data, error } = await supabase
                    .from('user')
                    .select('*') 
                    .eq('id', session.user.id);

                if (error) {
                    console.error("조회 중 문제 발생:", error.message);
                }

                // 3. 데이터가 배열에 들어있다면 첫 번째 값을 사용
                if (data && data.length > 0) {
                    const profile = data[0];
                    setUserData({
                        nickname: profile.nickname || "오윤",
                        userId: `@${profile.nickname || "user"}`,
                        bio: profile.bio || "체험형 기반 소셜 허브 '낙낙' 개발 중🚀",
                        movie: profile.movie || "미선택",
                        music: profile.music || "미선택",
                        hobby: profile.hobby || "미선택",
                        mbti: profile.mbti || "미선택"
                    });
                }

            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        if (confirm("로그아웃 하시겠습니까?")) {
            await supabase.auth.signOut();
            router.push('/onboarding'); 
        }
    };

    if (loading) return (
        <div className="bg-[#f5f7fb] min-h-screen flex items-center justify-center text-blue-600 font-black">
            데이터를 불러오는 중입니다... 👋
        </div>
    );

    return (
        <div className="bg-[#f5f7fb] min-h-screen pb-20">
            <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-50 shadow-sm">
                <Link href="/" className="logo font-black text-xl text-blue-600 tracking-tighter italic">
                    KNOCK KNOCK <span className="text-blue-500">👋</span>
                </Link>
                <div className="flex gap-5 text-gray-300 items-center">
                    <span className="cursor-pointer hover:text-blue-500 transition-colors">🔔</span>
                    <span className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => router.push('/onboarding?mode=edit')}>⚙️</span>
                </div>
            </header>

            <main className="container max-w-lg mx-auto p-6 space-y-6 mt-4">
                <section className="bg-white p-10 rounded-[35px] shadow-sm border border-gray-50 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl border border-gray-50 shadow-inner">😵‍💫</div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">{userData.nickname}</h2>
                    <p className="text-gray-400 text-sm font-medium mt-1">{userData.userId}</p>
                    <p className="text-gray-500 font-bold text-[13px] mt-4 px-4 leading-relaxed tracking-tight">{userData.bio}</p>
                </section>

                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-end mb-7 px-1">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">나의 취향 키워드</h3>
                            <p className="text-gray-400 text-[11px] font-bold mt-1.5">온보딩에서 선택한 나의 관심사에요</p>
                        </div>
                        <button onClick={() => router.push('/onboarding?mode=edit')} className="text-[13px] font-black text-blue-600 hover:underline">수정하기</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <TasteCard emoji="🎬" title="Movie" value={userData.movie} color="purple" />
                        <TasteCard emoji="🎵" title="Music" value={userData.music} color="blue" />
                        <TasteCard emoji="✨" title="Hobby" value={userData.hobby} color="pink" />
                        <TasteCard emoji="🧠" title="Style" value={userData.mbti} color="indigo" />
                    </div>
                </section>

                <section className="bg-white rounded-[35px] shadow-sm border border-gray-50 overflow-hidden">
                    <div onClick={handleLogout} className="p-6 text-center hover:bg-red-50 cursor-pointer transition-all group">
                        <span className="text-[13px] font-black text-red-300 group-hover:text-red-500 transition-colors">로그아웃</span>
                    </div>
                </section>
            </main>
        </div>
    );
}

function TasteCard({ emoji, title, value, color }: { emoji: string, title: string, value: string, color: string }) {
    const colorMap: any = {
        purple: "text-purple-600 bg-purple-50",
        blue: "text-blue-600 bg-blue-50",
        pink: "text-pink-600 bg-pink-50",
        indigo: "text-indigo-600 bg-indigo-50",
    };
    return (
        <div className="bg-[#FBFBFF] rounded-[24px] p-5 flex flex-col gap-3 border border-gray-50/50">
            <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm">{emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">{title}</span>
            </div>
            <span className={`text-[13px] font-black ${colorMap[color]} px-3 py-1.5 rounded-xl inline-block self-start shadow-sm`}>
                {value}
            </span>
        </div>
    );
}
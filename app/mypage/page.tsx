"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; // 절대 경로 사용 추천!
import BottomNav from "../components/BottomNav"; // 하단바 불러오기

export default function MyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    // 💡 여러 개를 담기 위해 초기값을 빈 배열([])로 변경했습니다.
    const [userData, setUserData] = useState({
        nickname: "사용자",
        userId: "@user",
        bio: "체험형 기반 소셜 허브 '낙낙' 개발 중🚀",
        movie: [] as string[],
        music: [] as string[],
        hobby: [] as string[],
        mbti: [] as string[]
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data: { session }, error: authError } = await supabase.auth.getSession();

                if (authError || !session) {
                    router.push('/onboarding'); 
                    return;
                }

                const { data, error } = await supabase
                    .from('user')
                    .select('*') 
                    .eq('id', session.user.id);

                if (error) {
                    console.error("조회 중 문제 발생:", error.message);
                }

                if (data && data.length > 0) {
                    const profile = data[0];
                    // 💡 DB에서 온 데이터가 혹시 배열이 아니더라도 에러가 나지 않도록 배열로 감싸주는 방어 코드 추가
                    setUserData({
                        nickname: profile.nickname || "오윤",
                        userId: `@${profile.nickname || "user"}`,
                        bio: profile.bio || "체험형 기반 소셜 허브 '낙낙' 개발 중🚀",
                        movie: Array.isArray(profile.movie) ? profile.movie : (profile.movie ? [profile.movie] : []),
                        music: Array.isArray(profile.music) ? profile.music : (profile.music ? [profile.music] : []),
                        hobby: Array.isArray(profile.hobby) ? profile.hobby : (profile.hobby ? [profile.hobby] : []),
                        mbti: Array.isArray(profile.mbti) ? profile.mbti : (profile.mbti ? [profile.mbti] : [])
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
        <div className="bg-[#f5f7fb] min-h-screen flex flex-col">
            <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-50 shadow-sm">
                <Link href="/" className="logo font-black text-xl text-blue-600 tracking-tighter italic">
                    KNOCK KNOCK <span className="text-blue-500">👋</span>
                </Link>
                <div className="flex gap-5 text-gray-300 items-center">
                    <span className="cursor-pointer hover:text-blue-500 transition-colors">🔔</span>
                    <span className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => router.push('/onboarding?mode=edit')}>⚙️</span>
                </div>
            </header>

            {/* 하단바 때문에 가려지지 않게 pb-32 추가 */}
            <main className="container max-w-lg mx-auto p-6 space-y-6 mt-4 pb-32">
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

            {/* 하단바 고정 */}
            <BottomNav />
        </div>
    );
}

// 💡 TasteCard의 value 타입을 배열(string[])로 변경했습니다.
function TasteCard({ emoji, title, value, color }: { emoji: string, title: string, value: string[], color: string }) {
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
            
            {/* 💡 배열 데이터를 map으로 순회하며 각각의 태그를 만들어냅니다. flex-wrap으로 자동 줄바꿈 처리! */}
            <div className="flex flex-wrap gap-1.5">
                {value && value.length > 0 ? (
                    value.map((item, index) => (
                        <span key={index} className={`text-[12px] font-black ${colorMap[color]} px-2.5 py-1.5 rounded-xl inline-block shadow-sm`}>
                            {item}
                        </span>
                    ))
                ) : (
                    <span className="text-[12px] font-bold text-gray-400 px-1 py-1.5">미선택</span>
                )}
            </div>
        </div>
    );
}
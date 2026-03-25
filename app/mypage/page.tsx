"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import BottomNav from "../components/BottomNav";
import { User, Bell, Settings, LogOut, Film, Music, Sparkles, Brain, Loader2 } from 'lucide-react';

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

    // 로딩 화면을 좀 더 세련되게 바꿨습니다.
    if (loading) return (
        <div className="bg-[#f5f7fb] min-h-screen flex flex-col items-center justify-center text-blue-600">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span className="font-black">데이터를 불러오는 중입니다... 👋</span>
        </div>
    );

    return (
        <div className="bg-[#f5f7fb] min-h-screen flex flex-col">
            <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-50 shadow-sm border-b border-gray-50">
                <Link href="/" className="logo font-black text-xl text-blue-600 tracking-tighter italic">
                    KNOCK KNOCK
                </Link>
                <div className="flex gap-5 text-gray-400 items-center">
                    <button className="hover:text-blue-600 transition-colors">
                        <Bell size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => router.push('/onboarding?mode=edit')} className="hover:text-blue-600 transition-colors">
                        <Settings size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <main className="container max-w-lg mx-auto p-6 space-y-6 mt-4 pb-32">
                <section className="bg-white p-10 rounded-[35px] shadow-sm border border-gray-50 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto mb-6 flex items-center justify-center border border-gray-100 shadow-inner">
                        <User size={48} strokeWidth={2} className="text-blue-200" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">{userData.nickname}</h2>
                    <p className="text-gray-400 text-sm font-medium mt-1">{userData.userId}</p>
                    <p className="text-gray-500 font-bold text-[13px] mt-4 px-4 leading-relaxed tracking-tight">{userData.bio}</p>
                </section>

                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-end mb-7 px-1">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">나의 취향 키워프</h3>
                            <p className="text-gray-400 text-[11px] font-bold mt-1.5">온보딩에서 선택한 나의 관심사에요</p>
                        </div>
                        <button onClick={() => router.push('/onboarding?mode=edit')} className="text-[13px] font-black text-blue-600 hover:underline transition-all">수정하기</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <TasteCard Icon={Film} title="Movie" value={userData.movie} color="purple" />
                        <TasteCard Icon={Music} title="Music" value={userData.music} color="blue" />
                        <TasteCard Icon={Sparkles} title="Hobby" value={userData.hobby} color="pink" />
                        <TasteCard Icon={Brain} title="Style" value={userData.mbti} color="indigo" />
                    </div>
                </section>

                <section className="bg-white rounded-[35px] shadow-sm border border-gray-50 overflow-hidden">
                    <div onClick={handleLogout} className="p-6 flex items-center justify-center gap-2 hover:bg-red-50 cursor-pointer transition-all group">
                        <LogOut size={16} className="text-red-300 group-hover:text-red-500 transition-colors" />
                        <span className="text-[13px] font-black text-red-300 group-hover:text-red-500 transition-colors">로그아웃</span>
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}

function TasteCard({ Icon, title, value, color }: { Icon: any, title: string, value: string, color: string }) {
    const colorMap: any = {
        purple: "text-purple-600 bg-purple-50",
        blue: "text-blue-600 bg-blue-50",
        pink: "text-pink-600 bg-pink-50",
        indigo: "text-indigo-600 bg-indigo-50",
    };
    return (
        <div className="bg-[#FBFBFF] rounded-[24px] p-5 flex flex-col gap-3 border border-gray-50/50 hover:shadow-md transition-shadow cursor-default">
            <div className="flex items-center gap-2 text-gray-400">
                <Icon size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{title}</span>
            </div>
            <span className={`text-[12px] font-black ${colorMap[color]} px-3 py-1.5 rounded-xl inline-block self-start shadow-sm`}>
                {value}
            </span>
        </div>
    );
}
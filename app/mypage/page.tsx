"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MyPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // 1. 현재 로그인한 유저의 Auth 정보 가져오기
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // 2. 해당 유저 ID와 일치하는 DB 데이터 가져오기
                const { data, error } = await supabase
                    .from('user') // 테이블명이 'user'인지 확인 필수!
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (!error && data) {
                    setUser(data);
                }
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">유저 정보를 찾을 수 없습니다.</div>;

    // 온보딩 데이터 매핑 (DB 컬럼명에 맞춰 수정 필요)
    const userInterests = [
        { category: "🎬 영화", value: user.movie, theme: "bg-purple-50 text-purple-600" },
        { category: "🎵 음악", value: user.music, theme: "bg-blue-50 text-blue-600" },
        { category: "🎸 취미", value: user.hobby, theme: "bg-pink-50 text-pink-600" },
        { category: "🧠 성격", value: user.mbti, theme: "bg-indigo-50 text-indigo-600" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 pb-10">
            <nav className="bg-white border-b border-gray-100 px-6 py-4 mb-6 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-indigo-600">낙낙 (Knock Knock)</h1>
            </nav>

            <div className="max-w-xl mx-auto px-4 space-y-6">
                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-white shadow-md">
                            {user.profile_emoji || "😵‍💫"}
                        </div>
                        <h2 className="text-2xl font-bold">{user.nickname || "이름 없음"}</h2>
                        <p className="text-gray-500 text-sm mb-2">@{user.handle || "id_none"}</p>
                        <p className="text-gray-600 text-sm max-w-xs">{user.bio || "자기소개가 없습니다."}</p>
                        
                        <div className="flex gap-8 mt-6 border-t border-gray-50 pt-6 w-full justify-center">
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Followers</p>
                                <p className="font-bold text-lg">247</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Following</p>
                                <p className="font-bold text-lg">189</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-lg font-bold">나의 취향 키워드</h3>
                            <p className="text-xs text-gray-400">온보딩에서 선택한 나의 관심사예요</p>
                        </div>
                        <button className="text-xs font-semibold text-indigo-600 hover:underline">수정하기</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {userInterests.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                                <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase">{item.category}</p>
                                <p className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${item.theme}`}>
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-2">
                        {[{ label: "계정 설정", icon: "👤" }, { label: "최근 매칭 기록", icon: "🤝" }, { label: "알림 설정", icon: "🔔" }, { label: "고객센터", icon: "💬" }].map((menu, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/50 rounded-2xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{menu.icon}</span>
                                    <span className="text-sm font-medium text-gray-700">{menu.label}</span>
                                </div>
                                <span className="text-gray-300 group-hover:text-indigo-400">→</span>
                            </button>
                        ))}
                        <button className="w-full flex items-center gap-3 p-4 mt-2 text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                            <span>🚪</span>
                            <span className="text-sm font-medium">로그아웃</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
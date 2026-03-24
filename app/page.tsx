"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabase';

export default function HomePage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyProfile = async () => {
            // 1. 현재 로그인 유저 가져오기
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // 2. 로그인한 유저 ID로 데이터 조회
                const { data, error } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (!error && data) {
                    setUserData(data);
                }
            }
            setLoading(false);
        };

        fetchMyProfile();
    }, []);

    return (
        <div className="bg-[#f5f7fb] min-h-screen">
            <header className="header flex justify-between items-center px-8 py-4 bg-white border-b sticky top-0 z-10">
                <div className="logo font-bold text-xl cursor-pointer text-blue-600">
                    <Link href="/">knock knock 👋</Link>
                </div>

                <div className="header-right flex items-center gap-6">
                    <div className="icon-group flex gap-4">
                        <div className="header-icon cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                            </svg>
                        </div>
                        <div className="header-icon relative cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
                            </svg>
                            <span className="alarm-dot absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                    </div>

                    <Link href="/mypage">
                        <div className="profile flex items-center gap-3 cursor-pointer group">
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
                                </svg>
                            </div>
                            <div className="text-sm">
                                <div className="profile-name font-bold">{loading ? '로딩 중...' : (userData?.nickname || '닉네임 없음')}</div>
                                <div className="profile-school text-gray-400 text-xs">{userData?.university || '대학교 미설정'}</div>
                            </div>
                        </div>
                    </Link>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto p-6 space-y-6">
                <section className="card bg-white p-8 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
                    <div className="greeting">
                        <h1 className="text-2xl font-bold mb-2">
                            안녕하세요, <span className="text-blue-600">{userData?.nickname || '회원'}</span>님 !
                        </h1>
                        <p className="text-gray-500">오늘은 어떤 친구를 만나볼까요?</p>
                    </div>
                    <button className="primary-btn bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                        매칭 시작하기
                    </button>
                </section>

                <section className="card bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="card-title font-bold text-lg mb-1">▪️ 카테고리 탐색</div>
                    <p className="card-desc text-gray-400 text-sm mb-6">원하는 테마의 친구들을 찾아보세요</p>
                    <div className="grid grid-cols-4 gap-4">
                        {['🎬 영화', '🎵 음악', '✈️ 여행', '🎮 게임'].map((cat, i) => (
                            <div key={i} className="category-box bg-gray-50 p-6 rounded-2xl text-center cursor-pointer hover:shadow-md transition-all">
                                <div className="text-3xl mb-2">{cat.split(' ')[0]}</div>
                                <span className="text-sm font-semibold text-gray-700">{cat.split(' ')[1]}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabase';

export default function HomePage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyProfile = async () => {
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('nickname', '오윤') 
                .single();

            if (!error && data) {
                setUserData(data);
            }
            setLoading(false);
        };

        fetchMyProfile();
    }, []);

    return (
        <div className="bg-[#f5f7fb] min-h-screen">
            {/* 헤더 섹션 */}
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

                    {/* 프로필 섹션 */}
                    <Link href="/mypage">
                        <div className="profile flex items-center gap-3 cursor-pointer group">
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6 text-gray-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
                                </svg>
                            </div>
                            <div className="text-sm">
                                <div className="profile-name font-bold">{loading ? '로딩 중...' : userData?.nickname}</div>
                                <div className="profile-school text-gray-400 text-xs">{userData?.university}</div>
                            </div>
                        </div>
                    </Link>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="container max-w-4xl mx-auto p-6 space-y-6">
                
                {/* 환영 카드 */}
                <section className="card bg-white p-8 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
                    <div className="greeting">
                        <h1 className="text-2xl font-bold mb-2">
                            안녕하세요, <span className="text-blue-600">{userData?.nickname}</span>님 !
                        </h1>
                        <p className="text-gray-500">오늘은 어떤 친구를 만나볼까요?</p>
                    </div>
                    <button className="primary-btn bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all transform active:scale-95">
                        매칭 시작하기
                    </button>
                </section>

                {/* 카테고리 카드 */}
                <section className="card bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="card-title font-bold text-lg mb-1">▪️ 카테고리 탐색</div>
                    <p className="card-desc text-gray-400 text-sm mb-6">원하는 테마의 친구들을 찾아보세요</p>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="category-box bg-pink-50 p-6 rounded-2xl text-center cursor-pointer hover:shadow-md transition-all">
                            <div className="text-3xl mb-2">🎬</div>
                            <span className="text-sm font-semibold text-gray-700">영화</span>
                        </div>
                        <div className="category-box bg-blue-50 p-6 rounded-2xl text-center cursor-pointer hover:shadow-md transition-all">
                            <div className="text-3xl mb-2">🎵</div>
                            <span className="text-sm font-semibold text-gray-700">음악</span>
                        </div>
                        <div className="category-box bg-green-50 p-6 rounded-2xl text-center cursor-pointer hover:shadow-md transition-all">
                            <div className="text-3xl mb-2">✈️</div>
                            <span className="text-sm font-semibold text-gray-700">여행</span>
                        </div>
                        <Link href="/game">
                            <div className="category-box bg-purple-50 p-6 rounded-2xl text-center cursor-pointer border-2 border-transparent hover:border-purple-200 hover:shadow-md transition-all">
                                <div className="text-3xl mb-2">🎮</div>
                                <span className="text-sm font-bold text-purple-700">게임</span>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* 나의 관심사 */}
                <section className="card bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="card-title font-bold text-lg mb-1 flex justify-between">
                        <span>▪️ 나의 관심사</span>
                        <span className="text-xs text-blue-500 cursor-pointer hover:underline">편집</span>
                    </div>
                    <p className="card-desc text-gray-400 text-sm mb-6">내 관심사가 반영된 매칭이 진행됩니다</p>

                    <div className="tag-row flex gap-3 flex-wrap">
                        <span className="tag bg-gray-50 border border-gray-100 px-5 py-2 rounded-full text-sm text-gray-600 hover:bg-white hover:border-blue-300 transition-all cursor-pointer">#콘텐츠</span>
                        <span className="tag bg-gray-50 border border-gray-100 px-5 py-2 rounded-full text-sm text-gray-600 hover:bg-white hover:border-blue-300 transition-all cursor-pointer">#클래식</span>
                        <span className="tag bg-gray-50 border border-gray-100 px-5 py-2 rounded-full text-sm text-gray-600 hover:bg-white hover:border-blue-300 transition-all cursor-pointer">#그림/디자인</span>
                    </div>
                </section>

            </main>
        </div>
    );
}
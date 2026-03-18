"use client";

import React, { useState } from 'react';

/**
 * [캡스톤] 게임 페이지 시안 재현 복구 코드 (블루 톤)
 * 4칸 들여쓰기 적용
 */
export default function GamePage() {
    // 임시 사용자 데이터 (우상단)
    const userData = {
        nickname: "권오윤",
        university: "세명대"
    };

    // 카테고리 탭 상태 (Game, Movie 등)
    const [activeTab, setActiveTab] = useState('Game');
    // 플랫폼 필터 상태 (PC, 모바일 등)
    const [activePlatform, setActivePlatform] = useState('PC');

    const categories = ['Game', 'Movie', 'Travel', 'Music'];
    const platforms = ['PC', '모바일', '콘솔', 'VR'];

    // 핸들러 함수
    const handleTodoAlert = (msg: string) => {
        alert(`${msg} 페이지는 추후 연결될 예정입니다.`);
    };

    return (
        <div className="bg-[#f0f2f5] min-h-screen text-gray-900 font-sans">
            
            {/* 1. 최상단 파란색 테두리 (시안 재현) */}
            <div className="h-2 bg-[#2563eb] w-full sticky top-0 z-30"></div>

            {/* 2. 헤더 섹션 (knock knock 👋) */}
            <header className="header flex justify-between items-center px-10 py-5 bg-white border-b border-gray-100 sticky top-2 z-20 shadow-sm">
                <div className="logo cursor-pointer text-2xl font-black text-gray-900">
                    {/* 일반 a 태그 사용 */}
                    <a href="/" className="hover:text-[#2563eb]">knock knock 👋</a>
                </div>

                <div className="header-right flex items-center gap-6">
                    <div className="flex items-center gap-4 text-gray-600">
                        {/* 돋보기 아이콘 */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 cursor-pointer hover:text-[#2563eb]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        {/* 종 아이콘 */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 cursor-pointer hover:text-[#2563eb]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31a8.967 8.967 0 0 1-2.312-6.022c0-1.652-.352-3.213-1.022-4.666a4.72 4.72 0 0 0-4.592-3.042a4.72 4.72 0 0 0-4.592 3.042a8.953 8.953 0 0 1-1.022 4.666c0 1.652-.352 3.213-1.022 4.666q-.944 2.064-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    </div>
                    {/* 유저 프로필 영역 */}
                    <div className="profile flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 border border-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
                            </svg>
                        </div>
                        <div className="text-sm">
                            <div className="profile-name font-bold text-gray-900">{userData.nickname}</div>
                            <div className="profile-school text-gray-400 text-xs">{userData.university}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 영역 */}
            <main className="max-w-[1400px] mx-auto p-8 pt-12">
                
                {/* 3. 카테고리 탭 (Game, Movie 등) */}
                <div className="category-tabs flex gap-4 mb-10">
                    {categories.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pill px-9 py-2.5 rounded-full font-bold text-lg shadow transition-all ${activeTab === tab ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 4. 플랫폼 필터 (PC, 모바일 등) - 파란색 포인트 */}
                <div className="platform-filters flex gap-6 text-xl font-bold text-gray-500 mb-12">
                    {platforms.map(platform => (
                        <button 
                            key={platform}
                            onClick={() => setActivePlatform(platform)}
                            className={`flex items-center gap-1.5 transition-colors ${activePlatform === platform ? 'text-[#2563eb]' : 'hover:text-gray-800'}`}
                        >
                            {activePlatform === platform && <span className="text-sm">▶</span>}
                            {platform}
                        </button>
                    ))}
                </div>

                {/* 메인 그리드 레이아웃 (좌측 모임 리스트 | 우측 사이드바) */}
                <div className="grid grid-cols-12 gap-10">
                    
                    {/* 좌측: 모임 리스트 영역 (8/12) */}
                    <div className="main-content col-span-12 lg:col-span-8">
                        
                        {/* 5. 추천 게임 모임 (카드형) */}
                        <section className="mb-12">
                            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                                🎮 추천 게임 모임
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* 카드 1: 롤 초보 파티 - 버튼 파란색 */}
                                <div className="feature relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer h-[380px]">
                                    <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" alt="LoL" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                    <div className="overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-7 flex flex-col justify-end text-white">
                                        <div className="text-3xl font-black mb-2 flex items-center gap-2">🔥 롤 초보 파티</div>
                                        <div className="text-gray-300 font-medium mb-5">PC • 초보 환영 • 3/5</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => alert('참여!')} className="bg-[#2563eb] hover:bg-[#1d4ed8] px-5 py-3 rounded-xl font-bold transition-colors">참여하기</button>
                                            <button onClick={() => alert('정보!')} className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl font-bold backdrop-blur-sm transition-colors">정보보기</button>
                                        </div>
                                    </div>
                                </div>

                                {/* 카드 2: 발로란트 - 버튼 파란색 */}
                                <div className="feature relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer h-[380px]">
                                    <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80" alt="Valorant" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                    <div className="overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-7 flex flex-col justify-end text-white">
                                        <div className="text-3xl font-black mb-2 flex items-center gap-2">🔥 발로란트 할사람?</div>
                                        <div className="text-gray-300 font-medium mb-5">PC • 즐겜 • 2/4</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => alert('참여!')} className="bg-[#2563eb] hover:bg-[#1d4ed8] px-5 py-3 rounded-xl font-bold transition-colors">참여하기</button>
                                            <button onClick={() => alert('정보!')} className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl font-bold backdrop-blur-sm transition-colors">정보보기</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 6. 전체 모임 보기 (하단 리스트형) */}
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black flex items-center gap-2">全 전체 모임 보기</h3>
                                <div className="text-gray-400 font-bold cursor-pointer hover:text-gray-600">등록순 ▾</div>
                            </div>
                            
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="list-item bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-xl"></div> {/* 게임 아이콘 */}
                                            <div>
                                                <h5 className="text-lg font-bold">롤 칼바람 나락 멤버 구합니다</h5>
                                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">PC • 초보 환영 • <span className="font-medium text-[#2563eb]">3/5</span>명</p>
                                            </div>
                                        </div>
                                        <button onClick={() => alert('참여!')} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-7 py-3 rounded-xl font-bold transition-colors">
                                            참여하기
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* 우측 사이드바 Area (4/12) */}
                    <aside className="col-span-12 lg:col-span-4 space-y-8">
                        
                        {/* 7. 인원모집 영역 - 파란색 포인트 */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-extrabold text-gray-800">인원모집 영역</h4>
                                <span className="text-[#2563eb] text-sm font-medium">더보기 +</span>
                            </div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-full"></div>
                                        <div className="text-sm flex-1">
                                            <p className="font-bold">최근 구함</p>
                                            <p className="text-gray-400 text-xs">최근 {i + 1}명 추가모집 중</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 8. 인기 게임 모임 - 파란색 포인트 */}
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h4 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">🔥 인기 게임 모임</h4>
                            <div className="space-y-5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-xl"></div>
                                        <div className="text-sm flex-1">
                                            <p className="font-bold">같이 {['롤', '발로란트', '배그', '메이플', '로아'][i]} 하실 분</p>
                                            <p className="text-gray-400 text-xs">{20 - (i * 2)}명 참여 중</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
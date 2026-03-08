"use client";

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
return (
    <div className="bg-[#f5f7fb] min-h-screen">
      {/* 헤더 섹션 */}
    <header className="header flex justify-between items-center px-8 py-4 bg-white border-b sticky top-0 z-10">
        <div className="logo font-bold text-xl cursor-pointer">
        <Link href="/">knock knock 👋</Link>
        </div>

        <div className="header-right flex items-center gap-6">
        <div className="icon-group flex gap-4">
            {/* 검색 아이콘 */}
            <div className="header-icon cursor-pointer" title="검색">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
            </svg>
            </div>
            {/* 알림 아이콘 */}
            <div className="header-icon relative cursor-pointer" title="알림">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
            </svg>
            <span className="alarm-dot absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
        </div>

          {/* 프로필 섹션 */}
        <div className="profile flex items-center gap-3 cursor-pointer" title="마이페이지">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-8 h-8 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
            <div className="text-sm">
            <div className="profile-name font-bold">권오윤</div>
            <div className="profile-school text-gray-500 text-xs">세명대</div>
            </div>
        </div>
        </div>
    </header>

      {/* 메인 컨텐츠 */}
    <main className="container max-w-4xl mx-auto p-6 space-y-6">
        
        {/* 환영 카드 */}
        <section className="card bg-white p-8 rounded-2xl shadow-sm flex justify-between items-center">
        <div className="greeting">
            <h1 className="text-2xl font-bold mb-2">안녕하세요, 권오윤님 !</h1>
            <p className="text-gray-500">오늘은 어떤 친구를 만나볼까요?</p>
        </div>
        <button className="primary-btn bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
            시작하기
        </button>
        </section>

        {/* 카테고리 카드 */}
        <section className="card bg-white p-8 rounded-2xl shadow-sm">
        <div className="card-title font-bold text-lg mb-1">▪️ 카테고리 탐색</div>
        <p className="card-desc text-gray-400 text-sm mb-6">원하는 카테고리를 선택해보세요</p>

        <div className="category-row grid grid-cols-4 gap-4">
            <div className="category-box bg-pink-50 p-6 rounded-xl text-center cursor-pointer hover:bg-pink-100 transition-colors">
            <div className="text-3xl mb-2">🎬</div>
            <span className="text-sm font-medium">영화</span>
            </div>

            <div className="category-box bg-blue-50 p-6 rounded-xl text-center cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="text-3xl mb-2">🎵</div>
            <span className="text-sm font-medium">음악</span>
            </div>

            <div className="category-box bg-green-50 p-6 rounded-xl text-center cursor-pointer hover:bg-green-100 transition-colors">
            <div className="text-3xl mb-2">✈️</div>
            <span className="text-sm font-medium">여행</span>
            </div>

            {/* 게임 카테고리 - 클릭 시 게임 페이지로 이동 */}
            <Link href="/game">
            <div className="category-box bg-purple-50 p-6 rounded-xl text-center cursor-pointer hover:bg-purple-100 transition-colors border-2 border-transparent hover:border-purple-200">
                <div className="text-3xl mb-2">🎮</div>
                <span className="text-sm font-medium font-bold text-purple-700">게임</span>
            </div>
            </Link>
        </div>
        </section>

        {/* 관심사 카드 */}
        <section className="card bg-white p-8 rounded-2xl shadow-sm">
        <div className="card-title font-bold text-lg mb-1">▪️ 나의 관심사</div>
        <p className="card-desc text-gray-400 text-sm mb-6">관심사를 선택하면 관련 채팅방을 볼 수 있어요</p>

        <div className="tag-row flex gap-3">
            <span className="tag bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">콘텐츠</span>
            <span className="tag bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">클래식</span>
            <span className="tag bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer">그림/디자인</span>
        </div>
        </section>

    </main>
    </div>
);
}
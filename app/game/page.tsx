"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GamePage() {
  // 알림창 함수 (더미용)
const showAlert = (msg: string) => alert(`${msg} 페이지는 추후 연결`);

return (
    <div className="bg-[#f5f7fb] min-h-screen">
      {/* 헤더 섹션 */}
    <header className="header flex justify-between items-center px-8 py-4 bg-white border-b sticky top-0 z-10">
        <div className="logo font-bold text-xl cursor-pointer">
        <Link href="/">knock knock 👋</Link>
        </div>

        <div className="header-right flex items-center gap-6">
        <div className="icon-group flex gap-4">
            <div className="header-icon cursor-pointer" title="검색">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
            </svg>
            </div>
            <div className="header-icon relative cursor-pointer" title="알림">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
            </svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
        </div>

        <div className="profile flex items-center gap-3 cursor-pointer" title="마이페이지">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-8 h-8 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
            <div className="text-sm">
            <div className="font-bold text-gray-800">권오윤</div>
            <div className="text-gray-500 text-xs">세명대</div>
            </div>
        </div>
        </div>
    </header>

    <div className="max-w-6xl mx-auto p-6">
        {/* 상단 탭 레이아웃 */}
        <div className="flex gap-3 mb-6">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md">Game</button>
        <button onClick={() => showAlert('Movie')} className="px-6 py-2 bg-white text-gray-600 rounded-full font-medium hover:bg-gray-100">Movie</button>
        <button onClick={() => showAlert('Travel')} className="px-6 py-2 bg-white text-gray-600 rounded-full font-medium hover:bg-gray-100">Travel</button>
        <button onClick={() => showAlert('Music')} className="px-6 py-2 bg-white text-gray-600 rounded-full font-medium hover:bg-gray-100">Music</button>
        </div>

        {/* 서브 탭 (PC, 모바일 등) */}
        <div className="flex items-center gap-4 mb-8 text-sm font-medium">
        <button className="text-blue-600 border-b-2 border-blue-600 pb-1">PC</button>
        <span className="text-gray-300">|</span>
        <button onClick={() => alert('모바일 필터는 추후 연결')} className="text-gray-500 hover:text-black">모바일</button>
        <span className="text-gray-300">|</span>
        <button onClick={() => alert('콘솔 필터는 추후 연결')} className="text-gray-500 hover:text-black">콘솔</button>
        <span className="text-gray-300">|</span>
        <button onClick={() => alert('VR 필터는 추후 연결')} className="text-gray-500 hover:text-black">VR</button>
        </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          {/* 왼쪽 콘텐츠 섹션 (추천 게임 모임) */}
        <div className="lg:col-span-2 space-y-10">
            <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🎮 추천 게임 모임</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 추천 카드 1 */}
                <GameFeatureCard 
                title="🔥 롤 입문자 한 판?" 
                tags={["PC", "초보 환영", "3/6"]}
                img="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=60"
                />
                {/* 추천 카드 2 */}
                <GameFeatureCard 
                title="🔥 발로란트 내전 모집" 
                tags={["PC", "마이크 가능", "2/5"]}
                img="https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=600&q=60"
                />
            </div>
            </div>

            {/* 전체 모임 목록 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <strong className="text-lg">전체 모임 보기</strong>
                <button onClick={() => showAlert('전체 모임')} className="text-sm text-gray-400 hover:text-blue-600">전체 보기 &gt;</button>
            </div>
            <div className="space-y-4">
                <GameRowItem title="오버워치2 같이 큐 잡자" time="22분전" count="8/10" img="12" />
                <GameRowItem title="스타듀밸리 힐링 팜" time="35분전" count="4/6" img="25" />
                <GameRowItem title="로스트아크 주말 레이드" time="41분전" count="6/8" img="33" />
            </div>
            </div>
        </div>

          {/* 사이드바 섹션 */}
        <aside className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">모임목록</span>
                <button className="text-xs font-bold text-blue-600 hover:underline">모임등록</button>
            </div>
            <div className="space-y-4">
                <GameSideItem title="리그오브레전드 듀오 구함" count="8/10" img="52" />
                <GameSideItem title="발로란트 스파이크 러시" count="5/10" img="56" />
                <GameSideItem title="몬헌 월드 파밍팟" count="3/4" img="60" />
            </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-lg font-bold mb-4">🔥 인기 게임 모임</div>
            <div className="space-y-4">
                <GameSideItem title="FC온라인 랭크전 모임" count="7/10" img="10" />
                <GameSideItem title="데바데 공포겜 파티" count="4/5" img="17" />
            </div>
            </div>
        </aside>

        </div>
    </div>
    </div>
);
}

// --- 재사용 가능한 작은 컴포넌트들 ---

function GameFeatureCard({ title, tags, img }: { title: string, tags: string[], img: string }) {
return (
    <div className="relative overflow-hidden rounded-2xl group h-64">
    <img src={img} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <div className="flex gap-2 text-xs opacity-80 mb-4">
        {tags.map((tag, i) => <span key={i}>{tag} {i < tags.length - 1 && "•"}</span>)}
        </div>
        <div className="flex gap-2">
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">참여하기</button>
        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold transition-colors">정보보기</button>
        </div>
    </div>
    </div>
);
}

function GameRowItem({ title, time, count, img }: any) {
return (
    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-4">
        <img src={`https://i.pravatar.cc/60?img=${img}`} className="w-12 h-12 rounded-full border border-gray-100" />
        <div>
    <div className="font-bold text-gray-800">{title}</div>
        <div className="text-xs text-gray-400">PC • {time}</div>
        </div>
    </div>
    <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-400">{count}</span>
        <button className="px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold transition-all text-gray-600">참여하기</button>
    </div>
    </div>
);
}

function GameSideItem({ title, count, img }: any) {
return (
    <div className="flex justify-between items-center group cursor-pointer">
    <div className="flex items-center gap-3">
        <img src={`https://i.pravatar.cc/60?img=${img}`} className="w-10 h-10 rounded-full" />
        <div>
        <div className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{title}</div>
        <div className="text-[10px] text-gray-400">PC • 15분전</div>
        </div>
    </div>
    <span className="text-xs font-medium text-gray-400">{count}</span>
    </div>
);
}
"use client";

import React from 'react';
import Link from 'next/link';

export default function GamePage() {
  // 경고창 함수 (기존 onclick="alert(...)" 대체)
  const handleTodoAlert = (msg: string) => {
    alert(`${msg} 페이지는 추후 연결될 예정입니다.`);
  };

  return (
    <div className="bg-[#f5f7fb] min-h-screen">
      {/* 헤더 섹션 */}
      <header className="header flex justify-between items-center px-8 py-4 bg-white border-b">
        <div className="logo cursor-pointer text-xl font-bold">
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
              <span className="alarm-dot absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>

          <div className="profile flex items-center gap-3 cursor-pointer" title="마이페이지">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-8 h-8 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
            <div className="text-sm">
              <div className="profile-name font-bold">권오윤</div>
              <div className="profile-school text-gray-500">세명대</div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 랩퍼 */}
      <div className="wrap max-w-6xl mx-auto p-6">
        {/* 상단 탭 */}
        <div className="top-tabs flex gap-3 mb-6">
          <button className="pill active bg-blue-600 text-white px-6 py-2 rounded-full font-bold">Game</button>
          <button onClick={() => handleTodoAlert('Movie')} className="pill bg-gray-200 px-6 py-2 rounded-full hover:bg-gray-300">Movie</button>
          <button onClick={() => handleTodoAlert('Travel')} className="pill bg-gray-200 px-6 py-2 rounded-full hover:bg-gray-300">Travel</button>
          <button onClick={() => handleTodoAlert('Music')} className="pill bg-gray-200 px-6 py-2 rounded-full hover:bg-gray-300">Music</button>
        </div>

        {/* 서브 탭 (필터) */}
        <div className="subtabs flex gap-4 items-center mb-8 text-sm font-medium text-gray-600">
          <a href="#" className="active text-blue-600 font-bold border-b-2 border-blue-600 pb-1">PC</a>
          <span className="text-gray-300">|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); handleTodoAlert('모바일'); }}>모바일</a>
          <span className="text-gray-300">|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); handleTodoAlert('콘솔'); }}>콘솔</a>
          <span className="text-gray-300">|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); handleTodoAlert('VR'); }}>VR</a>
        </div>

        {/* 컨텐츠 패널 */}
        <div className="panel grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* 메인 그리드 (왼쪽/중간 섹션) */}
        <div className="md:col-span-2 space-y-10">
            {/* 1번 추천 섹션 */}
            <section>
                <h3 className="section-title text-xl font-bold mb-4">🎮 추천 게임 모임</h3>
                <div className="feature relative rounded-xl overflow-hidden shadow-lg mb-6 group">
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=60" alt="LoL" className="w-full h-[300px] object-cover transition-transform group-hover:scale-105" />
                <div className="overlay absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                    <div className="title text-white text-2xl font-bold mb-2">🔥 롤 입문자 한 판?</div>
                    <div className="meta text-gray-300 text-sm flex gap-2 mb-4">
                    <span>PC</span><span>•</span><span>초보 환영</span><span>•</span><span>3/6</span>
                </div>
                <div className="actions flex gap-3">
                    <button className="btn primary bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700" onClick={() => alert('참여: 롤 입문자 한 판?')}>참여하기</button>
                    <button className="btn ghost bg-white/20 text-white px-4 py-2 rounded backdrop-blur-sm hover:bg-white/30" onClick={() => alert('정보: 롤 입문자 한 판?')}>정보보기</button>
                </div>
                </div>
            </div>

              {/* 리스트 블록 */}
            <div className="list-block bg-white rounded-xl p-6 shadow-sm">
                <div className="list-head flex justify-between items-center mb-4 border-b pb-3">
                <strong className="text-sm font-bold">전체 모임 보기</strong>
                <a href="#" onClick={(e) => { e.preventDefault(); handleTodoAlert('전체 모임'); }} className="text-xs text-blue-600 hover:underline">전체 보기 &gt;</a>
                </div>
                <div className="rows space-y-4">
                {[
                    { title: "오버워치2 같이 큐 잡자", img: "12", meta: "22분전", count: "8/10" },
                    { title: "스타듀밸리 힐링 팜", img: "25", meta: "35분전", count: "4/6" },
                    { title: "로스트아크 주말 레이드", img: "33", meta: "41분전", count: "6/8" }
                ].map((item, idx) => (
                    <div key={idx} className="row flex justify-between items-center group">
                    <div className="row-left flex gap-4 items-center">
                        <div className="avatar w-10 h-10 rounded-full overflow-hidden">
                        <img src={`https://i.pravatar.cc/60?img=${item.img}`} alt="user" />
                        </div>
                        <div>
                        <div className="row-title font-bold text-sm group-hover:text-blue-600 cursor-pointer">{item.title}</div>
                        <div className="row-sub text-xs text-gray-400"><span>PC</span><span> • </span><span>{item.meta}</span></div>
                        </div>
                    </div>
                    <div className="row-right flex items-center gap-4">
                        <span className="muted text-xs text-gray-400 font-medium">{item.count}</span>
                        <button className="join bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors" onClick={() => alert(`참여: ${item.title}`)}>참여</button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </section>
        </div>

          {/* 사이드바 (오른쪽 섹션) */}
        <aside className="side space-y-6">
            <div className="side-top flex justify-between items-center">
            <div className="small-title font-bold text-gray-700">실시간 모임 목록</div>
            <button className="ghost-btn text-xs font-bold text-blue-600 border border-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white" onClick={() => handleTodoAlert('모임 등록')}>모임등록</button>
            </div>

            <div className="side-card bg-white rounded-xl p-4 shadow-sm space-y-4 border border-gray-100">
            {[
                { title: "리그오브레전드 듀오 구함", img: "52", meta: "15분전", count: "8/10" },
                { title: "발로란트 스파이크 러시", img: "56", meta: "19분전", count: "5/10" },
                { title: "몬헌 월드 파밍팟", img: "60", meta: "27분전", count: "3/4" }
            ].map((item, idx) => (
                <div key={idx} className="row flex justify-between items-center">
                <div className="row-left flex gap-3 items-center">
                    <div className="avatar w-8 h-8 rounded-full overflow-hidden">
                    <img src={`https://i.pravatar.cc/60?img=${item.img}`} alt="user" />
                    </div>
                    <div>
                    <div className="row-title text-xs font-bold truncate w-32">{item.title}</div>
                    <div className="row-sub text-[10px] text-gray-400">PC • {item.meta}</div>
                    </div>
                </div>
                <div className="row-right text-[11px] text-gray-500 font-medium">{item.count}</div>
                </div>
            ))}
            </div>
            
            <div className="section-title text-sm font-bold text-orange-600">🔥 인기 게임 모임</div>
            <div className="side-card bg-white rounded-xl p-4 shadow-sm space-y-4 border border-gray-100">
            <div className="row flex justify-between items-center">
                <div className="row-left flex gap-3 items-center">
                <div className="avatar w-8 h-8 rounded-full overflow-hidden"><img src="https://i.pravatar.cc/60?img=10" alt="user" /></div>
                <div>
                    <div className="row-title text-xs font-bold">FC온라인 랭크전 모임</div>
                    <div className="row-sub text-[10px] text-gray-400">PC • 12분전</div>
                </div>
                </div>
                <div className="row-right text-[11px] text-gray-500 font-medium">7/10</div>
            </div>
            </div>
        </aside>

        </div>
    </div>
    </div>
);
}
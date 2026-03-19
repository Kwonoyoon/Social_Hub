"use client";

import React from 'react';

/**
 * [주의] 다른 모든 import(Link, supabase 등)는 제거한 상태입니다.
 * 이 코드는 외부 라이브러리 의존성 없이 오직 화면만 띄웁니다.
 */
export default function GamePage() {
    const userData = {
        nickname: "권오윤",
        university: "세명대"
    };

    return (
        <div className="bg-[#f5f7fb] min-h-screen text-gray-800 p-8">
            <header className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-blue-600">knock knock 👋</h1>
                <div className="text-right">
                    <p className="font-bold text-lg">{userData.nickname}</p>
                    <p className="text-gray-400 text-sm">{userData.university}</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 text-center">
                    <div className="text-6xl mb-6">🎮</div>
                    <h2 className="text-3xl font-bold mb-4">게임 화면 로드 완료!</h2>
                    <p className="text-gray-500 text-lg mb-8">
                        드디어 Turbopack 에러를 뚫고 화면이 보이네요. <br/>
                        이제 여기서부터 게임 모임 리스트를 하나씩 채워볼까요?
                    </p>
                    <button 
                        onClick={() => alert('작동 확인!')}
                        className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-blue-200 shadow-lg"
                    >
                        테스트 버튼 클릭
                    </button>
                </div>
            </main>
        </div>
    );
}
"use client";

import React from 'react';
import { useRouter } from "next/navigation";

export default function GamePage() {
    const router = useRouter();

    return (
        <div className="bg-[#f5f7fb] min-h-screen p-8">
            <header className="max-w-4xl mx-auto flex justify-between items-center mb-10">
                <h1 className="text-2xl font-black text-blue-600 cursor-pointer" onClick={() => router.push('/')}>
                    knock knock 👋
                </h1>
                <button onClick={() => router.push('/')} className="text-gray-500 font-bold hover:text-blue-600">뒤로가기</button>
            </header>

            <main className="max-w-4xl mx-auto">
                <div className="bg-white rounded-[40px] p-16 shadow-xl border border-white text-center">
                    <div className="text-8xl mb-8 animate-bounce">🎮</div>
                    <h2 className="text-4xl font-black mb-6 text-gray-900">게임 월드 입장!</h2>
                    <p className="text-gray-500 text-xl mb-12 leading-relaxed">
                        오윤님, 드디어 에러를 뚫고 들어오셨군요! <br/>
                        이제 여기서 새로운 게임 친구들을 찾아보세요.
                    </p>
                    <button 
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-12 py-5 rounded-[24px] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                    >
                        메인으로 돌아가기
                    </button>
                </div>
            </main>
        </div>
    );
} 
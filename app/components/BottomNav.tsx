"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageSquare, User } from 'lucide-react'; // 👈 세련된 라인 아이콘 import

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    // 이모지 대신 컴포넌트로 아이콘 변경
    const menus = [
        { name: '홈', Icon: Home, path: '/' },
        { name: '채팅', Icon: MessageSquare, path: '/chat' },
        { name: '마이', Icon: User, path: '/mypage' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-[0_-2px_15px_rgba(0,0,0,0.03)] pb-safe">
            {/* 높이를 h-16(64px)으로 최적화, max-w-lg로 폭 맞춤 */}
            <div className="max-w-lg mx-auto flex justify-around items-center h-16">
                {menus.map((menu) => {
                    const isActive = pathname === menu.path;
                    const { Icon } = menu; // 아이콘 컴포넌트 추출

                    return (
                        <button
                            key={menu.path}
                            onClick={() => router.push(menu.path)}
                            className="flex flex-col items-center justify-center w-full gap-1.5 transition-all active:scale-95"
                        >
                            {/* Icon 컴포넌트 사용: size와 strokeWidth로 두께 조절 */}
                            <Icon 
                                size={22} 
                                strokeWidth={isActive ? 2.5 : 2} // 활성화 시 더 두껍게
                                className={`${isActive ? 'text-blue-600' : 'text-gray-300'}`}
                            />
                            {/* 텍스트 스타일: font-black 및 크기 조정 */}
                            <span className={`text-[10px] font-black tracking-tight ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>
                                {menu.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
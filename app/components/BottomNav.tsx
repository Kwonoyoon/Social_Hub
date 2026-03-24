// app/components/BottomNav.tsx
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname(); // 현재 있는 페이지의 주소를 확인하는 기능

    return (
        <nav className="border-t border-neutral-200 bg-white sticky bottom-0 z-10 w-full shadow-lg mt-auto">
            <div className="w-full max-w-[1440px] mx-auto px-16 py-6 flex justify-between items-center">
                
                {/* 홈 탭 */}
                <li 
                    onClick={() => router.push('/')}
                    className={`flex flex-col items-center gap-2 cursor-pointer list-none flex-1 transition-colors ${
                        pathname === '/' ? 'text-blue-600 font-semibold' : 'text-neutral-400 hover:text-gray-600'
                    }`}
                >
                    <svg className="h-8 w-8" fill={pathname === '/' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke={pathname === '/' ? 'none' : 'currentColor'}>
                        {pathname === '/' 
                            ? <path d="M10.707 2.261a2 2 0 00-1.414 0l-7 3.267A2 2 0 001 7.354v11.29A2 2 0 003 20.5h14a2 2 0 002-1.856V7.354a2 2 0 00-1.293-1.826l-7-3.267zM9 13a1 1 0 011-1h4a1 1 0 011 1v6H9v-6z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        }
                    </svg>
                    <span className="text-sm">홈</span>
                </li>
                
                {/* 채팅 탭 (주소가 /chat 으로 시작하면 파란색 활성화) */}
                <li 
                    onClick={() => router.push('/chat')}
                    className={`flex flex-col items-center gap-2 cursor-pointer list-none flex-1 transition-colors ${
                        pathname.startsWith('/chat') ? 'text-blue-600 font-semibold' : 'text-neutral-400 hover:text-gray-600'
                    }`}
                >
                    <svg className="h-8 w-8" fill={pathname.startsWith('/chat') ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke={pathname.startsWith('/chat') ? 'none' : 'currentColor'} strokeWidth={pathname.startsWith('/chat') ? '0' : '2'}>
                        {pathname.startsWith('/chat')
                            ? <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        }
                    </svg>
                    <span className="text-sm">채팅</span>
                </li>
                
                {/* 마이페이지 탭 */}
                <li 
                    onClick={() => router.push('/mypage')}
                    className={`flex flex-col items-center gap-2 cursor-pointer list-none flex-1 transition-colors ${
                        pathname === '/mypage' ? 'text-blue-600 font-semibold' : 'text-neutral-400 hover:text-gray-600'
                    }`}
                >
                    <svg className="h-8 w-8" fill={pathname === '/mypage' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke={pathname === '/mypage' ? 'none' : 'currentColor'}>
                        {pathname === '/mypage'
                            ? <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        }
                    </svg>
                    <span className="text-sm">마이페이지</span>
                </li>
                
            </div>
        </nav>
    );
}
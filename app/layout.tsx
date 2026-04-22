'use client';

import { useEffect } from 'react';
import { socket } from '@/app/lib/socket'; // 아까 만든 소켓 설정 파일
import { supabase } from '@/app/lib/supabase';
import "./globals.css"; // ✅ 이게 있어야 스타일이 안 깨지고 정상으로 나옵니다!

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const setupNotificationSocket = async () => {
      // 현재 로그인한 유저 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ✅ 내 ID로 된 개인 소켓 방에 입장 (알람을 받기 위한 필수 관문)
        socket.emit('join_room', user.id);
        console.log(`알람 수신 대기 중: ${user.id}`);
      }
    };

    setupNotificationSocket();
  }, []);

  return (
    <html lang="ko">
      {/* 바디 스타일을 깨뜨리지 않게 기본 children만 렌더링합니다 */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
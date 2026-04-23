"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

// 💡 데이터 타입을 정의해서 빨간 줄(에러)을 방지합니다.
interface NotificationType {
    id: string;
    type: string;
    created_at: string;
    sender: {
        nickname: string;
        profile_url: string | null;
    } | null;
}

export default function NotificationsPage() {
    // 💡 타입을 NotificationType[]로 지정합니다.
    const [notis, setNotis] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotis = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // 알림과 보낸 사람의 정보를 함께 가져옵니다.
                const { data, error } = await supabase
                    .from('notifications')
                    .select(`
                        id,
                        type,
                        created_at,
                        sender:sender_id(nickname, profile_url)
                    `)
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setNotis((data as any) || []);
            } catch (err) {
                console.error("알림 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotis();
    }, []);

    return (
        <div className="bg-[#f5f7fb] min-h-screen p-6 font-sans">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/" className="text-gray-400 text-xl">←</Link>
                <h1 className="text-2xl font-black italic text-blue-600 tracking-tighter">ALERTS 🔔</h1>
            </header>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center py-10 text-blue-400 font-bold animate-pulse">확인 중...</p>
                ) : notis.length === 0 ? (
                    <div className="bg-white rounded-[35px] p-10 text-center border border-gray-100 shadow-sm">
                        <p className="text-gray-300 font-bold">아직 도착한 소식이 없어요!</p>
                    </div>
                ) : (
                    notis.map((n) => (
                        <div key={n.id} className="bg-white p-6 rounded-[30px] shadow-[0_5px_20px_rgba(0,0,0,0.02)] border border-white flex items-center gap-4 transition-all active:scale-95">
                            <div className="w-14 h-14 bg-blue-50 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                {n.sender?.profile_url ? (
                                    <img src={n.sender.profile_url} className="w-full h-full object-cover" alt="profile" />
                                ) : (
                                    <span className="text-2xl">👤</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-gray-800 leading-tight">
                                    <span className="text-blue-600 font-black">{n.sender?.nickname || "누군가"}</span>님이
                                    {n.type === 'follow' ? " 회원님을 팔로우했습니다." : " 매칭을 신청했습니다."}
                                </p>
                                <span className="text-[10px] text-gray-300 font-black uppercase mt-1 block tracking-widest">
                                    {new Date(n.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
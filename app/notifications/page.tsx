"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function NotificationsPage() {
    const [notis, setNotis] = useState([]);

    useEffect(() => {
        const fetchNotis = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data } = await supabase
                .from('notifications')
                .select(`
                    *,
                    sender:sender_id(nickname, profile_url)
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            setNotis(data || []);
        };
        fetchNotis();
    }, []);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-black italic text-blue-600 mb-6">ALERTS 🔔</h1>
            {notis.length === 0 ? (
                <p className="text-gray-400 font-bold">아직 도착한 소식이 없어요!</p>
            ) : (
                notis.map((n) => (
                    <div key={n.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full overflow-hidden">
                            {n.sender?.profile_url && <img src={n.sender.profile_url} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold">
                                <span className="text-blue-600">{n.sender?.nickname}</span>님이 회원님을 팔로우했습니다.
                            </p>
                            <span className="text-[10px] text-gray-300 font-medium">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
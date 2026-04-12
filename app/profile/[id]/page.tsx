"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [myId, setMyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) setMyId(session.user.id);

                const { data: profile } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', params.id)
                    .single();
                
                if (profile) setUser(profile);

                if (session) {
                    const { data: follow } = await supabase
                        .from('follow')
                        .select('*')
                        .eq('follower_id', session.user.id)
                        .eq('following_id', params.id)
                        .maybeSingle(); 
                    
                    if (follow) setIsFollowing(true);
                }
            } catch (err) {
                console.error("데이터 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [params.id]);

    const handleFollowToggle = async () => {
        if (!myId) return alert("로그인이 필요합니다.");
        if (myId === params.id) return alert("본인은 팔로우할 수 없습니다.");

        if (isFollowing) {
            // 💡 팔로우 취소 (언팔로우) 로직
            const { error: deleteError } = await supabase
                .from('follow')
                .delete()
                .eq('follower_id', myId)
                .eq('following_id', params.id);

            if (!deleteError) {
                // 관련 알림 삭제 (선택 사항)
                await supabase.from('notifications')
                    .delete()
                    .eq('sender_id', myId)
                    .eq('user_id', params.id)
                    .eq('type', 'follow');

                setIsFollowing(false);
            }
        } else {
            // 💡 팔로우 등록 로직
            const { error: insertError } = await supabase
                .from('follow')
                .insert([{ follower_id: myId, following_id: params.id }]);

            if (!insertError) {
                await supabase.from('notifications').insert([
                    { user_id: params.id, sender_id: myId, type: 'follow' }
                ]);
                setIsFollowing(true);
            }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-black text-blue-600 italic">KNOCK KNOCK...</div>;
    if (!user) return <div className="text-center p-20 font-bold">존재하지 않는 유저입니다.</div>;

    return (
        <div className="bg-[#f5f7fb] min-h-screen pb-20">
            {/* 💡 헤더 타이틀을 KNOCK KNOCK으로 변경 */}
            <header className="p-6 flex items-center justify-between bg-white shadow-sm sticky top-0 z-10">
                <button onClick={() => router.back()} className="text-2xl font-black text-gray-800">←</button>
                <h1 className="font-black text-xl italic text-blue-600 tracking-tighter">KNOCK KNOCK</h1>
                <div className="w-8"></div>
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-6">
                <section className="bg-white p-10 rounded-[45px] shadow-sm text-center border border-white">
                    <div className="w-28 h-28 rounded-full mx-auto mb-6 bg-gray-50 overflow-hidden border-4 border-gray-50 shadow-md">
                        {user.profile_url ? (
                            <img src={user.profile_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <span className="text-6xl flex items-center justify-center h-full">👤</span>
                        )}
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-1">{user.nickname}</h2>
                    <p className="text-blue-500 font-bold mb-8 italic">@{user.nickname}</p>

                    {/* 💡 팔로우/취소 토글 버튼 */}
                    {myId !== params.id && (
                        <button 
                            onClick={handleFollowToggle}
                            className={`w-full py-5 rounded-[25px] font-black text-sm transition-all active:scale-95 ${
                                isFollowing 
                                ? 'bg-gray-100 text-gray-400 border border-gray-200' 
                                : 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                            }`}
                        >
                            {isFollowing ? "FOLLOWING (취소)" : "FOLLOW"}
                        </button>
                    )}
                </section>

                <section className="bg-white p-9 rounded-[40px] shadow-sm border border-white">
                    <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                        <span>✨</span> 취향 키워드
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {[...(user.movie || []), ...(user.music || []), ...(user.hobby || [])].map((tag, i) => (
                            <span key={i} className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-full font-black text-[11px] border border-blue-100">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
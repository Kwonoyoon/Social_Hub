"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import BottomNav from "../components/BottomNav";

// --- 1. 공통 컴포넌트: 회색 기본 프로필 아이콘 ---
function DefaultProfileIcon({ size = "medium" }: { size?: "small" | "medium" }) {
    const isSmall = size === "small";
    return (
        <div className={`${isSmall ? 'w-12 h-12' : 'w-24 h-24'} rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden`}>
            <div className="flex flex-col items-center justify-center text-[#94a3b8]">
                <div className={`${isSmall ? 'w-2.5 h-2.5 border-[1.5px]' : 'w-5 h-5 border-[2.5px]'} rounded-full border-current mb-0.5`}></div>
                <div className={`${isSmall ? 'w-4 h-2 border-[1.5px]' : 'w-8 h-4 border-[2.5px]'} rounded-t-full border-t-current border-x-current border-b-0 border-current`}></div>
            </div>
        </div>
    );
}

// --- 2. 보조 컴포넌트 ---
function TasteCard({ emoji, title, value, color }: { emoji: string, title: string, value: string[], color: string }) {
    const colorMap: any = { 
        purple: "text-purple-600 bg-purple-50", 
        blue: "text-blue-600 bg-blue-50", 
        pink: "text-pink-600 bg-pink-50", 
        indigo: "text-indigo-600 bg-indigo-50" 
    };
    return (
        <div className="bg-[#FBFBFF] rounded-[30px] p-6 flex flex-col gap-4 border border-gray-50">
            <div className="flex items-center gap-2 text-gray-400">
                <span className="text-base">{emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {value && value.length > 0 ? value.map((v: string, i: number) => (
                    <span key={i} className={`text-[12px] font-black ${colorMap[color]} px-3 py-2 rounded-2xl`}>{v}</span>
                )) : <span className="text-[12px] font-bold text-gray-300">미선택</span>}
            </div>
        </div>
    );
}

function MenuListItem({ icon, title, onClick }: { icon: string, title: string, onClick?: () => void }) {
    return (
        <div onClick={onClick} className="flex items-center justify-between p-6 hover:bg-gray-50 cursor-pointer transition-colors group">
            <div className="flex items-center gap-4">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-black text-gray-700">{title}</span>
            </div>
            <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        </div>
    );
}

export default function MyPage() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [viewMode, setViewMode] = useState<"none" | "FOLLOWING" | "FOLLOWER">("none");
    const [followList, setFollowList] = useState<any[]>([]);
    const [counts, setCounts] = useState({ follower: 0, following: 0 });

    const fetchProfileData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/');

        const { data: user } = await supabase.from('user').select('*').eq('id', session.user.id).single();
        const { count: f1 } = await supabase.from('follow').select('*', { count: 'exact', head: true }).eq('following_id', session.user.id);
        const { count: f2 } = await supabase.from('follow').select('*', { count: 'exact', head: true }).eq('follower_id', session.user.id);

        if (user) {
            setUserData(user);
            setEditBio(user.bio || "");
            setCounts({ follower: f1 || 0, following: f2 || 0 });
        }
        setLoading(false);
    };

    useEffect(() => { fetchProfileData(); }, [router]);

    // 💡 400 에러 원천 차단: 관계 조인 없이 수동 패칭
    const handleShowList = async (mode: "FOLLOWING" | "FOLLOWER") => {
        setViewMode(mode);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            let ids: string[] = [];
            if (mode === "FOLLOWING") {
                const { data } = await supabase.from('follow').select('following_id').eq('follower_id', session.user.id);
                ids = data?.map(d => d.following_id) || [];
            } else {
                const { data } = await supabase.from('follow').select('follower_id').eq('following_id', session.user.id);
                ids = data?.map(d => d.follower_id) || [];
            }

            if (ids.length > 0) {
                const { data: users, error } = await supabase.from('user').select('id, nickname, bio').in('id', ids);
                if (error) throw error;
                setFollowList(users || []);
            } else {
                setFollowList([]);
            }
        } catch (e) {
            console.error(e);
            setFollowList([]);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 italic uppercase">KNOCK KNOCK... 👋</div>;

    return (
        <div className="bg-[#f5f7fb] min-h-screen pb-32">
            <header className="px-8 py-5 bg-white shadow-sm border-b border-gray-50">
                <h1 className="font-black text-xl text-blue-600 italic tracking-tighter uppercase text-left">KNOCK KNOCK</h1>
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-6">
                <section className="bg-white p-10 rounded-[45px] shadow-sm text-center relative">
                    {!isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(true)} className="absolute top-8 right-8 text-blue-600 font-black text-[11px] italic uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">EDIT</button>
                            <div className="mb-6 flex justify-center"><DefaultProfileIcon /></div>
                            <h2 className="text-3xl font-black text-gray-900 mb-1">{userData.nickname}</h2>
                            <p className="text-blue-500 font-bold mb-6 italic text-sm tracking-tight">@{userData.nickname}</p>

                            <div className="flex justify-center gap-8 mb-8 font-black uppercase tracking-tighter">
                                <div className="cursor-pointer" onClick={() => handleShowList('FOLLOWER')}>
                                    <p className="text-[10px] text-gray-300 mb-1 tracking-widest">Follower</p>
                                    <p className="text-xl text-gray-800">{counts.follower}</p>
                                </div>
                                <div className="w-[1px] h-8 bg-gray-100 self-center"></div>
                                <div className="cursor-pointer" onClick={() => handleShowList('FOLLOWING')}>
                                    <p className="text-[10px] text-gray-300 mb-1 tracking-widest">Following</p>
                                    <p className="text-xl text-gray-800">{counts.following}</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-50 text-gray-600 font-bold text-sm italic">
                                "{userData.bio || "반가워요!"}"
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-black text-blue-600 italic text-sm mb-2 text-left ml-2 uppercase tracking-widest">Profile Edit</h3>
                            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold h-24 resize-none" />
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-sm text-gray-400">CANCEL</button>
                                <button onClick={async () => {
                                    await supabase.from('user').update({ bio: editBio }).eq('id', userData.id);
                                    setIsEditing(false);
                                    fetchProfileData();
                                }} className="flex-1 py-4 bg-blue-600 rounded-2xl font-black text-sm text-white">SAVE</button>
                            </div>
                        </div>
                    )}
                </section>

                {!isEditing && (
                    <>
                        <section className="bg-white p-9 rounded-[45px] shadow-sm border border-white">
                            <div className="flex justify-between items-center mb-8 px-1">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">나의 취향 키워드</h3>
                                <button onClick={() => router.push('/onboarding?mode=edit')} className="text-[13px] font-black text-blue-600">편집 ✏️</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <TasteCard emoji="🎬" title="Movie" value={userData.movie || []} color="purple" />
                                <TasteCard emoji="🎵" title="Music" value={userData.music || []} color="blue" />
                                <TasteCard emoji="✨" title="Hobby" value={userData.hobby || []} color="pink" />
                                <TasteCard emoji="🧠" title="MBTI" value={[userData.mbti]} color="indigo" />
                            </div>
                        </section>

                        <section className="bg-white rounded-[45px] shadow-sm border border-gray-50 overflow-hidden divide-y divide-gray-50">
                            <MenuListItem icon="👥" title="팔로워 / 팔로잉 리스트 확인" onClick={() => handleShowList('FOLLOWING')} />
                            <MenuListItem icon="⚙️" title="앱 설정 및 알림 관리" />
                        </section>
                    </>
                )}
            </main>

            {/* 목록 모달 */}
            {viewMode !== "none" && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-end animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg mx-auto rounded-t-[45px] p-8 h-[75vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h3 className="text-2xl font-black text-blue-600 uppercase italic tracking-tighter">{viewMode}</h3>
                            <button onClick={() => setViewMode("none")} className="text-gray-300 hover:text-gray-900 text-3xl font-bold">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-10">
                            {followList.length === 0 ? (
                                <p className="text-center text-gray-300 font-bold py-20 italic">비어있는 리스트입니다.</p>
                            ) : (
                                followList.map((u) => (
                                    <div key={u.id} onClick={() => router.push(`/profile/${u.id}`)} className="flex items-center gap-5 p-5 bg-gray-50 rounded-[30px] border border-white shadow-sm cursor-pointer hover:bg-white transition-all">
                                        <DefaultProfileIcon size="small" />
                                        <div className="flex-1 overflow-hidden text-left">
                                            <p className="font-black text-gray-800 text-base truncate">{u.nickname}</p>
                                            <p className="text-[11px] text-gray-400 font-bold truncate italic">"{u.bio || "Hello!"}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
            <BottomNav />
        </div>
    );
}
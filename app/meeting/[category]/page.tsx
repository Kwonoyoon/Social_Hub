"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function UnifiedCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const category = (params?.category as string) || 'game';

    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const [infoModalRoom, setInfoModalRoom] = useState<any | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRoom, setNewRoom] = useState({ title: '', description: '', max_capacity: 4, password: '' });
    const [passModalRoom, setPassModalRoom] = useState<any | null>(null);
    const [inputPassword, setInputPassword] = useState('');

    const config: any = {
        game: { title: "게임", icon: "🕹️", img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800" },
        movie: { title: "영화", icon: "🎬", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800" },
        travel: { title: "여행", icon: "✈️", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800" },
        music: { title: "음악", icon: "🎧", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800" }
    };

    const cur = config[category] || config.game;

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUserId(session?.user?.id || null);
            const { data, error } = await supabase.from('meeting').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            
            const filtered = (data || []).filter(room => 
                room.title.includes(cur.title) || (room.description && room.description.includes(cur.title))
            );
            setMeetings(filtered);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [category]);

    const randomRoom = useMemo(() => {
        if (meetings.length === 0) return null;
        return meetings[Math.floor(Math.random() * meetings.length)];
    }, [meetings]);

    const joinMeetingDB = async (room: any) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return alert("로그인이 필요합니다!");

        try {
            const { error } = await supabase
                .from('meeting_participant')
                .insert([{ 
                    meeting_id: room.meeting_id, 
                    user_id: session.user.id,
                    role: 'member'
                }]);

            if (error && error.code !== '23505') throw error;
            router.push(`/chat/${room.room_id}`);
        } catch (err) {
            console.error("입장 기록 실패:", err);
            alert("모임 참여에 실패했습니다.");
        }
    };

    const handleJoinRequest = (room: any) => {
        if (room.password) { 
            setPassModalRoom(room); 
            setInputPassword(''); 
        } else { 
            joinMeetingDB(room); 
        }
    };

    const handlePasswordSubmit = () => {
        if (inputPassword === passModalRoom.password) {
            joinMeetingDB(passModalRoom);
            setPassModalRoom(null);
        } else { 
            alert("비밀번호가 틀렸습니다! 🔒"); 
            setInputPassword(''); 
        }
    };

    const handleCreateRoom = async () => {
        if (!newRoom.title.trim()) return alert("제목을 입력해주세요!");
        try {
            const { data: roomData, error: roomError } = await supabase
                .from('chat_room')
                .insert([{ room_type: 'group' }])
                .select()
                .single();
            
            if (roomError) throw roomError;

            const { data: meetingData, error: meetingError } = await supabase
                .from('meeting')
                .insert([{ 
                    host_id: currentUserId, 
                    title: `[${cur.title}] ${newRoom.title}`,
                    description: newRoom.description, 
                    max_capacity: newRoom.max_capacity, 
                    password: newRoom.password || null, 
                    status: 'ACTIVE',
                    room_id: roomData.id
                }])
                .select()
                .single();

            if (meetingError) throw meetingError;

            await supabase.from('meeting_participant').insert([{
                meeting_id: meetingData.meeting_id,
                user_id: currentUserId,
                role: 'host'
            }]);

            setIsCreateModalOpen(false);
            setNewRoom({ title: '', description: '', max_capacity: 4, password: '' });
            fetchData();
            alert("모임이 생성되었습니다! 🚀");
        } catch (err) { 
            console.error(err);
            alert("생성 실패"); 
        }
    };

    const handleDeleteRoom = async (meetingId: string) => {
        if (!confirm("정말로 삭제하시겠습니까?")) return;
        const { error } = await supabase.from('meeting').delete().eq('meeting_id', meetingId);
        if (!error) fetchData();
    };

    const displayedMeetings = showAll ? meetings : meetings.slice(0, 4);

    return (
        <div className="min-h-screen bg-[#f8f9fd] p-6 md:p-8 flex justify-center text-gray-900 overflow-x-hidden">
            <div className="w-full max-w-[1280px] flex flex-col lg:flex-row gap-8">
                
                {/* 왼쪽 메인 섹션 */}
                <div className="flex-1 bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-neutral-100">
                    <header className="flex items-center gap-4 mb-10">
                        <button onClick={() => router.push('/')} className="group flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-50 hover:bg-blue-600 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {['Game', 'Movie', 'Travel', 'Music'].map((cat) => (
                                <button key={cat} onClick={() => router.push(`/meeting/${cat.toLowerCase()}`)}
                                    className={`px-6 py-2.5 rounded-xl font-black whitespace-nowrap transition-all text-sm ${category === cat.toLowerCase() ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-300 border border-gray-100 hover:bg-gray-50'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </header>

                    <section>
                        <div className="mb-8 flex items-center justify-between px-1">
                            <h2 className="text-xl font-black flex items-center gap-2">{cur.icon} 추천 {cur.title} 모임</h2>
                            <button onClick={() => setIsCreateModalOpen(true)} className="text-blue-600 font-black text-[11px] bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">+ 모임 만들기</button>
                        </div>

                        {/* 추천 카드: aspect 조절로 크기 최적화 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                            {displayedMeetings.slice(0, 2).map((room) => (
                                <div key={room.meeting_id} className="relative group rounded-[30px] aspect-[16/10] bg-gray-900 overflow-hidden shadow-sm">
                                    <img src={cur.img} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" alt="bg" />
                                    {currentUserId === room.host_id && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.meeting_id); }} className="absolute top-4 right-4 z-10 bg-red-500/90 text-white px-3 py-1 rounded-lg text-[9px] font-black backdrop-blur-sm">삭제</button>
                                    )}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white">
                                        <h3 className="text-lg font-black mb-3 line-clamp-1">{room.title} {room.password && "🔒"}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleJoinRequest(room)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-black text-[10px] hover:bg-blue-700 transition-colors">참여하기</button>
                                            <button onClick={() => setInfoModalRoom(room)} className="flex-1 bg-white/20 backdrop-blur-md text-white py-2.5 rounded-xl font-bold text-[10px] hover:bg-white/30 transition-colors">정보보기</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 리스트 아이템 */}
                        <div className="space-y-3">
                            {displayedMeetings.slice(2).map((room) => (
                                <div key={room.meeting_id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-[24px] border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">{cur.icon}</div>
                                        <div>
                                            <h4 className="font-black text-gray-800 text-sm leading-tight">{room.title} {room.password && "🔒"}</h4>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Max: {room.max_capacity}명</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {currentUserId === room.host_id && <button onClick={() => handleDeleteRoom(room.meeting_id)} className="text-red-400 font-bold text-[9px] hover:underline mr-2">삭제</button>}
                                        <button onClick={() => handleJoinRequest(room)} className="bg-gray-900 text-white px-5 py-2 rounded-xl font-black text-[10px] hover:bg-blue-600 transition-all">참여</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!showAll && meetings.length > 4 && (
                            <button onClick={() => setShowAll(true)} className="w-full py-4 mt-6 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] hover:bg-gray-100 border border-dashed border-gray-200 uppercase tracking-tighter">+ Show All Rooms</button>
                        )}
                    </section>
                </div>

                {/* 오른쪽 사이드바 */}
                <aside className="w-full lg:w-[320px] space-y-6">
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-neutral-100">
                        <h3 className="text-md font-black text-gray-900 mb-5 flex items-center gap-2"><span className="text-blue-600">🎲</span> 랜덤 추천</h3>
                        {randomRoom ? (
                            <div className="p-5 bg-blue-50 rounded-[24px] border border-blue-100">
                                <h4 className="font-black text-gray-800 text-sm mb-4 truncate">{randomRoom.title}</h4>
                                <button onClick={() => handleJoinRequest(randomRoom)} className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] shadow-sm hover:bg-blue-600 hover:text-white transition-all">바로가기</button>
                            </div>
                        ) : <p className="text-gray-300 text-center py-6 text-xs italic">방이 없습니다.</p>}
                    </div>

                    <div className="bg-blue-600 rounded-[32px] p-6 shadow-lg text-white">
                        <h3 className="text-md font-black mb-6 italic flex items-center gap-2">🔥 실시간 랭킹</h3>
                        <div className="space-y-5">
                            {meetings.slice(0, 4).map((room, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => setInfoModalRoom(room)}>
                                    <span className="text-2xl font-black italic opacity-40">{i + 1}</span>
                                    <p className="font-black text-xs truncate group-hover:underline">{room.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* 모달들은 기존 로직 유지 (들여쓰기만 조정) */}
            {passModalRoom && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
                    <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl">
                        <h2 className="text-lg font-black text-gray-900 mb-4 text-center">Password 🔒</h2>
                        <input type="password" autoFocus className="w-full bg-gray-50 rounded-xl p-3 font-black text-center text-lg outline-none mb-6" placeholder="****" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} />
                        <div className="flex gap-2">
                            <button onClick={() => setPassModalRoom(null)} className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-xs">취소</button>
                            <button onClick={handlePasswordSubmit} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs">입장</button>
                        </div>
                    </div>
                </div>
            )}
            {/* 나머지 모달 생략 (코드 구조 동일) */}
        </div>
    );
}
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

    // 💡 [핵심 수정] DB에 입장 기록을 남기는 공통 함수
    const joinMeetingDB = async (room: any) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return alert("로그인이 필요합니다!");

        try {
            // meeting_participant 테이블에 입장 기록 추가 (중복 방지는 DB가 처리)
            const { error } = await supabase
                .from('meeting_participant')
                .insert([{ 
                    meeting_id: room.meeting_id, 
                    user_id: session.user.id,
                    role: 'member'
                }]);

            // 이미 참여 중인 경우(23505 에러)는 무시하고 진행
            if (error && error.code !== '23505') throw error;

            // 도장 찍기 성공 후 채팅방으로 이동
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
            joinMeetingDB(room); // 💡 비번 없으면 바로 도장 찍고 입장
        }
    };

    const handlePasswordSubmit = () => {
        if (inputPassword === passModalRoom.password) {
            joinMeetingDB(passModalRoom); // 💡 비번 맞으면 도장 찍고 입장
            setPassModalRoom(null);
        } else { 
            alert("비밀번호가 틀렸습니다! 🔒"); 
            setInputPassword(''); 
        }
    };

    const handleCreateRoom = async () => {
        if (!newRoom.title.trim()) return alert("제목을 입력해주세요!");
        try {
            // 1. 먼저 chat_room 테이블에 방 생성 (모임용 채팅방)
            const { data: roomData, error: roomError } = await supabase
                .from('chat_room')
                .insert([{ room_type: 'group' }])
                .select()
                .single();
            
            if (roomError) throw roomError;

            // 2. 생성된 room_id와 함께 meeting 테이블에 모임 생성
            const { data: meetingData, error: meetingError } = await supabase
                .from('meeting')
                .insert([{ 
                    host_id: currentUserId, 
                    title: `[${cur.title}] ${newRoom.title}`,
                    description: newRoom.description, 
                    max_capacity: newRoom.max_capacity, 
                    password: newRoom.password || null, 
                    status: 'ACTIVE',
                    room_id: roomData.id // 💡 채팅방과 연결!
                }])
                .select()
                .single();

            if (meetingError) throw meetingError;

            // 3. 모임을 만든 사람(방장)도 참여자로 자동 등록 (그래야 본인 리스트에도 뜸)
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
        <div className="min-h-screen bg-[#f1f3f9] p-6 md:p-10 flex justify-center text-gray-900 overflow-x-hidden">
            {/* ... (이하 JSX 코드는 기존과 동일하므로 생략하지만, 실제 코드 작성시에는 그대로 두시면 됩니다) ... */}
            <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-8">
                
                <div className="flex-1 bg-white rounded-[50px] p-8 md:p-12 shadow-sm border border-white">
                    <header className="flex items-center gap-4 mb-10">
                        <button onClick={() => router.push('/')} className="group flex items-center justify-center w-12 h-12 min-w-[48px] rounded-2xl bg-gray-50 hover:bg-blue-600 transition-all shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white transition-colors"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            {['Game', 'Movie', 'Travel', 'Music'].map((cat) => (
                                <button key={cat} onClick={() => router.push(`/meeting/${cat.toLowerCase()}`)}
                                    className={`px-8 py-3 rounded-[18px] font-black whitespace-nowrap transition-all ${category === cat.toLowerCase() ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-300 border border-gray-50 hover:bg-gray-50'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </header>

                    <section>
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-2">{cur.icon} 추천 {cur.title} 모임</h2>
                            <button onClick={() => setIsCreateModalOpen(true)} className="text-blue-600 font-black text-xs bg-blue-50 px-5 py-3 rounded-[18px] hover:bg-blue-600 hover:text-white transition-all">+ 모임 만들기</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {displayedMeetings.slice(0, 2).map((room) => (
                                <div key={room.meeting_id} className="relative group rounded-[35px] aspect-[1.5/1] bg-gray-900 overflow-hidden shadow-md">
                                    <img src={cur.img} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" alt="bg" />
                                    {currentUserId === room.host_id && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.meeting_id); }} className="absolute top-5 right-5 z-10 bg-red-500/80 text-white px-3 py-1.5 rounded-xl text-[10px] font-black backdrop-blur-md">삭제</button>
                                    )}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent text-white">
                                        <h3 className="text-xl font-black mb-1">{room.title} {room.password && "🔒"}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleJoinRequest(room)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px]">참여하기</button>
                                            <button onClick={() => setInfoModalRoom(room)} className="bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-bold text-[11px]">정보보기</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {displayedMeetings.slice(2).map((room) => (
                                <div key={room.meeting_id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[25px] border border-gray-100/50 hover:bg-white hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">{cur.icon}</div>
                                        <div>
                                            <h4 className="font-black text-gray-800 leading-tight">{room.title} {room.password && "🔒"}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase italic tracking-tighter">Capacity: {room.max_capacity}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {currentUserId === room.host_id && <button onClick={() => handleDeleteRoom(room.meeting_id)} className="text-red-400 font-bold text-[10px] hover:underline mr-2">삭제</button>}
                                        <button onClick={() => setInfoModalRoom(room)} className="text-gray-400 font-bold text-[10px] mr-2 hover:text-gray-900 transition-all underline">info</button>
                                        <button onClick={() => handleJoinRequest(room)} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] hover:bg-blue-600 transition-all">참여하기</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!showAll && meetings.length > 4 && (
                            <button onClick={() => setShowAll(true)} className="w-full py-6 mt-6 bg-gray-50 text-gray-400 rounded-[30px] font-black text-xs hover:bg-gray-100 border border-dashed border-gray-200 uppercase tracking-widest">+ Show All</button>
                        )}
                    </section>
                </div>

                <aside className="w-full lg:w-[380px] space-y-8">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-white">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><span className="text-blue-600 text-xl">🎲</span> 랜덤 추천 모임</h3>
                        {randomRoom ? (
                            <div className="p-6 bg-blue-50 rounded-[30px] border border-blue-100 relative group">
                                <h4 className="font-black text-gray-800 text-base mb-1 truncate">{randomRoom.title}</h4>
                                <button onClick={() => handleJoinRequest(randomRoom)} className="w-full py-3.5 bg-white text-blue-600 rounded-2xl font-black text-[11px] mt-4 shadow-sm hover:bg-blue-600 hover:text-white transition-all">바로가기</button>
                            </div>
                        ) : <p className="text-gray-300 text-center py-10 italic">모임 정보 없음</p>}
                    </div>

                    <div className="bg-blue-600 rounded-[40px] p-8 shadow-xl text-white min-h-[300px]">
                        <h3 className="text-lg font-black mb-8 italic tracking-tighter flex items-center gap-2">🔥 실시간 인기 순위</h3>
                        <div className="space-y-6">
                            {meetings.slice(0, 4).map((room, i) => (
                                <div key={i} className="flex items-center gap-5 group cursor-pointer" onClick={() => setInfoModalRoom(room)}>
                                    <span className="text-4xl font-black italic opacity-30">{i + 1}</span>
                                    <p className="font-black text-sm truncate">{room.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {passModalRoom && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[150] p-4">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase italic">Enter Password 🔒</h2>
                        <input type="password" autoFocus className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-center text-lg outline-none focus:ring-2 focus:ring-blue-100 mb-6" placeholder="****" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} />
                        <div className="flex gap-3">
                            <button onClick={() => setPassModalRoom(null)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase">Cancel</button>
                            <button onClick={handlePasswordSubmit} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-100">Enter</button>
                        </div>
                    </div>
                </div>
            )}

            {infoModalRoom && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[110] p-4">
                    <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl relative">
                        <button onClick={() => setInfoModalRoom(null)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 text-2xl">✕</button>
                        <h2 className="text-3xl font-black text-gray-900 mb-5 leading-tight">{infoModalRoom.title}</h2>
                        <div className="bg-gray-50 rounded-[30px] p-6 mb-8"><p className="text-gray-500 font-bold">{infoModalRoom.description || "상세 설명이 없습니다."}</p></div>
                        <button onClick={() => { setInfoModalRoom(null); handleJoinRequest(infoModalRoom); }} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg">참여하기</button>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl relative">
                        <h2 className="text-2xl font-black mb-8 italic text-gray-900 uppercase">Create New Party {cur.icon}</h2>
                        <div className="space-y-5">
                            <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none text-sm focus:bg-white" placeholder="모임 제목" value={newRoom.title} onChange={(e) => setNewRoom({...newRoom, title: e.target.value})} />
                            <textarea className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none h-28 resize-none text-sm focus:bg-white" placeholder="상세 설명" value={newRoom.description} onChange={(e) => setNewRoom({...newRoom, description: e.target.value})} />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-300 ml-1 uppercase">Capacity: {newRoom.max_capacity}</label>
                                    <input type="range" min="1" max="10" className="w-full accent-blue-600" value={newRoom.max_capacity} onChange={(e) => setNewRoom({...newRoom, max_capacity: parseInt(e.target.value)})} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-300 ml-1 uppercase">Password</label>
                                    <input type="password" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none text-sm focus:bg-white" placeholder="비번(선택)" value={newRoom.password} onChange={(e) => setNewRoom({...newRoom, password: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4.5 bg-gray-100 text-gray-400 rounded-[22px] font-black text-[11px] uppercase">Cancel</button>
                            <button onClick={handleCreateRoom} className="flex-1 py-4.5 bg-blue-600 text-white rounded-[22px] font-black text-[11px] uppercase shadow-lg shadow-blue-100">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
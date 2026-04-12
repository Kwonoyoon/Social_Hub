"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; 
import BottomNav from "./components/BottomNav";
import { Search, Bell, User, X } from "lucide-react"; 

export default function MainPage() {
    const [userData, setUserData] = useState({
        nickname: "로딩 중...", 
        movie: "",
        music: "",
        hobby: ""
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 🔔 알림 관련 상태 관리
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotiOpen, setIsNotiOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    router.push("/onboarding"); 
                    return;
                }

                // 1. 프로필 정보 로드
                const { data: profile } = await supabase
                    .from("user")
                    .select("nickname, movie, music, hobby")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (profile) {
                    setUserData({
                        nickname: profile.nickname || "오윤", 
                        movie: profile.movie || "",
                        music: profile.music || "",
                        hobby: profile.hobby || ""
                    });
                }

                // 2. 초기 알림 목록 가져오기
                await fetchNotifications(session.user.id);

                // 3. 실시간 알림 구독
                const channel = supabase
                    .channel('realtime_notifications')
                    .on(
                        'postgres_changes',
                        { 
                            event: 'INSERT', 
                            schema: 'public', 
                            table: 'notifications', 
                            filter: `user_id=eq.${session.user.id}` 
                        },
                        () => {
                            fetchNotifications(session.user.id);
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };

            } catch (error) {
                console.error("데이터 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    // 💡 알림 데이터를 가져오는 함수 (400 에러 방지를 위한 2단계 로직)
    const fetchNotifications = async (userId: string) => {
        // [1단계] 알림 원본 데이터만 먼저 로드
        const { data: notiData, error: notiError } = await supabase
            .from('notifications')
            .select('*') 
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (notiError) {
            console.error("알림 쿼리 오류:", notiError);
            return;
        }

        if (notiData && notiData.length > 0) {
            // [2단계] 알림 보낸 유저들의 닉네임을 별도로 가져와 매핑
            const senderIds = Array.from(new Set(notiData.map(n => n.sender_id)));
            const { data: senderProfiles } = await supabase
                .from('user')
                .select('id, nickname')
                .in('id', senderIds);

            const combinedNotifications = notiData.map(noti => ({
                ...noti,
                sender: senderProfiles?.find(u => u.id === noti.sender_id) || { nickname: "알 수 없음" }
            }));

            setNotifications(combinedNotifications);
            setHasNewNotification(combinedNotifications.some(n => !n.is_read));
        }
    };

    // 💡 알림창 토글 및 읽음 처리
    const handleNotiToggle = async () => {
        setIsNotiOpen(!isNotiOpen);
        if (!isNotiOpen && hasNewNotification) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('user_id', session.user.id)
                    .eq('is_read', false);
                setHasNewNotification(false);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-black text-blue-600 bg-[#f5f7fb]">
            KNOCK KNOCK... 👋
        </div>
    );

    const userTags = [userData.movie, userData.music, userData.hobby].flat().filter(tag => tag && tag !== "");

    const categories = [
        { name: "영화", icon: "🎬", color: "bg-pink-50", path: "/meeting/movie" },
        { name: "음악", icon: "🎵", color: "bg-blue-50", path: "/meeting/music" },
        { name: "여행", icon: "✈️", color: "bg-green-50", path: "/meeting/travel" },
        { name: "게임", icon: "🎮", color: "bg-purple-50", path: "/meeting/game" } 
    ];

    return (
        <div className="min-h-screen bg-[#f5f7fb] flex flex-col items-center relative">
            <header className="w-full bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
                <div className="max-w-lg mx-auto flex justify-between items-center px-6 py-4">
                    <h1 className="text-xl font-black italic text-blue-600 tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
                        KNOCK KNOCK
                    </h1>
                    
                    <div className="flex items-center gap-5 text-gray-400">
                        <button className="hover:text-blue-600 transition-colors">
                            <Search size={20} strokeWidth={2.5} />
                        </button>
                        
                        <button onClick={handleNotiToggle} className="relative hover:text-blue-600 transition-colors">
                            <Bell size={20} strokeWidth={2.5} />
                            {hasNewNotification && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>
                        
                        <button onClick={() => router.push('/mypage')} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner hover:bg-blue-50 transition-all group">
                            <User size={18} strokeWidth={2.5} className="group-hover:text-blue-600" />
                        </button>
                    </div>
                </div>

                {isNotiOpen && (
                    <div className="absolute top-16 right-6 w-80 bg-white rounded-[25px] shadow-2xl border border-gray-100 z-[60] overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-blue-50/30">
                            <span className="text-[12px] font-black text-blue-600 uppercase tracking-widest">Recent Notifications</span>
                            <X size={14} className="text-gray-300 cursor-pointer hover:text-gray-600" onClick={() => setIsNotiOpen(false)} />
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? notifications.map((noti) => (
                                <div key={noti.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors cursor-pointer">
                                    <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                                        <span className="font-black text-blue-600">{noti.sender?.nickname}</span>님이 
                                        {noti.type === 'follow' ? ' 팔로우 신청을 보냈습니다. 👤' : ' 채팅을 보냈습니다. 💬'}
                                    </p>
                                    <span className="text-[10px] text-gray-300 font-bold mt-1 block uppercase">Just now</span>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-gray-300 text-[12px] font-bold italic">새로운 알림이 없습니다.</div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="max-w-lg w-full p-6 space-y-6 pb-32">
                <section className="bg-white p-8 rounded-[35px] shadow-sm flex justify-between items-center border border-gray-50">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                            안녕하세요, <span className="text-blue-600">{userData.nickname}님 !</span>
                        </h2>
                        <p className="text-gray-400 font-bold text-xs">오늘은 어떤 친구를 만나볼까요?</p>
                    </div>
                    <button onClick={() => router.push('/match')} className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-md hover:bg-blue-700 transition-all text-xs active:scale-95">
                        매칭 시작
                    </button>
                </section>

                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 카테고리 탐색
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <button key={cat.name} onClick={() => router.push(cat.path)} className={`${cat.color} aspect-square rounded-[24px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm`}>
                                <span className="text-2xl">{cat.icon}</span>
                                <span className="text-[11px] font-black text-gray-700">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 나의 관심사
                        </h3>
                        <button onClick={() => router.push('/onboarding?mode=edit')} className="text-blue-500 text-[12px] font-bold underline">편집</button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {userTags.length > 0 ? userTags.map(tag => (
                            <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-400 rounded-full text-[12px] font-bold border border-gray-100 shadow-sm">
                                #{tag}
                            </span>
                        )) : (
                            <span className="text-gray-300 text-[12px] font-bold italic px-1">관심사를 등록해 보세요!</span>
                        )}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
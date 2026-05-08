"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; 
import { socket } from "@/app/lib/socket"; // ✅ 실시간 알림용
import BottomNav from "./components/BottomNav";
import { Search, Bell, User } from "lucide-react"; 

export default function MainPage() {
    const [userData, setUserData] = useState({ nickname: "로딩 중...", movie: "", music: "", hobby: "" });
    const [unreadCount, setUnreadCount] = useState(0); // ✅ 알람 개수 상태
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // 기존 변수들은 그대로 두시고, 아래 3개만 새로 만드세요.
// 1. 상태 변수들은 그대로 두세요 (17~19번 줄)
const [foodKeyword, setFoodKeyword] = useState("");
const [foodPlaces, setFoodPlaces] = useState<any[]>([]);
const [isFoodSearching, setIsFoodSearching] = useState(false);

// 2. 함수 시작 (중복된 20번, 26번 줄 합침)
const handleFoodSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = foodKeyword.trim();
    if (!target) return;

    setIsFoodSearching(true);
    // 반드시 'REST API 키'여야 합니다!
    const REST_API_KEY = '0d0e846e52295731847d7c32a0f5cf3c'; 

    try {
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(target + " 맛집")}&category_group_code=FD6`,
            {
                method: 'GET',
                headers: {
                    // ★ 여기가 핵심: Authorization 뒤에 콜론(:)과 'KakaoAK ' (한 칸 띄움) 필수!
                    'Authorization': `KakaoAK ${REST_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorMsg = await response.text();
            console.error("카카오 응답 내용:", errorMsg);
            throw new Error(`${response.status}`);
        }

        const data = await response.json();
        setFoodPlaces(data.documents || []);

    } catch (error: any) {
        console.error("맛집 검색 실패:", error);
        // 에러가 403이면 브라우저 알림창 띄우기
        if (error.message === '403') {
            alert("카카오 설정(REST API 키 혹은 도메인)을 다시 확인해주세요.");
        }
    } finally {
        setIsFoodSearching(false);
    }
};

// 3. 페이지 로드 시 실행 (이미 useEffect가 있다면 그 안에 fetchPlaces(); 만 추가해도 됩니다)
useEffect(() => {
}, []);
    useEffect(() => {
        async function loadData() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { router.push("/onboarding"); return; }
                const { data: profile } = await supabase.from("user").select("*").eq("id", session.user.id).maybeSingle();
                if (profile) setUserData(profile);

                // ✅ 1. 내 ID로 된 소켓 방에 입장 (알람 수신을 위한 우체통 개설)
                socket.emit('join_room', session.user.id);

                // ✅ 초기 안읽은 알람 개수 로드
                const { count } = await supabase
                    .from("notifications")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", session.user.id)
                    .eq("is_read", false);
                setUnreadCount(count || 0);
            } finally {
                setLoading(false);
            }
        }
        loadData();

        // ✅ 3. 알람/메시지 왔을 때 빨간 점 띄우는 함수
        const handleNotification = () => {
            setUnreadCount(prev => prev + 1);
        };

        // ✅ 4. 두 종류의 신호를 모두 감시
        socket.on('receive_notification', handleNotification);
        socket.on('receive_message', handleNotification);

        return () => { 
            // ✅ 5. 페이지 나갈 때 감시 중단
            socket.off('receive_notification', handleNotification);
            socket.off('receive_message', handleNotification);
        };
    }, [router]);

    const handleCategoryClick = (categoryName: string) => {
        const categoryMap: { [key: string]: string } = {
            "영화": "movie", "음악": "music", "여행": "travel", "게임": "game"
        };
        const target = categoryMap[categoryName] || "game";
        router.push(`/meeting/${target}`);
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-black text-blue-600 bg-[#f5f7fb]">KNOCK KNOCK...</div>;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <header className="w-full bg-white sticky top-0 z-[100] border-b border-gray-100 shadow-sm">
                <div className="max-w-lg mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-black italic text-blue-600 tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
                        KNOCK KNOCK
                    </h1>
                    <div className="flex items-center gap-5 text-gray-400">
                        <Search size={20} strokeWidth={2.5} className="cursor-pointer hover:text-blue-600" />
                        
                        {/* 🔔 알람 아이콘: 클릭 영역 확보 및 z-index 설정 */}
                        <div 
                            className="relative cursor-pointer p-1" 
                            style={{ zIndex: 110 }} 
                            onClick={() => router.push('/notifications')}
                        >
                            <Bell size={20} strokeWidth={2.5} className="hover:text-blue-600 transition-colors" />
                            {unreadCount > 0 && (
                        /* 숫자를 빼고 크기를 줄인 순수 '빨간 점' */
                                <span className="absolute top-0 right-0 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse" />
                            )}
                            
                        </div>

                        <button onClick={() => router.push('/mypage')} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                            <User size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-6 space-y-6 pb-32">
                <section className="bg-white p-8 rounded-[35px] shadow-sm flex justify-between items-center border border-gray-50">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-gray-900 leading-tight">안녕하세요, <span className="text-blue-600">{userData.nickname}님 !</span></h2>
                        <p className="text-gray-400 font-bold text-[11px]">오늘은 어떤 친구를 만나볼까요?</p>
                    </div>
                    <button onClick={() => router.push('/match')} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black shadow-md text-[11px] active:scale-95">매칭 시작</button>
                </section>

                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <h3 className="text-[13px] font-black text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 카테고리 탐색
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { n: "영화", i: "🎬", c: "bg-pink-50" },
                            { n: "음악", i: "🎵", c: "bg-blue-50" },
                            { n: "여행", i: "✈️", c: "bg-green-50" },
                            { n: "게임", i: "🎮", c: "bg-purple-50" }
                        ].map((cat) => (
                            <div 
                                key={cat.n} 
                                onClick={() => handleCategoryClick(cat.n)}
                                className={`${cat.c} aspect-square rounded-[22px] flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm`}
                            >
                                <span className="text-xl">{cat.i}</span>
                                <span className="text-[10px] font-black text-gray-700">{cat.n}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 나의 관심사 대신 들어가는 핫플레이스 섹션 */}
                <form onSubmit={handleFoodSearch} className="mb-6 flex gap-2">
    <input 
        type="text" 
        value={foodKeyword}
        onChange={(e) => setFoodKeyword(e.target.value)}
        placeholder="학교 주변 맛집 검색"
        className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-[12px] focus:outline-none"
    />
    <button type="submit" className="bg-blue-500 text-white px-5 py-3 rounded-2xl text-[12px] font-bold">
        {isFoodSearching ? "..." : "검색"}
    </button>
</form>

<div className="flex gap-2 flex-wrap">
    {foodPlaces.map((place) => (
        <a key={place.id} href={place.place_url} target="_blank" className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold border border-blue-100">
            #{place.place_name}
        </a>
    ))}
</div>

</main>

            <BottomNav />
        </div>
    );
}

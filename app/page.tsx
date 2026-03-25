"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; 
import BottomNav from "./components/BottomNav";
// 👈 이 부분이 빠져있으면 에러가 납니다! 꼭 확인해주세요.
import { Search, Bell, User } from "lucide-react"; 

export default function MainPage() {
    const [userData, setUserData] = useState({
        nickname: "로딩 중...", 
        movie: "",
        music: "",
        hobby: ""
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function getProfile() {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    router.push("/onboarding"); 
                    return;
                }

                const { data, error } = await supabase
                    .from("user")
                    .select("nickname, movie, music, hobby")
                    .eq("id", session.user.id)
                    .maybeSingle();

                if (error) throw error;
                
                if (data) {
                    setUserData({
                        nickname: data.nickname || "오윤", 
                        movie: data.movie || "",
                        music: data.music || "",
                        hobby: data.hobby || ""
                    });
                }
            } catch (error) {
                console.error("데이터 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-black text-blue-600 bg-[#f5f7fb]">
            KNOCK KNOCK... 👋
        </div>
    );

    const userTags = [userData.movie, userData.music, userData.hobby].filter(tag => tag && tag !== "");

    // 카테고리 데이터: path를 미리 정의해서 클릭 시 이동하게 합니다.
    const categories = [
        { name: "영화", icon: "🎬", color: "bg-pink-50", path: "/category/movie" },
        { name: "음악", icon: "🎵", color: "bg-blue-50", path: "/category/music" },
        { name: "여행", icon: "✈️", color: "bg-green-50", path: "/category/travel" },
        { name: "게임", icon: "🎮", color: "bg-purple-50", path: "/category/game" }
    ];

    return (
        <div className="min-h-screen bg-[#f5f7fb] flex flex-col items-center">
            {/* 상단 헤더: Lucide 아이콘 적용 */}
            <header className="w-full bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
                <div className="max-w-lg mx-auto flex justify-between items-center px-6 py-4">
                    <h1 className="text-xl font-black italic text-blue-600 tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
                        KNOCK KNOCK
                    </h1>
                    
                    <div className="flex items-center gap-5 text-gray-400">
                        <button className="hover:text-blue-600 transition-colors">
                            <Search size={20} strokeWidth={2.5} />
                        </button>
                        <button className="relative hover:text-blue-600 transition-colors">
                            <Bell size={20} strokeWidth={2.5} />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        {/* 😵‍💫 대신 세련된 User 아이콘 프로필 버튼 */}
                        <button 
                            onClick={() => router.push('/mypage')} 
                            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner hover:bg-blue-50 transition-all group"
                        >
                            <User size={18} strokeWidth={2.5} className="group-hover:text-blue-600" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-lg w-full p-6 space-y-6 pb-32">
                {/* 웰컴 섹션 */}
                <section className="bg-white p-8 rounded-[35px] shadow-sm flex justify-between items-center border border-gray-50">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">
                            안녕하세요, <span className="text-blue-600">{userData.nickname}님 !</span>
                        </h2>
                        <p className="text-gray-400 font-bold text-xs">오늘은 어떤 친구를 만나볼까요?</p>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-md hover:bg-blue-700 transition-all text-xs">
                        매칭 시작
                    </button>
                </section>

                {/* 카테고리 섹션 */}
                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 카테고리 탐색
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <button 
                                key={cat.name} 
                                onClick={() => router.push(cat.path)} 
                                className={`${cat.color} aspect-square rounded-[24px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm outline-none`}
                            >
                                <span className="text-2xl">{cat.icon}</span>
                                <span className="text-[11px] font-black text-gray-700">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 나의 관심사 섹션 */}
                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 나의 관심사
                        </h3>
                        <button onClick={() => router.push('/onboarding?mode=edit')} className="text-blue-500 text-[12px] font-bold underline">편집</button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {userTags.length > 0 ? (
                            userTags.map(tag => (
                                <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-400 rounded-full text-[12px] font-bold border border-gray-100 shadow-sm">
                                    #{tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-300 text-[12px] font-bold italic px-1">관심사를 등록해 보세요!</span>
                        )}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; 
import BottomNav from "./components/BottomNav";
import { Search, Bell, User } from "lucide-react"; 

export default function MainPage() {
    const [userData, setUserData] = useState({ nickname: "로딩 중...", movie: "", music: "", hobby: "" });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { router.push("/onboarding"); return; }
                const { data: profile } = await supabase.from("user").select("*").eq("id", session.user.id).maybeSingle();
                if (profile) setUserData(profile);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    // 💡 카테고리 클릭 시 영문 경로로 매핑하여 이동
    const handleCategoryClick = (categoryName: string) => {
        const categoryMap: { [key: string]: string } = {
            "영화": "movie",
            "음악": "music",
            "여행": "travel",
            "게임": "game"
        };

        const target = categoryMap[categoryName] || "game";
        // UnifiedCategoryPage가 위치한 /meeting/[category] 경로로 이동합니다.
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
                        <Bell size={20} strokeWidth={2.5} className="cursor-pointer hover:text-blue-600" />
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

                <section className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[13px] font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 나의 관심사
                        </h3>
                        <button onClick={() => router.push('/onboarding?mode=edit')} className="text-blue-500 text-[11px] font-bold underline">편집</button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {["#코미디", "#애니메이션", "#EDM", "#게임"].map(tag => (
                            <span 
                                key={tag} 
                                onClick={() => handleCategoryClick(tag.replace('#', ''))}
                                className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full text-[11px] font-bold border border-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
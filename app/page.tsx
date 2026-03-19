"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; //

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
                const { data: { session } } = await supabase.auth.getSession(); //

                if (!session) {
                    router.push("/onboarding"); 
                    return;
                }

                // RLS가 해제되었으므로 이제 정상적으로 조회가 가능합니다
                const { data, error } = await supabase
                    .from("user")
                    .select("nickname, movie, music, hobby")
                    .eq("id", session.user.id)
                    .maybeSingle(); //

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

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            {/* 상단 헤더: 디자인 원래대로 복구 */}
            <header className="flex justify-between items-center px-10 py-6 bg-white sticky top-0 z-50 shadow-sm">
                <h1 className="text-2xl font-black italic text-blue-600 tracking-tighter">KNOCK KNOCK</h1>
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 text-xl">🔍</button>
                    <button className="text-gray-400 text-xl relative">
                        🔔 <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button onClick={() => router.push('/mypage')} className="flex items-center gap-2 hover:opacity-80 transition-all">
                        <div className="text-right mr-2 hidden sm:block">
                            <p className="text-[12px] font-black text-gray-900">{userData.nickname}님</p> {/* */}
                            <p className="text-[10px] text-gray-400 font-bold">세명대학교</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl border border-gray-50 shadow-sm">😵‍💫</div>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-10 space-y-10">
                {/* 메인 웰컴 섹션 */}
                <section className="bg-white p-12 rounded-[40px] shadow-sm flex justify-between items-center border border-gray-50">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">
                            안녕하세요, <span className="text-blue-600">{userData.nickname}님 !</span> {/* */}
                        </h2>
                        <p className="text-gray-400 font-bold mt-2">오늘은 어떤 친구를 만나볼까요?</p>
                    </div>
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
                        매칭 시작하기
                    </button>
                </section>

                {/* 카테고리 섹션 */}
                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-50">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 카테고리 탐색
                    </h3>
                    <div className="grid grid-cols-4 gap-6">
                        {[
                            { name: "영화", icon: "🎬", color: "bg-pink-50" },
                            { name: "음악", icon: "🎵", color: "bg-blue-50" },
                            { name: "여행", icon: "✈️", color: "bg-green-50" },
                            { name: "게임", icon: "🎮", color: "bg-purple-50" }
                        ].map((cat) => (
                            <div key={cat.name} className={`${cat.color} aspect-square rounded-[30px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 transition-all shadow-sm`}>
                                <span className="text-3xl">{cat.icon}</span>
                                <span className="text-[13px] font-black text-gray-700">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 나의 관심사 섹션 (DB 연동) */}
                <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-900 rounded-full"></span> 나의 관심사
                        </h3>
                        <button onClick={() => router.push('/onboarding?mode=edit')} className="text-blue-500 text-[13px] font-bold underline">편집</button>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {userTags.length > 0 ? (
                            userTags.map(tag => (
                                <span key={tag} className="px-5 py-2.5 bg-gray-50 text-gray-400 rounded-full text-[13px] font-bold border border-gray-100 shadow-sm">
                                    #{tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-300 text-[13px] font-bold italic">관심사를 등록해 보세요!</span>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
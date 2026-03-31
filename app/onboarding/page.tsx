"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from '@/app/lib/supabase';

const interestData = {
  영화: ["액션/스릴러", "로맨스", "코미디", "드라마", "공포/호러", "SF/판타지", "애니메이션", "다큐멘터리"],
  음악: ["K-POP", "힙합/랩", "인디/포크", "R&B", "록/메탈", "EDM/일렉트로닉", "재즈", "클래식"],
  취미: ["운동/헬스", "독서", "게임", "요리/베이킹", "여행", "사진/영상", "그림/디자인", "음악 연주"],
};

const mbtis = [
  "ENFP", "INFP", "ENFJ", "INFJ", 
  "ENTP", "INTP", "ENTJ", "INTJ",
  "ESFP", "ISFP", "ESFJ", "ISFJ",
  "ESTP", "ISTP", "ESTJ", "ISTJ"
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';

  const [currentStep, setCurrentStep] = useState(0); 
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState({
    email: "", 
    pw: "",
    nickname: "",
    university: "", 
    movie: [] as string[],
    music: [] as string[],
    hobby: [] as string[],
    mbti: "",
  });

  useEffect(() => {
    if (isEditMode) setCurrentStep(1);
  }, [isEditMode]);

  const renderHeader = (step: number, title: string, icon: string) => (
    <div className="mb-8 w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-2xl font-bold text-blue-800">{isEditMode ? `${title} 수정` : title}</h2>
        </div>
        <span className="text-gray-400 font-medium">{step} / 4</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>
    </div>
  );

  const renderInterestButtons = (category: 'movie' | 'music' | 'hobby', data: string[]) => (
    <div className="grid grid-cols-2 gap-4 w-full mt-6">
      {data.map(item => (
        <button key={item} type="button"
          onClick={() => {
            const currentList = onboardingData[category];
            const next = currentList.includes(item) ? currentList.filter(i => i !== item) : [...currentList, item];
            setOnboardingData({...onboardingData, [category]: next});
          }}
          className={`py-4 rounded-2xl border-2 font-bold transition-all text-sm shadow-sm ${onboardingData[category].includes(item) ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 text-gray-400 bg-white'}`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const updatePayload = {
        movie: onboardingData.movie[0] || "",
        music: onboardingData.music[0] || "",
        hobby: onboardingData.hobby[0] || "",
        mbti: onboardingData.mbti,
      };

      if (isEditMode) {
        if (!session?.user) throw new Error("로그인 정보가 없습니다.");
        const { error } = await supabase
          .from('user')
          .update(updatePayload)
          .eq('id', session.user.id);

        if (error) throw error;
        alert("취향 수정이 완료되었습니다! ✨");
        router.push('/mypage');

      } else if (isSignupMode) {
        if (!isAgreed) { alert("이용약관에 동의해주세요!"); setLoading(false); return; }
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: onboardingData.email,
          password: onboardingData.pw,
        });
        if (authError) throw authError;

        if (authData.user) {
          // ✅ 회원가입 성공 시 ID 저장
          localStorage.setItem('userId', authData.user.id);

          const { error: dbError } = await supabase.from('user').insert([{
            id: authData.user.id,
            email: onboardingData.email,
            nickname: onboardingData.nickname,
            university: onboardingData.university,
            ...updatePayload
          }]);
          if (dbError) throw dbError;
        }
        alert("회원가입 완료! 메인 화면으로 이동합니다.");
        router.push('/');

      } else {
        // --- 로그인 모드 ---
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: onboardingData.email,
          password: onboardingData.pw,
        });
        
        if (loginError) throw loginError;

        // ✅ 로그인 성공 시 실제 유저 ID 저장
        if (loginData?.user) {
          localStorage.setItem('userId', loginData.user.id);
        }
        
        router.push('/');
      }
    } catch (err: any) {
      alert("오류 발생: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f5f7fb] py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black italic text-blue-600 tracking-tighter mb-2">KNOCK KNOCK</h1>
        <p className="text-gray-400 font-bold">서로 마음의 문을 두드려보자!!</p>
      </div>

      <div className="w-[480px] bg-white rounded-[40px] p-12 shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-white">
        {currentStep === 0 && (
          <div className="flex flex-col w-full">
            <div className="flex justify-center gap-10 mb-10">
              <button onClick={() => setIsSignupMode(false)} className={`text-xl font-black ${!isSignupMode ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-300'}`}>로그인</button>
              <button onClick={() => setIsSignupMode(true)} className={`text-xl font-black ${isSignupMode ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-300'}`}>회원가입</button>
            </div>
            <div className="space-y-4">
              <input type="email" value={onboardingData.email} onChange={(e) => setOnboardingData({...onboardingData, email: e.target.value})} placeholder="이메일" className="w-full p-4 bg-gray-50 rounded-2xl border focus:outline-blue-600" />
              <input type="password" value={onboardingData.pw} onChange={(e) => setOnboardingData({...onboardingData, pw: e.target.value})} placeholder="비밀번호" className="w-full p-4 bg-gray-50 rounded-2xl border focus:outline-blue-600" />
              {isSignupMode && (
                <>
                  <input type="text" value={onboardingData.nickname} onChange={(e) => setOnboardingData({...onboardingData, nickname: e.target.value})} placeholder="닉네임" className="w-full p-4 bg-gray-50 rounded-2xl border focus:outline-blue-600" />
                  <input type="text" value={onboardingData.university} onChange={(e) => setOnboardingData({...onboardingData, university: e.target.value})} placeholder="학교" className="w-full p-4 bg-gray-50 rounded-2xl border focus:outline-blue-600" />
                  <div className="mt-4 p-5 bg-blue-50 rounded-[24px] border border-blue-100">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 accent-blue-600 cursor-pointer" />
                      <label className="text-[13px] text-gray-600 leading-tight font-black">
                        <button type="button" onClick={() => setShowTerms(true)} className="text-blue-700 underline">이용약관</button> 및 <button type="button" onClick={() => setShowTerms(true)} className="text-blue-700 underline">개인정보 처리방침</button>에 동의합니다.
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => isSignupMode ? setCurrentStep(1) : handleFinish()} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black mt-10 shadow-xl hover:bg-blue-700 transition-colors">
              {loading ? "처리 중..." : (isSignupMode ? "취향 설정하러 가기" : "로그인")}
            </button>
          </div>
        )}

        {currentStep === 1 && ( <div>{renderHeader(1, "영화", "🎬")}{renderInterestButtons('movie', interestData.영화)}<button onClick={() => setCurrentStep(2)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-10 shadow-lg">다음</button></div> )}
        {currentStep === 2 && ( <div>{renderHeader(2, "음악", "🎵")}{renderInterestButtons('music', interestData.음악)}<button onClick={() => setCurrentStep(3)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-10 shadow-lg">다음</button></div> )}
        {currentStep === 3 && ( <div>{renderHeader(3, "취미", "⚡")}{renderInterestButtons('hobby', interestData.취미)}<button onClick={() => setCurrentStep(4)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-10 shadow-lg">다음</button></div> )}
        {currentStep === 4 && (
          <div>
            {renderHeader(4, "성격 유형", "✨")}
            <div className="grid grid-cols-4 gap-2 mt-6">
              {mbtis.map(m => ( <button key={m} onClick={() => setOnboardingData({...onboardingData, mbti: m})} className={`py-3 rounded-xl border-2 text-xs font-black transition-all ${onboardingData.mbti === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-50 text-gray-400 bg-white hover:border-blue-100'}`}>{m}</button> ))}
            </div>
            <button onClick={handleFinish} disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold mt-10 shadow-xl hover:bg-black transition-colors">
                {isEditMode ? "수정 완료" : "완료"}
            </button>
          </div>
        )}
      </div>

      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <h3 className="text-xl font-black text-blue-800 mb-4">이용약관</h3>
            <div className="flex-1 overflow-y-auto pr-2 text-sm text-gray-500 leading-relaxed space-y-4">
              <p>KNOCK KNOCK 서비스를 이용해주셔서 감사합니다. 본 약관은 취향 기반 매칭 서비스를 제공하기 위해 필요한 정보를 수집하는 것에 동의함을 의미합니다.</p>
              <p>수집 항목: 이메일, 닉네임, 학교, 영화/음악/취미 취향, MBTI</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="mt-6 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
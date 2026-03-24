"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { supabase } from '@/app/lib/supabase'; // 경로 확인 필수!

// --- 데이터 정의 ---
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
  const [currentStep, setCurrentStep] = useState(0); 
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  const renderHeader = (step: number, title: string, icon: string) => (
    <div className="mb-8 w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
        </div>
        <span className="text-gray-400 font-medium">{step} / 4</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500" 
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-400 mt-4 font-medium text-center">
        {step === 4 ? "본인의 MBTI를 선택해주세요" : "관심있는 항목을 모두 선택해주세요 (여러 개 선택 가능)"}
      </p>
    </div>
  );

  const renderInterestButtons = (category: 'movie' | 'music' | 'hobby', data: string[]) => (
    <div className="grid grid-cols-2 gap-4 w-full mt-6">
      {data.map(item => (
        <button 
          key={item}
          onClick={() => {
            const currentList = onboardingData[category];
            const next = currentList.includes(item) 
              ? currentList.filter(i => i !== item)
              : [...currentList, item];
            setOnboardingData({...onboardingData, [category]: next});
          }}
          className={`py-4 rounded-2xl border-2 font-bold transition-all text-sm shadow-sm ${
            onboardingData[category].includes(item) 
              ? 'border-blue-600 bg-blue-600 text-white shadow-blue-200' 
              : 'border-gray-100 text-gray-400 bg-white hover:border-blue-200'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  // ★ 수정된 핵심 로직: user 테이블에 취향 데이터를 직접 포함하여 저장
  const handleFinish = async () => {
    setLoading(true);
    try {
      if (isSignupMode) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: onboardingData.email,
          password: onboardingData.pw,
        });

        if (authError) throw authError;

        if (authData?.user) {
          // DB의 컬럼명(movie, music, hobby, mbti)에 맞춰 데이터를 한 번에 넣습니다
          const { error: dbError } = await supabase.from('user').insert([{
            id: authData.user.id,
            email: onboardingData.email,
            nickname: onboardingData.nickname,
            university: onboardingData.university,
            mbti: onboardingData.mbti,
            movie: onboardingData.movie.join(', '), // 배열을 "액션, 공포" 형태의 문자열로 변환
            music: onboardingData.music.join(', '),
            hobby: onboardingData.hobby.join(', ')
          }]);

          if (dbError) throw dbError;

          // 추가적인 hobby_tag 테이블 관리가 필요할 경우 실행
          const allSelected = [...onboardingData.movie, ...onboardingData.music, ...onboardingData.hobby];
          const { data: tags } = await supabase.from('hobby_tag').select('id').in('name', allSelected);

          if (tags && tags.length > 0) {
            const tagInserts = tags.map(tag => ({
              user_id: authData.user?.id,
              hobby_tag_id: tag.id
            }));
            await supabase.from('user_hobby_tag').insert(tagInserts);
          }
          alert("회원가입과 취향 등록이 완료되었습니다!");
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: onboardingData.email,
          password: onboardingData.pw,
        });
        if (loginError) throw loginError;
      }

      router.push('/'); 
      
    } catch (error: any) {
      alert("에러: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f5f7fb] py-16 text-slate-900">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black italic text-blue-600 tracking-tighter mb-2">KNOCK KNOCK</h1>
        <p className="text-gray-400 font-bold">서로 마음의 문을 두드려보자!!</p>
      </div>

      <div className="w-[480px] bg-white rounded-[40px] p-12 shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-white">
        
        {currentStep === 0 && (
          <div className="flex flex-col w-full">
            <div className="flex justify-center gap-10 mb-10">
              <button onClick={() => setIsSignupMode(false)} className={`text-xl font-black transition-all ${!isSignupMode ? 'text-blue-600 border-b-4 border-blue-600 pb-1' : 'text-gray-300'}`}>로그인</button>
              <button onClick={() => setIsSignupMode(true)} className={`text-xl font-black transition-all ${isSignupMode ? 'text-blue-600 border-b-4 border-blue-600 pb-1' : 'text-gray-300'}`}>회원가입</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 ml-2">이메일</label>
                <input type="email" value={onboardingData.email} onChange={(e) => setOnboardingData({...onboardingData, email: e.target.value})} placeholder="이메일을 입력해주세요" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 border border-gray-100" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 ml-2">비밀번호</label>
                <input type="password" value={onboardingData.pw} onChange={(e) => setOnboardingData({...onboardingData, pw: e.target.value})} placeholder="비밀번호를 입력해주세요" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 border border-gray-100" />
              </div>

              {isSignupMode && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 ml-2">닉네임</label>
                    <input type="text" value={onboardingData.nickname} onChange={(e) => setOnboardingData({...onboardingData, nickname: e.target.value})} placeholder="사용할 닉네임" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 ml-2">학교</label>
                    <input type="text" value={onboardingData.university} onChange={(e) => setOnboardingData({...onboardingData, university: e.target.value})} placeholder="학교 입력" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" />
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => isSignupMode ? setCurrentStep(1) : handleFinish()} 
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg mt-10 hover:bg-blue-700 transition-all active:scale-[0.97]"
              disabled={loading}
            >
              {loading ? "처리 중..." : (isSignupMode ? "취향 설정하러 가기" : "로그인")}
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            {renderHeader(1, "영화", "🎬")}
            {renderInterestButtons('movie', interestData.영화)}
            <div className="flex gap-4 mt-12">
              <button onClick={() => setCurrentStep(0)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold">이전</button>
              <button onClick={() => setCurrentStep(2)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">다음</button>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div>
            {renderHeader(2, "음악", "🎵")}
            {renderInterestButtons('music', interestData.음악)}
            <div className="flex gap-4 mt-12">
              <button onClick={() => setCurrentStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold">이전</button>
              <button onClick={() => setCurrentStep(3)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">다음</button>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div>
            {renderHeader(3, "취미", "⚡")}
            {renderInterestButtons('hobby', interestData.취미)}
            <div className="flex gap-4 mt-12">
              <button onClick={() => setCurrentStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold">이전</button>
              <button onClick={() => setCurrentStep(4)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">다음</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            {renderHeader(4, "성격 유형", "✨")}
            <div className="grid grid-cols-4 gap-2 mt-6">
              {mbtis.map(m => (
                <button key={m} onClick={() => setOnboardingData({...onboardingData, mbti: m})}
                  className={`py-3 rounded-xl border-2 text-xs font-black transition-all ${onboardingData.mbti === m ? 'border-blue-600 bg-blue-600 text-white shadow-blue-100' : 'border-gray-50 text-gray-400 bg-white hover:border-blue-100'}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-12">
              <button onClick={() => setCurrentStep(3)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold">이전</button>
              <button 
                onClick={handleFinish} 
                className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg shadow-gray-200"
                disabled={loading}
              >
                {loading ? "저장 중..." : "완료"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
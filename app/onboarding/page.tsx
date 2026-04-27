"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from '@/app/lib/supabase';

type Step = 'start' | 'auth' | 'profile' | 'movie' | 'music' | 'hobby' | 'mbti';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

function getCharLength(str: string): number {
  return [...str].length;
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';

  const [currentStep, setCurrentStep] = useState<Step>('start');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [emailCode, setEmailCode] = useState('');

  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [onboardingData, setOnboardingData] = useState({
    email: "",
    nickname: "",
    university: "",
    bio: "",
    movie: [] as string[],
    music: [] as string[],
    hobby: [] as string[],
    mbti: "",
  });

  useEffect(() => {
    if (isEditMode) setCurrentStep('profile');
  }, [isEditMode]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const handleSendCode = async () => {
    if (!onboardingData.email) return setErrorMsg("이메일을 입력해주세요.");
    try {
      const res = await fetch(`${API_URL}/api/auth/univ-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: onboardingData.email })
      });
      if (res.ok) {
        setIsCodeSent(true);
        setErrorMsg('');
      } else {
        setErrorMsg("인증 요청 실패. 학교 이메일을 확인해주세요.");
      }
    } catch {
      setErrorMsg("서버 연결에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/univ-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: onboardingData.email, code: emailCode })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        const domain = onboardingData.email.split('@')[1];
        const universityName = domain ? domain.split('.')[0] : '';
        setOnboardingData(prev => ({ ...prev, university: universityName }));
        setErrorMsg('');
      } else {
        setErrorMsg("인증번호가 올바르지 않습니다.");
      }
    } catch {
      setErrorMsg("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const updatePayload = {
        movie: onboardingData.movie,
        music: onboardingData.music,
        hobby: onboardingData.hobby,
        mbti: [onboardingData.mbti],
        bio: onboardingData.bio,
      };

      if (isEditMode) {
        const { error } = await supabase.from('user').update(updatePayload).eq('id', session?.user.id);
        if (error) throw error;
        router.push('/mypage');

      } else if (isSignupMode) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: onboardingData.email,
          password,
        });
        if (authError) throw authError;
        if (authData.user) {
          const { error: insertError } = await supabase.from('user').insert([{
            id: authData.user.id,
            email: onboardingData.email,
            nickname: onboardingData.nickname,
            university: onboardingData.university,
            ...updatePayload,
          }]);
          if (insertError) throw insertError;
        }
        router.push('/');

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: onboardingData.email,
          password,
        });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  const renderHeader = (step: number, title: string, icon: string) => (
    <div className="mb-10 w-full px-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
        </div>
        <span className="text-blue-600 font-black text-lg">{step} / 4</span>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
        <div className="bg-blue-600 h-full transition-all duration-700 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
      </div>
    </div>
  );

  const ErrorBanner = () => errorMsg ? (
    <div className="w-full mt-4 px-5 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold text-center">
      {errorMsg}
    </div>
  ) : null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8f9fc] py-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black italic text-blue-600 tracking-tighter mb-2">knock knock 👋</h1>
        <p className="text-gray-400 font-bold">대학생 중심의 소셜 허브</p>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-[48px] p-10 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-white">

        {/* 시작 화면 */}
        {currentStep === 'start' && (
          <div className="flex flex-col w-full py-6">
            <div className="flex justify-center gap-12 mb-12">
              <button onClick={() => { setIsSignupMode(false); setCurrentStep('auth'); }} className="text-xl font-black text-gray-300 hover:text-blue-600 transition-all">로그인</button>
              <button onClick={() => { setIsSignupMode(true); setCurrentStep('auth'); }} className="text-xl font-black text-gray-300 hover:text-blue-600 transition-all">회원가입</button>
            </div>
            <p className="text-center text-gray-500 font-bold mb-4">반가워요! 시작할 방식을 선택해주세요.</p>
          </div>
        )}

        {/* Step auth: 계정/인증 */}
        {currentStep === 'auth' && (
          <div className="flex flex-col w-full">
            <div className="flex justify-center gap-12 mb-12">
              <button onClick={() => setIsSignupMode(false)} className={`text-xl font-black transition-all ${!isSignupMode ? 'text-blue-600 border-b-4 border-blue-600 pb-1' : 'text-gray-300'}`}>로그인</button>
              <button onClick={() => setIsSignupMode(true)} className={`text-xl font-black transition-all ${isSignupMode ? 'text-blue-600 border-b-4 border-blue-600 pb-1' : 'text-gray-300'}`}>회원가입</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-gray-700 mb-2 block">이메일</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={onboardingData.email}
                    onChange={(e) => setOnboardingData({ ...onboardingData, email: e.target.value })}
                    placeholder="학교 이메일"
                    className="flex-1 p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                  />
                  {isSignupMode && (
                    <button onClick={handleSendCode} className="px-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-50">
                      인증요청
                    </button>
                  )}
                </div>
                {isSignupMode && isCodeSent && !isVerified && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="인증번호"
                      className="flex-1 p-5 bg-blue-50 rounded-3xl border-2 border-blue-200 outline-none font-bold text-center"
                    />
                    <button onClick={handleVerifyCode} className="px-6 bg-gray-900 text-white rounded-2xl font-black text-xs">확인</button>
                  </div>
                )}
                {isVerified && <p className="text-xs text-green-600 font-black ml-4 mt-2">✅ 학교 인증 완료</p>}
              </div>
              <div>
                <label className="text-sm font-black text-gray-700 mb-2 block">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>
            <ErrorBanner />
            <button
              onClick={() => {
                if (!isSignupMode) return handleFinish();
                if (!isVerified) return setErrorMsg("학교 이메일 인증이 필요합니다.");
                setCurrentStep('profile');
              }}
              className="w-full py-6 bg-gray-950 text-white rounded-[32px] font-black mt-12 shadow-2xl hover:bg-black transition-all"
            >
              {isSignupMode ? "다음으로" : "로그인"}
            </button>
          </div>
        )}

        {/* Step profile: 프로필 입력 (이미지 제거) */}
        {currentStep === 'profile' && (
          <div className="flex flex-col w-full">
            <div className="space-y-6">
              <input
                type="text"
                value={onboardingData.nickname}
                onChange={(e) => {
                  if (getCharLength(e.target.value) <= 4) {
                    setOnboardingData({ ...onboardingData, nickname: e.target.value });
                  }
                }}
                placeholder="닉네임 (4자 이내)"
                className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 outline-none font-medium"
              />
              <input
                type="text"
                value={onboardingData.university}
                onChange={(e) => setOnboardingData({ ...onboardingData, university: e.target.value })}
                placeholder="대학교"
                className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 outline-none font-medium"
              />
              <textarea
                value={onboardingData.bio}
                onChange={(e) => setOnboardingData({ ...onboardingData, bio: e.target.value })}
                placeholder="한줄 소개 😊"
                className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 outline-none font-medium h-28 resize-none"
              />
              <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-3">
                <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-6 h-6 mt-0.5 accent-blue-600" />
                <button type="button" onClick={() => setShowTerms(true)} className="text-[13px] text-gray-600 font-black underline">이용약관 동의</button>
              </div>
            </div>
            <ErrorBanner />
            <button
              onClick={() => {
                if (!isAgreed) return setErrorMsg("이용약관에 동의해주세요.");
                setCurrentStep('movie');
              }}
              className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black mt-12 shadow-xl"
            >
              취향 선택하러 가기
            </button>
          </div>
        )}

        {/* Step movie/music/hobby: 취향 선택 */}
        {(['movie', 'music', 'hobby'] as Step[]).includes(currentStep) && (
          <div>
            {currentStep === 'movie' && renderHeader(1, "영화", "🎬")}
            {currentStep === 'music' && renderHeader(2, "음악", "🎵")}
            {currentStep === 'hobby' && renderHeader(3, "취미", "⚡")}
            <div className="grid grid-cols-2 gap-4 w-full mt-6 px-2">
              {interestData[currentStep === 'movie' ? '영화' : currentStep === 'music' ? '음악' : '취미'].map(item => {
                const category = currentStep as 'movie' | 'music' | 'hobby';
                const isSelected = onboardingData[category].includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => {
                      const next = isSelected
                        ? onboardingData[category].filter(i => i !== item)
                        : [...onboardingData[category], item];
                      setOnboardingData({ ...onboardingData, [category]: next });
                    }}
                    className={`py-5 rounded-[24px] border-2 font-black transition-all text-sm ${isSelected ? 'border-blue-600 bg-blue-600 text-white shadow-blue-200' : 'border-gray-50 text-gray-400 bg-white hover:border-blue-100'}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const next: Step = currentStep === 'movie' ? 'music' : currentStep === 'music' ? 'hobby' : 'mbti';
                setCurrentStep(next);
              }}
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black mt-10 shadow-xl"
            >
              다음
            </button>
          </div>
        )}

        {/* Step mbti */}
        {currentStep === 'mbti' && (
          <div>
            {renderHeader(4, "성격 유형", "✨")}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {mbtis.map(m => (
                <button
                  key={m}
                  onClick={() => setOnboardingData({ ...onboardingData, mbti: m })}
                  className={`py-4 rounded-2xl border-2 text-xs font-black transition-all ${onboardingData.mbti === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-50 text-gray-400 bg-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <ErrorBanner />
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full py-6 bg-gray-950 text-white rounded-[32px] font-black mt-12 shadow-2xl transition-all disabled:opacity-50"
            >
              {loading ? "처리 중..." : isEditMode ? "수정 완료" : "회원가입 완료"}
            </button>
          </div>
        )}
      </div>

      {/* 이용약관 모달 */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <h3 className="text-2xl font-black text-blue-800 mb-6 italic">이용약관</h3>
            <div className="flex-1 overflow-y-auto text-[13px] text-gray-500 leading-relaxed space-y-6 font-medium pr-2">
              <section><h4 className="font-black text-gray-800 mb-2">[제1조 목적]</h4><p>본 약관은 'KNOCK KNOCK' 서비스 이용 조건 및 절차를 규정합니다.</p></section>
              <section><h4 className="font-black text-gray-800 mb-2">[제2조 개인정보 수집]</h4><p>이메일, 닉네임, 취향 데이터를 매칭 목적으로 수집합니다.</p></section>
            </div>
            <button
              onClick={() => { setIsAgreed(true); setShowTerms(false); }}
              className="mt-8 w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-lg"
            >
              동의하고 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from '@/app/lib/supabase';
import Image from 'next/image';

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

// 기본 캐릭터 이미지 경로 (공용 폴더 public/avatars/ 안에 넣어두세요)
const defaultAvatars = [
  "/avatars/char1.png",
  "/avatars/char2.png",
  "/avatars/char3.png",
  "/avatars/char4.png",
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [onboardingData, setOnboardingData] = useState({
    email: "", 
    pw: "",
    nickname: "",
    university: "", 
    bio: "", // 한줄 소개 추가
    profile_url: "", // 프로필 이미지 URL
    movie: [] as string[],
    music: [] as string[],
    hobby: [] as string[],
    mbti: "",
  });

  useEffect(() => {
    if (isEditMode) setCurrentStep(1);
  }, [isEditMode]);

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOnboardingData({ ...onboardingData, profile_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderHeader = (step: number, title: string, icon: string) => (
    <div className="mb-10 w-full px-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{isEditMode ? `${title} 수정` : title}</h2>
        </div>
        <span className="text-blue-600 font-black text-lg">{step} / 4</span>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
        <div className="bg-blue-600 h-full transition-all duration-700 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>
    </div>
  );

  const renderInterestButtons = (category: 'movie' | 'music' | 'hobby', data: string[]) => (
    <div className="grid grid-cols-2 gap-4 w-full mt-6 px-2">
      {data.map(item => (
        <button key={item} type="button"
          onClick={() => {
            const currentList = onboardingData[category];
            const next = currentList.includes(item) ? currentList.filter(i => i !== item) : [...currentList, item];
            setOnboardingData({...onboardingData, [category]: next});
          }}
          className={`py-5 rounded-[24px] border-2 font-black transition-all text-sm shadow-sm ${onboardingData[category].includes(item) ? 'border-blue-600 bg-blue-600 text-white shadow-blue-200' : 'border-gray-50 text-gray-400 bg-white hover:border-blue-100'}`}
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
        movie: onboardingData.movie,
        music: onboardingData.music,
        hobby: onboardingData.hobby,
        mbti: [onboardingData.mbti], 
        profile_url: onboardingData.profile_url,
        bio: onboardingData.bio,
      };

      if (isEditMode) {
        if (!session?.user) throw new Error("로그인 정보가 없습니다.");
        const { error } = await supabase.from('user').update(updatePayload).eq('id', session.user.id);
        if (error) throw error;
        alert("프로필 수정 완료! ✨");
        router.push('/mypage');
      } else if (isSignupMode) {
        if (!isAgreed) { alert("이용약관에 동의해주세요!"); setLoading(false); return; }
        const { data: authData, error: authError } = await supabase.auth.signUp({ email: onboardingData.email, password: onboardingData.pw });
        if (authError) throw authError;
        if (authData.user) {
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
        alert("반가워요! 가입이 완료되었습니다.");
        router.push('/');
      } else {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email: onboardingData.email, password: onboardingData.pw });
        if (loginError) throw loginError;
        if (loginData?.user) localStorage.setItem('userId', loginData.user.id);
        router.push('/');
      }
    } catch (err: any) { alert("오류: " + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8f9fc] py-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black italic text-blue-600 tracking-tighter mb-2">knock knock 👋</h1>
        <p className="text-gray-400 font-bold">대학생 중심의 소셜 허브에 오신 것을 환영합니다</p>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-[48px] p-10 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-white">
        {currentStep === 0 && (
          <div className="flex flex-col w-full">
            <div className="flex justify-center gap-12 mb-12">
              <button onClick={() => setIsSignupMode(false)} className={`text-xl font-black transition-all ${!isSignupMode ? 'text-blue-600 border-b-4 border-blue-600 pb-1' : 'text-gray-300'}`}>로그인</button>
              <button onClick={() => setIsSignupMode(true)} className={`text-xl font-black transition-all ${isSignupMode ? 'text-blue-600 border-b-4 border-blue-600 pb-1' : 'text-gray-300'}`}>회원가입</button>
            </div>

            {isSignupMode && (
              <div className="flex flex-col items-center mb-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-50 shadow-inner flex items-center justify-center">
                    {onboardingData.profile_url ? (
                      <img src={onboardingData.profile_url} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                  <label htmlFor="img-up" className="absolute bottom-1 right-1 bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <span className="text-white text-xl">📷</span>
                  </label>
                  <input type="file" id="img-up" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <button onClick={() => setShowAvatarModal(true)} className="mt-4 text-sm font-bold text-blue-600 underline underline-offset-4">기본 캐릭터 선택하기</button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="text-sm font-black text-gray-700 mb-2 block">이메일</label>
                <input type="email" value={onboardingData.email} onChange={(e) => setOnboardingData({...onboardingData, email: e.target.value})} placeholder="학교 이메일 주소" className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="text-sm font-black text-gray-700 mb-2 block">비밀번호</label>
                <input type="password" value={onboardingData.pw} onChange={(e) => setOnboardingData({...onboardingData, pw: e.target.value})} placeholder="비밀번호 입력" className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" />
              </div>

              {isSignupMode && (
                <>
                  <div>
                    <label className="text-sm font-black text-gray-700 mb-2 block">닉네임 *</label>
                    <input type="text" value={onboardingData.nickname} onChange={(e) => setOnboardingData({...onboardingData, nickname: e.target.value})} placeholder="다른 사용자에게 보여질 이름" className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="text-sm font-black text-gray-700 mb-2 block">대학교</label>
                    <input type="text" value={onboardingData.university} onChange={(e) => setOnboardingData({...onboardingData, university: e.target.value})} placeholder="재학 중인 대학교" className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="text-sm font-black text-gray-700 mb-2 block">한줄 소개 *</label>
                    <textarea value={onboardingData.bio} onChange={(e) => setOnboardingData({...onboardingData, bio: e.target.value})} placeholder="나를 표현할 수 있는 한마디를 적어보세요 😊" className="w-full p-5 bg-gray-50 rounded-3xl border-2 border-gray-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium h-28 resize-none" />
                  </div>
                  <div className="mt-4 p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-3">
                    <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} className="w-6 h-6 mt-0.5 accent-blue-600" />
                    <label className="text-[13px] text-gray-600 leading-tight font-black">
                      <button type="button" onClick={() => setShowTerms(true)} className="text-blue-700 underline">이용약관</button> 및 <button type="button" onClick={() => setShowTerms(true)} className="text-blue-700 underline">개인정보 처리방침</button>에 동의합니다.
                    </label>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => isSignupMode ? setCurrentStep(1) : handleFinish()} disabled={loading} className="w-full py-6 bg-gray-950 text-white rounded-[32px] font-black mt-12 shadow-2xl hover:bg-black transition-all active:scale-[0.98]">
              {loading ? "처리 중..." : (isSignupMode ? "다음 단계로" : "로그인")}
            </button>
            {isSignupMode && <p className="text-center text-xs text-gray-400 mt-6 font-bold">프로필은 언제든지 수정할 수 있어요</p>}
          </div>
        )}

        {currentStep === 1 && ( <div>{renderHeader(1, "영화", "🎬")}{renderInterestButtons('movie', interestData.영화)}<button onClick={() => setCurrentStep(2)} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black mt-10 shadow-xl shadow-blue-100">다음</button></div> )}
        {currentStep === 2 && ( <div>{renderHeader(2, "음악", "🎵")}{renderInterestButtons('music', interestData.음악)}<button onClick={() => setCurrentStep(3)} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black mt-10 shadow-xl shadow-blue-100">다음</button></div> )}
        {currentStep === 3 && ( <div>{renderHeader(3, "취미", "⚡")}{renderInterestButtons('hobby', interestData.취미)}<button onClick={() => setCurrentStep(4)} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black mt-10 shadow-xl shadow-blue-100">다음</button></div> )}
        {currentStep === 4 && (
          <div>
            {renderHeader(4, "성격 유형", "✨")}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {mbtis.map(m => ( <button key={m} onClick={() => setOnboardingData({...onboardingData, mbti: m})} className={`py-4 rounded-2xl border-2 text-xs font-black transition-all ${onboardingData.mbti === m ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-50 text-gray-400 bg-white hover:border-blue-100'}`}>{m}</button> ))}
            </div>
            <button onClick={handleFinish} disabled={loading} className="w-full py-6 bg-gray-950 text-white rounded-[32px] font-black mt-12 shadow-2xl hover:bg-black transition-all">
                {isEditMode ? "수정 완료" : "회원가입 완료"}
            </button>
          </div>
        )}
      </div>

      {/* 캐릭터 선택 모달 */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tight font-black">캐릭터 선택</h3>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {defaultAvatars.map((url, i) => (
                <button key={i} onClick={() => { setOnboardingData({...onboardingData, profile_url: url}); setShowAvatarModal(false); }} className="w-24 h-24 rounded-full border-4 border-gray-50 hover:border-blue-500 transition-all overflow-hidden bg-gray-100">
                  <img src={url} alt="avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button onClick={() => setShowAvatarModal(false)} className="w-full py-4 bg-gray-100 text-gray-500 rounded-3xl font-black">닫기</button>
          </div>
        </div>
      )}

      {/* 이용약관 모달 */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <h3 className="text-2xl font-black text-blue-800 mb-6 italic">이용약관</h3>
            <div className="flex-1 overflow-y-auto pr-2 text-[13px] text-gray-500 leading-relaxed space-y-6 scrollbar-hide font-medium">
              <section> <h4 className="font-black text-gray-800 mb-2">[제1조 목적]</h4> <p>본 약관은 'KNOCK KNOCK'팀이 제공하는 취향 기반 소셜 매칭 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p> </section>
              <section> <h4 className="font-black text-gray-800 mb-2">[제2조 개인정보 수집]</h4> <p>서비스는 원활한 매칭을 위해 이메일, 닉네임, 학교, 취향 데이터, 프로필 이미지 등을 수집합니다.</p> </section>
              <section> <h4 className="font-black text-gray-800 mb-2">[제3조 이용자의 의무]</h4> <p>타인의 명의를 도용하거나 비매너 행위(욕설, 성희롱 등) 시 서비스 이용이 영구 제한될 수 있습니다.</p> </section>
              <section> <h4 className="font-black text-gray-800 mb-2">[제4조 책임 제한]</h4> <p>본 플랫폼은 연결을 돕는 도구이며, 유저 간 발생한 오프라인 분쟁에 대해서는 책임을 지지 않습니다.</p> </section>
              <p className="text-[11px] text-gray-300 pt-4 border-t border-gray-100">공고일: 2026. 04. 07</p>
            </div>
            <button onClick={() => { setIsAgreed(true); setShowTerms(false); }} className="mt-8 w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-lg">동의하고 닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
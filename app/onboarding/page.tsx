"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";

export default function CombinedOnboarding() {
  const router = useRouter();
  // step: 'login', 'signup', 'interest', 'mbti' (MBTI 단계 추가)
  const [step, setStep] = useState<'login' | 'signup' | 'interest' | 'mbti'>('login');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMBTI, setSelectedMBTI] = useState<string>("");

  const interests = ["게임", "영화", "음악", "여행", "운동", "독서", "요리", "반려동물"];
  const mbtis = [
    "ISTJ", "ISFJ", "INFJ", "INTJ",
    "ISTP", "ISFP", "INFP", "INTP",
    "ESTP", "ESFP", "ENFP", "ENTP",
    "ESTJ", "ESFJ", "ENFJ", "ENTJ"
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'login') router.push('/');
    else if (step === 'signup') setStep('interest');
  };

  const handleComplete = () => {
    alert(`취향 ${selectedInterests.length}개와 MBTI(${selectedMBTI}) 저장 완료!`);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f5f7fb]">
      {/* 상단 바 */}
      <div className="w-full border-b border-blue-800 px-8 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="text-2xl font-extrabold tracking-wide">
          <span className="text-pink-500">F</span><span className="text-blue-600">4</span>
        </div>
        <div className="text-2xl font-extrabold text-blue-700">knock knock</div>
      </div>

      <div className="mt-16 w-[480px] bg-white shadow-2xl rounded-3xl p-10 border border-gray-100 mb-20">
        
        {/* 1 & 2단계: 로그인 / 정보입력 */}
        {(step === 'login' || step === 'signup') && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-blue-800 mb-2">{step === 'login' ? 'KNOCK KNOCK' : '정보 입력'}</h1>
              <p className="text-gray-400 text-sm">반가워요! 정보를 입력하고 친구를 찾아보세요.</p>
            </div>
            <form onSubmit={handleNext} className="space-y-4">
              <input type="text" placeholder="아이디" required className="w-full border-2 border-gray-100 px-5 py-4 rounded-2xl focus:border-blue-600 outline-none" />
              <input type="password" placeholder="비밀번호" required className="w-full border-2 border-gray-100 px-5 py-4 rounded-2xl focus:border-blue-600 outline-none" />
              {step === 'signup' && <input type="text" placeholder="닉네임" required className="w-full border-2 border-gray-100 px-5 py-4 rounded-2xl focus:border-blue-600 outline-none" />}
              <button type="submit" className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 text-lg shadow-lg shadow-blue-100 mt-4">
                {step === 'login' ? '로그인' : '다음으로'}
              </button>
            </form>
            <div className="mt-8 text-center text-sm">
              {step === 'login' ? (
                <button onClick={() => setStep('signup')} className="text-blue-700 font-bold hover:underline">회원가입 하러가기</button>
              ) : (
                <button onClick={() => setStep('login')} className="text-gray-400 hover:underline">이미 계정이 있어요</button>
              )}
            </div>
          </>
        )}

        {/* 3단계: 관심사 선택 */}
        {step === 'interest' && (
          <div className="text-center">
            <h2 className="text-2xl font-black text-blue-800 mb-2">관심사 선택</h2>
            <p className="text-gray-400 text-sm mb-8">좋아하는 분야를 골라주세요! (중복 가능)</p>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {interests.map((item) => (
                <button key={item} onClick={() => toggleInterest(item)}
                  className={`py-3 rounded-2xl font-bold border-2 transition-all ${selectedInterests.includes(item) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}>
                  {item}
                </button>
              ))}
            </div>
            <button onClick={() => setStep('mbti')} disabled={selectedInterests.length === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${selectedInterests.length > 0 ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              다음 단계로
            </button>
            <button onClick={() => setStep('signup')} className="mt-4 text-sm text-gray-400 hover:underline block mx-auto">이전으로</button>
          </div>
        )}

        {/* 4단계: MBTI 선택 (새로 추가됨!) */}
        {step === 'mbti' && (
          <div className="text-center">
            <h2 className="text-2xl font-black text-blue-800 mb-2">MBTI 선택</h2>
            <p className="text-gray-400 text-sm mb-8">당신의 성격 유형은 무엇인가요?</p>
            <div className="grid grid-cols-4 gap-2 mb-10">
              {mbtis.map((m) => (
                <button key={m} onClick={() => setSelectedMBTI(m)}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${selectedMBTI === m ? 'bg-pink-500 border-pink-500 text-white scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-pink-200'}`}>
                  {m}
                </button>
              ))}
            </div>
            <button onClick={handleComplete} disabled={!selectedMBTI}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${selectedMBTI ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              회원가입 완료!
            </button>
            <button onClick={() => setStep('interest')} className="mt-4 text-sm text-gray-400 hover:underline block mx-auto">이전으로</button>
          </div>
        )}
      </div>
    </div>
  );
}
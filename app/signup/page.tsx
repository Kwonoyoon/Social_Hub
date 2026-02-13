"use client";

import { useState } from "react";
import Link from "next/link";

const hobbies = ["영화", "음악", "운동", "게임", "독서", "여행"];

export default function SignupPage() {
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby)
        ? prev.filter((h) => h !== hobby)
        : [...prev, hobby]
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #f5f7fb 0%, #f0f0f0 100%)",
      }}
    >
      {/* 상단 바 */}
      <div className="w-full border-b border-blue-800 px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-extrabold">
          <span className="text-pink-500">F</span>
          <span className="text-blue-600">4</span>
        </div>

        <Link href="/onboarding" className="text-blue-700 font-bold">
          낙낙
        </Link>
      </div>

      {/* 회원가입 카드 */}
      <div className="mt-16 w-[520px] bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-extrabold text-center text-blue-800 mb-6">
          회원가입
        </h1>

        {/* 학교 */}
        <input
          type="text"
          placeholder="학교명 (예: 세명대학교)"
          className="w-full border px-4 py-2 mb-3 rounded focus:outline-none focus:border-blue-600"
        />

        {/* 이름 */}
        <input
          type="text"
          placeholder="이름"
          className="w-full border px-4 py-2 mb-3 rounded focus:outline-none focus:border-blue-600"
        />

        {/* 학과 */}
        <input
          type="text"
          placeholder="학과"
          className="w-full border px-4 py-2 mb-3 rounded focus:outline-none focus:border-blue-600"
        />

        {/* 학년 */}
        <select className="w-full border px-4 py-2 mb-3 rounded focus:outline-none focus:border-blue-600">
          <option>학년 선택</option>
          <option>1학년</option>
          <option>2학년</option>
          <option>3학년</option>
          <option>4학년</option>
        </select>

        {/* 나이 */}
        <input
          type="number"
          placeholder="나이"
          className="w-full border px-4 py-2 mb-6 rounded focus:outline-none focus:border-blue-600"
        />

        {/* 취미 선택 */}
        <div className="mb-6">
          <p className="font-semibold mb-2">취미 선택 (복수 가능)</p>
          <div className="flex flex-wrap gap-2">
            {hobbies.map((hobby) => (
              <button
                key={hobby}
                type="button"
                onClick={() => toggleHobby(hobby)}
                className={`px-4 py-2 rounded-full border text-sm transition
                  ${
                    selectedHobbies.includes(hobby)
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-gray-700 hover:bg-blue-100"
                  }
                `}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* 가입 버튼 */}
        <button className="w-full bg-blue-700 text-white py-3 rounded font-semibold hover:bg-blue-800 transition">
          회원가입 완료
        </button>

        {/* 하단 */}
        <div className="text-center text-sm mt-6">
          이미 계정이 있나요?{" "}
          <Link href="/onboarding" className="text-blue-700 font-semibold">
            로그인
          </Link>
        </div>
      </div>

      <div className="mt-10 text-xs text-gray-500">
        © 2026 F4 · 설레는 낙낙
      </div>
    </div>
  );
}

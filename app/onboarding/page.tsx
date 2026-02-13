"use client";

import Link from "next/link";

export default function Onboarding() {
  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(180deg, #f5f7fb 0%, #f0f0f0 100%)",
      }}
    >
      {/* 상단 바 */}
      <div className="w-full border-b border-blue-800 px-8 py-4 flex justify-between items-center">
        {/* 좌측 F4 */}
        <div className="text-2xl font-extrabold tracking-wide">
          <span className="text-pink-500">F</span>
          <span className="text-blue-600">4</span>
        </div>

        {/* 우측 낙낙 */}
        <div className="text-2xl font-extrabold text-blue-700">
          낙낙
        </div>
      </div>

      {/* 로그인 카드 */}
      <div className="mt-24 w-[420px] bg-white shadow-lg rounded-lg p-8">
        
        {/* 문구 */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">
            서로 마음의 문을 두드려보자!!
          </p>
          <h1 className="text-3xl font-extrabold text-blue-800">
             낙낙
          </h1>
        </div>

        {/* 아이디 */}
        <input
          type="text"
          placeholder="아이디"
          className="w-full border px-4 py-2 mb-3 rounded focus:outline-none focus:border-blue-600"
        />

        {/* 비밀번호 */}
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full border px-4 py-2 mb-4 rounded focus:outline-none focus:border-blue-600"
        />

        {/* 로그인 버튼 */}
        <button className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition">
          로그인
        </button>

        {/* 아이디 저장 */}
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <input type="checkbox" className="mr-2" />
          아이디 저장
        </div>

        <hr className="my-6" />

        {/* 하단 링크 */}
        <div className="flex justify-between text-sm text-blue-700">
          <div className="space-x-2">
            <a href="#" className="hover:underline">아이디 찾기</a>
            <span>|</span>
            <a href="#" className="hover:underline">비밀번호 찾기</a>
          </div>

          <Link href="/signup" className="font-semibold hover:underline">
            회원가입
          </Link>
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-12 text-xs text-gray-500">
        © 2026 F4 · 설레는 낙낙
      </div>
    </div>
  );
}

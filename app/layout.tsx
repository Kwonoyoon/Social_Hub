import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      {/* 배경색을 f5f7fb로 고정하고, 가로 스크롤 방지 */}
      <body className="m-0 p-0 bg-[#f5f7fb] min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
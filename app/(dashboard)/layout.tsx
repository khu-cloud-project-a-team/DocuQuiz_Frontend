"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAuthenticated, logout, getUserDisplayName } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(() => {
    // Client-side only check
    if (typeof window !== "undefined" && isAuthenticated()) {
      return getUserDisplayName();
    }
    return null;
  });

  useEffect(() => {
    // 인증 가드: 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
    if (!isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    logout(); // localStorage에서 토큰 제거
    router.replace("/"); // 로그인 페이지로 리디렉션
  };

  // 인증 확인 전에는 아무것도 렌더링하지 않거나 로딩 스피너를 보여줄 수 있습니다.
  if (!displayName) {
    return null; // 또는 <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* 상단 네비게이션 바 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto max-w-7xl">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <BookOpen className="h-6 w-6" />
            <Link href="/dashboard">DocuQuiz</Link>
          </div>
          <div className="flex items-center gap-4">
            {displayName && (
              <span className="text-sm text-slate-500 hidden md:inline-block">
                {displayName} 님
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-slate-500 hover:text-red-500" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 영역 */}
      <main className="container py-10 px-4 md:px-8 mx-auto max-w-5xl">
        {children}
      </main>
    </div>
  );
}
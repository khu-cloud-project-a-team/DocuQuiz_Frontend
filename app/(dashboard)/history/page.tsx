"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, AlertTriangle, PlayCircle, RefreshCcw, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { listQuizzes, QuizListItem } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "학습 이력을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">학습 이력을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-600">
        <AlertTriangle className="h-8 w-8" />
        <p className="mt-4 text-lg">오류: {error}</p>
        <Button onClick={fetchData} className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" /> 다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">학습 이력</h2>
          <p className="text-muted-foreground">
            생성한 모든 퀴즈 목록입니다. 다시 풀거나 결과를 확인해보세요.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 학습 기록 ({quizzes.length})</CardTitle>
          <CardDescription>과거에 학습한 내용을 복습해보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quizzes.length > 0 ? (
              quizzes.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(item.createdAt), "yyyy-MM-dd")}</span>
                      <span>•</span>
                      <span>{item.questionCount}문제</span>
                      {item.fileName && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{item.fileName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/quiz/${item.id}`}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      다시 풀기
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>아직 생성된 퀴즈가 없습니다.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/upload">새 퀴즈 만들기</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

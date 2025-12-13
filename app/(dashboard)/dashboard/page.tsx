"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, BookOpen, BarChart3, FileText, PlayCircle, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import { getStats, listQuizzes, listFiles, getWrongAnswerNotes, regenerateFromNote, Stats, QuizListItem, FileEntity, WrongAnswerNote } from "@/lib/api";
import { format } from 'date-fns';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizListItem[]>([]);
  const [uploadedPdfs, setUploadedPdfs] = useState<FileEntity[]>([]);
  const [wrongAnswerNotes, setWrongAnswerNotes] = useState<WrongAnswerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, quizzesData, filesData, notesData] = await Promise.all([
        getStats(),
        listQuizzes(),
        listFiles(),
        getWrongAnswerNotes(),
      ]);
      setStats(statsData);
      setRecentQuizzes(quizzesData.slice(0, 3)); // Show latest 3
      setUploadedPdfs(filesData.slice(0, 3)); // Show latest 3
      setWrongAnswerNotes(notesData.slice(0, 3)); // Show latest 3
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegenerate = async (noteId: string) => {
    setRegeneratingId(noteId);
    try {
      const newQuiz = await regenerateFromNote(noteId);
      router.push(`/quiz/${newQuiz.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "퀴즈 재생성에 실패했습니다.");
      setRegeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">대시보드 데이터를 불러오는 중입니다...</p>
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
          <p className="text-muted-foreground">
            안녕하세요! 오늘 학습할 내용을 선택해보세요.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/upload">
            <PlusCircle className="mr-2 h-4 w-4" />
            새 퀴즈 만들기
          </Link>
        </Button>
      </div>

      {/* 상단 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">생성한 문제집 수</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.quizCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats?.avgScore ?? 0)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">업로드한 PDF 개수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pdfCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 중간 영역: 최근 퀴즈 & 업로드한 PDF */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 학습 기록</CardTitle>
              <CardDescription>최근에 생성한 퀴즈 목록입니다.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">전체 보기</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizzes.length > 0 ? recentQuizzes.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), 'yyyy-MM-dd')}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/quiz/${item.id}`}>풀기</Link>
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground">아직 생성된 퀴즈가 없습니다.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>업로드한 PDF</CardTitle>
              <CardDescription>최근 업로드한 파일입니다.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pdfs">전체 보기</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedPdfs.length > 0 ? uploadedPdfs.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none truncate max-w-[180px]">{item.originalName}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), 'yyyy-MM-dd')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">{formatBytes(item.size)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/generate?fileId=${item.id}&fileName=${encodeURIComponent(item.originalName)}`}>
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">문제 생성</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">아직 업로드된 파일이 없습니다.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 하단 영역: 오답 노트 바로가기 */}
      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>오답 노트 바로가기</CardTitle>
              <CardDescription>틀린 문제를 다시 학습하고 취약점을 보완하세요.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/incorrect-notes">전체 보기</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wrongAnswerNotes.length > 0 ? wrongAnswerNotes.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-amber-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.quizResult.quiz.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), 'yyyy-MM-dd')} 생성</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate(item.id)}
                    disabled={regeneratingId === item.id}
                  >
                    {regeneratingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : '복습'}
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground">아직 생성된 오답노트가 없습니다.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCcw, Home, Smile, Frown, BookOpen, FileText, Loader2, CheckCircle2, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { regenerateFromNote, getQuiz, getQuizPdf, Quiz, QuizResult } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function ResultPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();

    const resultId = params.quizId as string;
    const score = parseInt(searchParams.get("score") || "0");
    const correctQuestions = parseInt(searchParams.get("correct") || "0");
    const totalQuestions = parseInt(searchParams.get("total") || "0");
    const wrongAnswerNoteId = searchParams.get("noteId");

    const originalQuizId = searchParams.get("quizId");

    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // PDF 관련
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const pdfFrameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            if (originalQuizId) {
                try {
                    // Fetch basic quiz data
                    const fetchedQuiz = await getQuiz(originalQuizId);
                    setQuizData(fetchedQuiz);

                    // Fetch PDF URL
                    try {
                        const pdfData = await getQuizPdf(originalQuizId);
                        if (pdfData && pdfData.url) {
                            setPdfUrl(pdfData.url);
                        }
                    } catch (pdfErr) {
                        console.error("Failed to fetch PDF URL", pdfErr);
                    }

                } catch (err) {
                    console.error("Failed to fetch quiz data", err);
                }
            }

            setLoading(false);
        };

        loadData();
    }, [resultId, originalQuizId]);

    const handleRegenerateFromNote = async () => {
        if (!wrongAnswerNoteId) return;
        setIsRegenerating(true);
        try {
            const newQuiz = await regenerateFromNote(wrongAnswerNoteId);
            router.push(`/quiz/${newQuiz.id}`);
        } catch (error) {
            console.error("Failed to regenerate quiz from note", error);
            alert("오답노트 기반 퀴즈 재생성에 실패했습니다.");
        } finally {
            setIsRegenerating(false);
        }
    };

    const jumpToPage = (page: number) => {
        if (!pdfUrl || !pdfFrameRef.current) return;
        if (page < 1) return; // 0페이지는 정보 없음

        // PDF URL에 #page=N 추가하여 이동
        // 기존 URL에서 해시 제거 후 추가
        const baseUrl = pdfUrl.split('#')[0];
        const newUrl = `${baseUrl}#page=${page}`;

        // iframe src 업데이트
        // 리액트 상태 변경보다는 직접 DOM 조작이 iframe 리로드를 확실히 트리거할 때가 있음.
        // 하지만 src prop update가 더 리액트스러움.
        // 다만 같은 URL일 경우 리로드가 안될 수 있으므로 체크.
        if (pdfFrameRef.current.src !== newUrl) {
            // setPdfUrl(newUrl); // 상태로 관리하면 전체 리렌더링 될 수 있음.
            pdfFrameRef.current.src = newUrl;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">결과를 불러오는 중...</span>
            </div>
        );
    }

    if (!quizData) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">데이터를 찾을 수 없습니다.</h2>
                <p className="text-muted-foreground mb-4">
                    퀴즈 결과 데이터가 만료되었거나 찾을 수 없습니다.<br />
                    (새로고침을 하셨다면, 보안상 데이터가 초기화되었을 수 있습니다.)
                </p>
                <Button asChild>
                    <Link href="/dashboard">대시보드로 이동</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
            {/* Left Panel: Results List */}
            <div className="w-full md:w-1/2 flex flex-col gap-4 h-full overflow-hidden">
                <Card className="shrink-0 bg-slate-900 text-white border-slate-800">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                {score >= 70 ? "참 잘했어요! 🎉" : "조금 더 노력해봐요 💪"}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {totalQuestions}문제 중 {correctQuestions}문제 정답
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-5xl font-extrabold text-blue-400">{score}</span>
                            <span className="text-lg text-slate-400 ml-1">점</span>
                        </div>
                    </CardContent>
                </Card>



                {/* ScrollArea 대신 일반 div 사용으로 높이 문제 해결 시도 */}
                <div className="flex-1 rounded-md border bg-white p-4 overflow-y-auto min-h-0">
                    <div className="space-y-6">
                        {quizData.questions.map((q, idx) => {
                            const userAnswer = userAnswers[q.id];
                            const isCorrect = userAnswer?.trim() === q.answer.trim(); // 단순 문자열 비교

                            return (
                                <div key={q.id} className="flex flex-col gap-3 pb-6 border-b last:border-0 relative">
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-300 bg-slate-50 text-slate-500 font-bold text-sm mt-1">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-lg text-slate-900 leading-snug">
                                                    {q.question}
                                                </h3>
                                            </div>

                                            {/* Answers Comparison - Only show Correct Answer since User Answer is not persisted */}
                                            <div className="mb-3 text-sm">
                                                <div className="p-3 rounded-lg border bg-slate-50 border-slate-200">
                                                    <span className="block text-xs text-slate-500 mb-1">정답</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {q.answer}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            <div className="bg-slate-50 p-4 rounded-lg mb-2">
                                                <div className="flex items-center gap-2 mb-2 text-slate-700 font-medium">
                                                    <BookOpen className="h-4 w-4" />
                                                    해설
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {q.explanation}
                                                </p>
                                            </div>

                                            {/* Source Context & Link */}
                                            {q.page > 0 && (
                                                <div className="flex items-center justify-between mt-2 pl-1">
                                                    <span className="text-xs text-slate-400">
                                                        참고: Page {q.page} 에서 출제됨
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8"
                                                        onClick={() => jumpToPage(q.page)}
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        근거 문서 보기
                                                        <ChevronRight className="h-3 w-3 ml-1" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pt-4 pb-8 flex flex-col gap-2 justify-center">
                            {wrongAnswerNoteId && (
                                <Button
                                    onClick={handleRegenerateFromNote}
                                    disabled={isRegenerating}
                                    className="w-full shrink-0 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                                    오답문제 재생성
                                </Button>
                            )}
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/dashboard">
                                    <Home className="mr-2 h-4 w-4" /> 대시보드로 돌아가기
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: PDF Viewer */}
            <div className="hidden md:block w-1/2 h-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                {pdfUrl ? (
                    <iframe
                        ref={pdfFrameRef}
                        src={pdfUrl}
                        className="w-full h-full"
                        title="Source PDF"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <FileText className="h-16 w-16 mb-4 opacity-20" />
                        <p>연결된 PDF 문서가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
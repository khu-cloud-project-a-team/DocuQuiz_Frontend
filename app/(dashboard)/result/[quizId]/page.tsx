"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCcw, Home, Smile, Frown, BookOpen, FileText, Loader2, CheckCircle2, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { regenerateFromNote, getQuiz, Quiz, QuizResult } from "@/lib/api";
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

    // 퀴즈 ID 식별 (resultId가 DB의 QuizResult ID이고, 실제 Quiz ID는 쿼리 파라미터나 스토리지에서 찾아야 함)
    // 하지만 현재 구조상 URL params의 quizId가 사실은 Result ID임.
    // Quiz ID를 찾으려면 스토리지에 저장된 키를 찾아야 하는데, 키가 `quiz_data_${quizId}`임.
    // 하지만 여기서 quizId를 알 수 있는 방법이... 아, `QuizPage`에서 `submitQuiz` 호출 후 `router.push(/result/${result.id})` 함.
    // 즉 URL의 quizId는 Result ID임.
    // 스토리지 키를 찾으려면 Quiz ID가 필요한데 URL에는 없음.
    // => 해결책: `submitQuiz` 응답에 `quizId`가 있으면 좋겠지만 현재는 없음.
    // => 대안: sessionStorage의 모든 키를 뒤져서 `quiz_data_`로 시작하는 가장 최근 항목을 찾거나,
    //    QuizPage에서 `sessionStorage.setItem('current_quiz_id', quizId)`를 하나 더 저장하는게 좋겠음.
    //    또는 이미 저장된 `quiz_data_${quizId}`를 찾기 위해 반복문을 돌릴 수도 있음.
    //    아니면 `ResultPage` 로직상 `quizId`를 쿼리스트링으로 넘겨주는게 가장 확실함.

    // *수정*: QuizPage에서 쿼리스트링으로 `originalQuizId`를 넘겨주는게 좋겠다.
    // 하지만 이미 배포/구현된 코드를 건드리는 범위를 최소화하려면?
    // 백엔드 `getQuizResult`를 호출하면 `quiz` 객체가 들어있고 거기에 `id`가 있음.
    // 하지만 백엔드 호출 없이 스토리지에서 먼저 찾고 싶음.
    // QuizPage에서 `sessionStorage.setItem('last_quiz_id', quizId)`를 추가하는 편이 좋겠다.

    // 일단은 백엔드 `getQuizResult`가 아직 구현 안된 상태(상세 정보 미포함)이므로
    // 스토리지에서 데이터를 가져와야 하는데...
    // 아, QuizPage 수정해서 쿼리 파라미터에 `quizId`를 추가하는게 가장 깔끔함.

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

            // 1. Session Storage에서 데이터 시도
            // quizId가 쿼리에 있으면 그걸 쓰고, 없으면 'last_quiz_id' 같은걸 쓰거나...
            // QuizPage code changes needed to pass quizId in query string. I will modify QuizPage again.
            // For now, let's assume I fix QuizPage to pass `quizId`.

            let qId = originalQuizId;
            if (!qId) {
                // Fallback: try to find from storage keys? Unreliable.
                // Let's modify QuizPage first to pass quizId.
                // But wait, I can access storage in the browser. 
                // Let's just try to load 'last_processed_quiz_id' if I save it.
                qId = sessionStorage.getItem('last_active_quiz_id');
            }

            if (qId) {
                const storedQuiz = sessionStorage.getItem(`quiz_data_${qId}`);
                const storedAnswers = sessionStorage.getItem(`user_answers_${qId}`);

                if (storedQuiz && storedAnswers) {
                    const parsedQuiz = JSON.parse(storedQuiz) as Quiz;
                    setQuizData(parsedQuiz);
                    setUserAnswers(JSON.parse(storedAnswers));

                    // PDF URL 설정 (페이지 파편은 제거)
                    if (parsedQuiz.pdfInfo?.url) {
                        setPdfUrl(parsedQuiz.pdfInfo.url);
                    }

                    setLoading(false);
                    return;
                }
            }

            // 2. Storage에 없으면 API 호출 (백엔드가 상세 정보를 안주므로 제한적임)
            // 그래도 퀴즈 자체는 불러올 수 있으니 시도.
            // 하지만 qId를 모르면 이것도 불가능. QuizResult ID(`resultId`)로 QuizResult를 조회해서 Quiz ID를 알아내야 함.
            // 현재 백엔드 `getQuizResult`는 `quiz` 객체를 포함하여 반환함 (controller에는 없지만 service에는 있음? 아니 Controller check needed).
            // Controller: GET /quiz/:id -> QuizService.getQuizResult (X - This is getQuiz)
            // Controller: GET /quiz (List)
            // Controller has NO endpoint for getQuizResult explicitly with full details.
            // BUT, `quiz.service.ts` has `getQuizResult(id, user)`.
            // Wait, does Controller expose it?
            // Checking `quiz.controller.ts`...
            // Line 117: // TODO: GET /quiz/result/:resultId 구현 필요
            // It is NOT exposed. Function `getQuizResult` exists in Service but not Controller.
            // So we CANNOT fetch result details from backend without backend changes.

            // Critical: If we rely on Frontend Only, we MUST have the data in Storage.
            // And we MUST know the Quiz ID to get it from storage.
            // So I MUST modify QuizPage to pass `quizId` in the query params.

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

                {wrongAnswerNoteId && (
                    <Button
                        onClick={handleRegenerateFromNote}
                        disabled={isRegenerating}
                        className="w-full shrink-0 bg-blue-600 hover:bg-blue-700"
                    >
                        {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                        오답 집중 공략하기 (AI 추천 문제)
                    </Button>
                )}

                <ScrollArea className="flex-1 pr-4 rounded-md border bg-white p-4">
                    <div className="space-y-6">
                        {quizData.questions.map((q, idx) => {
                            const userAnswer = userAnswers[q.id];
                            const isCorrect = userAnswer?.trim() === q.answer.trim(); // 단순 문자열 비교

                            return (
                                <div key={q.id} className="flex flex-col gap-3 pb-6 border-b last:border-0 relative">
                                    <div className="flex items-start gap-3">
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm mt-1
                                            ${isCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-lg text-slate-900 leading-snug">
                                                    {q.question}
                                                </h3>
                                                <Badge variant={isCorrect ? "default" : "destructive"} className="shrink-0 ml-2">
                                                    {isCorrect ? "정답" : "오답"}
                                                </Badge>
                                            </div>

                                            {/* Answers Comparison */}
                                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                                                    <span className="block text-xs text-slate-500 mb-1">내 답안</span>
                                                    <span className={`font-semibold ${isCorrect ? 'text-blue-700' : 'text-red-700'}`}>
                                                        {userAnswer || "(미입력)"}
                                                    </span>
                                                </div>
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
                                                        참고: Page {q.page}
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
                        <div className="pt-4 pb-8 flex justify-center">
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/dashboard">
                                    <Home className="mr-2 h-4 w-4" /> 대시보드로 돌아가기
                                </Link>
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
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
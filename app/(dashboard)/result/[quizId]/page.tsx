"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, Home, Smile, Frown, BookOpen, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { regenerateFromNote } from "@/lib/api";
import { useState } from "react";

export default function ResultPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();

    const resultId = params.quizId as string; // resultId는 params.quizId에 매핑됨
    const score = parseInt(searchParams.get("score") || "0");
    const correctQuestions = parseInt(searchParams.get("correct") || "0");
    const totalQuestions = parseInt(searchParams.get("total") || "0");
    const wrongAnswerNoteId = searchParams.get("noteId");

    const mode = searchParams.get("mode"); // 'review' or null (for now, not directly used for data, but for UI text)

    const [isRegenerating, setIsRegenerating] = useState(false);

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

    return (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    {mode === "review" ? "오답 노트 점검 결과" : "학습 결과 확인"}
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <Home className="mr-2 h-4 w-4" /> 대시보드
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Score Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shrink-0">
                <CardContent className="flex flex-col items-center justify-center p-8">
                    {score >= 70 ? (
                        <Smile className="w-16 h-16 mb-4 text-green-300" />
                    ) : (
                        <Frown className="w-16 h-16 mb-4 text-orange-300" />
                    )}
                    <h2 className="text-2xl font-bold mb-2">퀴즈 완료!</h2>
                    <p className="text-blue-200 text-sm mb-4">
                        총 {totalQuestions}문제 중 {correctQuestions}문제 정답
                    </p>
                    <div className="text-center">
                        <span className="block text-6xl font-extrabold text-white leading-none">
                            {score}
                        </span>
                        <span className="text-sm text-blue-200">점</span>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
                {wrongAnswerNoteId && (
                    <>
                        <Button
                            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-md"
                            onClick={handleRegenerateFromNote}
                            disabled={isRegenerating}
                        >
                            {isRegenerating ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <RefreshCcw className="mr-2 h-5 w-5" />
                            )}
                            오답 기반 문제 재생성
                        </Button>
                        <p className="text-xs text-center text-slate-500 mt-2">
                            틀린 문제의 유형과 개념을 분석하여 새로운 문제를 생성합니다.
                        </p>
                    </>
                )}
                <Button
                    className="w-full h-12 text-lg bg-slate-800 hover:bg-slate-900 shadow-md"
                    asChild
                >
                    <Link href="/dashboard">
                        <Home className="mr-2 h-5 w-5" /> 대시보드로 돌아가기
                    </Link>
                </Button>
            </div>
        </div>
    );
}
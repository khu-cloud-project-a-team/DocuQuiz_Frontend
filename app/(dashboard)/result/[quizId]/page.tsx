"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, RefreshCcw, BookOpen, Home, FileText } from "lucide-react";
import Link from "next/link";

export default function ResultPage() {
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode"); // 'review' or null

    // 나중에 백엔드에서 받아올 데이터 (지금은 가짜)
    const pdfUrl = "https://pdfobject.com/pdf/sample.pdf"; // ★ 테스트용 PDF URL (나중에 S3 URL로 교체)

    const RESULTS = [
        { id: 1, question: "sin(x)를 미분하면?", userAns: "cos(x)", correctAns: "cos(x)", isCorrect: true, explanation: "sin(x)의 도함수는 cos(x)입니다.", sourcePage: 42 },
        { id: 2, question: "적분의 기본 정리는?", userAns: "기울기이다", correctAns: "미분의 역연산이다", isCorrect: false, explanation: "부정적분은 미분의 역연산 관계입니다.", sourcePage: 12 },
        { id: 3, question: "연속함수의 조건?", userAns: "모두 정답", correctAns: "모두 정답", isCorrect: true, explanation: "극한값이 존재하고, 함숫값이 존재하며, 두 값이 일치해야 합니다.", sourcePage: 33 },
    ];

    const score = Math.round((RESULTS.filter(r => r.isCorrect).length / RESULTS.length) * 100);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
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

            {/* Split View Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">

                {/* Left Panel: Result Summary & Details */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    {/* Score Card */}
                    <Card className="bg-slate-900 text-white border-none shrink-0">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h2 className="text-xl font-bold">퀴즈 완료!</h2>
                                <p className="text-slate-400 text-sm">총 {RESULTS.length}문제 중 {RESULTS.filter(r => r.isCorrect).length}문제 정답</p>
                            </div>
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-green-400">{score}</span>
                                <span className="text-xs text-slate-400">Score</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Results */}
                    <div className="space-y-4 flex-1">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> 상세 해설
                        </h2>
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {RESULTS.map((item, idx) => (
                                <AccordionItem key={item.id} value={`item-${idx}`} className="border rounded-lg px-4 bg-white">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-4 text-left w-full">
                                            {item.isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <span className="text-xs text-slate-500 font-normal mr-2">Q{idx + 1}.</span>
                                                <span className="font-medium text-sm">{item.question}</span>
                                            </div>
                                            <Badge variant={item.isCorrect ? "default" : "destructive"} className="ml-2 shrink-0">
                                                {item.isCorrect ? "정답" : "오답"}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 text-slate-600 bg-slate-50/50 -mx-4 px-6 py-4 border-t">
                                        <div className="grid gap-3 text-sm">
                                            <div className="grid grid-cols-[60px_1fr] gap-2">
                                                <span className="font-semibold text-slate-900">내 답안:</span>
                                                <span className={item.isCorrect ? "text-green-600" : "text-red-600"}>{item.userAns}</span>
                                            </div>
                                            <div className="grid grid-cols-[60px_1fr] gap-2">
                                                <span className="font-semibold text-slate-900">정답:</span>
                                                <span className="text-blue-600">{item.correctAns}</span>
                                            </div>
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                                                <p className="text-xs font-semibold text-blue-800 mb-1">💡 해설 (참고: {item.sourcePage}p)</p>
                                                <p className="text-slate-700">{item.explanation}</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pb-4">
                        {mode === "review" ? (
                            <Button
                                className="w-full h-12 text-lg bg-slate-800 hover:bg-slate-900 shadow-md"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                <Home className="mr-2 h-5 w-5" /> 학습 종료 및 대시보드
                            </Button>
                        ) : (
                            <>
                                <Button
                                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-md"
                                    onClick={() => window.location.href = '/quiz/new_generated_id?mode=review'}
                                >
                                    <RefreshCcw className="mr-2 h-5 w-5" /> 오답 기반 문제 재생성
                                </Button>
                                <p className="text-xs text-center text-slate-500 mt-2">
                                    틀린 문제의 유형과 개념을 분석하여 새로운 문제를 생성합니다.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel: PDF Viewer */}
                <div className="hidden lg:block h-full border-l pl-4">
                    <Card className="h-full w-full overflow-hidden border-2 flex flex-col">
                        <CardHeader className="bg-slate-50 border-b py-3 shrink-0">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-red-500" />
                                학습 원문 (PDF)
                            </CardTitle>
                        </CardHeader>
                        <div className="flex-1 bg-slate-100 flex items-center justify-center">
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full"
                                title="PDF Viewer"
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
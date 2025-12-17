"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { getQuiz, submitQuiz, Quiz, Question } from "@/lib/api";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await getQuiz(quizId);
        console.log("Fetched quiz data:", data);
        console.log("Questions count:", data.questions?.length);
        console.log("Questions:", data.questions);
        setQuiz(data);
        // Reset answers for the new quiz
        setAnswers({});
      } catch (err) {
        setError(err instanceof Error ? err.message : "퀴즈를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-4 text-lg">퀴즈를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-600">
        <AlertCircle className="h-8 w-8" />
        <p className="mt-4 text-lg">오류: {error || "퀴즈를 찾을 수 없습니다."}</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          대시보드로 돌아가기
        </Button>
      </div>
    );
  }

  const questions = quiz.questions;
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const currQ = questions[currentIdx];

  console.log("Current state:", {
    questionsLength: questions.length,
    currentIdx,
    currQ,
    hasQuestion: !!currQ?.question
  });

  const handleSelect = (answer: string) => {
    setAnswers({ ...answers, [currQ.id]: answer });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));

      // Ensure all questions are answered
      if (formattedAnswers.length !== questions.length) {
        const unanswered = questions.length - formattedAnswers.length;
        if (!confirm(`${unanswered}개의 질문에 답변하지 않았습니다. 정말 제출하시겠습니까?`)) {
          setLoading(false);
          return;
        }
      }

      const result = await submitQuiz({ quizId, answers: formattedAnswers });

      const query = new URLSearchParams({
        score: result.score.toString(),
        correct: result.correctQuestions.toString(),
        total: result.totalQuestions.toString(),
      });
      if (result.wrongAnswerNoteId) {
        query.set('noteId', result.wrongAnswerNoteId);
      }

      // 쿼리 파라미터에 원본 Quiz ID 추가 (ResultPage에서 데이터 로드용)
      query.set('quizId', quizId);

      router.push(`/result/${result.id}?${query.toString()}`);

    } catch (err) {
      alert(err instanceof Error ? err.message : "제출에 실패했습니다.");
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const renderQuestionInput = (question: Question) => {
    const selectedAnswer = answers[question.id];

    switch (question.type) {
      case '객관식':
        return (
          <div className="grid gap-3">
            {question.options?.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(opt)}
                className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center gap-3 hover:bg-slate-50 ${selectedAnswer === opt ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200"
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${selectedAnswer === opt ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 text-slate-500"
                  }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-base">{opt}</span>
              </div>
            ))}
          </div>
        );
      case 'OX':
        return (
          <div className="grid grid-cols-2 gap-4">
            {['O', 'X'].map(opt => (
              <Button
                key={opt}
                variant={selectedAnswer === opt ? 'default' : 'outline'}
                className="h-24 text-4xl"
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        );
      case '주관식':
      case '빈칸':
        return (
          <Input
            type="text"
            placeholder="답을 입력하세요..."
            value={selectedAnswer || ''}
            onChange={(e) => handleSelect(e.target.value)}
            className="h-12 text-lg"
          />
        );
      default:
        return <p>지원하지 않는 문제 유형입니다.</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {quiz.isRegeneratedQuiz && quiz.weaknessAnalysis && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              취약점 분석 및 개념 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-700 whitespace-pre-wrap">
            {(() => {
              try {
                // JSON 파싱 시도
                const parsed = JSON.parse(quiz.weaknessAnalysis);
                // 값이 객체라면 첫 번째 키의 값을 사용하거나, 그대로 사용
                const content = typeof parsed === 'object' && parsed !== null
                  ? Object.values(parsed)[0] as string
                  : parsed;

                if (typeof content === 'string') {
                  // 문장 단위로 분리 (. 기준으로)
                  const sentences = content
                    .split(/(?<=[.?!])\s+/) // 문장 끝 부호 뒤의 공백으로 분리
                    .filter(s => s.trim().length > 0);

                  return (
                    <ol className="list-decimal list-outside pl-5 space-y-2">
                      {sentences.map((sentence, idx) => (
                        <li key={idx} className="leading-relaxed pl-1">
                          {sentence}
                        </li>
                      ))}
                    </ol>
                  );
                }
                // 문자열이 아니면 그대로 출력 (fallback)
                return <p>{String(content)}</p>;
              } catch (e) {
                // 파싱 실패 시 원본 그대로 출력 (줄바꿈만 적용)
                return <p className="whitespace-pre-wrap">{quiz.weaknessAnalysis}</p>;
              }
            })()}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-slate-500">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="min-h-[400px] flex flex-col justify-between shadow-sm">
        <CardContent className="pt-8 space-y-8">
          <h2 className="text-2xl font-semibold leading-relaxed">
            <span className="text-blue-600 mr-2">Q{currentIdx + 1}.</span>
            {currQ.question}
          </h2>
          {renderQuestionInput(currQ)}
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 이전
          </Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> :
              currentIdx === questions.length - 1 ? "제출하기" : "다음 문제"
            }
            {!loading && currentIdx !== questions.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
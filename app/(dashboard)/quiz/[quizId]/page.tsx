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

      // 결과 페이지에서 사용하기 위해 세션 스토리지에 퀴즈 데이터와 답안 저장
      // (새로고침 시 유지되지만, 탭 닫으면 사라짐)
      try {
        sessionStorage.setItem(`quiz_data_${quizId}`, JSON.stringify(quiz));
        sessionStorage.setItem(`user_answers_${quizId}`, JSON.stringify(answers)); // 원본 answers 객체 저장
        sessionStorage.setItem('last_active_quiz_id', quizId); // ResultPage에서 ID를 찾지 못할 경우 대비
      } catch (e) {
        console.error("Failed to save to sessionStorage", e);
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
            {quiz.weaknessAnalysis}
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
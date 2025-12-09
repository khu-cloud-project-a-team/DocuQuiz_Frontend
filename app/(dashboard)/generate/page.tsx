"use client";

import { useState } from "react";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider"; // shadcn/ui slider 필요 (없으면 input type range로 대체)

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [qCount, setQCount] = useState([10]);
  const [qType, setQType] = useState("multiple");
  const [difficulty, setDifficulty] = useState("normal");

  const handleGenerate = () => {
    setIsLoading(true);
    // Mock API Call with parameters
    console.log("Generating quiz with:", { count: qCount[0], type: qType, difficulty });
    // Mock API
    setTimeout(() => {
      window.location.href = `/quiz/quiz_demo_123`; // 퀴즈 풀기 화면으로 이동
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">퀴즈 생성 설정</h1>
        <p className="text-slate-500">업로드된 파일을 기반으로 AI가 퀴즈를 생성합니다.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 bg-slate-100 w-fit px-3 py-1 rounded-full">
            <FileText className="w-4 h-4" />
            <span>Advanced_Calculus_Chapter_3.pdf</span>
          </div>
          <CardTitle>옵션 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 문항 수 슬라이더 */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-base">문항 수</Label>
              <span className="font-bold text-blue-600">{qCount[0]}문제</span>
            </div>


            <Slider
              defaultValue={[10]}
              max={30}
              step={1}
              min={5}
              onValueChange={setQCount}
              className="py-4"
            />
          </div>

          {/* 난이도 설정 */}
          <div className="space-y-3">
            <Label className="text-base">난이도</Label>
            <Select onValueChange={setDifficulty} defaultValue={difficulty}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="난이도 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">쉬움</SelectItem>
                <SelectItem value="normal">보통</SelectItem>
                <SelectItem value="hard">어려움</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 문제 유형 */}
          <div className="space-y-3">
            <Label className="text-base">문제 유형</Label>
            <Select onValueChange={setQType} defaultValue={qType}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple">객관식 (4지선다)</SelectItem>
                <SelectItem value="ox">OX 퀴즈</SelectItem>
                <SelectItem value="short">단답형</SelectItem>
                <SelectItem value="blank">빈칸 채우기</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full h-12 text-lg" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 퀴즈 생성 중...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> 퀴즈 생성하기</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
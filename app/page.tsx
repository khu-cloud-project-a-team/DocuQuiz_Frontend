"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Copy, Check, ArrowRight, Lock, Loader2 } from "lucide-react";
import { loginUser, signUpUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [secretCode, setSecretCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCode) {
      setError("비밀코드를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      await loginUser(secretCode);
      router.push("/dashboard");
    } catch (err) {
      setError("유효하지 않은 비밀코드이거나 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupStart = () => {
    setIsSignupMode(true);
    setError("");
    setNickname("");
  };

  const handleSignupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (nickname.length > 10) {
      setError("닉네임은 10글자 이내여야 합니다.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await signUpUser(nickname);
      setGeneratedCode(response.token);
      setIsSignupMode(false); 
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetState = () => {
    setSecretCode("");
    setNickname("");
    setGeneratedCode(null);
    setIsSignupMode(false);
    setError("");
  };

  const handleStartNow = () => {
    if (generatedCode) {
      setSecretCode(generatedCode);
      // loginUser를 호출하여 localStorage에 정보를 저장하고 바로 대시보드로 이동
      loginUser(generatedCode).then(() => {
        router.push("/dashboard");
      }).catch(err => {
        // 이 경우는 거의 없지만, 에러 처리
        setError("자동 로그인에 실패했습니다. 코드를 복사하여 직접 로그인해주세요.");
        setGeneratedCode(null); // 로그인 뷰로 돌아가기
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-8">
          <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-600/20">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            DocuQuiz
          </CardTitle>
          <CardDescription className="text-slate-500">
            PDF 강의자료를 업로드하고 AI 퀴즈로 학습하세요.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {generatedCode ? (
            // ================== 3. Generated Code View ==================
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg text-slate-900">환영합니다, {nickname}님!</h3>
                <p className="text-sm text-slate-500">
                  비밀코드가 발급되었습니다.<br />
                  이 코드는 다시 확인할 수 없으니<br />반드시 안전한 곳에 저장해주세요.
                </p>
              </div>

              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex items-center justify-between group relative overflow-hidden">
                <code className="text-xl font-mono font-bold tracking-wider text-blue-600">
                  {generatedCode}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="hover:bg-white hover:text-blue-600 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                onClick={handleStartNow}
                disabled={isLoading}
              >
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>바로 시작하기 <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          ) : isSignupMode ? (
            // ================== 2. Nickname Input View ==================
            <form onSubmit={handleSignupComplete} className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-2">
                <Label htmlFor="nickname" className="text-slate-700">닉네임 설정</Label>
                <div className="relative">
                  <Input
                    id="nickname"
                    placeholder="사용하실 닉네임을 입력하세요"
                    className="bg-slate-50 border-slate-200 focus:border-blue-500 transition-colors"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={10}
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                <p className="text-xs text-slate-400">최대 10글자까지 입력 가능합니다.</p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 발급 중...</> : "비밀코드 발급받기"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full hover:bg-slate-100 text-slate-500"
                onClick={resetState}
                disabled={isLoading}
              >
                취소하고 뒤로가기
              </Button>
            </form>
          ) : (
            // ================== 1. Default Login View ==================
            <form onSubmit={handleLogin} className="grid gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-slate-700">비밀코드</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="code"
                    placeholder="10자리 비밀코드를 입력하세요"
                    className="pl-9 bg-slate-50 border-slate-200 focus:border-blue-500 transition-colors"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                    maxLength={10}
                    autoCapitalize="characters"
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 확인 중...</> : "로그인"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">
                    처음이신가요?
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
                onClick={handleSignupStart}
              >
                새 비밀코드 발급받기
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-center text-slate-400 w-full">
            계속 진행하면 서비스 이용약관에 동의하는 것으로 간주합니다.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
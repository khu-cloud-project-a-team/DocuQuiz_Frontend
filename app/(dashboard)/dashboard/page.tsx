import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, BookOpen, BarChart3, FileText, PlayCircle } from "lucide-react";

export default function Dashboard() {
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
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">81%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">업로드한 PDF 개수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>

          </CardContent>
        </Card>
      </div>

      {/* 중간 영역: 최근 퀴즈 & 업로드한 PDF */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 최근 퀴즈 목록 */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>최근 학습 기록</CardTitle>
            <CardDescription>
              최근에 생성하고 푼 퀴즈 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock Data Items */}
              {[
                { title: "운영체제 중간고사 대비", date: "2024-03-15", score: 85 },
                { title: "데이터베이스 3장 정규화", date: "2024-03-14", score: 92 },
                { title: "알고리즘 - 정렬 파트", date: "2024-03-10", score: 78 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="font-medium">
                    {item.score}점
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 업로드한 PDF 목록 */}
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
              {[
                { title: "운영체제_8장_가상메모리.pdf", date: "2024-03-15", size: "2.4MB" },
                { title: "데이터베이스_정규화_강의자료.pdf", date: "2024-03-14", size: "1.8MB" },
                { title: "알고리즘_정렬_요약.pdf", date: "2024-03-10", size: "1.2MB" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none truncate max-w-[180px]">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">{item.size}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href="/generate?fileId=demo">
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">문제 생성</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
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
              <CardDescription>
                많이 틀린 유형을 복습해보세요.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/incorrect-notes">전체 보기</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "데이터베이스 - B-Tree", rate: "40%", color: "bg-red-500", bg: "bg-red-50", hover: "hover:bg-red-100" },
                { title: "운영체제 - 페이징", rate: "45%", color: "bg-orange-500", bg: "bg-orange-50", hover: "hover:bg-orange-100" },
                { title: "네트워크 - TCP/IP", rate: "52%", color: "bg-yellow-500", bg: "bg-yellow-50", hover: "hover:bg-yellow-100" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${item.bg} ${item.hover}`}>
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">정답률 {item.rate} 미만</p>
                  </div>
                  <Button variant="ghost" size="sm">복습</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
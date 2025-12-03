import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function IncorrectNotesPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" asChild>
        <Link href="/dashboard" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Link>
      </Button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">오답 노트</h2>
        <p className="text-muted-foreground">
          틀린 문제를 복습하고 약점을 보완하세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "데이터베이스 - B-Tree", rate: "40%", color: "bg-red-500", bg: "bg-red-50", hover: "hover:bg-red-100", count: 12 },
          { title: "운영체제 - 페이징", rate: "45%", color: "bg-orange-500", bg: "bg-orange-50", hover: "hover:bg-orange-100", count: 8 },
          { title: "네트워크 - TCP/IP", rate: "52%", color: "bg-yellow-500", bg: "bg-yellow-50", hover: "hover:bg-yellow-100", count: 5 },
          { title: "알고리즘 - 다익스트라", rate: "55%", color: "bg-yellow-500", bg: "bg-yellow-50", hover: "hover:bg-yellow-100", count: 4 },
          { title: "자료구조 - 힙(Heap)", rate: "58%", color: "bg-yellow-500", bg: "bg-yellow-50", hover: "hover:bg-yellow-100", count: 3 },
          { title: "컴퓨터구조 - 캐시 메모리", rate: "60%", color: "bg-green-500", bg: "bg-green-50", hover: "hover:bg-green-100", count: 2 },
          { title: "웹 - REST API", rate: "65%", color: "bg-green-500", bg: "bg-green-50", hover: "hover:bg-green-100", count: 1 },
        ].map((item, i) => (
          <Card key={i} className={`cursor-pointer transition-colors ${item.bg} ${item.hover} border-none shadow-sm`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.rate}</div>
              <p className="text-xs text-muted-foreground">정답률 (오답 {item.count}개)</p>
              <div className="mt-4">
                <Button className="w-full" variant="outline" size="sm">복습하기</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

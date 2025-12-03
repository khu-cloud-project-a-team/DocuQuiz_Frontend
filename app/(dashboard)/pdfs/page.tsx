import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ChevronLeft, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfsPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" asChild>
        <Link href="/dashboard" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </Link>
      </Button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">업로드한 PDF</h2>
        <p className="text-muted-foreground">
          업로드한 모든 PDF 파일을 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>파일 목록</CardTitle>
          <CardDescription>
            총 12개의 파일이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "운영체제_8장_가상메모리.pdf", date: "2024-03-15", size: "2.4MB" },
              { title: "데이터베이스_정규화_강의자료.pdf", date: "2024-03-14", size: "1.8MB" },
              { title: "알고리즘_정렬_요약.pdf", date: "2024-03-10", size: "1.2MB" },
              { title: "네트워크_TCP_IP_완벽가이드.pdf", date: "2024-03-05", size: "3.1MB" },
              { title: "자료구조_트리_그래프.pdf", date: "2024-03-01", size: "1.5MB" },
              { title: "컴퓨터구조_CPU_작동원리.pdf", date: "2024-02-28", size: "2.2MB" },
              { title: "인공지능_기초_개념.pdf", date: "2024-02-25", size: "4.5MB" },
              { title: "웹프로그래밍_React_기초.pdf", date: "2024-02-20", size: "1.9MB" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date} • {item.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8" asChild>
                    <Link href="/generate?fileId=demo_123">
                      <PlayCircle className="mr-2 h-3 w-3" />
                      문제 생성
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

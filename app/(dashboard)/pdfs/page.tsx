"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ChevronLeft, PlayCircle, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listFiles, FileEntity } from "@/lib/api";
import { format } from 'date-fns';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function PdfsPage() {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filesData = await listFiles();
      setFiles(filesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // 분석 중인 파일이 있으면 주기적으로 확인
    const interval = setInterval(() => {
      listFiles().then(filesData => {
        const hasProcessing = filesData.some(f => !f.status);
        if (hasProcessing) {
          setFiles(filesData); // 상태 업데이트
        }
      }).catch(() => {
        // 에러 발생 시 무시 (다음 주기에 다시 시도)
      });
    }, 3000); // 3초마다 확인
    
    return () => clearInterval(interval);
  }, []);

  const handleGenerateClick = (file: FileEntity) => {
    if (!file.status) {
      alert("PDF 분석이 아직 완료되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    router.push(`/generate?fileId=${file.id}&fileName=${encodeURIComponent(file.originalName)}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-48 text-red-600">
          <AlertTriangle className="h-8 w-8" />
          <p className="mt-4 text-lg">오류: {error}</p>
          <Button onClick={fetchData} className="mt-4" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" /> 다시 시도
          </Button>
        </div>
      );
    }
    
    if (files.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-12">업로드된 파일이 없습니다.</p>;
    }

    return (
      <div className="space-y-4">
        {files.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{item.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.createdAt), 'yyyy-MM-dd')} • {formatBytes(item.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className={`h-8 ${!item.status ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!item.status}
                onClick={() => handleGenerateClick(item)}
              >
                {item.status ? (
                   <PlayCircle className="mr-2 h-3 w-3" />
                ) : (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                {item.status ? "문제 생성" : "분석 중"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
            총 {files.length}개의 파일이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

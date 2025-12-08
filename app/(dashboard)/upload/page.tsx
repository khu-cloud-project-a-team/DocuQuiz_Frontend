"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, FileText, X, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requestPresignedUpload, uploadFileToS3, confirmUploadMetadata } from "@/lib/upload";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 드롭존 설정
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    const pdfFiles = acceptedFiles.filter(f => f.type === "application/pdf");
    if (pdfFiles.length > 0) {
      setFiles(pdfFiles);
    }

    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        alert("파일 크기는 10MB를 초과할 수 없습니다.");
      } else {
        alert("파일 업로드 중 오류가 발생했습니다.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1, // 데모용 1개 제한
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const presigned = await requestPresignedUpload({
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSize: file.size,
      });

      await uploadFileToS3(presigned, file);

      const confirmed = await confirmUploadMetadata({
        fileName: file.name,
        s3Key: presigned.key,
        mimeType: file.type || "application/pdf",
        size: file.size,
      });

      window.location.href = `/generate?fileId=${confirmed.id}`;
    } catch (error) {
      console.error("Upload failed", error);
      const message = error instanceof Error ? error.message : "파일 업로드에 실패했습니다.";
      alert(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">PDF 업로드</h1>
        <p className="text-slate-500">퀴즈를 생성할 강의 자료(PDF)를 업로드해주세요.</p>
      </div>

      <Card className="border-dashed border-2 shadow-none">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center h-64 rounded-lg cursor-pointer transition-colors
              ${isDragActive ? "bg-blue-50 border-blue-500" : "bg-slate-50 hover:bg-slate-100 border-slate-200"}
            `}
          >
            <input {...getInputProps()} />
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <UploadCloud className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-slate-900">파일을 드래그하거나 클릭하여 업로드</p>
            <p className="text-sm text-slate-500 mt-1">PDF 파일 (최대 10MB)</p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{files[0].name}</p>
                <p className="text-xs text-slate-500">{(files[0].size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFiles([])} disabled={isUploading}>
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button size="lg" onClick={handleUpload} disabled={files.length === 0 || isUploading} className="w-full md:w-auto">
          {isUploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 업로드 중...</>
          ) : (
            <>다음 단계 <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('환경 변수 NEXT_PUBLIC_API_URL이 설정되어 있지 않습니다.');
}

// ==================================
// Type Definitions
// ==================================

// Auth
export interface SignupResponse {
  userId: string;
  token: string;
}

export interface LoginResponse {
  userId: string;
  token: string;
  displayName: string;
}

// File
export interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

export interface ConfirmUploadRequest {
  fileName: string;
  s3Key: string;
  mimeType: string;
  size: number;
}

export interface FileEntity {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Url: string;
  createdAt: string;
  status: boolean;
}

// Quiz
export interface QuizGenerationOptions {
  questionCount: number;
  types: Array<'객관식' | '주관식' | 'OX' | '빈칸'>;
  difficulty: '쉬움' | '보통' | '어려움';
}

export interface Question {
  id: string;
  page: number;
  type: '객관식' | '주관식' | 'OX' | '빈칸';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  source_context: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  isRegeneratedQuiz?: boolean;
  weaknessAnalysis?: string;
  pdfInfo?: {
    url: string;
    fileName: string;
  };
}

export interface QuizSubmission {
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
  }>;
}

export interface QuizResult {
  id: string;
  score: number;
  correctQuestions: number;
  totalQuestions: number;
  wrongAnswerNoteId: string | null;
}

export interface Stats {
  pdfCount: number;
  quizCount: number;
  avgScore: number;
}

export interface WrongAnswerNote {
  id: string;
  title: string;
  createdAt: string;
  quizResult: {
    quiz: {
      title: string;
    };
  };
}

export interface QuizListItem {
  id: string;
  title: string;
  createdAt: string;
  questionCount: number;
  isRegenerated: boolean;
  fileName: string;
}


// ==================================
// API Core
// ==================================

const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) { // No Content
    return null as T;
  }

  return response.json();
};


// ==================================
// Auth API
// ==================================

export const signup = (displayName?: string): Promise<SignupResponse> => {
  return fetchWithAuth('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ displayName }),
  });
};

export const login = (token: string): Promise<LoginResponse> => {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
};

// ==================================
// File Management API
// ==================================

export const getPresignedUrl = (fileName: string): Promise<PresignedUrlResponse> => {
  return fetchWithAuth(`/file/presigned-url?fileName=${encodeURIComponent(fileName)}`, {
    method: 'GET',
  });
};

export const listFiles = (): Promise<FileEntity[]> => {
  return fetchWithAuth('/file', {
    method: 'GET',
  });
};

export const confirmUpload = (payload: ConfirmUploadRequest): Promise<FileEntity> => {
  return fetchWithAuth('/file/confirm-upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Note: The actual S3 upload is handled separately, see `lib/upload.ts`

// ==================================
// Quiz API
// ==================================

export const generateQuiz = (fileId: string, options: QuizGenerationOptions): Promise<Quiz> => {
  return fetchWithAuth('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({ fileId, options }),
  });
};

export const submitQuiz = (submission: QuizSubmission): Promise<QuizResult> => {
  return fetchWithAuth('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify(submission),
  });
};

export const regenerateFromNote = (noteId: string): Promise<Quiz> => {
  return fetchWithAuth('/quiz/regenerate-from-note', {
    method: 'POST',
    body: JSON.stringify({ noteId }),
  });
};

export const getStats = (): Promise<Stats> => {
  return fetchWithAuth('/quiz/stats', {
    method: 'GET',
  });
};

export const getWrongAnswerNotes = (): Promise<WrongAnswerNote[]> => {
  return fetchWithAuth('/quiz/wrong-answer-notes', {
    method: 'GET',
  });
};

export const listQuizzes = (): Promise<QuizListItem[]> => {
  return fetchWithAuth('/quiz', {
    method: 'GET',
  });
};

export const getQuiz = (id: string): Promise<Quiz> => {
  return fetchWithAuth(`/quiz/${id}`, {
    method: 'GET',
  });
};

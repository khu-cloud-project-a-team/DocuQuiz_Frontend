// User interface for type safety
export interface User {
  code: string;
  nickname: string;
}

export const generateSecretCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Mock database to simulate backend behavior
const MOCK_DB_KEY = 'docuquiz_users';

export const saveUser = async (code: string, nickname: string): Promise<boolean> => {
  // In a real app, this would be: await fetch('/api/register', { ... })
  try {
    const users = JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '{}');
    users[code] = { code, nickname };
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Failed to save user', error);
    return false;
  }
};

export const loginWithCode = async (code: string): Promise<boolean> => {
  // Mock validation: Check against mock DB or just validation regex if strictly anonymous
  // For this requirement, we'll try to find the user in mock DB, OR just allow it if it matches regex 
  // (to keep backward compatibility if needed, but for nickname feature we might prefer strict check).
  // Let's stick to the regex check for "login" simplicity unless we want to enforce registration.
  // BUT, to persist nickname after login, we might want to fetch it.

  const isValid = /^[A-Z0-9]{10}$/.test(code);

  if (isValid) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if we have nickname info for this code (optional for now, but good for "DB" mock)
    const users = JSON.parse(localStorage.getItem(MOCK_DB_KEY) || '{}');
    const user = users[code];

    // Store token (code)
    localStorage.setItem('auth_token', code);

    // If user exists, maybe we want to store their info in session?
    if (user) {
      localStorage.setItem('user_nickname', user.nickname);
    }

    return true;
  }
  return false;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_nickname');
};

export const getUserNickname = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_nickname');
};

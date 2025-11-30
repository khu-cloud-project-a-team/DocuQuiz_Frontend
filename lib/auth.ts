export const generateSecretCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const loginWithCode = async (code: string): Promise<boolean> => {
  // Mock validation: In a real app, this would call the backend.
  // For now, we accept any 10-character alphanumeric string.
  const isValid = /^[A-Z0-9]{10}$/.test(code);

  if (isValid) {
    localStorage.setItem('auth_token', code);
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
};

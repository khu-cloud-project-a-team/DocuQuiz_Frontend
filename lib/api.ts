import { isAuthenticated } from './auth';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // Mock response for now since there is no backend
  console.log(`[Mock API] Request to ${url}`, { ...options, headers });

  return new Response(JSON.stringify({ success: true, message: "Mock response" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

import axios, { type AxiosError } from 'axios';

export const ACCESS_TOKEN_KEY = 'access_token';
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data: unknown = error.response?.data;
  if (data && typeof data === 'object' && 'message' in data) {
    const message = data.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      return message.filter((part): part is string => typeof part === 'string').join(' ');
    }
  }

  if (!error.response) return 'Unable to reach the server. Check your connection and try again.';
  return fallback;
}

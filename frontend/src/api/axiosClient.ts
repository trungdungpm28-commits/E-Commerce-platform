import axios, { type AxiosError } from 'axios';

export const ACCESS_TOKEN_KEY = 'access_token';
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

  const status = error.response?.status;
  const data: unknown = error.response?.data;
  if ((status === 400 || status === 422) && data && typeof data === 'object' && 'message' in data) {
    const message = data.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) {
      return message.filter((part): part is string => typeof part === 'string').join(' ');
    }
  }

  if (!error.response) {
    return 'Can’t connect to the API. Start the backend and check VITE_API_BASE_URL.';
  }
  if (status === 403 || status === 409) {
    const message = data && typeof data === 'object' && 'message' in data ? data.message : undefined;
    if (typeof message === 'string' && message.includes('đã được sử dụng')) {
      return 'An account already uses this email or phone number.';
    }
    return 'This account could not be created. Check whether the email or phone number is already registered.';
  }
  if (status === 404) return 'The signup endpoint was not found. Check the backend route and API base URL.';
  if (status !== undefined && status >= 500) {
    return 'The server could not complete signup. Check the backend and database logs.';
  }
  return fallback;
}

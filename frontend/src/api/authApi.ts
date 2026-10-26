import { apiClient } from './axiosClient';
import type { AuthTokenResponse, SignInRequest, SignUpRequest } from '../types/api';

export async function signInRequest(body: SignInRequest): Promise<AuthTokenResponse> {
  const { data } = await apiClient.post<AuthTokenResponse>('/auth/signin', body);
  return data;
}

export async function signUpRequest(body: SignUpRequest): Promise<AuthTokenResponse> {
  const { data } = await apiClient.post<AuthTokenResponse>('/auth/signup', body);
  return data;
}

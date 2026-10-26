import { apiClient } from './axiosClient';
import type {
  Address,
  AddressRequest,
  AuthUser,
  ChangePasswordRequest,
  DeletedUserResponse,
  EditUserRequest,
  MessageResponse,
} from '../types/api';

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/users/me');
  return data;
}

export async function updateCurrentUser(body: EditUserRequest): Promise<AuthUser> {
  const { data } = await apiClient.patch<AuthUser>('/users/me', body);
  return data;
}

export async function changePassword(body: ChangePasswordRequest): Promise<MessageResponse> {
  const { data } = await apiClient.patch<MessageResponse>('/users/change-password', body);
  return data;
}

export async function createAddress(body: AddressRequest): Promise<Address> {
  const { data } = await apiClient.post<Address>('/users/addresses', body);
  return data;
}

export async function getAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>('/users/addresses');
  return data;
}

export async function deleteCurrentUser(): Promise<DeletedUserResponse> {
  const { data } = await apiClient.delete<DeletedUserResponse>('/users/me');
  return data;
}

export async function deleteUser(userId: number): Promise<DeletedUserResponse> {
  const { data } = await apiClient.delete<DeletedUserResponse>(`/users/${userId}`);
  return data;
}

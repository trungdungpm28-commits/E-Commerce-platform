import { apiClient } from './axiosClient';
import type { Shop, ShopRequest, ShopStatus } from '../types/api';

export async function createShop(body: ShopRequest): Promise<Shop> {
  const { data } = await apiClient.post<Shop>('/shops', body);
  return data;
}

export async function getMyShop(): Promise<Shop> {
  const { data } = await apiClient.get<Shop>('/shops/my-shop');
  return data;
}

export async function updateMyShop(body: Partial<ShopRequest>): Promise<Shop> {
  const { data } = await apiClient.patch<Shop>('/shops/my-shop', body);
  return data;
}

export async function getShops(): Promise<Shop[]> {
  const { data } = await apiClient.get<Shop[]>('/shops');
  return data;
}

export async function updateShopStatus(shopId: number, status: ShopStatus): Promise<Shop> {
  const { data } = await apiClient.patch<Shop>(`/shops/${shopId}/status`, { status });
  return data;
}

export async function deleteMyShop(): Promise<Shop> {
  const { data } = await apiClient.delete<Shop>('/shops/my-shop');
  return data;
}

export async function deleteShop(shopId: number): Promise<Shop> {
  const { data } = await apiClient.delete<Shop>(`/shops/${shopId}`);
  return data;
}

import { apiClient } from './axiosClient';
import type { Brand } from '../types/api';

export interface CreateBrandRequest {
  name: string;
  logo?: string;
}

export async function getBrands(): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>('/categories/brands/all');
  return data;
}

export async function createBrand(body: CreateBrandRequest): Promise<Brand> {
  const { data } = await apiClient.post<Brand>('/categories/brands', body);
  return data;
}

export async function deleteBrand(brandId: number): Promise<Brand> {
  const { data } = await apiClient.delete<Brand>(`/categories/brands/${brandId}`);
  return data;
}

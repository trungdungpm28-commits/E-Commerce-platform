import { apiClient } from './axiosClient';
import type { Category } from '../types/api';

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: number;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}

export async function createCategory(body: CreateCategoryRequest): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', body);
  return data;
}

export async function deleteCategory(categoryId: number): Promise<Category> {
  const { data } = await apiClient.delete<Category>(`/categories/${categoryId}`);
  return data;
}

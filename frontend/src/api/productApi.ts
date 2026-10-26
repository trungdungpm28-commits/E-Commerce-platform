import { apiClient } from './axiosClient';
import type { CreateProductRequest, Product, ProductQuery, ProductStatus } from '../types/api';

export async function getProducts(params: ProductQuery = {}): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/products', { params });
  return data;
}

export async function getProduct(productId: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${productId}`);
  return data;
}

export async function createProduct(body: CreateProductRequest): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', body);
  return data;
}

export async function updateProductStatus(productId: number, status: ProductStatus): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${productId}/status`, { status });
  return data;
}

export async function deleteProduct(productId: number): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`/products/${productId}`);
  return data;
}

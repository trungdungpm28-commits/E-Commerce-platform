import { apiClient } from './axiosClient';
import type { CartItemMutationResponse, CartResponse } from '../types/api';

export interface AddToCartRequest {
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export async function getCart(): Promise<CartResponse> {
  const { data } = await apiClient.get<CartResponse>('/cart');
  return data;
}

export async function addToCart(body: AddToCartRequest): Promise<CartItemMutationResponse> {
  const { data } = await apiClient.post<CartItemMutationResponse>('/cart/items', body);
  return data;
}

export async function updateCartItem(itemId: number, body: UpdateCartItemRequest): Promise<CartItemMutationResponse> {
  const { data } = await apiClient.patch<CartItemMutationResponse>(`/cart/items/${itemId}`, body);
  return data;
}

export async function removeCartItem(itemId: number): Promise<CartItemMutationResponse> {
  const { data } = await apiClient.delete<CartItemMutationResponse>(`/cart/items/${itemId}`);
  return data;
}

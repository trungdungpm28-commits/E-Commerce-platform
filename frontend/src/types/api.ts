export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'PENDING_VERIFY' | 'ACTIVE' | 'LOCKED';
export type ShopStatus = 'ACTIVE' | 'SUSPENDED';
export type ProductStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'HIDDEN' | 'REJECTED';
export type VariantStatus = 'ACTIVE' | 'INACTIVE';

export interface AuthUser {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  googleId?: string | null;
  failedLoginCount?: number;
  loginLockedUntil?: string | null;
}

export interface AuthTokenResponse {
  access_token: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface EditUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  isDefault?: boolean;
}

export interface Address {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedUserResponse extends AuthUser {
  passwordHash: string | null;
}

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string | null;
  isLeaf: boolean;
  isActive: boolean;
  createdAt: string;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  createdAt: string;
}

export interface ShopSummary {
  id: number;
  name: string;
  logo: string | null;
}

export interface Shop {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  isMall: boolean;
  status: ShopStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShopRequest {
  name: string;
  description?: string;
  logo?: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  shopId: number;
  skuCode: string;
  variantName: string | null;
  price: number | string;
  salePrice: number | string | null;
  stockQuantity: number;
  reservedStock: number;
  weightGram: number;
  maxPerOrder: number;
  status: VariantStatus;
  createdAt: string;
  updatedAt: string;
  color: string | null;
  size: string | null;
}

export interface Product {
  id: number;
  shopId: number;
  categoryId: number;
  brandId: number | null;
  name: string;
  description: string;
  status: ProductStatus;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
  slug: string | null;
  images: string[] | Array<{ id: number; productId: number; url: string; isCover: boolean; sortOrder: number }>;
  variants: ProductVariant[];
  shop?: Shop | ShopSummary;
  category?: Category;
  brand?: Brand | null;
}

export interface ProductQuery {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}

export interface ProductVariantRequest {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  weightGram: number;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  price: number;
  salePrice?: number;
  categoryId: number;
  brandId?: number;
  variants: ProductVariantRequest[];
}

export interface CartEntry {
  cartItemId: number;
  variantId: number;
  productName: string;
  color: string | null;
  size: string | null;
  price: number | string;
  stockQuantity: number;
  quantity: number;
  weightGram: number;
}

export interface CartShopGroup {
  shopId: number;
  shopName: string;
  shopLogo: string | null;
  items: CartEntry[];
}

export interface CartResponse {
  cartId?: number;
  shops: CartShopGroup[];
  totalItems: number;
}

export interface CartItemMutationResponse {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  isSelected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageResponse {
  message: string;
}

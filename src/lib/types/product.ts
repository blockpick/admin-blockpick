/**
 * Product related types based on OpenAPI spec
 */

export interface ProductDto {
  id: string;
  sku?: string;
  brand?: string;
  name: string;
  description?: string;
  defaultImage?: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  originalPrice?: number;
  price?: number;
  countryCode?: string;
  category?: string;
  imageUrl?: string;
  active?: boolean;
}

export interface CreateProductInput {
  sku?: string;
  brand?: string;
  name: string;
  description?: string;
  thumbnail?: string;
  defaultImage?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductInput {
  id: string;
  sku?: string;
  brand?: string;
  name?: string;
  description?: string;
  defaultImage?: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}

export interface ProductFilterParams {
  brand?: string;
  category?: string;
  search?: string;
  active?: boolean;
}


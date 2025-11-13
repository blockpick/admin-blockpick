/**
 * Product Management API Service
 * Based on OpenAPI spec: /admin/products/*
 */

import { apiClient } from './client';
import type {
  ProductDto,
  CreateProductInput,
  UpdateProductInput,
  ProductFilterParams,
} from '../types/product';
import type { PageResponse, PaginationParams } from '../types/common';

export const productService = {
  /**
   * Get paginated list of products
   * GET /admin/products
   */
  getProducts: async (
    params?: PaginationParams & ProductFilterParams
  ): Promise<PageResponse<ProductDto>> => {
    return apiClient.get<PageResponse<ProductDto>>('/admin/products', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get product by ID
   * GET /admin/products/{id}
   */
  getProductById: async (id: string): Promise<ProductDto> => {
    return apiClient.get<ProductDto>(`/admin/products/${id}`);
  },

  /**
   * Get product by SKU
   * GET /admin/products/sku/{sku}
   */
  getProductBySku: async (sku: string): Promise<ProductDto> => {
    return apiClient.get<ProductDto>(`/admin/products/sku/${sku}`);
  },

  /**
   * Search products
   * GET /admin/products/search
   */
  searchProducts: async (
    query: string,
    params?: PaginationParams
  ): Promise<PageResponse<ProductDto>> => {
    return apiClient.get<PageResponse<ProductDto>>('/admin/products/search', {
      params: {
        ...params,
        q: query,
      } as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get products by brand
   * GET /admin/products/brand/{brand}
   */
  getProductsByBrand: async (
    brand: string,
    params?: PaginationParams
  ): Promise<PageResponse<ProductDto>> => {
    return apiClient.get<PageResponse<ProductDto>>(`/admin/products/brand/${brand}`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Create new product
   * POST /admin/products
   */
  createProduct: async (data: CreateProductInput): Promise<ProductDto> => {
    return apiClient.post<ProductDto>('/admin/products', data);
  },

  /**
   * Update product
   * PUT /admin/products
   */
  updateProduct: async (data: UpdateProductInput): Promise<ProductDto> => {
    return apiClient.put<ProductDto>('/admin/products', data);
  },

  /**
   * Delete product
   * DELETE /admin/products/{id}
   */
  deleteProduct: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/products/${id}`);
  },

  /**
   * Get product categories
   * GET /admin/products/categories
   */
  getCategories: async (): Promise<string[]> => {
    return apiClient.get<string[]>('/admin/products/categories');
  },

  /**
   * Get product statistics
   * GET /admin/products/stats
   */
  getProductStats: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    byBrand: Record<string, number>;
    byCategory: Record<string, number>;
    [key: string]: unknown;
  }> => {
    return apiClient.get<{
      total: number;
      active: number;
      inactive: number;
      byBrand: Record<string, number>;
      byCategory: Record<string, number>;
      [key: string]: unknown;
    }>('/admin/products/stats');
  },
};


/**
 * Product management hooks using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { productService } from '../api';
import type { ProductFilterParams } from '../types/product';
import type { PaginationParams } from '../types/common';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';

/**
 * Query keys for product-related queries
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: PaginationParams & ProductFilterParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
};

/**
 * Hook to get paginated products
 */
export function useProducts(params?: PaginationParams & ProductFilterParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    placeholderData: (previousData) => previousData,
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to get product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: shouldEnableQueryWith(!!id),
  });
}

/**
 * Hook to search products
 */
export function useSearchProducts(query: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [...productKeys.lists(), 'search', query, params],
    queryFn: () => productService.searchProducts(query, params),
    enabled: shouldEnableQueryWith(!!query && query.length > 0),
  });
}

/**
 * Hook to get product statistics
 */
export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => productService.getProductStats(),
    enabled: shouldEnableQuery(),
  });
}


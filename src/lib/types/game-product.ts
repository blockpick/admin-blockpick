/**
 * Game-Product integration types based on OpenAPI spec
 */

import { ProductDto } from './product';

export interface GameProductDto {
  id: string;
  gameId: string;
  productId: string;
  product?: ProductDto;
  isGrandPrize: boolean;
  quantity?: number;
  sequence?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  regions?: GameProductRegionDto[];
}

export interface GameProductRegionDto {
  id: string;
  gameProductId: string;
  countryCode?: string;
  regionCode?: string;
  productId: string;
  product?: ProductDto;
  localizedName?: string;
  localizedDesc?: string;
  imageUrl?: string;
  currencyOverride?: 'CASH' | 'POINT';
  priceCents?: number;
  stock?: number;
  shippingNotes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameProductInput {
  gameId: string;
  productId?: string;
  isGrandPrize: boolean;
  quantity?: number;
  sequence?: number;
  active: boolean;
}

export interface UpdateGameProductInput {
  id: string;
  productId?: string;
  isGrandPrize?: boolean;
  quantity?: number;
  sequence?: number;
  active?: boolean;
}

export interface CreateGameProductRegionInput {
  gameProductId: string;
  countryCode?: string;
  regionCode?: string;
  productId?: string;
  localizedName?: string;
  localizedDesc?: string;
  imageUrl?: string;
  currencyOverride?: 'CASH' | 'POINT';
  priceCents?: number;
  stock?: number;
  shippingNotes?: string;
  active: boolean;
}

export interface LinkProductToGameRequest {
  gameProduct: CreateGameProductInput;
  regions: CreateGameProductRegionInput[];
}

export interface AddProductToGameRequest {
  product: {
    sku?: string;
    brand?: string;
    name: string;
    description?: string;
    thumbnail?: string;
    defaultImage?: string;
    metadata?: Record<string, unknown>;
  };
  gameProduct: CreateGameProductInput;
  regions: CreateGameProductRegionInput[];
}

export interface ProductSequence {
  gameProductId: string;
  sequence: number;
}

export interface ReorderProductsRequest {
  sequences: ProductSequence[];
}

export interface SetGrandPrizesRequest {
  gameProductIds: string[];
}

export interface GameProductCountResponse {
  count: number;
}


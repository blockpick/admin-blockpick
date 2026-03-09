/**
 * User related types based on OpenAPI spec
 */

import { UserRole } from './auth';

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  password?: string;
  nickname?: string;
  profileImageUrl?: string;
  // 스펙 기준 재화 필드
  shoppingCash: number;
  eventPoint: number;
  participationPoint: number;
  // 하위 호환성을 위해 optional로 유지
  point?: number;
  cash?: number;
  isPushNotification: boolean;
  isMarketingNotification: boolean;
  isBan: boolean;
  userRole: UserRole;
  isSocialAccount: boolean;
  socialProvider?: 'GOOGLE' | 'KAKAO' | 'NAVER' | 'APPLE' | 'FACEBOOK';
  socialId?: string;
  socialEmail?: string;
  socialName?: string;
  socialProfileImageUrl?: string;
  deletedAt?: string;
}

export interface UserModel extends User {
  username?: string;
  name?: string;
  phoneNumber?: string;
  status?: UserStatus;
  walletAddress?: string;
  lastLoginAt?: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  nickname?: string;
  profileImageUrl?: string;
  role: UserRole;
}

export interface AdminUpdateUserRequest {
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
}

export interface UpdateUserRoleRequest {
  email: string;
  role: UserRole;
}

export interface UserRoleInfo {
  id: string;
  email: string;
  nickname?: string;
  role: UserRole;
  updatedAt: string;
}

// Legacy interfaces for backward compatibility
export interface CreateUserRequest {
  email: string;
  username?: string;
  name?: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
  nickname?: string;
}

export interface UpdateUserRequest {
  username?: string;
  name?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  status?: UserStatus;
  role?: UserRole;
  email?: string;
  nickname?: string;
}

export interface UserFilterParams {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  startDate?: string;
  endDate?: string;
}

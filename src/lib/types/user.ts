/**
 * User related types
 */

import { UserRole } from './auth';

export interface UserModel {
  id: string;
  email: string;
  username: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  status: UserStatus;
  role: UserRole;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export interface CreateUserRequest {
  email: string;
  username: string;
  name: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  username?: string;
  name?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  status?: UserStatus;
  role?: UserRole;
}

export interface UserFilterParams {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  startDate?: string;
  endDate?: string;
}

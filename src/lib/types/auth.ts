/**
 * Authentication related types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  code: string;
  message: string;
  accessToken: string;
  refreshToken: string;
  admin: AdminInfo;
}

export interface AdminInfo {
  id: string;
  email: string;
  nickname?: string;
  profileImageUrl?: string;
  role: UserRole;
}

export interface RefreshTokenResponse {
  success: boolean;
  code: string;
  message: string;
  accessToken: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  code: string;
  message: string;
  valid: boolean;
  admin?: AdminInfo;
}

// Legacy interfaces for backward compatibility
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Note: User type is now exported from './user' to avoid conflicts
// Use AdminInfo for admin user info, or import User from './user' for full user data

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PARTNER = 'PARTNER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface AuthState {
  user: AdminInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

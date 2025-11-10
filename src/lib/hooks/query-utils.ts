/**
 * Utility functions for React Query hooks
 */

/**
 * Check if query should be enabled in current environment
 * In development mode without a token, queries are disabled to prevent 403 errors
 */
export function shouldEnableQuery(): boolean {
  if (typeof window === 'undefined') return false;

  // In development mode, disable all queries that require authentication
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  // Check if we have an auth token
  const token = localStorage.getItem('auth_token');
  return !!token;
}

/**
 * Check if query should be enabled with additional conditions
 */
export function shouldEnableQueryWith(...conditions: boolean[]): boolean {
  return shouldEnableQuery() && conditions.every(Boolean);
}

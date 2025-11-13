/**
 * Utility functions for React Query hooks
 */

/**
 * Check if query should be enabled in current environment
 * Queries are enabled if we have an auth token
 */
export function shouldEnableQuery(): boolean {
  if (typeof window === 'undefined') return false;

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

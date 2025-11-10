# Troubleshooting Guide

## Common Issues and Solutions

### 1. Hydration Errors

**Problem**: `Uncaught Error: Hydration failed because the server rendered text didn't match the client`

**Cause**: Using `Math.random()`, `Date.now()`, or other dynamic values that differ between server and client rendering.

**Solution**: Use static data or ensure the same values are generated on both server and client:

```typescript
// ❌ Bad - causes hydration error
{Math.random()}

// ✅ Good - static data
{mockData.value}
```

### 2. 403 Authentication Errors

**Problem**: `Failed to load resource: the server responded with a status of 403`

**Cause**: API requests without valid authentication token.

**Solutions**:

1. **Development Mode**: The app runs in development mode without authentication by default. You'll see 403 errors in console but the UI will show appropriate error states.

2. **Add Authentication**:
   ```typescript
   // Login with valid credentials
   const login = useLogin();
   await login.mutateAsync({ email, password });
   ```

3. **Mock Data**: For development without a backend, consider using mock data:
   ```typescript
   // In development, return mock data instead of API call
   if (process.env.NODE_ENV === 'development') {
     return mockUsers;
   }
   ```

### 3. React Query Errors

**Problem**: Too many retry attempts on failed requests

**Solution**: Configure retry logic in `src/components/providers.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
})
```

### 4. Type Errors

**Problem**: TypeScript errors about missing types or type mismatches

**Solutions**:

1. **Rebuild**: `npm run build`
2. **Check imports**: Ensure all types are exported from `lib/types/index.ts`
3. **Restart IDE**: Sometimes TypeScript server needs restart

### 5. Build Errors

**Problem**: Build fails with module not found errors

**Solutions**:

1. **Clear cache**:
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run build
   ```

2. **Check imports**: Make sure all imports use correct paths with `@/` prefix

### 6. Environment Variables

**Problem**: API URL not working

**Solution**: Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api-dev.blockpick.net
```

**Important**: Restart dev server after changing environment variables.

### 7. Styling Issues

**Problem**: Tailwind classes not working

**Solutions**:

1. Check `tailwind.config.ts` includes all source files
2. Verify `globals.css` imports Tailwind directives
3. Clear cache and rebuild

### 8. Development Tips

**Console Errors**: Some 403 errors in development are expected when not authenticated. The UI handles these gracefully with empty states.

**React Query Devtools**: Open devtools to inspect queries and mutations:
```typescript
// Already enabled in development
<ReactQueryDevtools initialIsOpen={false} />
```

**Type Safety**: Always use TypeScript interfaces for API responses to catch errors early.

## Debugging Checklist

- [ ] Check browser console for errors
- [ ] Verify `.env.local` exists with correct variables
- [ ] Confirm dev server is running on correct port
- [ ] Check network tab for failed API requests
- [ ] Review React Query devtools for query states
- [ ] Clear browser cache and hard reload
- [ ] Restart dev server
- [ ] Clear `.next` folder and rebuild

## Getting Help

If you encounter issues not covered here:

1. Check the error message carefully
2. Review the relevant code in the architecture docs
3. Search GitHub issues for similar problems
4. Check Next.js and React Query documentation

## Useful Commands

```bash
# Clear and rebuild
rm -rf .next && npm run build

# Check for type errors
npm run build

# Run development server
npm run dev

# Install all dependencies
npm install
```

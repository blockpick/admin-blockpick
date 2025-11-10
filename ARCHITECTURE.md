# BlockPick Admin Architecture

## Overview

This document describes the architecture and design patterns used in the BlockPick Admin Dashboard.

## Technology Stack

- **Frontend Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: TanStack React Query
- **Data Tables**: TanStack React Table
- **Icons**: Lucide React
- **Theme**: next-themes

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard page
│   ├── users/                   # User management page
│   ├── games/                   # Game management page
│   ├── nfts/                    # NFT management page
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Root redirect
│   └── globals.css              # Global styles
│
├── components/
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   │
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx          # Main navigation sidebar
│   │   ├── header.tsx           # Top header with search and user menu
│   │   ├── theme-toggle.tsx     # Dark/light mode toggle
│   │   └── admin-layout.tsx     # Combined layout wrapper
│   │
│   ├── shared/                  # Reusable components
│   │   ├── data-table.tsx       # Generic table with sorting & filtering
│   │   ├── stats-card.tsx       # Dashboard statistics card
│   │   ├── page-header.tsx      # Page title with action button
│   │   ├── loading-spinner.tsx  # Loading state
│   │   └── empty-state.tsx      # Empty state placeholder
│   │
│   └── features/                # Feature-specific components
│
├── lib/
│   ├── api/                     # API layer
│   │   ├── client.ts            # Base HTTP client
│   │   ├── auth.service.ts      # Authentication endpoints
│   │   ├── user.service.ts      # User CRUD endpoints
│   │   ├── game.service.ts      # Game CRUD endpoints
│   │   ├── nft.service.ts       # NFT CRUD endpoints
│   │   └── index.ts             # Exports
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts          # Auth hooks (login, logout, etc.)
│   │   ├── use-users.ts         # User hooks (CRUD + queries)
│   │   ├── use-games.ts         # Game hooks (CRUD + queries)
│   │   ├── use-nfts.ts          # NFT hooks (CRUD + queries)
│   │   └── index.ts             # Exports
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── common.ts            # Common types (Pagination, etc.)
│   │   ├── auth.ts              # Auth types
│   │   ├── user.ts              # User types
│   │   ├── game.ts              # Game types
│   │   ├── nft.ts               # NFT types
│   │   └── index.ts             # Exports
│   │
│   └── utils.ts                 # Utility functions
│
└── constants/                   # Application constants
```

## Architecture Patterns

### 1. Service Layer Pattern

All API calls are abstracted into service modules:

```typescript
// lib/api/user.service.ts
export const userService = {
  getUsers: async (params) => apiClient.get('/api/users', { params }),
  getUserById: async (id) => apiClient.get(`/api/users/${id}`),
  createUser: async (data) => apiClient.post('/api/users', data),
  // ...
};
```

**Benefits:**
- Centralized API logic
- Easy to test
- Type-safe requests/responses
- Consistent error handling

### 2. Custom Hooks Pattern

React Query hooks wrap service calls:

```typescript
// lib/hooks/use-users.ts
export function useUsers(params) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

**Benefits:**
- Automatic caching
- Optimistic updates
- Automatic refetching
- Loading and error states
- Cache invalidation

### 3. Component Composition

Reusable components built with composition:

```typescript
<AdminLayout>
  <PageHeader
    title="Users"
    action={{ label: "Add User", onClick: handleAdd }}
  />
  <DataTable
    columns={columns}
    data={users}
    searchKey="username"
  />
</AdminLayout>
```

**Benefits:**
- Highly reusable
- Clean page components
- Consistent UI
- Easy to maintain

### 4. Type Safety

Full TypeScript coverage:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // ...
}

const userService = {
  getUsers: (): Promise<PageResponse<User>> => {
    // ...
  }
};
```

**Benefits:**
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

## Data Flow

```
┌─────────────┐
│   Page      │
│ Component   │
└──────┬──────┘
       │
       │ uses
       ▼
┌─────────────┐
│   Custom    │
│   Hook      │
└──────┬──────┘
       │
       │ calls
       ▼
┌─────────────┐
│   Service   │
│   Layer     │
└──────┬──────┘
       │
       │ uses
       ▼
┌─────────────┐
│   API       │
│   Client    │
└──────┬──────┘
       │
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │
│   API       │
└─────────────┘
```

## Key Features

### Authentication
- JWT token management
- Auto token refresh
- Protected routes
- User session handling

### Data Management
- Server-side pagination
- Client-side filtering
- Sorting
- Search

### UI Components
- Responsive design
- Dark/light themes
- Loading states
- Error handling
- Empty states

### Code Organization
- Feature-based modules
- Separation of concerns
- DRY principles
- Clean code practices

## Best Practices

1. **Always use TypeScript** - No `any` types
2. **Use custom hooks** - Don't call services directly
3. **Component composition** - Build with reusable components
4. **Error handling** - Always handle errors gracefully
5. **Loading states** - Show feedback to users
6. **Type safety** - Define interfaces for all data structures
7. **Code splitting** - Use dynamic imports for large components
8. **Optimization** - Memoize expensive computations

## API Integration

The application connects to: `https://api-dev.blockpick.net`

### Endpoints

- **Auth**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Games**: `/api/games/*`
- **NFTs**: `/api/nfts/*`
- **Missions**: `/api/missions/*`
- **Rankings**: `/api/rankings/*`
- **Wallets**: `/api/wallets/*`
- **Payments**: `/api/payments/*`

### Request Flow

1. Component calls custom hook
2. Hook executes service function
3. Service calls API client
4. Client adds auth headers
5. Request sent to backend
6. Response cached by React Query
7. Component receives data

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api-dev.blockpick.net
```

## Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Audit logs
- [ ] Role-based access control
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] File uploads with progress

# BlockPick Admin Dashboard

A modern, clean admin dashboard for the BlockPick platform built with Next.js, TypeScript, and shadcn/ui.

## Features

- Modern UI with shadcn/ui components
- Type-safe API integration with TypeScript
- React Query for efficient data fetching and caching
- Responsive design with Tailwind CSS
- Dark mode support
- Comprehensive user, game, and NFT management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack React Query
- **Tables**: TanStack React Table
- **Theme**: next-themes
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard page
│   ├── users/               # User management
│   ├── games/               # Game management
│   ├── nfts/                # NFT management
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (Sidebar, Header)
│   ├── features/            # Feature-specific components
│   └── shared/              # Shared/reusable components
├── lib/
│   ├── api/                 # API client & service layer
│   │   ├── client.ts        # Base API client
│   │   ├── auth.service.ts  # Auth endpoints
│   │   ├── user.service.ts  # User endpoints
│   │   ├── game.service.ts  # Game endpoints
│   │   └── nft.service.ts   # NFT endpoints
│   ├── hooks/               # Custom React hooks
│   │   ├── use-auth.ts      # Auth hooks
│   │   ├── use-users.ts     # User hooks
│   │   ├── use-games.ts     # Game hooks
│   │   └── use-nfts.ts      # NFT hooks
│   ├── types/               # TypeScript type definitions
│   └── utils.ts             # Utility functions
└── constants/               # App constants
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=https://api-dev.blockpick.net
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture

### API Service Layer

The application uses a clean service layer architecture:

- **API Client** (`lib/api/client.ts`): Base HTTP client with automatic token management and error handling
- **Service Files**: Domain-specific API services (auth, users, games, NFTs)
- **Type Definitions**: Strongly typed request/response interfaces

### Custom Hooks

React Query hooks provide a clean interface for data fetching:

```typescript
// Example usage
const { data: users, isLoading } = useUsers({ page: 0, size: 10 });
const createUser = useCreateUser();
```

### Reusable Components

- **DataTable**: Generic table component with sorting, filtering, and pagination
- **StatsCard**: Dashboard statistics cards
- **PageHeader**: Consistent page headers with actions
- **LoadingSpinner**: Loading states
- **EmptyState**: Empty state placeholders

## API Integration

The app integrates with the BlockPick API at `https://api-dev.blockpick.net`.

Main endpoints:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/games/*` - Game management
- `/api/nfts/*` - NFT management

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

Private - BlockPick Platform

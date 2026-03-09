"use client"

import * as React from "react"
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { ThemeProvider } from "@/components/theme-provider"
import { SpecProvider } from "@/components/spec"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 401/403 errors
              if (error instanceof Error && 'status' in error) {
                const status = (error as any).status;
                if (status === 401 || status === 403) {
                  return false;
                }
              }
              // Retry other errors up to 2 times
              return failureCount < 2;
            },
          },
        },
      }),
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SpecProvider>
          {children}
        </SpecProvider>
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </ThemeProvider>
  )
}



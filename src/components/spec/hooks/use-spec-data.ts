'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { SpecScreen } from '../types';

const ROUTE_TO_SCREEN: Record<string, string> = {
  '/login': 'S01',
  '/dashboard': 'S02',
  '/users': 'S03',
  '/games': 'S04',
  '/products': 'S07',
  '/blockchain': 'S08',
  '/monitoring': 'S09',
  '/storage': 'S10',
  '/settings': 'S11',
  '/profile': 'S11',
};

function resolveScreenId(pathname: string): string | null {
  if (ROUTE_TO_SCREEN[pathname]) return ROUTE_TO_SCREEN[pathname];
  if (/^\/games\/[^/]+\/products$/.test(pathname)) return 'S05';
  if (/^\/games\/[^/]+\/leaderboard$/.test(pathname)) return 'S06';
  return null;
}

export function useSpecData() {
  const pathname = usePathname();
  const [screenData, setScreenData] = useState<SpecScreen | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const screenId = resolveScreenId(pathname);

  useEffect(() => {
    if (!screenId) {
      setScreenData(null);
      return;
    }

    setIsLoading(true);
    fetch(`/api/spec/${screenId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load spec data');
        return res.json();
      })
      .then((data) => setScreenData(data))
      .catch(() => setScreenData(null))
      .finally(() => setIsLoading(false));
  }, [screenId]);

  return { screenData, isLoading, screenId };
}

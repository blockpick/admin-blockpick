'use client';

import { useContext } from 'react';
import { SpecContext } from '../spec-provider';
import type { SpecContextValue } from '../types';

export function useSpecContext(): SpecContextValue | null {
  return useContext(SpecContext);
}

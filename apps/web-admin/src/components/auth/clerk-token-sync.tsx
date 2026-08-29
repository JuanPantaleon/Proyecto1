'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { api } from '@/lib/api';

export function ClerkTokenSync() {
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !userId) {
      api.clearToken();
      return;
    }

    let cancelled = false;

    async function syncToken() {
      try {
        const token = await getToken();
        if (!cancelled) {
          if (token) {
            api.setToken(token);
          } else {
            api.clearToken();
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[ClerkTokenSync] Failed to get token:', error);
          api.clearToken();
        }
      }
    }

    syncToken();

    return () => {
      cancelled = true;
    };
  }, [userId, isLoaded, isSignedIn, getToken]);

  return null;
}
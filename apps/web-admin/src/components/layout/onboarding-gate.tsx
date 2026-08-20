'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    if (localStorage.getItem('ranked_fitness_onboarded') === 'true') return;

    let cancelled = false;
    api
      .get<{ isOnboarded?: boolean }>('/api/v1/auth/me')
      .then((me) => {
        if (cancelled) return;
        if (me?.isOnboarded) {
          localStorage.setItem('ranked_fitness_onboarded', 'true');
        } else {
          setAllowed(false);
        }
      })
      .catch(() => {
        // sin backend: no bloquear la demo
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!allowed && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [allowed, pathname, router]);

  return <>{children}</>;
}
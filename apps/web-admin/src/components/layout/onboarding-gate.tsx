'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    api
      .get<{ isOnboarded?: boolean }>('/api/v1/auth/me')
      .then((me) => {
        if (cancelled) return;
        if (me?.isOnboarded) {
          localStorage.setItem('ranked_fitness_onboarded', 'true');
        } else {
          router.replace('/onboarding');
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[OnboardingGate] Failed to check onboarding status:', error);
        if (error?.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/sign-in';
        } else {
          // Si la API falla por cualquier otro motivo, redirigir a onboarding por seguridad
          router.replace('/onboarding');
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF4444] mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
          <Skeleton className="h-4 w-1/2 mx-auto mt-4 rounded" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
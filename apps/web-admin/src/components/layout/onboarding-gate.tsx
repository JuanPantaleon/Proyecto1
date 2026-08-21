'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setChecking(false);
      return;
    }

    // Si Clerk no ha terminado de cargar, esperamos
    if (!isLoaded) {
      return;
    }

    // Si NO hay sesión en Clerk, no hay nada que hacer aquí
    // El middleware de Clerk se encargará de redirigir a sign-in
    if (!isSignedIn) {
      setChecking(false);
      return;
    }

    // HAY sesión en Clerk → verificamos con nuestro backend
    let cancelled = false;
    setChecking(true);

    api
      .get<{ isOnboarded?: boolean }>('/api/v1/auth/me')
      .then((me) => {
        if (cancelled) return;
        if (me?.isOnboarded) {
          localStorage.setItem('ranked_fitness_onboarded', 'true');
        } else {
          // Usuario existe en Clerk pero no está onboarded → a onboarding
          router.replace('/onboarding');
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[OnboardingGate] Failed to check onboarding status:', error);
        
        // Si hay error 401/404 pero Clerk dice que hay sesión → usuario nuevo/desincronizado
        // Lo enviamos a onboarding para que el POST cree/actualice su perfil
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          router.replace('/onboarding');
        } else {
          // Otros errores de red/servidor → también a onboarding por seguridad
          router.replace('/onboarding');
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router, isLoaded, isSignedIn]);

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
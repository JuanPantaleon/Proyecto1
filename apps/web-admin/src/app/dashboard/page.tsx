'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Loader2, User, Building2, GraduationCap, Crown } from 'lucide-react';
import { useRole } from '@/lib/roles';

const ROLE_ICONS = {
  player: User,
  coach: GraduationCap,
  gym: Building2,
  admin: Crown,
};

const ROLE_LABELS = {
  player: 'Jugador',
  coach: 'Entrenador',
  gym: 'Gimnasio',
  admin: 'Admin',
};

const ROLE_DESCRIPTIONS = {
  player: 'Redirigiendo a tu centro de entrenamiento...',
  coach: 'Redirigiendo a tu panel de entrenador...',
  gym: 'Redirigiendo a la gestión de tu gimnasio...',
  admin: 'Redirigiendo al panel de administración...',
};

export default function DashboardDispatcher() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isOwner } = useRole();

  useEffect(() => {
    if (!isLoaded) return;

    // Si NO hay sesión en Clerk → a sign-in (el middleware de Clerk lo maneja)
    if (!isSignedIn) {
      router.replace('/sign-in');
      return;
    }

    // HAY sesión en Clerk → decidimos a dónde ir según rol/onboarding
    if (isOwner) {
      router.replace('/dashboard/owner');
      return;
    }

    switch (role) {
      case 'player':
        router.replace('/dashboard/jugador');
        break;
      case 'coach':
        router.replace('/dashboard/entrenador');
        break;
      case 'gym':
        router.replace('/dashboard/gimnasio');
        break;
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      default:
        // Usuario logueado en Clerk pero sin rol asignado → a onboarding
        router.replace('/onboarding');
    }
  }, [role, isOwner, isLoaded, isSignedIn, router]);

  const Icon = role && ROLE_ICONS[role as keyof typeof ROLE_ICONS] ? ROLE_ICONS[role as keyof typeof ROLE_ICONS] : Loader2;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black px-4">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#EF4444]/5 via-transparent to-[#FBBF24]/5" />
      <div className="relative flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-[#EF4444]/30 animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#EF4444] to-[#FBBF24]">
            <Icon className="h-8 w-8 text-black" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] : 'Cargando...'}
          </h1>
          <p className="mt-2 text-sm text-white/40">
            {role ? ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] : 'Verificando tu sesión...'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full w-1/3 bg-gradient-to-r from-[#EF4444] to-[#FBBF24] animate-[shimmer_1.5s_infinite]"
              style={{ animation: 'shimmer 1.5s infinite' }}
            />
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      ` }} />
    </div>
  );
}
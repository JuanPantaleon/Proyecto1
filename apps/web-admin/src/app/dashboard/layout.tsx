'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RoleProvider, useRole, type AppRole } from '@/lib/roles';
import { OwnerRoleIsland } from '@/components/layout/owner-role-island';
import { OnboardingGate } from '@/components/layout/onboarding-gate';
import { UserButton } from '@clerk/nextjs';
import {
  Home,
  Dumbbell,
  Timer,
  Trophy,
  Users,
  ScanLine,
  Building2,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PLAYER_NAVIGATION: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/entrenamiento', label: 'Entrenar', icon: Dumbbell },
  { href: '/dashboard/temporizador', label: 'Tiempo', icon: Timer },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
  { href: '/dashboard/comunidad', label: 'Social', icon: Users },
];

const GYM_NAVIGATION: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
  { href: '/dashboard/comunidad', label: 'Social', icon: Users },
  { href: '/dashboard/jugadores', label: 'Jugadores', icon: Building2 },
];

const COACH_NAVIGATION: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/entrenamiento', label: 'Entrenamiento', icon: Dumbbell },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
  { href: '/dashboard/comunidad', label: 'Social', icon: Users },
  { href: '/dashboard/jugadores', label: 'Jugadores', icon: Building2 },
  { href: '/dashboard/validar', label: 'Validar', icon: ScanLine },
  { href: '/dashboard/ejercicios', label: 'Ejercicios', icon: ClipboardList },
];

const ADMIN_NAVIGATION: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
  { href: '/dashboard/comunidad', label: 'Social', icon: Users },
  { href: '/dashboard/ejercicios', label: 'Ejercicios', icon: ClipboardList },
  { href: '/dashboard/jugadores', label: 'Jugadores', icon: Building2 },
];

const NAVIGATION_BY_ROLE: Record<AppRole, NavItem[]> = {
  player: PLAYER_NAVIGATION,
  gym: GYM_NAVIGATION,
  coach: COACH_NAVIGATION,
  admin: ADMIN_NAVIGATION,
};

const COACH_ONLY_PATHS = [
  '/dashboard/entrenador/validar',
  '/dashboard/entrenador/ejercicios',
  '/dashboard/entrenador/jugadores',
  '/dashboard/validar',
  '/dashboard/ejercicios',
];

const GYM_ONLY_PATHS = ['/dashboard/gimnasio', '/dashboard/jugadores'];

const STAFF_SHARED_PATHS = ['/dashboard/jugadores'];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isForbidden(pathname: string, role: AppRole, isOwner: boolean) {
  if (isOwner) return false;

  if (role === 'player') {
    return (
      matchesPath(pathname, COACH_ONLY_PATHS) ||
      matchesPath(pathname, GYM_ONLY_PATHS) ||
      matchesPath(pathname, STAFF_SHARED_PATHS)
    );
  }
  if (role === 'coach') {
    return matchesPath(pathname, GYM_ONLY_PATHS);
  }
  if (role === 'gym') {
    return matchesPath(pathname, COACH_ONLY_PATHS);
  }
  return false;
}
 
/** Guarda de rutas: impide acceso por URL directa a áreas que no corresponden al rol activo. */
function RouteRoleGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isOwner } = useRole();

  useEffect(() => {
    if (pathname === '/dashboard') return;
    if (isForbidden(pathname, role, isOwner)) {
      router.replace('/dashboard');
    }
  }, [pathname, role, isOwner, router]);

  return <>{children}</>;
}

function DockNavigation() {
  const pathname = usePathname();
  const { role } = useRole();

  const navigation = NAVIGATION_BY_ROLE[role];

  return (
    <nav
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)]"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center gap-1 bg-[#0D0D0D]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-3.5 py-3 rounded-[1.5rem] transition-all duration-300',
                'min-w-[64px]',
                isActive
                  ? 'text-[#EF4444]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-medium whitespace-nowrap">{item.label}</span>
              <span
                className={cn(
                  'absolute bottom-1 h-1 w-1 rounded-full bg-[#EF4444] transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function OwnerTopPad() {
  const { isOwner } = useRole();
  if (!isOwner) return null;
  return <div className="h-10 shrink-0" aria-hidden="true" />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <OnboardingGate>
        <RouteRoleGuard>
          <div className="relative h-[100dvh] w-full bg-black overflow-hidden flex flex-col">
            {/* Background atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/5 via-transparent to-[#FBBF24]/5" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50" />
            </div>

            {/* Owner mini-isla flotante superior */}
            <OwnerRoleIsland />

            {/* User Button (Logout / Account Settings) */}
            <div className="fixed top-4 right-6 z-50">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 border-2 border-white/10 shadow-lg',
                  },
                }}
              />
            </div>

            {/* Main content area */}
            <main className="flex-1 overflow-hidden relative pb-28 flex flex-col px-4 pt-6">
              <OwnerTopPad />
              <div className="max-w-7xl mx-auto w-full h-full flex flex-col min-h-0">
                {children}
              </div>
            </main>

            <DockNavigation />
          </div>
        </RouteRoleGuard>
      </OnboardingGate>
    </RoleProvider>
  );
}
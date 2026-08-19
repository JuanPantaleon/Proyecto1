'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RoleProvider, useRole } from '@/lib/roles';
import { Home, Dumbbell, Timer, Trophy, Users, ScanLine, Building2 } from 'lucide-react';

const PLAYER_NAVIGATION = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/entrenamiento', label: 'Entrenar', icon: Dumbbell },
  { href: '/dashboard/temporizador', label: 'Tiempo', icon: Timer },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
  { href: '/dashboard/comunidad', label: 'Social', icon: Users },
];

const STAFF_NAVIGATION = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/ranking', label: 'Ranking', icon: Trophy },
  { href: '/dashboard/comunidad', label: 'Social', icon: Users },
  { href: '/dashboard/gimnasio/jugadores', label: 'Jugadores', icon: Building2 },
];

function DockNavigation() {
  const pathname = usePathname();
  const { role } = useRole();

  const navigation = [
    ...(role === 'gym' || role === 'coach' ? STAFF_NAVIGATION : PLAYER_NAVIGATION),
    ...(role === 'coach'
      ? [{ href: '/dashboard/entrenador/validar', label: 'Validar', icon: ScanLine }]
      : []),
  ];

  return (
    <nav
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="relative flex items-center gap-1 bg-[#0D0D0D]/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
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
                'relative flex flex-col items-center justify-center gap-1 px-5 py-3 rounded-[1.5rem] transition-all duration-300',
                'min-w-[72px]',
                isActive
                  ? 'text-[#EF4444]'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="relative h-[100dvh] w-full bg-black overflow-hidden flex flex-col">
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/5 via-transparent to-[#FBBF24]/5" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 400%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50" />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden relative pb-28 flex flex-col px-4 pt-6">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col min-h-0">
            {children}
          </div>
        </main>

        <DockNavigation />
      </div>
    </RoleProvider>
  );
}
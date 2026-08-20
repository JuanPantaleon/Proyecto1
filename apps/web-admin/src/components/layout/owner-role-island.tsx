'use client';

import { useRole, type AppRole } from '@/lib/roles';
import { cn } from '@/lib/utils';

const VIEWS: { id: AppRole; label: string; icon: string }[] = [
  { id: 'player', label: 'Jugador', icon: '🏃' },
  { id: 'coach', label: 'Entrenador', icon: '🥇' },
  { id: 'gym', label: 'Gimnasio', icon: '🏢' },
  { id: 'admin', label: 'Admin', icon: '🛡' },
];

export function OwnerRoleIsland() {
  const { isOwner, role, switchRole } = useRole();

  if (!isOwner) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[60] -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1.5 shadow-lg shadow-black/40 backdrop-blur-md">
        <span className="mr-1 hidden items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-accent sm:flex">
          <span aria-hidden>👑</span> Owner
        </span>
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => switchRole(view.id)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200',
              role === view.id
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background-hover hover:text-foreground'
            )}
            aria-pressed={role === view.id}
            title={`Vista Owner: ${view.label}`}
          >
            <span aria-hidden>{view.icon}</span>
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
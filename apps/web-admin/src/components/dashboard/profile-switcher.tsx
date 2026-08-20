'use client';

import { useState } from 'react';
import { User, Building2, GraduationCap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, type AppRole } from '@/lib/roles';

const OPTIONS: { role: AppRole; label: string; icon: typeof User }[] = [
  { role: 'player', label: 'Jugador', icon: User },
  { role: 'gym', label: 'Gimnasio', icon: Building2 },
  { role: 'coach', label: 'Entrenador', icon: GraduationCap },
];

export default function ProfileSwitcher() {
  const { role, switchRole, isOwner, setOwnerMode } = useRole();
  // Con un token válido el rol se verifica en el backend; el toggle Owner es
  // solo para el modo demo (sin backend) y nunca puede autoproclamar el rol.
  const [hasToken] = useState(
    () => typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
        {isOwner ? 'Modo Owner activo' : 'Ver app como'}
      </span>
      <div className="flex items-center gap-1 self-start rounded-[1.25rem] border border-white/10 bg-[#0D0D0D] p-1">
        {OPTIONS.map(({ role: option, label, icon: Icon }) => {
          const isActive = role === option;
          return (
            <button
              key={option}
              onClick={() => switchRole(option)}
              className={cn(
                'flex items-center gap-1.5 rounded-[1rem] px-3.5 py-2 text-xs font-bold transition-all duration-300',
                isActive
                  ? 'bg-[#EF4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              )}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
        {!hasToken && (
          <button
            type="button"
            onClick={() => setOwnerMode(!isOwner)}
            title={
              isOwner
                ? 'Salir del modo Owner (demo)'
                : 'Activar modo Owner (demo) — con backend el rol se verifica en servidor'
            }
            className={cn(
              'flex items-center gap-1.5 rounded-[1rem] px-3 py-2 text-xs font-bold transition-all duration-300',
              isOwner
                ? 'bg-[#FBBF24] text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'border border-dashed border-[#FBBF24]/40 text-[#FBBF24]/70 hover:bg-[#FBBF24]/10 hover:text-[#FBBF24]'
            )}
            aria-pressed={isOwner}
          >
            <Crown className="h-3.5 w-3.5" />
            {isOwner ? 'Owner' : 'Owner'}
          </button>
        )}
      </div>
      {isOwner && (
        <p className="text-xs text-[#FBBF24]/70">
          La mini-isla 👑 del top cambia la vista global (dock + API).
        </p>
      )}
      {hasToken && (
        <p className="text-xs text-white/30">
          Rol verificado por el backend · el modo Owner se concede solo a la cuenta raíz.
        </p>
      )}
    </div>
  );
}
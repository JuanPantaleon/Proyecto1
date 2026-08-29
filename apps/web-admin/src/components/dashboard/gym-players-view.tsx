'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Trophy,
  UserPlus,
  UserCheck,
  X,
  ClipboardList,
  Check,
  Users,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/roles';

interface Routine {
  id: string;
  title: string;
  days: number;
}

const DIVISION_BADGE: Record<string, string> = {
  Platino: 'border-white/40 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/10 text-[#D97706]',
};

const ROUTINE_LIBRARY: Routine[] = [
  { id: 'r1', title: 'Full Body Pantafit', days: 3 },
  { id: 'r2', title: 'Push + Pull', days: 4 },
  { id: 'r3', title: 'Fuerza Competitiva', days: 5 },
  { id: 'r4', title: 'Hipertrofia Pantafit', days: 4 },
];

interface GymLibraryRoutine {
  id: string;
  name: string;
  level?: string;
  goal?: string;
  description?: string;
  exercises?: { name: string; sets: number; reps: number }[];
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function GymPlayersView() {
  const {
    players,
    joinRequests,
    routineAssignments,
    approveJoin,
    rejectJoin,
    assignRoutine,
  } = useRole();
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [justAssigned, setJustAssigned] = useState<string | null>(null);
  const [gymRoutines, setGymRoutines] = useState<GymLibraryRoutine[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ranked_fitness_gym_routines') ?? '[]');
      if (Array.isArray(stored) && stored.length > 0) setGymRoutines(stored);
    } catch {
      // biblioteca local vacía -> usar defaults
    }
  }, []);

  const assignLibrary =
    gymRoutines.length > 0 ? gymRoutines : ROUTINE_LIBRARY;

  const assignRoutineFor = (title: string) => {
    if (!assignTarget) return;
    assignRoutine(assignTarget, title);
    setJustAssigned(`${assignTarget}:${title}`);
    setAssignTarget(null);
    setTimeout(() => setJustAssigned(null), 2500);
  };

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/80 px-6 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Pantafit</h1>
            <p className="text-xs text-white/40">Gestión de Jugadores</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/dashboard/gimnasio/rutinas"
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-[#0D0D0D] px-4 text-xs font-bold uppercase tracking-widest text-white/50 transition-all hover:border-[#FBBF24]/40 hover:text-[#FBBF24]"
          >
            <ClipboardList className="h-4 w-4" />
            Rutinas
          </a>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5">
            <Users className="h-4 w-4 text-[#FBBF24]" />
            <span className="text-base font-black text-white">{players.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              {joinRequests.length > 0 ? `+${joinRequests.length} solicitudes` : 'vinculados'}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido con scroll */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 pt-6 scrollbar-hide">
        {/* Solicitudes de ingreso */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
              <UserPlus className="h-4 w-4 text-[#EF4444]" />
              Solicitudes para unirse a Pantafit
            </p>
            <span className="rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
              {joinRequests.length} pendientes
            </span>
          </div>

          {joinRequests.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 py-8 text-center">
              <UserCheck className="mx-auto h-8 w-8 text-white/15" />
              <p className="mt-2 text-sm text-white/40">Sin solicitudes pendientes</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {joinRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                      {initials(req.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{req.name}</p>
                      <p className="truncate text-xs text-white/40">
                        {req.email} · {req.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveJoin(req.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#EF4444] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90 sm:flex-none"
                    >
                      <Check className="h-4 w-4" />
                      Aceptar
                    </button>
                    <button
                      onClick={() => rejectJoin(req.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white/40 transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444] sm:flex-none"
                    >
                      <X className="h-4 w-4" />
                      Rechazar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Jugadores vinculados */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <Building2 className="h-4 w-4 text-[#FBBF24]" />
            Jugadores vinculados
          </p>

          <div className="mt-4 space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                    {initials(player.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{player.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                          DIVISION_BADGE[player.division] ?? DIVISION_BADGE.Plata
                        )}
                      >
                        {player.division}
                      </span>
                      <span className="text-xs font-bold text-[#FBBF24]">+{player.isgScore} ISG</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="min-w-0 max-w-[10rem]">
                    <p className="truncate text-[10px] font-bold uppercase tracking-widest text-white/30">
                      Rutina asignada
                    </p>
                    <p
                      className={cn(
                        'truncate text-xs font-bold',
                        routineAssignments[player.id] ? 'text-white' : 'text-white/30'
                      )}
                    >
                      {routineAssignments[player.id] ?? 'Sin asignar'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAssignTarget(player.id)}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-widest text-white/50 transition-all hover:border-[#FBBF24]/50 hover:text-[#FBBF24]"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Asignar
                  </button>
                </div>

                {justAssigned === `${player.id}:r1` && (
                  <p className="text-xs font-bold text-green-300">✓ Rutina asignada</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de asignación de rutina */}
      {assignTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 pb-6 backdrop-blur-sm sm:items-center"
          onClick={() => setAssignTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Asignar rutina a
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">
                  {players.find((p) => p.id === assignTarget)?.name ?? 'Jugador'}
                </h3>
              </div>
              <button
                onClick={() => setAssignTarget(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-4 space-y-2.5">
              {assignLibrary.map((routine) => {
                const title = 'name' in routine ? routine.name : routine.title;
                const isCurrent = routineAssignments[assignTarget] === title;
                const subtitle =
                  'goal' in routine && routine.goal
                    ? `${routine.level} · ${routine.goal}`
                    : `${'days' in routine ? routine.days : 0} días · Pantafit`;
                return (
                  <li key={routine.id}>
                    <button
                      onClick={() => assignRoutineFor(title)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all',
                        isCurrent
                          ? 'border-[#FBBF24]/60 bg-[#FBBF24]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#FBBF24]/40'
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{title}</p>
                        <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                        {isCurrent ? 'Actual' : 'Asignar'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/40">
              <Trophy className="h-4 w-4 text-[#FBBF24]" />
              La rutina se sincroniza al instante con el jugador.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
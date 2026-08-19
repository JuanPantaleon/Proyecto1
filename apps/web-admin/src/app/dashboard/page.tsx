'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Dumbbell, Activity, Award, ArrowRight, Calendar, Zap, Users, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, PLAYER_PROFILE, type PlayerProfile } from '@/lib/roles';
import ProfileSwitcher from '@/components/dashboard/profile-switcher';
import RoleProfileCard from '@/components/dashboard/role-profile-card';

const STORAGE_KEY = 'ranked_fitness_custom_routines';

interface ActiveRoutine {
  id: number;
  title: string;
  description: string;
  days: { title: string; exercises: { name: string; sets: { kilos: string; repes: string }[] }[] }[];
}

const weekDays = [
  { day: 'L', done: true },
  { day: 'M', done: true },
  { day: 'X', done: true },
  { day: 'J', done: false },
  { day: 'V', done: false },
  { day: 'S', done: false },
  { day: 'D', done: false },
];

const feed = [
  { id: 1, user: 'Lautaro Díaz', action: 'Nuevo PR', detail: 'Sentadilla 180 kg', time: 'hace 12 min', icon: Trophy, color: 'text-[#FBBF24]' },
  { id: 2, user: 'Valentina Ríos', action: 'Ascenso a División Oro', detail: 'Ranked Fitness', time: 'hace 40 min', icon: Award, color: 'text-[#FBBF24]' },
  { id: 3, user: 'Martín Quispe', action: 'Sesión completada', detail: 'Peso Muerto 200 kg · 3x5', time: 'hace 1 h', icon: Dumbbell, color: 'text-[#EF4444]' },
  { id: 4, user: 'Camila Sosa', action: 'Levantamiento validado', detail: 'Press Banca 100 kg', time: 'hace 2 h', icon: Activity, color: 'text-[#EF4444]' },
  { id: 5, user: 'Nicolás Fernández', action: 'Nuevo PR', detail: 'Dominadas 25 reps', time: 'hace 3 h', icon: Trophy, color: 'text-[#FBBF24]' },
];

const ROLE_SUBTITLE: Record<string, string> = {
  player: 'Centro de control del atleta',
  gym: 'Panel de gestión del gimnasio',
  coach: 'Gestión de alumnos y programas',
};

export default function DashboardPage() {
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(null);
  const { role, profile } = useRole();
  const player: PlayerProfile =
    'role' in profile && profile.role === 'player' ? profile : PLAYER_PROFILE;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setActiveRoutine(stored[0]);
      }
    } catch {
      setActiveRoutine(null);
    }
  }, []);

  const nextDivisionIsg = player.division.minScore + 1000;
  const progressToNext = Math.min(
    100,
    Math.max(0, Math.round(((player.isgScore - 2000) / (nextDivisionIsg - 2000)) * 100))
  );

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex-shrink-0 px-6 pb-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Inicio</h1>
        <p className="mt-0.5 text-sm font-medium text-white/40">{ROLE_SUBTITLE[role]}</p>
        <div className="mt-4">
          <ProfileSwitcher />
        </div>
      </header>

      {/* Contenedor con scroll interno */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 scrollbar-hide">
        {/* Perfil según rol */}
        <RoleProfileCard />

        {role === 'player' ? (
          <>
            {/* Progreso a siguiente división */}
            <div className="rounded-3xl border border-white/5 bg-[#0D0D0D] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Próxima división
                </span>
                <span className="text-xs font-bold text-[#FBBF24]">
                  {nextDivisionIsg.toLocaleString()} ISG
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#FBBF24] transition-all"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40">
                Faltan {(nextDivisionIsg - player.isgScore).toLocaleString()} ISG para ascender
              </p>
            </div>

            {/* Racha y Metas Semanales */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-[#0D0D0D] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Racha activa
                  </span>
                  <Flame className="h-5 w-5 text-[#EF4444]" />
                </div>
                <p className="mt-3 text-3xl font-black tracking-tighter text-white">
                  4 <span className="text-base font-medium text-white/40">días</span>
                </p>
                <p className="mt-1 text-xs text-[#EF4444]">¡Sigue así, Atleta!</p>
              </div>

              <div className="rounded-3xl border border-white/5 bg-[#0D0D0D] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Meta semanal
                  </span>
                  <Zap className="h-5 w-5 text-[#FBBF24]" />
                </div>
                <p className="mt-3 text-3xl font-black tracking-tighter text-white">
                  2 <span className="text-base font-medium text-white/40">/ 3 sesiones</span>
                </p>
                <div className="mt-3 flex items-center justify-between gap-1.5">
                  {weekDays.map((d, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-full rounded-full',
                          d.done ? 'bg-[#EF4444]' : 'bg-white/5'
                        )}
                      />
                      <span className="text-[9px] font-bold uppercase text-white/30">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rutina Activa / Próxima Sesión */}
            <div className="rounded-3xl border border-[#EF4444]/20 bg-[#0D0D0D] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <Calendar className="h-4 w-4 text-[#EF4444]" />
                  Rutina activa
                </span>
                <Link
                  href="/dashboard/entrenamiento"
                  className="flex items-center gap-1 text-xs font-bold text-[#EF4444] transition-colors hover:text-white"
                >
                  Ver rutinas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {activeRoutine ? (
                <>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                    {activeRoutine.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/40">
                    {activeRoutine.description || 'Sin descripción'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(activeRoutine.days ?? []).map((d, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/60"
                      >
                        {d.title || `Día ${i + 1}`} · {d.exercises?.length ?? 0} ejercicios
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/entrenamiento"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
                  >
                    <Dumbbell className="h-4 w-4" />
                    Ir a Entrenar
                  </Link>
                </>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
                  <Dumbbell className="h-8 w-8 text-white/20" />
                  <p className="text-sm text-white/40">Aún no tienes una rutina activa</p>
                  <Link
                    href="/dashboard/entrenamiento/crear"
                    className="rounded-full bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
                  >
                    Crear primera rutina
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Panel de gestión para Gimnasio / Entrenador */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/entrenamiento"
              className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-5 transition-all hover:border-[#EF4444]/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <ClipboardList className="h-4 w-4 text-[#EF4444]" />
                  Programas
                </span>
                <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#EF4444]" />
              </div>
              <p className="mt-3 text-sm text-white/50">
                {role === 'coach'
                  ? 'Diseña y asigna rutinas a tus alumnos.'
                  : 'Gestiona los programas del gimnasio.'}
              </p>
            </Link>

            <Link
              href="/dashboard/ranking"
              className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-5 transition-all hover:border-[#FBBF24]/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <Users className="h-4 w-4 text-[#FBBF24]" />
                  Ranking
                </span>
                <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#FBBF24]" />
              </div>
              <p className="mt-3 text-sm text-white/50">
                Monitorea el rendimiento de {role === 'coach' ? 'tus alumnos' : 'los jugadores vinculados'}.
              </p>
            </Link>
          </div>
        )}

        {/* Feed Social Pantafit */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <Activity className="h-4 w-4 text-[#FBBF24]" />
            Pantafit Activity
          </h2>
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#0D0D0D] p-4 transition-all hover:border-white/20"
            >
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5',
                  item.color
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-white">
                  {item.user}{' '}
                  <span className="font-normal text-white/40">· {item.action}</span>
                </p>
                <p className="break-words text-xs text-white/30">
                  {item.detail} · {item.time}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
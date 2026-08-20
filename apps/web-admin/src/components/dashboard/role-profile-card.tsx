'use client';

import {
  Trophy,
  Mail,
  MapPin,
  Cake,
  Ruler,
  Weight,
  Dumbbell,
  Users,
  UserCheck,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, type PlayerProfile } from '@/lib/roles';

const DIVISION_BADGE: Record<string, string> = {
  Platino: 'border-white/40 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/10 text-[#D97706]',
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]';

function Field({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/50">
      <Icon className="h-4 w-4 flex-shrink-0 text-white/30" />
      <span className="truncate">{value}</span>
      <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/25">
        {label}
      </span>
    </div>
  );
}

function PlayerCard() {
  const { profile, updatePlayerProfile } = useRole();
  const player = profile as PlayerProfile;

  const setNumber = (key: 'age' | 'heightCm' | 'weightKg', value: string) => {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      updatePlayerProfile({ [key]: parsed } as Partial<PlayerProfile>);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-lg font-black text-[#FBBF24]">
            {initials(player.name)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              Jugador
            </p>
            <p className="mt-0.5 break-words text-lg font-bold text-white">{player.name}</p>
            <span
              className={cn(
                'mt-1.5 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
                DIVISION_BADGE[player.division.name]
              )}
            >
              <Trophy className="h-3 w-3" />
              {player.division.name}
            </span>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Score ISG
          </span>
          <span className="text-4xl font-black tracking-tighter text-[#FBBF24]">
            {player.isgScore.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2.5 rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Contacto y ubicación</p>
          <Field icon={Mail} label="Email" value={player.email} />
          <Field
            icon={MapPin}
            label="País"
            value={player.location.country}
          />
          <Field
            icon={MapPin}
            label="Provincia"
            value={player.location.province}
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <Dumbbell className="h-3.5 w-3.5 text-[#FBBF24]" />
            Datos para el motor ISG
          </p>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                <Cake className="h-4 w-4 text-white/40" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Edad</label>
                <input
                  type="number"
                  value={player.age}
                  onChange={(e) => setNumber('age', e.target.value)}
                  className={inputClass}
                  aria-label="Edad"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                <Ruler className="h-4 w-4 text-white/40" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Altura (cm)</label>
                <input
                  type="number"
                  value={player.heightCm}
                  onChange={(e) => setNumber('heightCm', e.target.value)}
                  className={inputClass}
                  aria-label="Altura en centímetros"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                <Weight className="h-4 w-4 text-white/40" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Peso (kg)</label>
                <input
                  type="number"
                  value={player.weightKg}
                  onChange={(e) => setNumber('weightKg', e.target.value)}
                  className={inputClass}
                  aria-label="Peso en kilogramos"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GymCard() {
  const { profile } = useRole();
  const gym = profile as import('@/lib/roles').GymProfile;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#EF4444]/60 bg-[#EF4444]/15 text-xl font-black text-[#EF4444]">
            <Building2 className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              Gimnasio
            </p>
            <p className="mt-0.5 break-words text-lg font-bold text-white">{gym.name}</p>
            <p className="mt-1 text-xs text-white/50">
              {gym.country} · {gym.province}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-lg font-black text-white">{gym.linkedCoaches.length}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Coaches</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-lg font-black text-[#FBBF24]">{gym.linkedPlayers.length}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Jugadores</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <UserCheck className="h-3.5 w-3.5 text-[#EF4444]" />
            Entrenadores vinculados
          </p>
          <ul className="mt-3 space-y-2.5">
            {gym.linkedCoaches.map((coach) => (
              <li key={coach.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-[11px] font-black text-white/60">
                  {initials(coach.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{coach.name}</p>
                  <p className="truncate text-xs text-white/30">{coach.email}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <Users className="h-3.5 w-3.5 text-[#FBBF24]" />
            Jugadores vinculados
          </p>
          <ul className="mt-3 space-y-2.5">
            {gym.linkedPlayers.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-[11px] font-black text-white/60">
                  {initials(member.name)}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{member.name}</p>
                <span className="text-xs font-bold text-[#FBBF24]">+{member.isgScore}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CoachCard() {
  const { profile } = useRole();
  const coach = profile as import('@/lib/roles').CoachProfile;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-lg font-black text-[#FBBF24]">
            {initials(coach.name)}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              Entrenador
            </p>
            <p className="mt-0.5 break-words text-lg font-bold text-white">{coach.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
              <Mail className="h-3.5 w-3.5 text-white/30" />
              {coach.email}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Gimnasio asignado
          </span>
          <span className="flex items-center gap-1.5 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-sm font-bold text-[#EF4444]">
            <Building2 className="h-4 w-4" />
            {coach.assignedGym.name}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <GraduationCap className="h-3.5 w-3.5 text-[#FBBF24]" />
          Alumnos vinculados · {coach.linkedStudents.length}
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {coach.linkedStudents.map((student) => (
            <li
              key={student.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/30 p-3"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-[11px] font-black text-white/60">
                {initials(student.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{student.name}</p>
              </div>
              <span className="text-xs font-bold text-[#FBBF24]">+{student.isgScore}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AdminCard() {
  const { profile } = useRole();
  const admin = profile as import('@/lib/roles').AdminProfile;

  return (
    <div className="rounded-[2rem] border border-[#FBBF24]/20 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-xl font-black text-[#FBBF24]">
            👑
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              Owner · Super Admin
            </p>
            <p className="mt-0.5 break-words text-lg font-bold text-white">{admin.name}</p>
            <p className="mt-1 text-xs text-[#FBBF24]/80">{admin.label}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-lg font-black text-[#FBBF24]">∞</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
              Permisos
            </span>
          </div>
        </div>
      </div>
      <p className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-white/50">
        Acceso raíz con vistas globales: usá la mini-isla 👑 superior para alternar entre las
        vistas de Jugador, Entrenador, Gimnasio y Administración sin perder permisos.
      </p>
    </div>
  );
}

export default function RoleProfileCard() {
  const { role } = useRole();

  if (role === 'gym') return <GymCard />;
  if (role === 'coach') return <CoachCard />;
  if (role === 'admin') return <AdminCard />;
  return <PlayerCard />;
}
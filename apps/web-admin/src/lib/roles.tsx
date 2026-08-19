'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AppRole = 'player' | 'gym' | 'coach';

export interface PlayerProfile {
  id: string;
  email: string;
  name: string;
  role: 'player';
  location: { country: string; province: string };
  age: number;
  heightCm: number;
  weightKg: number;
  activeRoutineId?: string;
  isgScore: number;
  division: { name: string; minScore: number };
}

export interface LinkedPerson {
  id: string;
  name: string;
  email?: string;
  isgScore?: number;
}

export interface GymProfile {
  id: string;
  name: string;
  country: string;
  province: string;
  linkedCoaches: LinkedPerson[];
  linkedPlayers: LinkedPerson[];
}

export interface CoachProfile {
  id: string;
  email: string;
  name: string;
  role: 'coach';
  assignedGym: { id: string; name: string };
  linkedStudents: LinkedPerson[];
}

export type AppProfile = PlayerProfile | GymProfile | CoachProfile;

const STORAGE_KEY = 'ranked_fitness_active_profile';

export const PLAYER_PROFILE: PlayerProfile = {
  id: 'player-1',
  email: 'juan.perez@rankedfitness.com',
  name: 'Juan Pérez',
  role: 'player',
  location: { country: 'Argentina', province: 'Buenos Aires' },
  age: 24,
  heightCm: 178,
  weightKg: 82,
  activeRoutineId: undefined,
  isgScore: 2450,
  division: { name: 'Platino', minScore: 2000 },
};

export const GYM_PROFILE: GymProfile = {
  id: 'gym-pantafit',
  name: 'Pantafit',
  country: 'Argentina',
  province: 'Buenos Aires',
  linkedCoaches: [
    { id: 'coach-1', name: 'Lucía Fernández', email: 'lucia@pantafit.com' },
    { id: 'coach-2', name: 'Diego Ruiz', email: 'diego@pantafit.com' },
  ],
  linkedPlayers: [
    { id: 'player-1', name: 'Juan Pérez', isgScore: 2450 },
    { id: 'player-2', name: 'Camila Sosa', isgScore: 1980 },
    { id: 'player-3', name: 'Martín Quispe', isgScore: 1820 },
  ],
};

export const COACH_PROFILE: CoachProfile = {
  id: 'coach-1',
  email: 'lucia@pantafit.com',
  name: 'Lucía Fernández',
  role: 'coach',
  assignedGym: { id: 'gym-pantafit', name: 'Pantafit' },
  linkedStudents: [
    { id: 'player-1', name: 'Juan Pérez', isgScore: 2450 },
    { id: 'player-4', name: 'Valentina Ríos', isgScore: 2100 },
    { id: 'player-5', name: 'Nicolás Fernández', isgScore: 1750 },
  ],
};

const DEFAULT_PROFILES: Record<AppRole, AppProfile> = {
  player: PLAYER_PROFILE,
  gym: GYM_PROFILE,
  coach: COACH_PROFILE,
};

interface RoleContextValue {
  role: AppRole;
  profile: AppProfile;
  switchRole: (role: AppRole) => void;
  updatePlayerProfile: (patch: Partial<PlayerProfile>) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Record<AppRole, AppProfile>>(DEFAULT_PROFILES);
  const [role, setRole] = useState<AppRole>('player');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<AppRole, AppProfile> & { active?: AppRole };
      if (parsed && typeof parsed === 'object') {
        setProfiles((prev) => ({
          player: parsed.player ?? prev.player,
          gym: parsed.gym ?? prev.gym,
          coach: parsed.coach ?? prev.coach,
        }));
        if (parsed.active === 'player' || parsed.active === 'gym' || parsed.active === 'coach') {
          setRole(parsed.active);
        }
      }
    } catch {
      // perfil por defecto
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profiles, active: role }));
    } catch {
      // almacenamiento no disponible
    }
  }, [profiles, role]);

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      profile: profiles[role],
      switchRole: (next) => setRole(next),
      updatePlayerProfile: (patch) =>
        setProfiles((prev) => ({
          ...prev,
          player: { ...(prev.player as PlayerProfile), ...patch },
        })),
    }),
    [role, profiles]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole debe usarse dentro de <RoleProvider>');
  return ctx;
}
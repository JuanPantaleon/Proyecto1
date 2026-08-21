'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

export type AppRole = 'player' | 'gym' | 'coach' | 'admin';

// Mapea el rol persistido en el backend (Prisma Role) al rol de la app.
const BACKEND_ROLE_TO_APP: Record<string, AppRole> = {
  USER: 'player',
  TRAINER: 'coach',
  GYM_ADMIN: 'gym',
  OWNER: 'admin',
};

function mapBackendRole(role?: string): AppRole | null {
  if (!role) return null;
  return BACKEND_ROLE_TO_APP[role] ?? null;
}

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

export interface AdminProfile {
  id: string;
  name: string;
  role: 'admin';
  label: string;
}

export type AppProfile = PlayerProfile | GymProfile | CoachProfile | AdminProfile;

/* ============================================================
 * Ecosistema demo (fuente única de verdad del roster).
 * Cada vista del Owner (PLAYER / COACH / GYM / ADMIN) deriva sus
 * datos de este store: los cambios (series ISG, rutinas asignadas,
 * solicitudes aceptadas, altas de jugadores) se reflejan al instante
 * y de forma consistente en todos los modos.
 * ============================================================ */

export interface EcosystemPlayer {
  id: string;
  name: string;
  isgScore: number;
  division: string;
}

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  reason: string;
}

export interface CoachingRequest {
  id: string;
  name: string;
  note: string;
}

export interface EcosystemState {
  players: EcosystemPlayer[];
  joinRequests: JoinRequest[];
  coachingRequests: CoachingRequest[];
  routineAssignments: Record<string, string>;
  coachStudentIds: string[];
}

const STORAGE_KEY = 'ranked_fitness_active_profile';
const ECOSYSTEM_KEY = 'ranked_fitness_ecosystem';

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

export const ADMIN_PROFILE: AdminProfile = {
  id: 'owner-root',
  name: 'Owner · Super Admin',
  role: 'admin',
  label: 'Acceso raíz · vistas globales',
};

const DEFAULT_PROFILES: Record<AppRole, AppProfile> = {
  player: PLAYER_PROFILE,
  gym: GYM_PROFILE,
  coach: COACH_PROFILE,
  admin: ADMIN_PROFILE,
};

export function divisionForScore(score: number): string {
  if (score >= 2000) return 'Platino';
  if (score >= 1800) return 'Oro';
  if (score >= 1500) return 'Plata';
  return 'Bronce';
}

const DEFAULT_PLAYERS: EcosystemPlayer[] = [
  { id: 'player-1', name: 'Juan Pérez', isgScore: 2450, division: 'Platino' },
  { id: 'player-2', name: 'Camila Sosa', isgScore: 1980, division: 'Oro' },
  { id: 'player-3', name: 'Martín Quispe', isgScore: 2085, division: 'Oro' },
  { id: 'player-4', name: 'Valentina Ríos', isgScore: 2100, division: 'Oro' },
  { id: 'player-5', name: 'Nicolás Fernández', isgScore: 1750, division: 'Plata' },
  { id: 'player-6', name: 'Agustina Ledesma', isgScore: 1620, division: 'Plata' },
];

const DEFAULT_JOIN_REQUESTS: JoinRequest[] = [
  { id: 'req-1', name: 'Sofía Condorí', email: 'sofia.condori@gmail.com', reason: 'Quiero unirme a Pantafit' },
  { id: 'req-2', name: 'Bruno Mamani', email: 'bruno.mamani@gmail.com', reason: 'Solicitud por recomendación' },
];

const DEFAULT_COACHING_REQUESTS: CoachingRequest[] = [
  { id: 'coach-req-1', name: 'Renata Vidal', note: 'Solicitud de coaching · Quiere entrenar con vos' },
  { id: 'coach-req-2', name: 'Tomás Herrera', note: 'Solicitud de coaching · Jugador de la isla' },
];

const DEFAULT_ECOSYSTEM: EcosystemState = {
  players: DEFAULT_PLAYERS,
  joinRequests: DEFAULT_JOIN_REQUESTS,
  coachingRequests: DEFAULT_COACHING_REQUESTS,
  routineAssignments: {},
  coachStudentIds: ['player-1', 'player-4', 'player-5'],
};

function loadEcosystem(): EcosystemState {
  if (typeof window === 'undefined') return DEFAULT_ECOSYSTEM;
  try {
    const raw = localStorage.getItem(ECOSYSTEM_KEY);
    if (!raw) return DEFAULT_ECOSYSTEM;
    const parsed = JSON.parse(raw) as Partial<EcosystemState>;
    return {
      players: Array.isArray(parsed.players) ? parsed.players : DEFAULT_ECOSYSTEM.players,
      joinRequests: Array.isArray(parsed.joinRequests)
        ? parsed.joinRequests
        : DEFAULT_ECOSYSTEM.joinRequests,
      coachingRequests: Array.isArray(parsed.coachingRequests)
        ? parsed.coachingRequests
        : DEFAULT_ECOSYSTEM.coachingRequests,
      routineAssignments:
        parsed.routineAssignments && typeof parsed.routineAssignments === 'object'
          ? parsed.routineAssignments
          : {},
      coachStudentIds: Array.isArray(parsed.coachStudentIds)
        ? parsed.coachStudentIds
        : DEFAULT_ECOSYSTEM.coachStudentIds,
    };
  } catch {
    return DEFAULT_ECOSYSTEM;
  }
}

interface RoleContextValue {
  role: AppRole;
  profile: AppProfile;
  isOwner: boolean;
  roleReady: boolean;
  switchRole: (role: AppRole) => void;
  updatePlayerProfile: (patch: Partial<PlayerProfile>) => void;
  /* Ecosistema compartido */
  players: EcosystemPlayer[];
  joinRequests: JoinRequest[];
  coachingRequests: CoachingRequest[];
  routineAssignments: Record<string, string>;
  acceptCoaching: (id: string) => void;
  rejectCoaching: (id: string) => void;
  approveJoin: (id: string) => void;
  rejectJoin: (id: string) => void;
  assignRoutine: (athleteId: string, routineTitle: string) => void;
  recordSetIsg: (playerId: string, delta: number) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Record<AppRole, AppProfile>>(DEFAULT_PROFILES);
  const [role, setRole] = useState<AppRole>('player');
  const [isOwner, setIsOwner] = useState(false);
  const [roleReady, setRoleReady] = useState(false);
  const [ecosystem, setEcosystem] = useState<EcosystemState>(() => loadEcosystem());
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<AppRole, AppProfile> & { active?: AppRole };
        if (parsed && typeof parsed === 'object') {
          setProfiles((prev) => ({
            player: parsed.player ?? prev.player,
            gym: parsed.gym ?? prev.gym,
            coach: parsed.coach ?? prev.coach,
            admin: parsed.admin ?? prev.admin,
          }));
          if (parsed.active === 'player' || parsed.active === 'gym' || parsed.active === 'coach') {
            setRole(parsed.active);
          }
        }
      }
    } catch {
      // perfil por defecto
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setIsOwner(false);
      setRoleReady(true);
      return;
    }

    let cancelled = false;
    api
      .get<{ role?: string; isOnboarded?: boolean }>('/api/v1/auth/me')
      .then((me) => {
        if (!cancelled) {
          const isOwnerResult = me?.role === 'OWNER';
          console.log('[RoleProvider] OWNER check result:', { role: me?.role, isOwner: isOwnerResult });
          setIsOwner(isOwnerResult);
          // El backend es la fuente de verdad del rol base del usuario.
          const mapped = mapBackendRole(me?.role);
          if (mapped) setRole(mapped);
          setRoleReady(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('[RoleProvider] Failed to verify OWNER role:', error);
          // Si hay error 401/404 PERO hay sesión en Clerk → usuario nuevo/desincronizado
          // NO redirigir a /sign-in, dejar que OnboardingGate maneje la redirección a /onboarding
          if (error?.response?.status === 401 || error?.response?.status === 404) {
            if (!isSignedIn) {
              // Solo redirigir a sign-in si NO hay sesión en Clerk
              localStorage.removeItem('auth_token');
              if (typeof window !== 'undefined') {
                window.location.href = '/sign-in';
              }
            }
            // Si hay sesión en Clerk, NO redirigir - dejar que OnboardingGate maneje
          }
          setIsOwner(false);
          setRoleReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  // Anti-tamper: la vista `admin` solo es legítima para el OWNER verificado.
  useEffect(() => {
    if (role === 'admin' && !isOwner) {
      setRole('player');
    }
  }, [role, isOwner]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profiles, active: role }));
    } catch {
      // almacenamiento no disponible
    }
  }, [profiles, role]);

  useEffect(() => {
    try {
      localStorage.setItem(ECOSYSTEM_KEY, JSON.stringify(ecosystem));
    } catch {
      // almacenamiento no disponible
    }
  }, [ecosystem]);

  const acceptCoaching = useCallback((id: string) => {
    setEcosystem((prev) => {
      const req = prev.coachingRequests.find((r) => r.id === id);
      if (!req) return prev;
      const existing = prev.players.find((p) => p.name === req.name);
      const players = existing
        ? prev.players
        : [...prev.players, { id: `player-${Date.now()}`, name: req.name, isgScore: 1600, division: 'Plata' }];
      const studentId = existing ? existing.id : players[players.length - 1].id;
      const coachStudentIds = prev.coachStudentIds.includes(studentId)
        ? prev.coachStudentIds
        : [...prev.coachStudentIds, studentId];
      return {
        ...prev,
        coachingRequests: prev.coachingRequests.filter((r) => r.id !== id),
        players,
        coachStudentIds,
      };
    });
  }, []);

  const rejectCoaching = useCallback((id: string) => {
    setEcosystem((prev) => ({
      ...prev,
      coachingRequests: prev.coachingRequests.filter((r) => r.id !== id),
    }));
  }, []);

  const approveJoin = useCallback((id: string) => {
    setEcosystem((prev) => {
      const req = prev.joinRequests.find((r) => r.id === id);
      if (!req) return prev;
      return {
        ...prev,
        joinRequests: prev.joinRequests.filter((r) => r.id !== id),
        players: [
          ...prev.players,
          { id: `player-${Date.now()}`, name: req.name, isgScore: 1100, division: 'Bronce' },
        ],
      };
    });
  }, []);

  const rejectJoin = useCallback((id: string) => {
    setEcosystem((prev) => ({
      ...prev,
      joinRequests: prev.joinRequests.filter((r) => r.id !== id),
    }));
  }, []);

  const assignRoutine = useCallback((athleteId: string, routineTitle: string) => {
    setEcosystem((prev) => ({
      ...prev,
      routineAssignments: { ...prev.routineAssignments, [athleteId]: routineTitle },
    }));
  }, []);

  const recordSetIsg = useCallback((playerId: string, delta: number) => {
    if (!Number.isFinite(delta) || delta <= 0) return;
    setEcosystem((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.id !== playerId) return p;
        const isgScore = p.isgScore + delta;
        return { ...p, isgScore, division: divisionForScore(isgScore) };
      }),
    }));
  }, []);

  const value = useMemo<RoleContextValue>(() => {
    const playerProfile = profiles.player as PlayerProfile;
    const gymProfile = profiles.gym as GymProfile;
    const coachProfile = profiles.coach as CoachProfile;

    const player = ecosystem.players.find((p) => p.id === playerProfile.id);
    const division = player?.division ?? playerProfile.division.name;
    const divisionMinScore =
      division === 'Platino' ? 2000 : division === 'Oro' ? 1800 : division === 'Plata' ? 1500 : 1000;

    const derivedProfiles: Record<AppRole, AppProfile> = {
      player: player
        ? {
            ...playerProfile,
            isgScore: player.isgScore,
            division: { name: division as PlayerProfile['division']['name'], minScore: divisionMinScore },
          }
        : playerProfile,
      gym: {
        ...gymProfile,
        linkedPlayers: ecosystem.players.map((p) => ({
          id: p.id,
          name: p.name,
          isgScore: p.isgScore,
        })),
      },
      coach: {
        ...coachProfile,
        linkedStudents: ecosystem.players
          .filter((p) => ecosystem.coachStudentIds.includes(p.id))
          .map((p) => ({ id: p.id, name: p.name, isgScore: p.isgScore })),
      },
      admin: profiles.admin,
    };

    return {
      role,
      profile: derivedProfiles[role],
      isOwner,
      roleReady,
      switchRole: (next) => {
        if (next === 'admin' && !isOwner) return;
        setRole(next);
      },
      updatePlayerProfile: (patch) =>
        setProfiles((prev) => ({
          ...prev,
          player: { ...(prev.player as PlayerProfile), ...patch },
        })),
      players: ecosystem.players,
      joinRequests: ecosystem.joinRequests,
      coachingRequests: ecosystem.coachingRequests,
      routineAssignments: ecosystem.routineAssignments,
      acceptCoaching,
      rejectCoaching,
      approveJoin,
      rejectJoin,
      assignRoutine,
      recordSetIsg,
    };
  }, [
    role,
    profiles,
    isOwner,
    roleReady,
    ecosystem,
    acceptCoaching,
    rejectCoaching,
    approveJoin,
    rejectJoin,
    assignRoutine,
    recordSetIsg,
  ]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole debe usarse dentro de <RoleProvider>');
  return ctx;
}
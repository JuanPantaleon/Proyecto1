import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { MetricType, SetType } from '@ranked-fitness/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ACTIVE_VIEW_HEADER: Record<string, 'PLAYER' | 'COACH' | 'GYM' | 'ADMIN'> = {
  player: 'PLAYER',
  coach: 'COACH',
  gym: 'GYM',
  admin: 'ADMIN',
};

export function getActiveViewHeader(): 'PLAYER' | 'COACH' | 'GYM' | 'ADMIN' | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ranked_fitness_active_profile');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { active?: string };
    return ACTIVE_VIEW_HEADER[parsed.active ?? ''] ?? null;
  } catch {
    return null;
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          try {
            const clerk = (window as any).Clerk;
            if (clerk?.session) {
              const token = await clerk.session.getToken();
              if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch {
            // Sin token: la petición irá sin Authorization y el backend
            // responderá 401, que es manejado por los guards (OnboardingGate).
          }
          const activeView = getActiveViewHeader();
          if (activeView && config.headers) {
            config.headers['X-Active-View'] = activeView;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // NOTA: no redirigimos automáticamente a /sign-in aquí. Esa lógica
        // causaba un bucle infinito (dashboard <-> sign-in) cuando faltaba el
        // token, porque Clerk (sesión viva) rebotaba de vuelta a /dashboard.
        // Los guards del cliente (OnboardingGate / DashboardDispatcher) ya
        // derivan a /onboarding o /sign-in según corresponda.
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>) {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown) {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown) {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string) {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    localStorage.removeItem('auth_token');
  }
}

export const api = new ApiClient();

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string;
  level: string;
  metricType: MetricType;
  massValue: number | null;
  demandValue: number | null;
  complexityValue: number | null;
  impactValue: number | null;
  exerciseFactor: number | string;
  isCustom: boolean;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultWeight: number | string | null;
  defaultSec: number | null;
  createdById: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomExerciseInput {
  name: string;
  description?: string;
  metricType: MetricType;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  defaultSec?: number;
  exerciseFactor?: number;
}

export interface ExerciseFilters {
  muscleGroup?: string;
  level?: string;
  search?: string;
}

export interface Session {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  estimatedCalories: number;
  timerState: 'RUNNING' | 'PAUSED' | 'STOPPED';
  timerStartedAt: string | null;
  timerPausedAt: string | null;
  accumulatedTime: number;
  createdAt: string;
  sets?: Set[];
}

export interface Set {
  id: string;
  sessionId: string;
  exerciseId: string;
  userId: string;
  weightKg: number | string | null;
  reps: number | null;
  durationSec: number | null;
  setType: SetType;
  variantBonus: number;
  penalty: number;
  isRecordPr: boolean;
  isgScore: number | string;
  createdAt: string;
  exercise?: Exercise;
}

export interface CreateSetDto {
  sessionId: string;
  exerciseId: string;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  setType?: SetType;
  variantBonus?: number;
  penalty?: number;
}

export interface RestTimer {
  id: string;
  sessionId: string;
  setId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  createdAt: string;
}

export interface TimerState {
  state: 'RUNNING' | 'PAUSED' | 'STOPPED';
  elapsedSeconds: number;
  accumulatedSeconds: number;
  formatted: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  currentWeightKg: number;
  heightCm: number;
  streakDays: number;
  role: 'USER' | 'TRAINER' | 'GYM_ADMIN' | 'SUPER_ADMIN' | 'OWNER';
  isOnboarded: boolean;
  gymId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
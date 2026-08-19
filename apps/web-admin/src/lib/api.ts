import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/sign-in';
          }
        }
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
  muscleGroup: string;
  level: string;
  massValue: number;
  demandValue: number;
  complexityValue: number;
  impactValue: number;
  exerciseFactor: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  weightKg: number;
  reps: number;
  variantBonus: number;
  penalty: number;
  isRecordPr: boolean;
  isgScore: number;
  createdAt: string;
  exercise?: Exercise;
}

export interface CreateSetDto {
  sessionId: string;
  exerciseId: string;
  weightKg: number;
  reps: number;
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
  role: 'USER' | 'TRAINER' | 'GYM_ADMIN' | 'SUPER_ADMIN';
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
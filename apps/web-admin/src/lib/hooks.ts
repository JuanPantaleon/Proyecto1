'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ISGResult } from '@ranked-fitness/shared';
import { api, type Exercise, type ExerciseFilters, type Session, type Set, type CreateSetDto, type RestTimer, type TimerState, type User, type CreateCustomExerciseInput } from './api';

export function useExercises(filters?: ExerciseFilters, enabled = true) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => api.get<Exercise[]>('/api/v1/catalogo/ejercicios', filters as Record<string, unknown>),
    enabled,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => api.get<Exercise>(`/api/v1/catalogo/ejercicios/${id}`),
    enabled: !!id,
  });
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: ['muscleGroups'],
    queryFn: () => api.get<{ muscleGroup: string }[]>('/api/v1/catalogo/grupos-musculares'),
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Exercise>) => api.post<Exercise>('/api/v1/catalogo/ejercicios', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useCustomExercises(enabled = true) {
  return useQuery({
    queryKey: ['customExercises'],
    queryFn: () => api.get<Exercise[]>('/api/v1/exercises'),
    enabled,
  });
}

export function useCreateCustomExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomExerciseInput) => api.post<Exercise>('/api/v1/exercises', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customExercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exercise> }) =>
      api.put<Exercise>(`/api/v1/catalogo/ejercicios/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/catalogo/ejercicios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useSessions(userId?: string, limit = 20, offset = 0, enabled = true) {
  return useQuery({
    queryKey: ['sessions', userId, limit, offset],
    queryFn: () => api.get<Session[]>(`/api/v1/entrenamiento/mis-sesiones`, { limit, offset }),
    enabled: !!userId && enabled,
  });
}

export function useSession(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => api.get<Session>(`/api/v1/entrenamiento/sesion/${id}`),
    enabled: options?.enabled ?? !!id,
  });
}

export function useStartSession() {
  return useMutation({
    mutationFn: () => api.post<Session>('/api/v1/entrenamiento/sesion', {}),
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<Session>(`/api/v1/entrenamiento/sesion/${id}/finalizar`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCreateSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSetDto) =>
      api.post<{ set: Set; isgResult: ISGResult }>('/api/v1/entrenamiento/set', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useTimerState(sessionId: string) {
  return useQuery({
    queryKey: ['timer', sessionId],
    queryFn: () => api.get<TimerState>(`/api/v1/entrenamiento/sesion/${sessionId}/timer`),
    enabled: !!sessionId,
    refetchInterval: 1000,
  });
}

export function useStartTimer() {
  return useMutation({
    mutationFn: (sessionId: string) => api.post(`/api/v1/entrenamiento/sesion/${sessionId}/timer/iniciar`, {}),
  });
}

export function usePauseTimer() {
  return useMutation({
    mutationFn: (sessionId: string) => api.put(`/api/v1/entrenamiento/sesion/${sessionId}/timer/pausar`, {}),
  });
}

export function useResumeTimer() {
  return useMutation({
    mutationFn: (sessionId: string) => api.put(`/api/v1/entrenamiento/sesion/${sessionId}/timer/reanudar`, {}),
  });
}

export function useStopTimer() {
  return useMutation({
    mutationFn: (sessionId: string) => api.put(`/api/v1/entrenamiento/sesion/${sessionId}/timer/detener`, {}),
  });
}

export function useRestTimers(sessionId: string) {
  return useQuery({
    queryKey: ['restTimers', sessionId],
    queryFn: () => api.get<RestTimer[]>(`/api/v1/entrenamiento/sesion/${sessionId}/descansos`),
    enabled: !!sessionId,
  });
}

export function useStartRestTimer() {
  return useMutation({
    mutationFn: ({ sessionId, setId }: { sessionId: string; setId?: string }) =>
      api.post(`/api/v1/entrenamiento/sesion/${sessionId}/descanso/iniciar`, { setId }),
  });
}

export function useEndRestTimer() {
  return useMutation({
    mutationFn: (sessionId: string) => api.put(`/api/v1/entrenamiento/sesion/${sessionId}/descanso/finalizar`, {}),
  });
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.get<User>('/api/v1/auth/me'),
    enabled,
  });
}
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function formatISG(score: number): string {
  return score.toFixed(1);
}

export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    PECHO: 'Pecho',
    ESPALDA: 'Espalda',
    PIERNAS: 'Piernas',
    HOMBROS: 'Hombros',
    BRAZOS: 'Brazos',
    CORE: 'Core',
    CARDIO: 'Cardio',
    OTROS: 'Otros',
  };
  return labels[group] || group;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    PRINCIPIANTE: 'Principiante',
    INTERMEDIO: 'Intermedio',
    AVANZADO: 'Avanzado',
  };
  return labels[level] || level;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    USER: 'Usuario',
    TRAINER: 'Entrenador',
    GYM_ADMIN: 'Admin Gimnasio',
    SUPER_ADMIN: 'Super Admin',
  };
  return labels[role] || role;
}

export function getRoleColor(role: string): 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'accent' | 'accentSolid' | 'primarySolid' {
  const colors: Record<string, 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'accent' | 'accentSolid' | 'primarySolid'> = {
    USER: 'default',
    TRAINER: 'primary',
    GYM_ADMIN: 'accent',
    SUPER_ADMIN: 'destructive',
  };
  return colors[role] || 'default';
}
export const ISG_CONSTANTS = {
  HEIGHT_FACTOR_BASE: 1.0,
  HEIGHT_FACTOR_PER_CM: 0.002,
  MIN_WEIGHT_KG: 0.5,
  MAX_WEIGHT_KG: 500,
  MIN_REPS: 1,
  MAX_REPS: 100,
  MIN_DURATION_SEC: 1,
  MAX_DURATION_SEC: 3600,
  PHYSIOLOGICAL_LIMIT_MULTIPLIER: 2.5,
  ISOMETRIC_BODY_LOAD_RATIO: 0.5,
  CALISTHENIC_BODY_LOAD_RATIO: 1.0,
  FAILURE_MULTIPLIER: 1.05,
} as const;

export const MUSCLE_GROUPS = [
  'PECHO',
  'ESPALDA',
  'PIERNAS',
  'HOMBROS',
  'BRAZOS',
  'CORE',
  'CARDIO',
  'OTROS',
] as const;

export const EXERCISE_LEVELS = [
  'PRINCIPIANTE',
  'INTERMEDIO',
  'AVANZADO',
] as const;

export const METRIC_TYPES = [
  'REPS_WEIGHT',
  'TIME_ONLY',
  'REPS_ONLY',
  'TO_FAILURE',
] as const;

export const SET_TYPES = [
  'NORMAL',
  'FAILURE',
  'WARMUP',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];
export type ExerciseLevel = typeof EXERCISE_LEVELS[number];
export type MetricType = typeof METRIC_TYPES[number];
export type SetType = typeof SET_TYPES[number];
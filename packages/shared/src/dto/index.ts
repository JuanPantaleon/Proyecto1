import { z } from 'zod';
import { MUSCLE_GROUPS, EXERCISE_LEVELS, METRIC_TYPES, SET_TYPES } from '../isg/isg-constants';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  currentWeightKg: z.number().positive().max(500),
  heightCm: z.number().int().positive().max(300),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const exerciseBaseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  level: z.enum(EXERCISE_LEVELS),
  metricType: z.enum(METRIC_TYPES),
  massValue: z.number().int().min(1).max(10),
  demandValue: z.number().int().min(1).max(10),
  complexityValue: z.number().int().min(1).max(10),
  impactValue: z.number().int().min(1).max(10),
});

export const createExerciseSchema = exerciseBaseSchema.extend({
  level: z.enum(EXERCISE_LEVELS).default('PRINCIPIANTE'),
  metricType: z.enum(METRIC_TYPES).default('REPS_WEIGHT'),
});

export const updateExerciseSchema = exerciseBaseSchema.partial();

export const startSessionSchema = z.object({
  userId: z.string().uuid(),
});

export const createSetSchema = z
  .object({
    sessionId: z.string().uuid(),
    exerciseId: z.string().uuid(),
    weightKg: z.number().positive().max(500).optional(),
    reps: z.number().int().positive().max(100).optional(),
    durationSec: z.number().int().positive().max(3600).optional(),
    setType: z.enum(SET_TYPES).default('NORMAL'),
    variantBonus: z.number().positive().default(1.0),
    penalty: z.number().positive().default(1.0),
  })
  .superRefine((data, ctx) => {
    const hasMeasure = data.reps !== undefined || data.durationSec !== undefined;
    if (!hasMeasure) {
      ctx.addIssue({
        code: 'custom',
        path: ['reps'],
        message: 'Debe indicarse reps o durationSec según la métrica del ejercicio',
      });
    }
    if (data.weightKg !== undefined && data.reps === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['weightKg'],
        message: 'weightKg requiere reps definidas',
      });
    }
  });

export const updateUserSchema = z.object({
  currentWeightKg: z.number().positive().max(500).optional(),
  heightCm: z.number().int().positive().max(300).optional(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type CreateExerciseDto = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseDto = z.infer<typeof updateExerciseSchema>;
export type StartSessionDto = z.infer<typeof startSessionSchema>;
export type CreateSetDto = z.infer<typeof createSetSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
import { createExerciseSchema, createSetSchema } from './index';

describe('createExerciseSchema', () => {
  it('defaults metricType a REPS_WEIGHT', () => {
    const result = createExerciseSchema.safeParse({
      name: 'Press Banca',
      muscleGroup: 'PECHO',
      massValue: 9,
      demandValue: 8,
      complexityValue: 7,
      impactValue: 8,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metricType).toBe('REPS_WEIGHT');
      expect(result.data.level).toBe('PRINCIPIANTE');
    }
  });

  it('acepta metricType TIME_ONLY y REPS_ONLY', () => {
    const time = createExerciseSchema.safeParse({
      name: 'Plancha',
      muscleGroup: 'CORE',
      metricType: 'TIME_ONLY',
      massValue: 5,
      demandValue: 6,
      complexityValue: 4,
      impactValue: 4,
    });
    const repsOnly = createExerciseSchema.safeParse({
      name: 'Dominadas',
      muscleGroup: 'ESPALDA',
      metricType: 'REPS_ONLY',
      massValue: 9,
      demandValue: 9,
      complexityValue: 8,
      impactValue: 8,
    });

    expect(time.success && time.data.metricType).toBe('TIME_ONLY');
    expect(repsOnly.success && repsOnly.data.metricType).toBe('REPS_ONLY');
  });

  it('rechaza metricType inválido', () => {
    const result = createExerciseSchema.safeParse({
      name: 'X',
      muscleGroup: 'PECHO',
      metricType: 'WEIGHT_TIME',
      massValue: 5,
      demandValue: 5,
      complexityValue: 5,
      impactValue: 5,
    });

    expect(result.success).toBe(false);
  });
});

describe('createSetSchema', () => {
  it('acepta una serie de fuerza con peso y reps', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      weightKg: 100,
      reps: 8,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.setType).toBe('NORMAL');
      expect(result.data.variantBonus).toBe(1.0);
    }
  });

  it('acepta una serie isométrica solo con durationSec', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      durationSec: 60,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationSec).toBe(60);
      expect(result.data.weightKg).toBeUndefined();
    }
  });

  it('acepta una serie de calistenia solo con reps', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      reps: 20,
    });

    expect(result.success).toBe(true);
  });

  it('acepta la modalidad al fallo', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      weightKg: 100,
      reps: 10,
      setType: 'FAILURE',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.setType).toBe('FAILURE');
    }
  });

  it('rechaza una serie sin reps ni durationSec', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      weightKg: 100,
    });

    expect(result.success).toBe(false);
  });

  it('rechaza weightKg sin reps', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      weightKg: 100,
      durationSec: 30,
    });

    expect(result.success).toBe(false);
  });

  it('rechaza setType inválido', () => {
    const result = createSetSchema.safeParse({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      exerciseId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      reps: 10,
      setType: 'AMRAP',
    });

    expect(result.success).toBe(false);
  });
});
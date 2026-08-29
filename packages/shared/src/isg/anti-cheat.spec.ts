import {
  estimateOneRepMax,
  validateLift,
  validateLiftRatio,
  resolveLiftKind,
  BLOCKED_RATIO_MESSAGE,
  LIFT_ANTI_CHEAT,
} from './anti-cheat';

describe('estimateOneRepMax', () => {
  it('calcula el 1RM estimado con la fórmula de Epley', () => {
    expect(estimateOneRepMax(100, 5)).toBeCloseTo(116.67, 2);
    expect(estimateOneRepMax(150, 1)).toBeCloseTo(155, 2);
    expect(estimateOneRepMax(100, 0)).toBe(100);
  });
});

describe('validateLiftRatio', () => {
  it('devuelve ok cuando el ratio está por debajo del umbral de alerta', () => {
    const result = validateLiftRatio({ liftKind: 'bench_press', estimated1RMKg: 200, bodyWeightKg: 100 });
    expect(result).toEqual({ status: 'ok' });
  });

  it('devuelve requires_video cuando supera el umbral de alerta pero no el máximo', () => {
    const result = validateLiftRatio({ liftKind: 'squat', estimated1RMKg: 300, bodyWeightKg: 100 });
    expect(result.status).toBe('requires_video');
    if (result.status === 'requires_video') {
      expect(result.ratio).toBe(3.0);
      expect(result.alertRatio).toBe(LIFT_ANTI_CHEAT.squat.alertRatio);
    }
  });

  it('bloquea cuando el ratio excede el máximo absoluto', () => {
    const result = validateLiftRatio({ liftKind: 'deadlift', estimated1RMKg: 420, bodyWeightKg: 100 });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') {
      expect(result.message).toBe(BLOCKED_RATIO_MESSAGE);
      expect(result.ratio).toBe(4.2);
    }
  });

  it('usa los coeficientes máximos por ejercicio', () => {
    expect(LIFT_ANTI_CHEAT.bench_press).toEqual({ maxAbsoluteRatio: 2.7, alertRatio: 2.2 });
    expect(LIFT_ANTI_CHEAT.squat).toEqual({ maxAbsoluteRatio: 3.5, alertRatio: 2.8 });
    expect(LIFT_ANTI_CHEAT.deadlift).toEqual({ maxAbsoluteRatio: 4.0, alertRatio: 3.2 });
  });

  it('no valida ejercicios sin tipo conocido', () => {
    const result = validateLiftRatio({ liftKind: 'other', estimated1RMKg: 500, bodyWeightKg: 50 });
    expect(result).toEqual({ status: 'ok' });
  });

  it('lanza error con peso corporal inválido', () => {
    expect(() => validateLiftRatio({ liftKind: 'squat', estimated1RMKg: 100, bodyWeightKg: 0 })).toThrow(
      'Peso corporal requerido'
    );
  });
});

describe('validateLift', () => {
  it('estima el 1RM y valida en un solo paso', () => {
    expect(validateLift({ liftKind: 'bench_press', weightKg: 200, reps: 5, bodyWeightKg: 80 }).status).toBe(
      'blocked'
    );
    expect(validateLift({ liftKind: 'bench_press', weightKg: 170, reps: 5, bodyWeightKg: 80 }).status).toBe(
      'requires_video'
    );
    expect(validateLift({ liftKind: 'bench_press', weightKg: 150, reps: 5, bodyWeightKg: 80 }).status).toBe('ok');
  });
});

describe('resolveLiftKind', () => {
  it('detecta los levantamientos por nombre', () => {
    expect(resolveLiftKind('Press de Banca')).toBe('bench_press');
    expect(resolveLiftKind('Press Banca Plana')).toBe('bench_press');
    expect(resolveLiftKind('Sentadilla Libre')).toBe('squat');
    expect(resolveLiftKind('Back Squat')).toBe('squat');
    expect(resolveLiftKind('Peso Muerto')).toBe('deadlift');
    expect(resolveLiftKind('Deadlift')).toBe('deadlift');
  });

  it('devuelve other para ejercicios no clasificados', () => {
    expect(resolveLiftKind('Dominadas')).toBe('other');
    expect(resolveLiftKind('Press Militar')).toBe('other');
  });
});
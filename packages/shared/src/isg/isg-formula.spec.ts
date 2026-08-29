import { calculateISG, calculateExerciseFactor } from './isg-formula';
import { ISG_CONSTANTS, METRIC_TYPES, SET_TYPES } from './isg-constants';

describe('calculateISG - REPS_WEIGHT', () => {
  it('calcula el puntaje de fuerza convencional (peso x repeticiones)', () => {
    const result = calculateISG({
      metricType: 'REPS_WEIGHT',
      weightKg: 100,
      reps: 8,
      exerciseFactor: 8.0,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'NORMAL',
    });

    // heightFactor = 1 + (175-170)*0.002 = 1.01
    // ratio = 100*8*8/80 = 80 -> raw = 80.8
    expect(result.heightFactor).toBeCloseTo(1.01, 10);
    expect(result.ratioFuerza).toBeCloseTo(80, 10);
    expect(result.rawScore).toBeCloseTo(80.8, 10);
    expect(result.finalScore).toBe(80.8);
    expect(result.intensityMultiplier).toBe(1);
    expect(result.isPhysiologicalLimitExceeded).toBe(false);
  });

  it('marca límite fisiológico superado con cargas extremas', () => {
    const result = calculateISG({
      metricType: 'REPS_WEIGHT',
      weightKg: 200,
      reps: 100,
      exerciseFactor: 10,
      bodyWeightKg: 60,
      heightCm: 170,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'NORMAL',
    });

    expect(result.isPhysiologicalLimitExceeded).toBe(true);
    expect(result.finalScore).toBeGreaterThan(result.physiologicalLimit);
  });

  it('lanza error con peso inválido', () => {
    expect(() =>
      calculateISG({
        metricType: 'REPS_WEIGHT',
        weightKg: 0.1,
        reps: 8,
        exerciseFactor: 8.0,
        bodyWeightKg: 80,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
      })
    ).toThrow('Peso inválido');
  });

  it('lanza error con repeticiones inválidas', () => {
    expect(() =>
      calculateISG({
        metricType: 'REPS_WEIGHT',
        weightKg: 100,
        reps: 200,
        exerciseFactor: 8.0,
        bodyWeightKg: 80,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
      })
    ).toThrow('Repeticiones inválidas');
  });
});

describe('calculateISG - TIME_ONLY (isométricos)', () => {
  it('calcula el puntaje isométrico a partir de la duración y el peso corporal', () => {
    const result = calculateISG({
      metricType: 'TIME_ONLY',
      durationSec: 60,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'NORMAL',
    });

    // load isométrico = 80 * 0.5 = 40 kg
    // ratio = 40*60*4.75/80 = 142.5 -> raw = 142.5*1.01 = 143.925
    expect(result.ratioFuerza).toBeCloseTo(142.5, 10);
    expect(result.rawScore).toBeCloseTo(143.925, 10);
    expect(result.finalScore).toBe(143.93);
    expect(result.isPhysiologicalLimitExceeded).toBe(false);
  });

  it('más duración implica mayor puntaje isométrico', () => {
    const short = calculateISG({
      metricType: 'TIME_ONLY',
      durationSec: 30,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
    });
    const long = calculateISG({
      metricType: 'TIME_ONLY',
      durationSec: 120,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
    });

    expect(long.ratioFuerza).toBeCloseTo(short.ratioFuerza * 4, 10);
    expect(long.finalScore).toBeGreaterThan(short.finalScore);
  });

  it('lanza error con duración inválida', () => {
    expect(() =>
      calculateISG({
        metricType: 'TIME_ONLY',
        durationSec: 0,
        exerciseFactor: 4.75,
        bodyWeightKg: 80,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
      })
    ).toThrow('Duración inválida');
  });

  it('lanza error sin peso corporal', () => {
    expect(() =>
      calculateISG({
        metricType: 'TIME_ONLY',
        durationSec: 60,
        exerciseFactor: 4.75,
        bodyWeightKg: 0,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
      })
    ).toThrow('Peso corporal requerido');
  });
});

describe('calculateISG - REPS_ONLY (calistenia)', () => {
  it('calcula el puntaje de calistenia a partir de repeticiones con carga corporal', () => {
    const result = calculateISG({
      metricType: 'REPS_ONLY',
      reps: 20,
      exerciseFactor: 5.5,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'NORMAL',
    });

    // ratio = (80*1.0)*20*5.5/80 = 110 -> raw = 110*1.01 = 111.1
    expect(result.ratioFuerza).toBeCloseTo(110, 10);
    expect(result.finalScore).toBe(111.1);
  });

  it('lanza error con repeticiones inválidas', () => {
    expect(() =>
      calculateISG({
        metricType: 'REPS_ONLY',
        reps: 0,
        exerciseFactor: 5.5,
        bodyWeightKg: 80,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
      })
    ).toThrow('Repeticiones inválidas');
  });
});

describe('calculateISG - series al fallo (FAILURE)', () => {
  it('aplica multiplicador 1.05x a series NORMAL en REPS_WEIGHT', () => {
    const base = calculateISG({
      metricType: 'REPS_WEIGHT',
      weightKg: 100,
      reps: 8,
      exerciseFactor: 8.0,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'NORMAL',
    });
    const failure = calculateISG({
      metricType: 'REPS_WEIGHT',
      weightKg: 100,
      reps: 8,
      exerciseFactor: 8.0,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });

    expect(failure.intensityMultiplier).toBe(ISG_CONSTANTS.FAILURE_MULTIPLIER);
    expect(failure.finalScore).toBeCloseTo(base.finalScore * ISG_CONSTANTS.FAILURE_MULTIPLIER, 2);
  });

  it('aplica el multiplicador al fallo en series isométricas', () => {
    const normal = calculateISG({
      metricType: 'TIME_ONLY',
      durationSec: 60,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'NORMAL',
    });
    const failure = calculateISG({
      metricType: 'TIME_ONLY',
      durationSec: 60,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });

    expect(failure.finalScore).toBeCloseTo(normal.finalScore * 1.05, 1);
    expect(failure.finalScore).toBe(151.12);
  });

  it('no aplica multiplicador a series WARMUP', () => {
    const warmup = calculateISG({
      metricType: 'REPS_ONLY',
      reps: 10,
      exerciseFactor: 5.5,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'WARMUP',
    });

    expect(warmup.intensityMultiplier).toBe(1);
  });
});

describe('calculateISG - métrica TO_FAILURE (registro flexible)', () => {
  it('calcula por reps (modo calisténico) cuando se informan reps', () => {
    const repsFailure = calculateISG({
      metricType: 'TO_FAILURE',
      reps: 12,
      exerciseFactor: 5.5,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });
    const calisthenic = calculateISG({
      metricType: 'REPS_ONLY',
      reps: 12,
      exerciseFactor: 5.5,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });

    expect(repsFailure.finalScore).toBe(calisthenic.finalScore);
  });

  it('calcula por segundos (modo isométrico) cuando se informa duración', () => {
    const timeFailure = calculateISG({
      metricType: 'TO_FAILURE',
      durationSec: 45,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });
    const isometric = calculateISG({
      metricType: 'TIME_ONLY',
      durationSec: 45,
      exerciseFactor: 4.75,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });

    expect(timeFailure.finalScore).toBe(isometric.finalScore);
  });

  it('prioriza reps cuando se informan ambas medidas', () => {
    const both = calculateISG({
      metricType: 'TO_FAILURE',
      reps: 10,
      durationSec: 45,
      exerciseFactor: 5.5,
      bodyWeightKg: 80,
      heightCm: 175,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: 'FAILURE',
    });
    expect(both.finalScore).toBe(
      calculateISG({
        metricType: 'REPS_ONLY',
        reps: 10,
        exerciseFactor: 5.5,
        bodyWeightKg: 80,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
        setType: 'FAILURE',
      }).finalScore
    );
  });

  it('rechaza series al fallo sin reps ni duración', () => {
    expect(() =>
      calculateISG({
        metricType: 'TO_FAILURE',
        exerciseFactor: 5.5,
        bodyWeightKg: 80,
        heightCm: 175,
        variantBonus: 1.0,
        penalty: 1.0,
        setType: 'FAILURE',
      })
    ).toThrow('Se requiere reps o durationSec');
  });
});

describe('calculateExerciseFactor', () => {
  it('promedia masa, demanda, complejidad e impacto', () => {
    expect(calculateExerciseFactor(9, 8, 7, 8)).toBe(8);
    expect(calculateExerciseFactor(5, 6, 4, 4)).toBe(4.75);
  });
});

describe('enums de métricas y tipos de serie', () => {
  it('expone las métricas de ejercicio soportadas', () => {
    expect(METRIC_TYPES).toEqual([
      'REPS_WEIGHT',
      'TIME_ONLY',
      'REPS_ONLY',
      'TO_FAILURE',
    ]);
  });

  it('expone los tipos de serie soportados', () => {
    expect(SET_TYPES).toEqual(['NORMAL', 'FAILURE', 'WARMUP']);
  });

  it('expone la constante del multiplicador al fallo', () => {
    expect(ISG_CONSTANTS.FAILURE_MULTIPLIER).toBe(1.05);
  });
});

export type LiftKind = 'bench_press' | 'squat' | 'deadlift' | 'other';

export interface LiftRatioThresholds {
  maxAbsoluteRatio: number;
  alertRatio: number;
}

export const LIFT_ANTI_CHEAT: Record<Exclude<LiftKind, 'other'>, LiftRatioThresholds> = {
  bench_press: {
    maxAbsoluteRatio: 2.7,
    alertRatio: 2.2,
  },
  squat: {
    maxAbsoluteRatio: 3.5,
    alertRatio: 2.8,
  },
  deadlift: {
    maxAbsoluteRatio: 4.0,
    alertRatio: 3.2,
  },
};

export const BLOCKED_RATIO_MESSAGE =
  'Imposible fisiológicamente. El ratio excede los límites mundiales naturales verificados.';

export const REQUIRES_VIDEO_LABEL = 'Requiere Video';

export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps < 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export type LiftValidationResult =
  | { status: 'ok' }
  | {
      status: 'requires_video';
      liftKind: Exclude<LiftKind, 'other'>;
      ratio: number;
      alertRatio: number;
      maxAbsoluteRatio: number;
    }
  | {
      status: 'blocked';
      liftKind: Exclude<LiftKind, 'other'>;
      ratio: number;
      maxAbsoluteRatio: number;
      message: string;
    };

export function validateLiftRatio(input: {
  liftKind: LiftKind;
  estimated1RMKg: number;
  bodyWeightKg: number;
}): LiftValidationResult {
  const { liftKind, estimated1RMKg, bodyWeightKg } = input;

  if (bodyWeightKg <= 0) throw new Error('Peso corporal requerido');
  if (estimated1RMKg < 0) throw new Error('Carga inválida');

  if (liftKind === 'other') return { status: 'ok' };

  const ratio = estimated1RMKg / bodyWeightKg;
  const thresholds = LIFT_ANTI_CHEAT[liftKind];

  if (ratio > thresholds.maxAbsoluteRatio) {
    return {
      status: 'blocked',
      liftKind,
      ratio,
      maxAbsoluteRatio: thresholds.maxAbsoluteRatio,
      message: BLOCKED_RATIO_MESSAGE,
    };
  }

  if (ratio > thresholds.alertRatio) {
    return {
      status: 'requires_video',
      liftKind,
      ratio,
      alertRatio: thresholds.alertRatio,
      maxAbsoluteRatio: thresholds.maxAbsoluteRatio,
    };
  }

  return { status: 'ok' };
}

export function validateLift(input: {
  liftKind: LiftKind;
  weightKg: number;
  reps: number;
  bodyWeightKg: number;
}): LiftValidationResult {
  return validateLiftRatio({
    liftKind: input.liftKind,
    estimated1RMKg: estimateOneRepMax(input.weightKg, input.reps),
    bodyWeightKg: input.bodyWeightKg,
  });
}

const LIFT_NAME_PATTERNS: Record<Exclude<LiftKind, 'other'>, RegExp> = {
  bench_press: /press\s*(de\s*)?banca|press\s*banca|bench\s*press|benchpress|press\s*plano/i,
  squat: /sentadilla|squat|back\s*squat/i,
  deadlift: /peso\s*mue(to|rto)|deadlift|despegue/i,
};

const LIFT_KIND_ORDER: Exclude<LiftKind, 'other'>[] = ['bench_press', 'squat', 'deadlift'];

export function resolveLiftKind(exerciseName: string): LiftKind {
  const name = exerciseName.trim();
  for (const kind of LIFT_KIND_ORDER) {
    if (LIFT_NAME_PATTERNS[kind].test(name)) return kind;
  }
  return 'other';
}
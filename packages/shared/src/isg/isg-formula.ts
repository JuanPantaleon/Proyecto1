import { Decimal } from 'decimal.js';
import { ISG_CONSTANTS, SetType } from './isg-constants';

export interface ISGBaseInput {
  exerciseFactor: number;
  bodyWeightKg: number;
  heightCm: number;
  variantBonus: number;
  penalty: number;
  setType?: SetType;
}

export interface ISGRepsWeightInput extends ISGBaseInput {
  metricType: 'REPS_WEIGHT';
  weightKg: number;
  reps: number;
}

export interface ISGTimeOnlyInput extends ISGBaseInput {
  metricType: 'TIME_ONLY';
  durationSec: number;
}

export interface ISGRepsOnlyInput extends ISGBaseInput {
  metricType: 'REPS_ONLY';
  reps: number;
}

export interface ISGToFailureInput extends ISGBaseInput {
  metricType: 'TO_FAILURE';
  reps?: number;
  durationSec?: number;
}

export type ISGInput =
  | ISGRepsWeightInput
  | ISGTimeOnlyInput
  | ISGRepsOnlyInput
  | ISGToFailureInput;

export interface ISGResult {
  rawScore: number;
  finalScore: number;
  ratioFuerza: number;
  heightFactor: number;
  isPhysiologicalLimitExceeded: boolean;
  physiologicalLimit: number;
  intensityMultiplier: number;
}

function validateWeight(weightKg: number) {
  if (weightKg < ISG_CONSTANTS.MIN_WEIGHT_KG || weightKg > ISG_CONSTANTS.MAX_WEIGHT_KG) {
    throw new Error(`Peso inválido: ${weightKg}kg`);
  }
}

function validateReps(reps: number) {
  if (reps < ISG_CONSTANTS.MIN_REPS || reps > ISG_CONSTANTS.MAX_REPS) {
    throw new Error(`Repeticiones inválidas: ${reps}`);
  }
}

function validateDurationSec(durationSec: number) {
  if (
    durationSec < ISG_CONSTANTS.MIN_DURATION_SEC ||
    durationSec > ISG_CONSTANTS.MAX_DURATION_SEC
  ) {
    throw new Error(`Duración inválida: ${durationSec}s`);
  }
}

export function calculateISG(input: ISGInput): ISGResult {
  const { exerciseFactor, bodyWeightKg, heightCm, variantBonus, penalty, setType } = input;

  if (bodyWeightKg <= 0) throw new Error('Peso corporal requerido');

  const heightFactor = new Decimal(ISG_CONSTANTS.HEIGHT_FACTOR_BASE)
    .plus(new Decimal(heightCm).minus(170).times(ISG_CONSTANTS.HEIGHT_FACTOR_PER_CM));

  let ratioFuerza: Decimal;

  switch (input.metricType) {
    case 'REPS_WEIGHT': {
      const { weightKg, reps } = input;
      validateWeight(weightKg);
      validateReps(reps);
      ratioFuerza = new Decimal(weightKg)
        .times(reps)
        .times(exerciseFactor)
        .dividedBy(bodyWeightKg);
      break;
    }
    case 'TIME_ONLY': {
      const { durationSec } = input;
      validateDurationSec(durationSec);
      const isometricLoadKg = new Decimal(bodyWeightKg).times(
        ISG_CONSTANTS.ISOMETRIC_BODY_LOAD_RATIO
      );
      ratioFuerza = isometricLoadKg
        .times(durationSec)
        .times(exerciseFactor)
        .dividedBy(bodyWeightKg);
      break;
    }
    case 'REPS_ONLY': {
      const { reps } = input;
      validateReps(reps);
      const calisthenicLoadKg = new Decimal(bodyWeightKg).times(
        ISG_CONSTANTS.CALISTHENIC_BODY_LOAD_RATIO
      );
      ratioFuerza = calisthenicLoadKg
        .times(reps)
        .times(exerciseFactor)
        .dividedBy(bodyWeightKg);
      break;
    }
    case 'TO_FAILURE': {
      const { reps, durationSec } = input;
      const hasDuration = (durationSec ?? 0) > 0;
      const hasReps = (reps ?? 0) > 0;
      if (!hasDuration && !hasReps) {
        throw new Error('Se requiere reps o durationSec para series al fallo');
      }
      if (hasDuration && !hasReps) {
        validateDurationSec(durationSec!);
        const isometricLoadKg = new Decimal(bodyWeightKg).times(
          ISG_CONSTANTS.ISOMETRIC_BODY_LOAD_RATIO
        );
        ratioFuerza = isometricLoadKg
          .times(durationSec!)
          .times(exerciseFactor)
          .dividedBy(bodyWeightKg);
      } else {
        validateReps(reps!);
        const calisthenicLoadKg = new Decimal(bodyWeightKg).times(
          ISG_CONSTANTS.CALISTHENIC_BODY_LOAD_RATIO
        );
        ratioFuerza = calisthenicLoadKg
          .times(reps!)
          .times(exerciseFactor)
          .dividedBy(bodyWeightKg);
      }
      break;
    }
  }

  const rawScore = ratioFuerza.times(heightFactor);

  const intensityMultiplier =
    setType === 'FAILURE' ? ISG_CONSTANTS.FAILURE_MULTIPLIER : 1;

  const adjustedScore = rawScore.times(variantBonus).times(penalty).times(intensityMultiplier);

  const physiologicalLimit = new Decimal(bodyWeightKg)
    .times(ISG_CONSTANTS.PHYSIOLOGICAL_LIMIT_MULTIPLIER)
    .times(heightFactor);

  const isPhysiologicalLimitExceeded = adjustedScore.greaterThan(physiologicalLimit);
  const finalScore = adjustedScore.toDecimalPlaces(2).toNumber();

  return {
    rawScore: rawScore.toNumber(),
    finalScore,
    ratioFuerza: ratioFuerza.toNumber(),
    heightFactor: heightFactor.toNumber(),
    isPhysiologicalLimitExceeded,
    physiologicalLimit: physiologicalLimit.toNumber(),
    intensityMultiplier,
  };
}

export function calculateExerciseFactor(m: number, d: number, c: number, i: number): number {
  return (m + d + c + i) / 4;
}
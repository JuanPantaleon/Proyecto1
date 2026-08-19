import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  calculateISG,
  ISGInput,
  MetricType,
  SetType,
  resolveLiftKind,
  validateLiftRatio,
  estimateOneRepMax,
  LiftValidationResult,
} from '@ranked-fitness/shared';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.session.create({
      data: {
        userId,
        startedAt: new Date(),
        timerState: 'STOPPED',
        accumulatedTime: 0,
      },
    });
  }

  async startTimer(sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.timerState === 'RUNNING') throw new BadRequestException('El timer ya está en marcha');

    const now = new Date();
    const updateData: any = {
      timerState: 'RUNNING',
      timerStartedAt: now,
    };

    if (session.timerState === 'PAUSED' && session.timerPausedAt) {
      const pausedDuration = Math.floor((now.getTime() - session.timerPausedAt.getTime()) / 1000);
      updateData.accumulatedTime = session.accumulatedTime + pausedDuration;
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    });
  }

  async pauseTimer(sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.timerState !== 'RUNNING') throw new BadRequestException('El timer no está en marcha');

    const now = new Date();
    const runningDuration = Math.floor((now.getTime() - session.timerStartedAt!.getTime()) / 1000);

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        timerState: 'PAUSED',
        timerPausedAt: now,
        accumulatedTime: session.accumulatedTime + runningDuration,
      },
    });
  }

  async resumeTimer(sessionId: string) {
    return this.startTimer(sessionId);
  }

  async stopTimer(sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.timerState === 'STOPPED') throw new BadRequestException('El timer ya está detenido');

    let finalAccumulated = session.accumulatedTime;
    if (session.timerState === 'RUNNING' && session.timerStartedAt) {
      const runningDuration = Math.floor((new Date().getTime() - session.timerStartedAt.getTime()) / 1000);
      finalAccumulated += runningDuration;
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        timerState: 'STOPPED',
        timerStartedAt: null,
        timerPausedAt: null,
        accumulatedTime: finalAccumulated,
      },
    });
  }

  async getTimerState(sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    let currentElapsed = session.accumulatedTime;
    if (session.timerState === 'RUNNING' && session.timerStartedAt) {
      currentElapsed += Math.floor((new Date().getTime() - session.timerStartedAt.getTime()) / 1000);
    }

    return {
      state: session.timerState,
      elapsedSeconds: currentElapsed,
      accumulatedSeconds: session.accumulatedTime,
      formatted: this.formatTime(currentElapsed),
    };
  }

  async startRestTimer(sessionId: string, setId?: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    const activeRestTimer = await this.prisma.restTimer.findFirst({
      where: { sessionId, endedAt: null },
    });
    if (activeRestTimer) throw new BadRequestException('Ya hay un descanso activo');

    return this.prisma.restTimer.create({
      data: {
        sessionId,
        setId,
        startedAt: new Date(),
      },
    });
  }

  async endRestTimer(sessionId: string) {
    const restTimer = await this.prisma.restTimer.findFirst({
      where: { sessionId, endedAt: null },
    });
    if (!restTimer) throw new BadRequestException('No hay descanso activo');

    const endedAt = new Date();
    const durationSec = Math.floor((endedAt.getTime() - restTimer.startedAt.getTime()) / 1000);

    return this.prisma.restTimer.update({
      where: { id: restTimer.id },
      data: { endedAt, durationSec },
    });
  }

  async getRestTimers(sessionId: string) {
    return this.prisma.restTimer.findMany({
      where: { sessionId },
      orderBy: { startedAt: 'desc' },
    });
  }

  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    if (session.endedAt) throw new BadRequestException('La sesión ya ha finalizado');

    const sets = await this.prisma.set.findMany({ where: { sessionId } });
    const totalCalories = sets.reduce((sum, set) => sum + this.estimateCalories(set), 0);

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        estimatedCalories: totalCalories,
      },
    });
  }

  async createSet(data: {
    sessionId: string;
    exerciseId: string;
    weightKg?: number;
    reps?: number;
    durationSec?: number;
    setType?: SetType;
    variantBonus?: number;
    penalty?: number;
  }) {
    const session = await this.prisma.session.findUnique({
      where: { id: data.sessionId },
      include: { user: true },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    const exercise = await this.prisma.exercise.findUnique({ where: { id: data.exerciseId } });
    if (!exercise) throw new NotFoundException('Ejercicio no encontrado');

    if (session.user.currentWeightKg <= 0 || session.user.heightCm <= 0) {
      throw new BadRequestException('Usuario debe tener peso y altura configurados');
    }

    const bodyWeightKg = session.user.currentWeightKg.toNumber();
    const metricType: MetricType = exercise.metricType ?? 'REPS_WEIGHT';

    let liftValidation: LiftValidationResult = { status: 'ok' };
    let isgInput: ISGInput;

    switch (metricType) {
      case 'TIME_ONLY': {
        if (!data.durationSec || data.durationSec <= 0) {
          throw new BadRequestException(
            'Se requiere durationSec para ejercicios basados en tiempo/isométricos',
          );
        }
        isgInput = {
          metricType: 'TIME_ONLY',
          durationSec: data.durationSec,
          exerciseFactor: exercise.exerciseFactor.toNumber(),
          bodyWeightKg,
          heightCm: session.user.heightCm,
          variantBonus: data.variantBonus ?? 1.0,
          penalty: data.penalty ?? 1.0,
          setType: data.setType ?? 'NORMAL',
        };
        break;
      }
      case 'REPS_ONLY': {
        if (!data.reps || data.reps <= 0) {
          throw new BadRequestException('Se requiere reps para ejercicios de calistenia');
        }
        isgInput = {
          metricType: 'REPS_ONLY',
          reps: data.reps,
          exerciseFactor: exercise.exerciseFactor.toNumber(),
          bodyWeightKg,
          heightCm: session.user.heightCm,
          variantBonus: data.variantBonus ?? 1.0,
          penalty: data.penalty ?? 1.0,
          setType: data.setType ?? 'NORMAL',
        };
        break;
      }
      case 'REPS_WEIGHT':
      default: {
        if (!data.weightKg || !data.reps) {
          throw new BadRequestException('Se requiere weightKg y reps para ejercicios de fuerza');
        }

        const liftKind = resolveLiftKind(exercise.name);
        if (liftKind !== 'other') {
          liftValidation = validateLiftRatio({
            liftKind,
            estimated1RMKg: estimateOneRepMax(data.weightKg, data.reps),
            bodyWeightKg,
          });

          if (liftValidation.status === 'blocked') {
            throw new BadRequestException(liftValidation.message);
          }
        }

        isgInput = {
          metricType: 'REPS_WEIGHT',
          weightKg: data.weightKg,
          reps: data.reps,
          exerciseFactor: exercise.exerciseFactor.toNumber(),
          bodyWeightKg,
          heightCm: session.user.heightCm,
          variantBonus: data.variantBonus ?? 1.0,
          penalty: data.penalty ?? 1.0,
          setType: data.setType ?? 'NORMAL',
        };
        break;
      }
    }

    const isgResult = calculateISG(isgInput);
    const setType = data.setType ?? 'NORMAL';

    const previousBest = await this.prisma.set.findFirst({
      where: {
        userId: session.userId,
        exerciseId: data.exerciseId,
        isRecordPr: true,
      },
      orderBy: { isgScore: 'desc' },
    });

    const isRecordPr = !previousBest || isgResult.finalScore > previousBest.isgScore.toNumber();

    const set = await this.prisma.set.create({
      data: {
        sessionId: data.sessionId,
        exerciseId: data.exerciseId,
        userId: session.userId,
        weightKg: data.weightKg,
        reps: data.reps,
        durationSec: data.durationSec,
        setType,
        variantBonus: data.variantBonus ?? 1.0,
        penalty: data.penalty ?? 1.0,
        isRecordPr,
        isgScore: isgResult.finalScore,
        validationStatus:
          liftValidation.status === 'requires_video' ? 'REQUIRES_VIDEO' : 'APPROVED',
      },
      include: { exercise: true },
    });

    if (isRecordPr) {
      await this.prisma.set.updateMany({
        where: {
          userId: session.userId,
          exerciseId: data.exerciseId,
          id: { not: set.id },
        },
        data: { isRecordPr: false },
      });
    }

    return { set, isgResult };
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        sets: {
          include: { exercise: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');
    return session;
  }

  async getUserSessions(userId: string, limit = 20, offset = 0) {
    return this.prisma.session.findMany({
      where: { userId },
      include: {
        sets: {
          include: { exercise: true },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSession = await this.prisma.session.findFirst({
      where: { userId, endedAt: { not: null } },
      orderBy: { endedAt: 'desc' },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    let newStreak = user.streakDays;

    if (lastSession) {
      const lastSessionDate = new Date(lastSession.endedAt!);
      lastSessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { streakDays: newStreak },
    });
  }

  private estimateCalories(set: any): number {
    const met = 6;
    const weightKg = set.user?.currentWeightKg?.toNumber() || 70;
    const durationMinutes = 1;
    return Math.round(met * weightKg * durationMinutes / 60);
  }
}
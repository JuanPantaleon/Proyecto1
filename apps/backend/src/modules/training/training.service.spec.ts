import { Test, TestingModule } from '@nestjs/testing';
import { TrainingService } from './training.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TrainingService', () => {
  let service: TrainingService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    set: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    exercise: {
      findUnique: jest.fn(),
    },
    restTimer: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TrainingService>(TrainingService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a new session with timer stopped', async () => {
      const user = { id: 'user-1', currentWeightKg: 80, heightCm: 175 };
      const session = { id: 'session-1', userId: 'user-1', timerState: 'STOPPED', accumulatedTime: 0 };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.session.create.mockResolvedValue(session);

      const result = await service.startSession('user-1');

      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          startedAt: expect.any(Date),
          timerState: 'STOPPED',
          accumulatedTime: 0,
        },
      });
      expect(result).toEqual(session);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.startSession('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSet', () => {
    const sessionId = 'session-1';
    const exerciseId = 'exercise-1';
    const userId = 'user-1';

    const mockSession = {
      id: sessionId,
      userId,
      user: {
        id: userId,
        currentWeightKg: { toNumber: () => 80 },
        heightCm: 175,
      },
    };

    const mockExercise = {
      id: exerciseId,
      name: 'Press Banca Plana',
      metricType: 'REPS_WEIGHT',
      exerciseFactor: { toNumber: () => 8.0 }, // Press Banca Plana: (9+8+7+8)/4 = 8.0
    };

    const mockSet = {
      id: 'set-1',
      sessionId,
      exerciseId,
      userId,
      weightKg: 100,
      reps: 8,
      setType: 'NORMAL',
      isRecordPr: true,
      isgScore: 80.8,
      exercise: mockExercise,
    };

    beforeEach(() => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.exercise.findUnique.mockResolvedValue(mockExercise);
      mockPrisma.set.findFirst.mockResolvedValue(null);
      mockPrisma.set.create.mockResolvedValue(mockSet);
      mockPrisma.set.updateMany.mockResolvedValue({ count: 0 });
    });

    it('should create set with ISG calculation', async () => {
      const result = await service.createSet(userId, {
        sessionId,
        exerciseId,
        weightKg: 100,
        reps: 8,
      });

      expect(mockPrisma.set.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionId,
            exerciseId,
            userId,
            weightKg: 100,
            reps: 8,
            isRecordPr: true,
          }),
          include: { exercise: true },
        }),
      );
      // ISG calculation result (actual implementation returns 80.8)
      expect(result.set.isgScore).toBe(80.8);
      expect(result.isgResult.finalScore).toBe(80.8);
    });

    it('should throw if user has no weight/height', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, currentWeightKg: { toNumber: () => 0 }, heightCm: 0 },
      });

      await expect(service.createSet(userId, { sessionId, exerciseId, weightKg: 100, reps: 8 }))
        .rejects.toThrow(BadRequestException);
    });

    it('should detect PR correctly', async () => {
      const previousBest = { isgScore: { toNumber: () => 70 } };
      mockPrisma.set.findFirst.mockResolvedValue(previousBest);

      const result = await service.createSet(userId, { sessionId, exerciseId, weightKg: 100, reps: 8 });

      expect(result.set.isRecordPr).toBe(true);
      expect(mockPrisma.set.updateMany).toHaveBeenCalled();
    });
  });

  describe('createSet with new metrics', () => {
    const sessionId = 'session-1';
    const exerciseId = 'exercise-1';
    const userId = 'user-1';

    const mockSession = {
      id: sessionId,
      userId,
      user: {
        id: userId,
        currentWeightKg: { toNumber: () => 80 },
        heightCm: 175,
      },
    };

    beforeEach(() => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.set.findFirst.mockResolvedValue(null);
      mockPrisma.set.create.mockResolvedValue({ id: 'set-1' });
      mockPrisma.set.updateMany.mockResolvedValue({ count: 0 });
    });

    it('should create a time-based set (isométrico) with durationSec', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: exerciseId,
        metricType: 'TIME_ONLY',
        exerciseFactor: { toNumber: () => 4.75 }, // Plancha (Plank)
      });

      const result = await service.createSet(userId, { sessionId, exerciseId, durationSec: 60 });

      // ratio = (80*0.5)*60*4.75/80 = 142.5 -> raw = 142.5*1.01 = 143.925
      expect(result.isgResult.finalScore).toBe(143.93);
      expect(mockPrisma.set.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionId,
            exerciseId,
            durationSec: 60,
            setType: 'NORMAL',
          }),
        }),
      );
    });

    it('should create a reps-only set (calistenia) without weight', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: exerciseId,
        metricType: 'REPS_ONLY',
        exerciseFactor: { toNumber: () => 5.5 }, // Flexiones (Push-ups)
      });

      const result = await service.createSet(userId, { sessionId, exerciseId, reps: 20 });

      // ratio = (80*1.0)*20*5.5/80 = 110 -> raw = 110*1.01 = 111.1
      expect(result.isgResult.finalScore).toBe(111.1);
      expect(mockPrisma.set.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reps: 20,
            weightKg: undefined,
            setType: 'NORMAL',
          }),
        }),
      );
    });

    it('should apply the failure multiplier to sets marked FAILURE', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: exerciseId,
        name: 'Press Banca Plana',
        metricType: 'REPS_WEIGHT',
        exerciseFactor: { toNumber: () => 8.0 },
      });

      const result = await service.createSet(userId, {
        sessionId,
        exerciseId,
        weightKg: 100,
        reps: 8,
        setType: 'FAILURE',
      });

      // 80.8 * 1.05 = 84.84
      expect(result.isgResult.intensityMultiplier).toBe(1.05);
      expect(result.isgResult.finalScore).toBe(84.84);
      expect(mockPrisma.set.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ setType: 'FAILURE' }),
        }),
      );
    });

    it('should throw if a time-based exercise has no durationSec', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: exerciseId,
        metricType: 'TIME_ONLY',
        exerciseFactor: { toNumber: () => 4.75 },
      });

      await expect(service.createSet(userId, { sessionId, exerciseId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if a reps-only exercise has no reps', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: exerciseId,
        metricType: 'REPS_ONLY',
        exerciseFactor: { toNumber: () => 5.5 },
      });

      await expect(service.createSet(userId, { sessionId, exerciseId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if a strength exercise has no weight/reps', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({
        id: exerciseId,
        name: 'Press Banca Plana',
        metricType: 'REPS_WEIGHT',
        exerciseFactor: { toNumber: () => 8.0 },
      });

      await expect(service.createSet(userId, { sessionId, exerciseId, reps: 8 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Timer functionality', () => {
    const sessionId = 'session-1';
    const userId = 'user-1';
    const mockSession = {
      id: sessionId,
      userId,
      timerState: 'STOPPED',
      accumulatedTime: 0,
      timerStartedAt: null,
      timerPausedAt: null,
    };

    describe('startTimer', () => {
      it('should start timer from STOPPED state', async () => {
        mockPrisma.session.findUnique.mockResolvedValue(mockSession);
        mockPrisma.session.update.mockResolvedValue({
          ...mockSession,
          timerState: 'RUNNING',
          timerStartedAt: new Date(),
        });

        const result = await service.startTimer(sessionId, userId);

        expect(result.timerState).toBe('RUNNING');
        expect(result.timerStartedAt).toBeDefined();
      });

      it('should resume from PAUSED state and add paused duration', async () => {
        const pausedSession = {
          ...mockSession,
          timerState: 'PAUSED',
          timerPausedAt: new Date(Date.now() - 10000),
          accumulatedTime: 30,
        };
        mockPrisma.session.findUnique.mockResolvedValue(pausedSession);
        mockPrisma.session.update.mockResolvedValue({
          ...pausedSession,
          timerState: 'RUNNING',
          timerStartedAt: new Date(),
          accumulatedTime: 40,
        });

        const result = await service.startTimer(sessionId, userId);

        expect(result.timerState).toBe('RUNNING');
        expect(result.accumulatedTime).toBeGreaterThanOrEqual(40);
      });

      it('should throw if already RUNNING', async () => {
        mockPrisma.session.findUnique.mockResolvedValue({
          ...mockSession,
          timerState: 'RUNNING',
        });

        await expect(service.startTimer(sessionId, userId)).rejects.toThrow(BadRequestException);
      });
    });

    describe('pauseTimer', () => {
      it('should pause RUNNING timer and accumulate time', async () => {
        const runningSession = {
          ...mockSession,
          timerState: 'RUNNING',
          timerStartedAt: new Date(Date.now() - 5000),
          accumulatedTime: 10,
        };
        mockPrisma.session.findUnique.mockResolvedValue(runningSession);
        mockPrisma.session.update.mockResolvedValue({
          ...runningSession,
          timerState: 'PAUSED',
          timerPausedAt: new Date(),
          accumulatedTime: 15,
        });

        const result = await service.pauseTimer(sessionId, userId);

        expect(result.timerState).toBe('PAUSED');
        expect(result.accumulatedTime).toBe(15);
      });

      it('should throw if not RUNNING', async () => {
        mockPrisma.session.findUnique.mockResolvedValue(mockSession);

        await expect(service.pauseTimer(sessionId, userId)).rejects.toThrow(BadRequestException);
      });
    });

    describe('stopTimer', () => {
      it('should stop timer and finalize accumulated time', async () => {
        const runningSession = {
          ...mockSession,
          timerState: 'RUNNING',
          timerStartedAt: new Date(Date.now() - 5000),
          accumulatedTime: 10,
        };
        mockPrisma.session.findUnique.mockResolvedValue(runningSession);
        mockPrisma.session.update.mockResolvedValue({
          ...runningSession,
          timerState: 'STOPPED',
          timerStartedAt: null,
          timerPausedAt: null,
          accumulatedTime: 15,
        });

        const result = await service.stopTimer(sessionId, userId);

        expect(result.timerState).toBe('STOPPED');
        expect(result.accumulatedTime).toBe(15);
      });
    });

    describe('getTimerState', () => {
      it('should return current elapsed time when RUNNING', async () => {
        const runningSession = {
          ...mockSession,
          timerState: 'RUNNING',
          timerStartedAt: new Date(Date.now() - 5000),
          accumulatedTime: 10,
        };
        mockPrisma.session.findUnique.mockResolvedValue(runningSession);

        const result = await service.getTimerState(sessionId, userId);

        expect(result.state).toBe('RUNNING');
        expect(result.elapsedSeconds).toBeGreaterThanOrEqual(15);
        expect(result.formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      });

      it('should return accumulated time when STOPPED', async () => {
        mockPrisma.session.findUnique.mockResolvedValue({
          ...mockSession,
          timerState: 'STOPPED',
          accumulatedTime: 45,
        });

        const result = await service.getTimerState(sessionId, userId);

        expect(result.state).toBe('STOPPED');
        expect(result.elapsedSeconds).toBe(45);
      });
    });
  });

  describe('Rest Timer', () => {
    const sessionId = 'session-1';
    const userId = 'user-1';

    describe('startRestTimer', () => {
      it('should create rest timer', async () => {
        mockPrisma.session.findUnique.mockResolvedValue({ id: sessionId, userId });
        mockPrisma.restTimer.findFirst.mockResolvedValue(null);
        mockPrisma.restTimer.create.mockResolvedValue({
          id: 'rest-1',
          sessionId,
          setId: 'set-1',
          startedAt: new Date(),
          endedAt: null,
          durationSec: 0,
        });

        const result = await service.startRestTimer(sessionId, 'set-1', userId);

        expect(result.setId).toBe('set-1');
        expect(result.endedAt).toBeNull();
      });

      it('should throw if rest timer already active', async () => {
        mockPrisma.session.findUnique.mockResolvedValue({ id: sessionId, userId });
        mockPrisma.restTimer.findFirst.mockResolvedValue({ id: 'rest-1', endedAt: null });

        await expect(service.startRestTimer(sessionId, undefined, userId)).rejects.toThrow(BadRequestException);
      });
    });

    describe('endRestTimer', () => {
      it('should end rest timer and calculate duration', async () => {
        const startedAt = new Date(Date.now() - 10000);
        mockPrisma.session.findUnique.mockResolvedValue({ id: sessionId, userId });
        mockPrisma.restTimer.findFirst.mockResolvedValue({
          id: 'rest-1',
          sessionId,
          startedAt,
          endedAt: null,
        });
        mockPrisma.restTimer.update.mockResolvedValue({
          id: 'rest-1',
          sessionId,
          startedAt,
          endedAt: new Date(),
          durationSec: 10,
        });

        const result = await service.endRestTimer(sessionId, userId);

        expect(result.endedAt).toBeDefined();
        expect(result.durationSec).toBe(10);
      });
    });
  });

  describe('updateStreak', () => {
    it('should increment streak if last session was yesterday', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'session-1',
        endedAt: yesterday,
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', streakDays: 5 });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', streakDays: 6 });

      const result = await service.updateStreak('user-1');

      expect(result.streakDays).toBe(6);
    });

    it('should reset streak to 1 if last session was more than 1 day ago', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'session-1',
        endedAt: threeDaysAgo,
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', streakDays: 5 });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', streakDays: 1 });

      const result = await service.updateStreak('user-1');

      expect(result.streakDays).toBe(1);
    });

    it('should set streak to 1 if no previous sessions', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', streakDays: 0 });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', streakDays: 1 });

      const result = await service.updateStreak('user-1');

      expect(result.streakDays).toBe(1);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { calculateExerciseFactor } from '@ranked-fitness/shared';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;

  const mockPrisma = {
    exercise: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return exercises with filters', async () => {
      const exercises = [
        { id: '1', name: 'Press Banca', muscleGroup: 'PECHO', level: 'INTERMEDIO', exerciseFactor: 8.0 },
        { id: '2', name: 'Sentadilla', muscleGroup: 'PIERNAS', level: 'AVANZADO', exerciseFactor: 9.75 },
      ];
      mockPrisma.exercise.findMany.mockResolvedValue(exercises);

      const result = await service.findAll('PECHO', 'INTERMEDIO', 'Press');

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          muscleGroup: 'PECHO',
          level: 'INTERMEDIO',
          name: { contains: 'Press', mode: 'insensitive' },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(exercises);
    });

    it('should return all exercises when no filters', async () => {
      const exercises = [{ id: '1', name: 'Press Banca' }];
      mockPrisma.exercise.findMany.mockResolvedValue(exercises);

      const result = await service.findAll();

      expect(mockPrisma.exercise.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(exercises);
    });
  });

  describe('findById', () => {
    it('should return exercise by id', async () => {
      const exercise = { id: '1', name: 'Press Banca' };
      mockPrisma.exercise.findUnique.mockResolvedValue(exercise);

      const result = await service.findById('1');

      expect(result).toEqual(exercise);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create exercise with calculated exerciseFactor', async () => {
      const input = {
        name: 'Nuevo Ejercicio',
        muscleGroup: 'PECHO',
        level: 'PRINCIPIANTE',
        massValue: 6,
        demandValue: 5,
        complexityValue: 4,
        impactValue: 4,
      };
      const exerciseFactor = calculateExerciseFactor(6, 5, 4, 4); // 4.75
      const created = { id: 'new-1', ...input, exerciseFactor };

      mockPrisma.exercise.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(mockPrisma.exercise.create).toHaveBeenCalledWith({
        data: { ...input, exerciseFactor },
      });
      expect(result.exerciseFactor).toBe(4.75);
    });
  });

  describe('update', () => {
    it('should update exercise and recalculate factor if M/D/C/I changed', async () => {
      const current = { id: '1', massValue: 6, demandValue: 5, complexityValue: 4, impactValue: 4, exerciseFactor: 4.75 };
      const updated = { ...current, massValue: 8, exerciseFactor: 5.25 }; // (8+5+4+4)/4 = 5.25

      mockPrisma.exercise.findUnique.mockResolvedValue(current);
      mockPrisma.exercise.update.mockResolvedValue(updated);

      const result = await service.update('1', { massValue: 8 });

      expect(mockPrisma.exercise.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          massValue: 8,
          exerciseFactor: 5.25,
        }),
      });
    });

    it('should not recalculate factor if M/D/C/I not changed', async () => {
      const current = { id: '1', name: 'Press', muscleGroup: 'PECHO', level: 'INTERMEDIO', exerciseFactor: 8.0 };
      mockPrisma.exercise.findUnique.mockResolvedValue(current);
      mockPrisma.exercise.update.mockResolvedValue({ ...current, name: 'Press Updated' });

      const result = await service.update('1', { name: 'Press Updated' });

      expect(mockPrisma.exercise.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Press Updated' },
      });
    });
  });

  describe('delete', () => {
    it('should soft delete exercise', async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.exercise.update.mockResolvedValue({ id: '1', isActive: false });

      const result = await service.delete('1');

      expect(mockPrisma.exercise.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });
  });

  describe('getMuscleGroups', () => {
    it('should return distinct muscle groups', async () => {
      const groups = [
        { muscleGroup: 'PECHO' },
        { muscleGroup: 'ESPALDA' },
        { muscleGroup: 'PIERNAS' },
      ];
      mockPrisma.exercise.groupBy.mockResolvedValue(groups);

      const result = await service.getMuscleGroups();

      expect(mockPrisma.exercise.groupBy).toHaveBeenCalledWith({
        by: ['muscleGroup'],
        where: { isActive: true },
      });
      expect(result).toEqual(groups);
    });
  });
});
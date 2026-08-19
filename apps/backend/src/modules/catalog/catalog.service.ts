import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateExerciseFactor } from '@ranked-fitness/shared';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findAll(muscleGroup?: string, level?: string, search?: string) {
    const where: any = { isActive: true };
    
    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (level) where.level = level;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new NotFoundException('Ejercicio no encontrado');
    return exercise;
  }

  async create(data: {
    name: string;
    muscleGroup: string;
    level: string;
    massValue: number;
    demandValue: number;
    complexityValue: number;
    impactValue: number;
  }) {
    const exerciseFactor = calculateExerciseFactor(
      data.massValue,
      data.demandValue,
      data.complexityValue,
      data.impactValue
    );

    return this.prisma.exercise.create({
      data: {
        ...data,
        exerciseFactor,
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    muscleGroup: string;
    level: string;
    massValue: number;
    demandValue: number;
    complexityValue: number;
    impactValue: number;
    isActive: boolean;
  }>) {
    await this.findById(id);

    const updateData: any = { ...data };
    
    if (data.massValue !== undefined || data.demandValue !== undefined || 
        data.complexityValue !== undefined || data.impactValue !== undefined) {
      const current = await this.prisma.exercise.findUnique({ where: { id } });
      const massValue = data.massValue ?? current!.massValue;
      const demandValue = data.demandValue ?? current!.demandValue;
      const complexityValue = data.complexityValue ?? current!.complexityValue;
      const impactValue = data.impactValue ?? current!.impactValue;
      
      updateData.exerciseFactor = calculateExerciseFactor(massValue, demandValue, complexityValue, impactValue);
    }

    return this.prisma.exercise.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.exercise.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getMuscleGroups() {
    return this.prisma.exercise.groupBy({
      by: ['muscleGroup'],
      where: { isActive: true },
    });
  }
}
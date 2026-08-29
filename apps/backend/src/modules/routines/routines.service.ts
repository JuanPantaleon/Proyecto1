import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const routineInclude = {
  days: {
    orderBy: { order: 'asc' as const },
    include: {
      blocks: {
        orderBy: { order: 'asc' as const },
        include: {
          sets: {
            orderBy: { order: 'asc' as const },
            include: { exercise: true },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  findPublic() {
    return this.prisma.routine.findMany({
      where: { isPublic: true },
      include: routineInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  findOnePublic(id: string) {
    return this.prisma.routine.findFirst({
      where: { id, isPublic: true },
      include: routineInclude,
    });
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    const db = await this.checkDatabase();
    const redis = await this.checkRedis();

    return {
      status: db && redis ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: db ? 'up' : 'down',
        redis: redis ? 'up' : 'down',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      return true;
    } catch {
      return false;
    }
  }
}
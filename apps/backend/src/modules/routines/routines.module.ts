import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
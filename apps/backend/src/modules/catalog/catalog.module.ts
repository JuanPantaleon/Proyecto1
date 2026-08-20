import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { CustomExerciseController } from './custom-exercise.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController, CustomExerciseController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
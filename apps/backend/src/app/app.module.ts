import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { CatalogModule } from '../modules/catalog/catalog.module';
import { TrainingModule } from '../modules/training/training.module';
import { HealthModule } from '../modules/health/health.module';
import { AuditModule } from '../modules/audit/audit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    TrainingModule,
    HealthModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
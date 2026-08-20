import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { CatalogModule } from '../modules/catalog/catalog.module';
import { TrainingModule } from '../modules/training/training.module';
import { HealthModule } from '../modules/health/health.module';
import { AuditModule } from '../modules/audit/audit.module';
import { RelationsModule } from '../modules/relations/relations.module';
import { CommunityModule } from '../modules/community/community.module';
import { ChatModule } from '../modules/chat/chat.module';
import { RoutinesModule } from '../modules/routines/routines.module';
import { ActiveViewGuard } from '../modules/auth/guards/active-view.guard';
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
    RelationsModule,
    CommunityModule,
    ChatModule,
    RoutinesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ActiveViewGuard,
    },
  ],
})
export class AppModule {}
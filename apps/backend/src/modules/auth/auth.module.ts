import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ActiveViewGuard } from './guards/active-view.guard';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, ActiveViewGuard],
  exports: [AuthService, JwtAuthGuard, ActiveViewGuard],
})
export class AuthModule {}
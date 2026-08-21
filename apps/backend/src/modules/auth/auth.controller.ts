import { Controller, Post, Req, UseGuards, Get, Body, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { completeOnboardingSchema, updateUserSchema } from '@ranked-fitness/shared';
import type { CompleteOnboardingDto } from '@ranked-fitness/shared';
import { verifyClerkWebhook } from './webhook.util';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('clerk-webhook')
  @ApiOperation({ summary: 'Clerk webhook endpoint (verifica firma Svix)' })
  async clerkWebhook(@Req() req: any) {
    try {
      const secret = process.env.CLERK_WEBHOOK_SECRET;
      if (!secret) throw new UnauthorizedException('Webhook no configurado');
      verifyClerkWebhook(req.rawBody, req.headers, secret);
      return this.authService.handleClerkWebhook(req.body);
    } catch (e: any) {
      return { __debug: true, name: e?.name, message: e?.message, hasRaw: typeof req?.rawBody, rawIsBuffer: Buffer.isBuffer(req?.rawBody), stack: e?.stack };
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Completar onboarding: elegir rol base (PLAYER/COACH/GYM)' })
  async completeOnboarding(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(completeOnboardingSchema)) dto: CompleteOnboardingDto,
  ) {
    return this.authService.completeOnboarding(user.clerkId, dto);
  }

  @Put('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar peso/altura del usuario actual' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(updateUserSchema)) body: { currentWeightKg?: number; heightCm?: number },
  ) {
    return this.authService.updateUserProfile(user.clerkId, body);
  }
}
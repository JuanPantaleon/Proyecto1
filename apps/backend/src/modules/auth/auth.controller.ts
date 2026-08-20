import { Controller, Post, Req, UseGuards, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { completeOnboardingSchema } from '@ranked-fitness/shared';
import type { CompleteOnboardingDto } from '@ranked-fitness/shared';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('clerk-webhook')
  @ApiOperation({ summary: 'Clerk webhook endpoint' })
  async clerkWebhook(@Req() req: any) {
    return this.authService.handleClerkWebhook(req.body);
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
}
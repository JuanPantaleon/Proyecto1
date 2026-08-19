import { Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

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
}
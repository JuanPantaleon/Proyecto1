import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    return this.healthService.check();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready() {
    return { status: 'ready' };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  async live() {
    return { status: 'alive' };
  }
}
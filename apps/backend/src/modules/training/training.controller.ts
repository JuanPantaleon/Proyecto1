import { Controller, Post, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createSetSchema } from '@ranked-fitness/shared';
import type { CreateSetDto } from '@ranked-fitness/shared';

@ApiTags('entrenamiento')
@Controller('api/v1/entrenamiento')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  @Post('sesion')
  @ApiOperation({ summary: 'Iniciar nueva sesión de entrenamiento' })
  async startSession(@CurrentUser() user: any) {
    return this.trainingService.startSession(user.id);
  }

  @Put('sesion/:id/finalizar')
  @ApiOperation({ summary: 'Finalizar sesión de entrenamiento' })
  async endSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.endSession(id, user.id);
  }

  @Post('set')
  @ApiOperation({ summary: 'Registrar una serie (calcula ISG automáticamente)' })
  async createSet(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createSetSchema)) data: CreateSetDto,
  ) {
    return this.trainingService.createSet(user.id, data);
  }

  @Get('sesion/:id')
  @ApiOperation({ summary: 'Obtener detalles de una sesión' })
  async getSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.getSession(id, user.id);
  }

  @Get('mis-sesiones')
  @ApiOperation({ summary: 'Listar mis sesiones de entrenamiento' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getUserSessions(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.trainingService.getUserSessions(user.id, limit ?? 20, offset ?? 0);
  }

  @Post('sesion/:id/timer/iniciar')
  @ApiOperation({ summary: 'Iniciar/reanudar timer de la sesión' })
  async startTimer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.startTimer(id, user.id);
  }

  @Put('sesion/:id/timer/pausar')
  @ApiOperation({ summary: 'Pausar timer de la sesión' })
  async pauseTimer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.pauseTimer(id, user.id);
  }

  @Put('sesion/:id/timer/reanudar')
  @ApiOperation({ summary: 'Reanudar timer de la sesión' })
  async resumeTimer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.resumeTimer(id, user.id);
  }

  @Put('sesion/:id/timer/detener')
  @ApiOperation({ summary: 'Detener timer de la sesión' })
  async stopTimer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.stopTimer(id, user.id);
  }

  @Get('sesion/:id/timer')
  @ApiOperation({ summary: 'Obtener estado actual del timer' })
  async getTimerState(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.getTimerState(id, user.id);
  }

  @Post('sesion/:id/descanso/iniciar')
  @ApiOperation({ summary: 'Iniciar timer de descanso' })
  async startRestTimer(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('setId') setId?: string,
  ) {
    return this.trainingService.startRestTimer(id, setId, user.id);
  }

  @Put('sesion/:id/descanso/finalizar')
  @ApiOperation({ summary: 'Finalizar timer de descanso' })
  async endRestTimer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.endRestTimer(id, user.id);
  }

  @Get('sesion/:id/descansos')
  @ApiOperation({ summary: 'Obtener historial de descansos' })
  async getRestTimers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.trainingService.getRestTimers(id, user.id);
  }
}
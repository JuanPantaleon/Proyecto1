import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createCustomExerciseSchema } from '@ranked-fitness/shared';
import type { CreateCustomExerciseDto } from '@ranked-fitness/shared';

@ApiTags('custom-exercises')
@Controller('api/v1/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TRAINER', 'GYM_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class CustomExerciseController {
  constructor(private catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ejercicios personalizados del entrenador' })
  findMine(@CurrentUser() user: { id: string }) {
    return this.catalogService.findCustomByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear ejercicio personalizado (Entrenador/Admin)' })
  create(
    @Body(new ZodValidationPipe(createCustomExerciseSchema)) data: CreateCustomExerciseDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.catalogService.createCustom(data, user.id);
  }
}
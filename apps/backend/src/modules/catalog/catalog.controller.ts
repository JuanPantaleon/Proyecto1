import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createExerciseSchema, updateExerciseSchema } from '@ranked-fitness/shared';
import type { CreateExerciseDto, UpdateExerciseDto } from '@ranked-fitness/shared';

@ApiTags('catalog')
@Controller('api/v1/catalogo')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('ejercicios')
  @ApiOperation({ summary: 'Listar ejercicios con filtros' })
  @ApiQuery({ name: 'muscleGroup', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('muscleGroup') muscleGroup?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.catalogService.findAll(muscleGroup, level, search);
  }

  @Get('ejercicios/:id')
  @ApiOperation({ summary: 'Obtener ejercicio por ID' })
  async findById(@Param('id') id: string) {
    return this.catalogService.findById(id);
  }

  @Get('grupos-musculares')
  @ApiOperation({ summary: 'Obtener grupos musculares disponibles' })
  async getMuscleGroups() {
    return this.catalogService.getMuscleGroups();
  }

  @Post('ejercicios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo ejercicio (Solo Super Admin)' })
  async create(@Body(new ZodValidationPipe(createExerciseSchema)) data: CreateExerciseDto) {
    return this.catalogService.create(data);
  }

  @Put('ejercicios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar ejercicio (Solo Super Admin)' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExerciseSchema)) data: UpdateExerciseDto,
  ) {
    return this.catalogService.update(id, data);
  }

  @Delete('ejercicios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar ejercicio (Solo Super Admin)' })
  async delete(@Param('id') id: string) {
    return this.catalogService.delete(id);
  }
}
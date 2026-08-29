import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RelationsService } from './relations.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createConnectionSchema, respondConnectionSchema } from '@ranked-fitness/shared';
import type { CreateConnectionDto, RespondConnectionDto } from '@ranked-fitness/shared';

@ApiTags('relaciones')
@Controller('api/v1/relaciones')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RelationsController {
  constructor(private relationsService: RelationsService) {}

  @Post('solicitud')
  @ApiOperation({ summary: 'Enviar solicitud de seguimiento / amistad / coaching' })
  createRequest(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createConnectionSchema)) data: CreateConnectionDto,
  ) {
    return this.relationsService.createRequest(user.id, data);
  }

  @Get('solicitudes')
  @ApiOperation({ summary: 'Solicitudes recibidas pendientes' })
  listIncoming(@CurrentUser() user: any) {
    return this.relationsService.listIncoming(user.id);
  }

  @Get('solicitudes/enviadas')
  @ApiOperation({ summary: 'Solicitudes enviadas pendientes' })
  listOutgoing(@CurrentUser() user: any) {
    return this.relationsService.listOutgoing(user.id);
  }

  @Get('conexiones')
  @ApiOperation({ summary: 'Conexiones aceptadas' })
  listConnections(@CurrentUser() user: any) {
    return this.relationsService.listConnections(user.id);
  }

  @Get('usuarios')
  @ApiOperation({ summary: 'Buscar usuarios por nombre o email (excluye al propio)' })
  searchUsers(@CurrentUser() user: any, @Query('q') q?: string) {
    return this.relationsService.searchUsers(user.id, q);
  }

  @Get('coach/atletas')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Atletas vinculados al entrenador (COACH_ATHLETE)' })
  coachAthletes(@CurrentUser() user: any) {
    return this.relationsService.coachAthletes(user.id);
  }

  @Get('coach/atletas/:id')
  @UseGuards(RolesGuard)
  @Roles('TRAINER', 'GYM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Detalle de un atleta VINCULADO (COACH_ATHLETE ACCEPTED) + sesiones' })
  coachAthleteDetail(@Param('id') id: string, @CurrentUser() user: any) {
    return this.relationsService.coachAthleteDetail(user.id, id);
  }

  @Get('gimnasio/jugadores')
  @UseGuards(RolesGuard)
  @Roles('GYM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Jugadores afiliados/asistentes al propio centro' })
  gymPlayers(@CurrentUser() user: any) {
    return this.relationsService.gymPlayers(user.id);
  }

  @Get('gimnasio/ranking')
  @UseGuards(RolesGuard)
  @Roles('GYM_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Ranking local (suma ISG) de los jugadores del propio centro' })
  gymRanking(@CurrentUser() user: any) {
    return this.relationsService.gymRanking(user.id);
  }

  @Put('solicitud/:id')
  @ApiOperation({ summary: 'Aceptar o rechazar una solicitud recibida' })
  respond(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(respondConnectionSchema)) data: RespondConnectionDto,
  ) {
    return this.relationsService.respond(id, user.id, data);
  }

  @Put('solicitud/:id/bloquear')
  @ApiOperation({ summary: 'Bloquear una conexión' })
  block(@Param('id') id: string, @CurrentUser() user: any) {
    return this.relationsService.block(id, user.id);
  }
}
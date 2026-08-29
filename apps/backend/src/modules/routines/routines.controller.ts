import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RoutinesService } from './routines.service';

@ApiTags('routines')
@Controller('api/v1/rutinas')
export class RoutinesController {
  constructor(private routinesService: RoutinesService) {}

  @Get('public')
  @ApiOperation({ summary: 'Listar rutinas públicas (accesibles para todos)' })
  findPublic() {
    return this.routinesService.findPublic();
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Obtener una rutina pública por ID' })
  @ApiParam({ name: 'id', required: true })
  findOnePublic(@Param('id') id: string) {
    return this.routinesService.findOnePublic(id);
  }
}
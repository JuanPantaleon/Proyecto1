import { Controller, Post, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createChatSchema, sendMessageSchema } from '@ranked-fitness/shared';
import type { CreateChatDto, SendMessageDto } from '@ranked-fitness/shared';

@ApiTags('chat')
@Controller('api/v1/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('salas')
  @ApiOperation({ summary: 'Crear chat privado o grupal' })
  createRoom(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createChatSchema)) data: CreateChatDto,
  ) {
    return this.chatService.createRoom(user.id, data);
  }

  @Get('salas')
  @ApiOperation({ summary: 'Mis salas con último mensaje' })
  myRooms(@CurrentUser() user: any) {
    return this.chatService.myRooms(user.id);
  }

  @Get('salas/:id/mensajes')
  @ApiOperation({ summary: 'Historial de mensajes de la sala' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  messages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.messages(user.id, id, limit ?? 50, offset ?? 0);
  }

  @Post('salas/:id/mensajes')
  @ApiOperation({ summary: 'Enviar mensaje (texto, imagen, video o nota de voz)' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(sendMessageSchema)) data: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, id, data);
  }

  @Put('salas/:id/leido')
  @ApiOperation({ summary: 'Marcar sala como leída' })
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markRead(user.id, id);
  }
}
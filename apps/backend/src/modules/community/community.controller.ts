import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createPostSchema,
  addReactionSchema,
  createCommentSchema,
  feedFilterSchema,
} from '@ranked-fitness/shared';
import type {
  CreatePostDto,
  AddReactionDto,
  CreateCommentDto,
  FeedFilter,
} from '@ranked-fitness/shared';

@ApiTags('comunidad')
@Controller('api/v1/comunidad')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Post('posts')
  @ApiOperation({ summary: 'Crear publicación en el feed' })
  createPost(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createPostSchema)) data: CreatePostDto,
  ) {
    return this.communityService.createPost(user.id, data);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Feed con filtros: following / local (Pantafit) / elite' })
  @ApiQuery({ name: 'filter', required: false, enum: ['all', 'following', 'local', 'elite'] })
  feed(@CurrentUser() user: any, @Query('filter') filter?: FeedFilter) {
    return this.communityService.feed(user.id, feedFilterSchema.parse(filter ?? 'all'));
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Detalle de publicación con reacciones y comentarios' })
  getPost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.getPost(id, user.id);
  }

  @Post('posts/:id/reacciones')
  @ApiOperation({ summary: 'Reaccionar (🔥 / 💀 / 👑). Envía el mismo tipo para quitar.' })
  addReaction(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(addReactionSchema)) data: AddReactionDto,
  ) {
    return this.communityService.addReaction(user.id, id, data);
  }

  @Post('posts/:id/comentarios')
  @ApiOperation({ summary: 'Comentar una publicación' })
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(createCommentSchema)) data: CreateCommentDto,
  ) {
    return this.communityService.addComment(user.id, id, data);
  }
}
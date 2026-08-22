import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { MediaService } from './media.service';

const MAX_BYTES = 50 * 1024 * 1024;

@ApiTags('media')
@Controller('api/v1/media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir imagen o video (multipart, campo "file"). Se guarda en la base de datos.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES } }))
  async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any, @Req() req: Request) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Solo se permiten imágenes o videos');
    }
    const { id, kind } = await this.mediaService.save(user.id, file.buffer, file.originalname, file.mimetype);
    const base = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    return { url: `${base}/api/v1/media/${id}`, mediaKind: kind };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Servir un archivo subido (persistido en base de datos)' })
  async serve(@Param('id') id: string, @Res() res: Response) {
    try {
      const { data, mimeType } = await this.mediaService.get(id);
      res.set('Content-Type', mimeType);
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(data);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw err;
    }
  }
}

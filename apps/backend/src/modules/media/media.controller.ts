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
import { access as fsAccess } from 'fs/promises';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('api/v1/media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir imagen o video (multipart, campo "file")' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      throw new BadRequestException('Solo se permiten imágenes o videos');
    }
    const filename = await this.mediaService.save(file.buffer, file.originalname);
    const base = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const mediaKind = file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
    return { url: `${base}/api/v1/media/${filename}`, mediaKind };
  }

  @Get(':file')
  @ApiOperation({ summary: 'Servir un archivo subido' })
  async serve(@Param('file') file: string, @Res() res: Response) {
    const safe = file.replace(/[^a-zA-Z0-9._-]/g, '');
    const path = this.mediaService.resolve(safe);
    try {
      await fsAccess(path);
    } catch {
      throw new NotFoundException('Archivo no encontrado');
    }
    res.sendFile(path);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async save(
    ownerId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ id: string; kind: 'IMAGE' | 'VIDEO' }> {
    const kind = mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE';
    const created = await this.prisma.media.create({
      data: {
        ownerId,
        mimeType,
        kind,
        size: buffer.length,
        filename: originalName,
        data: buffer,
      },
      select: { id: true, kind: true },
    });
    return { id: created.id, kind: created.kind as 'IMAGE' | 'VIDEO' };
  }

  async get(id: string): Promise<{ data: Buffer; mimeType: string }> {
    const media = await this.prisma.media.findUnique({
      where: { id },
      select: { data: true, mimeType: true },
    });
    if (!media) throw new NotFoundException('Archivo no encontrado');
    return { data: media.data as Buffer, mimeType: media.mimeType };
  }
}

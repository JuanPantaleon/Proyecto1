import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname, join } from 'path';

@Injectable()
export class MediaService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async ensureDir() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async save(buffer: Buffer, originalName: string): Promise<string> {
    await this.ensureDir();
    const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extname(safe)}`;
    await fs.writeFile(join(this.uploadDir, filename), buffer);
    return filename;
  }

  resolve(filename: string): string {
    return join(this.uploadDir, filename);
  }
}

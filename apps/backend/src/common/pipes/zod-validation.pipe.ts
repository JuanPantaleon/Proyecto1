import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`,
      );
      throw new BadRequestException(messages.join('; '));
    }
    return result.data;
  }
}
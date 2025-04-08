import { PipeTransform } from '@nestjs/common';
import { BadUserInputException } from 'src/exceptions';
import { ZodSchema } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: T) {
    try {
      const parsedValue = this.schema.parse(value);
      return { ...value, ...parsedValue };
    } catch {
      throw BadUserInputException('Invalid input');
    }
  }
}

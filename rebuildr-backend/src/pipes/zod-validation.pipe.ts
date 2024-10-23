import { PipeTransform } from '@nestjs/common';
import { BadUserInputException } from 'src/exceptions';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch {
      throw BadUserInputException('Invalid input');
    }
  }
}

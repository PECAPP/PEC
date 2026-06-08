import { createZodDto } from 'nestjs-zod';
import { userSchema } from '@pec/shared';

export class CreateUserDto extends createZodDto(userSchema) {}

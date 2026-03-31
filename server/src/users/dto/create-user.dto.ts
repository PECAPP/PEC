import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { userSchema } from '@shared/schemas/erp';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['student', 'faculty', 'college_admin'] })
  role: 'student' | 'faculty' | 'college_admin';

  @ApiPropertyOptional()
  githubUsername?: string;

  @ApiPropertyOptional()
  linkedinUsername?: string;

  @ApiPropertyOptional({ default: true })
  isPublicProfile?: boolean;

  static validate(data: unknown): ReturnType<typeof userSchema.parse> {
    return userSchema.parse(data);
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { hostelIssueSchema } from '@shared/schemas/erp';

export class CreateHostelIssueDto {
  @ApiProperty({ example: 'Broken Fan' })
  title: string;

  @ApiProperty({ example: 'The fan in room 204 is making clicking noise' })
  description: string;

  @ApiProperty({ example: 'Electrical' })
  category: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' })
  priority: string;

  @ApiPropertyOptional({ enum: ['pending', 'assigned', 'resolved', 'closed'], default: 'pending' })
  status?: string;

  @ApiProperty({ example: 'Room 204' })
  roomNumber: string;

  @ApiProperty({ example: 'uuid-student-id' })
  studentId: string;

  @ApiProperty({ example: 'John Doe' })
  studentName: string;

  @ApiPropertyOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  responses?: unknown;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiPropertyOptional()
  updatedAt?: string;

  static validate(data: unknown) {
    return hostelIssueSchema.parse(data);
  }
}


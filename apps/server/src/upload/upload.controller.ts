import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { S3Service } from '../common/services/s3.service';
import { AuthGuard } from '../auth/auth.guard';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const PresignRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export class PresignRequestDto extends createZodDto(PresignRequestSchema) {}

@ApiTags('Upload')
@Controller('upload')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presign')
  @ApiOperation({ summary: 'Generate a presigned URL to upload a file directly to storage' })
  async generatePresignedUrl(@Body() body: PresignRequestDto) {
    const { url, key } = await this.s3Service.generatePresignedUploadUrl(body.contentType, body.filename);
    return { url, key, success: true };
  }
}

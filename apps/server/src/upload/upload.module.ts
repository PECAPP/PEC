import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { S3Service } from '../common/services/s3.service';

@Module({
  controllers: [UploadController],
  providers: [S3Service],
})
export class UploadModule {}

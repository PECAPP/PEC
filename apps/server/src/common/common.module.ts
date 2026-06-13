import { Module, Global } from '@nestjs/common';
import { S3Service } from './services/s3.service';

@Global()
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class CommonServicesModule {}

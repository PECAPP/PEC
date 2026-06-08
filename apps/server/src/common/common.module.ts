import { Module, Global } from '@nestjs/common';
import { ClamavService } from './services/clamav.service';
import { S3Service } from './services/s3.service';

@Global()
@Module({
  providers: [ClamavService, S3Service],
  exports: [ClamavService, S3Service],
})
export class CommonServicesModule {}

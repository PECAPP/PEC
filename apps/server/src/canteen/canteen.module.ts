import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CanteenController } from './canteen.controller';
import { CanteenService } from './canteen.service';

@Module({
  imports: [CacheModule.register({ ttl: 600000 })], // 10 minutes default TTL
  controllers: [CanteenController],
  providers: [CanteenService]
})
export class CanteenModule {}

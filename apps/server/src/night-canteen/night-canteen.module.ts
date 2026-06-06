import { Module } from '@nestjs/common';
import { NightCanteenController } from './night-canteen.controller';
import { NightCanteenService } from './night-canteen.service';
import { NightCanteenRepository } from './night-canteen.repository';

@Module({
  controllers: [NightCanteenController],
  providers: [NightCanteenService, NightCanteenRepository],
})
export class NightCanteenModule {}

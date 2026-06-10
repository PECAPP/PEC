import { Module } from '@nestjs/common';
import { NightCanteenController } from './night-canteen.controller';
import { NightCanteenService } from './night-canteen.service';
import { NightCanteenRepository } from './night-canteen.repository';
import { NightCanteenGateway } from './night-canteen.gateway';

@Module({
  controllers: [NightCanteenController],
  providers: [NightCanteenService, NightCanteenRepository, NightCanteenGateway],
})
export class NightCanteenModule {}

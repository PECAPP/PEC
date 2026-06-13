import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceRepository } from './marketplace.repository';
import { MarketplaceGateway } from './marketplace.gateway';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketplaceRepository, MarketplaceGateway],
})
export class MarketplaceModule {}

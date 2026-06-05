import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceRepository } from './marketplace.repository';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketplaceRepository],
})
export class MarketplaceModule {}

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // GlobalCacheModule is registered globally in AppModule — no local CacheModule needed
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}

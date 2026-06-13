import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DockerController } from './docker/docker.controller';
import { DockerService } from './docker/docker.service';

@Module({
  imports: [
    PrismaModule,
    // GlobalCacheModule is registered globally in AppModule — no local CacheModule needed
  ],
  providers: [AdminService, DockerService],
  controllers: [AdminController, DockerController]
})
export class AdminModule {}

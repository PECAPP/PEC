import { Module } from '@nestjs/common';
import { CollegeSettingsController } from './college-settings.controller';
import { CollegeSettingsService } from './college-settings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CollegeSettingsController],
  providers: [CollegeSettingsService],
  exports: [CollegeSettingsService],
})
export class CollegeSettingsModule {}

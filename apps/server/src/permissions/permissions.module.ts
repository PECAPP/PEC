import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';

@Module({
  imports: [PrismaModule, SecurityAuditModule],
  controllers: [PermissionsController],

  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

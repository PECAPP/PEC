import { Module } from '@nestjs/common';
import { RolesMgmtService } from './roles-mgmt.service';
import { RolesMgmtController } from './roles-mgmt.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';

@Module({
  imports: [PrismaModule, SecurityAuditModule],
  controllers: [RolesMgmtController],

  providers: [RolesMgmtService],
  exports: [RolesMgmtService],
})
export class RolesMgmtModule {}

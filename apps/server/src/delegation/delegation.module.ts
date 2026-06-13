import { Module } from '@nestjs/common';
import { DelegationService } from './delegation.service';
import { DelegationController } from './delegation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslModule } from '../casl/casl.module';
import { SecurityAuditModule } from '../security-audit/security-audit.module';

@Module({
  imports: [PrismaModule, CaslModule, SecurityAuditModule],
  controllers: [DelegationController],

  providers: [DelegationService],
  exports: [DelegationService]
})
export class DelegationModule {}

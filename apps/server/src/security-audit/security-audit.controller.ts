import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SecurityAuditService } from './security-audit.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('security-audit')
export class SecurityAuditController {
  constructor(private readonly auditService: SecurityAuditService) {}

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'AuditLog'))
  async getLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 50;
    return this.auditService.getLogs(p, l);
  }
}

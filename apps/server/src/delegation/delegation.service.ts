import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SecurityAuditService } from '../security-audit/security-audit.service';

@Injectable()
export class DelegationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly auditService: SecurityAuditService,
  ) {}


  async createDelegation(
    delegatorId: string,
    delegateeId: string,
    roleId: string,
    validUntil: Date,
    reason?: string
  ) {
    if (delegatorId === delegateeId) {
      throw new BadRequestException('Cannot delegate to self');
    }

    if (validUntil <= new Date()) {
      throw new BadRequestException('validUntil must be in the future');
    }

    // Verify delegator actually has this role
    const hasRole = await this.prisma.userRole.findFirst({
      where: { userId: delegatorId, roleId }
    });

    if (!hasRole) {
      throw new BadRequestException('Delegator does not possess the requested role');
    }

    const delegation = await this.prisma.roleDelegation.create({
      data: {
        delegatorId,
        delegateeId,
        roleId,
        validUntil,
        reason
      }
    });

    await this.cacheManager.del(`user_perms:${delegateeId}`);
    
    await this.auditService.createLog({
      actorId: delegatorId,
      action: 'CREATE_DELEGATION',
      targetType: 'RoleDelegation',
      targetId: delegation.id,
      after: { delegateeId, roleId, validUntil, reason }
    });

    return delegation;
  }


  async revokeDelegation(id: string, requesterId: string) {
    const delegation = await this.prisma.roleDelegation.findUnique({ where: { id } });
    if (!delegation) throw new NotFoundException('Delegation not found');

    if (delegation.delegatorId !== requesterId) {
      // Allow System Admins to revoke as well, but we check this in the controller via PoliciesGuard
    }

    const result = await this.prisma.roleDelegation.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    await this.cacheManager.del(`user_perms:${delegation.delegateeId}`);

    await this.auditService.createLog({
      actorId: requesterId,
      action: 'REVOKE_DELEGATION',
      targetType: 'RoleDelegation',
      targetId: id,
    });

    return result;
  }


  async getMyDelegations(userId: string) {
    return this.prisma.roleDelegation.findMany({
      where: { delegatorId: userId, revokedAt: null },
      include: { delegatee: true, role: true }
    });
  }
}

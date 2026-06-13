import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityAuditService } from '../security-audit/security-audit.service';

@Injectable()
export class RolesMgmtService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly auditService: SecurityAuditService,
  ) {}

  private async invalidateRoleUsers(roleId: string) {
    const userRoles = await this.prisma.userRole.findMany({ where: { roleId }, select: { userId: true } });
    for (const ur of userRoles) {
      await this.cacheManager.del(`user_perms:${ur.userId}`);
    }
  }

  async findAll() {
    return this.prisma.role.findMany({ include: {
        permissions: {
          include: { permission: true }
        }
      },
      orderBy: { hierarchy: 'desc' }
    });
  }

  async create(data: { name: string; description?: string; hierarchy?: number; permissionIds?: string[] }) {
    const { permissionIds, ...roleData } = data;
    return this.prisma.role.create({
      data: {
        ...roleData,
        permissions: permissionIds ? {
          create: permissionIds.map(id => ({ permissionId: id }))
        } : undefined
      },
      include: { permissions: true }
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ 
      where: { id },
      include: {
        permissions: { include: { permission: true } }
      }
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, data: { name?: string; description?: string; hierarchy?: number; permissionIds?: string[] }) {
    const { permissionIds, ...roleData } = data;
    
    const updatedRole = await this.prisma.$transaction(async (tx) => {
      if (permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
      }

      return tx.role.update({
        where: { id },
        data: {
          ...roleData,
          permissions: permissionIds ? {
            create: permissionIds.map(permId => ({ permissionId: permId }))
          } : undefined
        },
        include: { permissions: { include: { permission: true } } }
      });
    });

    await this.invalidateRoleUsers(id);
    return updatedRole;
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new Error('Cannot delete a system role');
    }
    await this.invalidateRoleUsers(id);
    return this.prisma.role.delete({ where: { id } });
  }

  async assignRole(
    userId: string,
    roleId: string,
    grantedBy: string,
    options?: { validFrom?: Date; validUntil?: Date }
  ) {
    const role = await this.findOne(roleId);
    if (!role) throw new NotFoundException('Role not found');

    const result = await this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId }
      },
      update: {
        validFrom: options?.validFrom || null,
        validUntil: options?.validUntil || null,
        grantedBy,
        grantedAt: new Date()
      },
      create: {
        userId,
        roleId,
        validFrom: options?.validFrom || null,
        validUntil: options?.validUntil || null,
        grantedBy
      }
    });

    await this.cacheManager.del(`user_perms:${userId}`);
    await this.auditService.createLog({
      actorId: grantedBy,
      action: 'ASSIGN_ROLE',
      targetType: 'UserRole',
      targetId: `${userId}:${roleId}`,
      after: { validFrom: options?.validFrom, validUntil: options?.validUntil }
    });
    return result;
  }

  async revokeRole(userId: string, roleId: string, actorId: string = 'system') {
    const result = await this.prisma.userRole.deleteMany({
      where: { userId, roleId }
    });
    await this.cacheManager.del(`user_perms:${userId}`);
    await this.auditService.createLog({
      actorId: actorId,
      action: 'REVOKE_ROLE',
      targetType: 'UserRole',
      targetId: `${userId}:${roleId}`,
    });
    return result;
  }


  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
  }
}


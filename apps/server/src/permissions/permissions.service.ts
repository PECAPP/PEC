import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityAuditService } from '../security-audit/security-audit.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly auditService: SecurityAuditService,
  ) {}

  private async invalidatePermissionUsers(permissionId: string) {
    const rolePerms = await this.prisma.rolePermission.findMany({ where: { permissionId }, select: { roleId: true } });
    for (const rp of rolePerms) {
      const userRoles = await this.prisma.userRole.findMany({ where: { roleId: rp.roleId }, select: { userId: true } });
      for (const ur of userRoles) {
        await this.cacheManager.del(`user_perms:${ur.userId}`);
      }
    }
  }

  async findAll(query?: { limit?: number; offset?: number }) {
    return this.prisma.permission.findMany({ 
      take: query?.limit || 1000, 
      skip: query?.offset || 0,
      orderBy: [{ subject: 'asc' }, { action: 'asc' }],
    });
  }

  async create(data: { action: string; subject: string; conditions?: any; description?: string }, actorId: string = 'system') {
    const permission = await this.prisma.permission.create({ data });
    await this.auditService.createLog({
      actorId,
      action: 'CREATE_PERMISSION',
      targetType: 'Permission',
      targetId: permission.id,
      after: data
    });
    return permission;
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: string, data: { action?: string; subject?: string; conditions?: any; description?: string }, actorId: string = 'system') {
    const before = await this.findOne(id);
    const updated = await this.prisma.permission.update({ where: { id }, data });
    await this.invalidatePermissionUsers(id);
    
    await this.auditService.createLog({
      actorId,
      action: 'UPDATE_PERMISSION',
      targetType: 'Permission',
      targetId: id,
      before,
      after: data
    });

    return updated;
  }

  async remove(id: string, actorId: string = 'system') {
    const before = await this.findOne(id);
    await this.invalidatePermissionUsers(id);
    const result = await this.prisma.permission.delete({ where: { id } });

    await this.auditService.createLog({
      actorId,
      action: 'DELETE_PERMISSION',
      targetType: 'Permission',
      targetId: id,
      before,
    });

    return result;
  }
}

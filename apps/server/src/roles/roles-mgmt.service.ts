import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesMgmtService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({ take: 1000, 
      include: {
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
    
    // Using transaction to clear old permissions and set new ones
    return this.prisma.$transaction(async (tx) => {
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
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new Error('Cannot delete a system role');
    }
    return this.prisma.role.delete({ where: { id } });
  }
}

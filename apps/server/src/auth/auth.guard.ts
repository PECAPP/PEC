import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          sessionVersion: true,
          passwordChangedAt: true,
          roles: {
            select: {
              role: { select: { name: true } },
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const tokenSessionVersion =
        typeof payload.sv === 'number' ? payload.sv : 0;
      if (user.sessionVersion !== tokenSessionVersion) {
        throw new UnauthorizedException('Session invalidated');
      }

      const tokenPwdChangedAt =
        typeof payload.pwd === 'number' ? payload.pwd : 0;
      const pwdChangedAt = user.passwordChangedAt?.getTime() ?? 0;
      if (pwdChangedAt > 0 && tokenPwdChangedAt < pwdChangedAt) {
        throw new UnauthorizedException('Session invalidated');
      }

      const roles = user.roles.map((entry) => entry.role.name);
      const primaryRole = roles[0] ?? payload.role;

      // Check Redis cache for permissions
      const cacheKey = `user_perms:${user.id}`;
      let permissions = await this.cacheManager.get(cacheKey);

      if (!permissions) {
        // Fetch from DB
        const roleRecords = await this.prisma.role.findMany({
          where: {
            name: { in: roles.length > 0 ? roles : primaryRole ? [primaryRole] : [] },
          },
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        });

        const permsSet = new Map();
        roleRecords.forEach(role => {
          role.permissions.forEach(rp => {
            permsSet.set(rp.permission.id, rp.permission);
          });
        });

        permissions = Array.from(permsSet.values());

        // Cache for 15 minutes
        await this.cacheManager.set(cacheKey, permissions, 15 * 60);
      }

      request['user'] = {
        ...payload,
        role: primaryRole,
        roles,
        permissions,
        uid: user.id,
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';
import type { FastifyRequest } from 'fastify';
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
    require('fs').appendFileSync('C:\\\\Users\\\\dubey\\\\PEC\\\\auth_debug.log', 'AuthGuard started\\n');
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      require('fs').appendFileSync('C:\\\\Users\\\\dubey\\\\PEC\\\\auth_debug.log', 'Token missing! Headers: ' + JSON.stringify(request.headers) + '\\n');
      throw new UnauthorizedException();
    }

    // CSRF Check for mutating requests
    const method = request.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfHeader = request.headers['x-csrf-token'];
      const isProd = process.env.NODE_ENV === 'production';
      const cookiePrefix = isProd ? '__Host-' : '';
      const csrfCookieName = `${cookiePrefix}csrf_token`;
      
      let csrfCookie = request.cookies ? request.cookies[csrfCookieName] : undefined;
      
      // Fallback manual parsing
      if (!csrfCookie && request.headers.cookie) {
        const entries = request.headers.cookie.split(';').map((chunk: string) => chunk.trim());
        const target = entries.find((item: string) => item.startsWith(`${csrfCookieName}=`));
        if (target) {
          csrfCookie = target.slice(`${csrfCookieName}=`.length);
        }
      }

      if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        throw new ForbiddenException('CSRF Token Invalid');
      }

      const origin = request.headers.origin || request.headers.referer;
      if (origin) {
        try {
          const originUrl = new URL(origin as string);
          const hostUrl = new URL(`${request.protocol}://${request.headers.host}`);
          if (originUrl.hostname !== hostUrl.hostname) {
            throw new ForbiddenException('CSRF Origin Mismatch');
          }
        } catch (e) {
          // Re-throw security exceptions; swallow only URL parse errors
          if (e instanceof ForbiddenException) throw e;
        }
      }
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const isBlacklisted = await this.cacheManager.get(`blacklist:token:${tokenHash}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token revoked');
      }

      // Token is stateless, we rely entirely on the payload and the Redis blacklist.
      // Removed the synchronous DB user lookup to eliminate the DB bottleneck.
      
      const roles = Array.isArray(payload.roles) ? payload.roles : [];
      const primaryRole = payload.role;
      const userId = payload.sub;

      // Check Redis cache for permissions
      const cacheKey = `user_perms:${userId}`;
      let cachedData = await this.cacheManager.get<{ permissions: any[], isSystemAdmin: boolean }>(cacheKey);
      
      let permissions = cachedData?.permissions;
      let isSystemAdmin = cachedData?.isSystemAdmin || false;

      if (!permissions) {
        // 1. Fetch user's direct active roles
        const activeUserRoles = await this.prisma.userRole.findMany({
          where: {
            userId: userId,
            OR: [ { validFrom: null }, { validFrom: { lte: new Date() } } ],
            AND: [ { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] } ]
          },
          select: { roleId: true }
        });

        // 2. Fetch user's delegated active roles
        const activeDelegations = await this.prisma.roleDelegation.findMany({
          where: {
            delegateeId: userId,
            revokedAt: null,
            validFrom: { lte: new Date() },
            validUntil: { gt: new Date() }
          },
          select: { roleId: true }
        });

        const startingRoleIds = new Set([
          ...activeUserRoles.map(ur => ur.roleId),
          ...activeDelegations.map(rd => rd.roleId)
        ]);

        if (startingRoleIds.size === 0 && roles.length > 0) {
          const tokenRoles = await this.prisma.role.findMany({
            where: { name: { in: roles } },
            select: { id: true }
          });
          tokenRoles.forEach(r => startingRoleIds.add(r.id));
        }

        // Fetch ALL roles from DB to build inheritance tree in memory
        const allRoles = await this.prisma.role.findMany({
          include: { permissions: { include: { permission: true } } }
        });

        const roleMap = new Map();
        allRoles.forEach(r => roleMap.set(r.id, r));

        // Traverse inheritance
        const collectedRoleIds = new Set<string>();
        const queue = Array.from(startingRoleIds);

        while (queue.length > 0) {
          const rId = queue.shift()!;
          if (!collectedRoleIds.has(rId)) {
            collectedRoleIds.add(rId);
            const rData = roleMap.get(rId);
            if (rData && rData.parentRoleId) {
              queue.push(rData.parentRoleId);
            }
          }
        }

        const permsSet = new Map();
        
        collectedRoleIds.forEach(rId => {
          const rData = roleMap.get(rId);
          if (rData) {
            if (rData.isSystemAdmin) isSystemAdmin = true;
            rData.permissions.forEach((rp: any) => {
              permsSet.set(rp.permission.id, rp.permission);
            });
          }
        });

        permissions = Array.from(permsSet.values());
        
        await this.cacheManager.set(cacheKey, { permissions, isSystemAdmin }, 15 * 60 * 1000);
      }

      request['user'] = {
        ...payload,
        role: primaryRole,
        roles,
        permissions,
        isSystemAdmin,
        uid: userId,
      };

    } catch (e: any) {
      console.error(e);
      require('fs').appendFileSync('C:\\\\Users\\\\dubey\\\\PEC\\\\auth_error.log', e.stack || e.toString() + '\\n');
      throw new UnauthorizedException(e.message || 'Unauthorized');
    }
    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = (request.headers.authorization as string)?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    // Fallback to cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookiePrefix = isProd ? '__Host-' : '';
    const cookieName = `${cookiePrefix}access_token`;

    if (request.cookies && request.cookies[cookieName]) {
      return request.cookies[cookieName];
    }

    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const entries = cookieHeader.split(';').map((chunk) => chunk.trim());
      const target = entries.find((item) => item.startsWith(`${cookieName}=`));
      if (target) {
        const cookieToken = target.slice(`${cookieName}=`.length);
        return cookieToken ? decodeURIComponent(cookieToken) : undefined;
      }
    }
    return undefined;
  }
}

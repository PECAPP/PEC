import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    
    // Developer bypass for stable testing during migration
    if (process.env.NODE_ENV !== 'production' && token === 'mock-token') {
       // Mock a student user if using the mock token
       request['user'] = {
          sub: 'mock-user-id',
          uid: 'mock-user-id',
          role: 'student',
          roles: ['student'],
          email: 'student@pec.edu'
       };
       return true;
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
          role: true,
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
      const primaryRole = user.role ?? roles[0] ?? payload.role;

      request['user'] = {
        ...payload,
        role: primaryRole,
        roles,
      };
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AppRole } from './roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { role?: string; roles?: string[] }
      | undefined;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const assignedRoles =
      user.roles && user.roles.length > 0
        ? user.roles
        : user.role
          ? [user.role]
          : [];

    if (assignedRoles.length === 0) {
      throw new ForbiddenException('User role is not assigned');
    }

    const allowed = requiredRoles.some((role) => assignedRoles.includes(role));
    if (!allowed) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}

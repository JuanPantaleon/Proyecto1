import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

const GLOBAL_ADMIN_ROLES = ['OWNER', 'SUPER_ADMIN'];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    const effectiveRole = user.effectiveRole ?? user.role;

    return (
      requiredRoles.some((role) => effectiveRole === role) ||
      GLOBAL_ADMIN_ROLES.some((admin) => user.role === admin)
    );
  }
}
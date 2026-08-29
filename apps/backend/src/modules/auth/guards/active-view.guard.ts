import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { resolveActiveView } from '../roles/effective-role';

/**
 * Guard global de saneamiento de la cabecera contextual `X-Active-View`.
 * - Solo permite valores de la allowlist (PLAYER | COACH | GYM | ADMIN).
 * - Si un usuario no es OWNER, la cabecera se elimina por completo: su rol
 *   efectivo queda forzado a su rol real verificado (anti-tampering).
 */
@Injectable()
export class ActiveViewGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const raw = request?.headers?.['x-active-view'];

    const clean = resolveActiveView(raw);
    if (!clean) {
      delete request.headers['x-active-view'];
      request.activeView = undefined;
      return true;
    }

    request.headers['x-active-view'] = clean;
    request.activeView = clean;
    return true;
  }
}
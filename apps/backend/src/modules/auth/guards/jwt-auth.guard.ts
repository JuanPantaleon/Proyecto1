import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/clerk-sdk-node';
import { AuthService } from '../auth.service';
import { resolveActiveView, computeEffectiveRole } from '../roles/effective-role';

/**
 * Guard de autenticación basado en el JWT de Clerk (plantilla "backend").
 * - Verifica la firma RS256 del token con las claves de Clerk (issuer inferido
 *   desde CLERK_SECRET_KEY).
 * - Resuelve el usuario de la BD por clerkId (payload.sub), creándolo on-demand
 *   si no existe (see AuthService.ensureUser).
 * - Adjunta { ...user, activeView, effectiveRole } a request.user para que
 *   RolesGuard / ActiveViewGuard / @CurrentUser() sigan funcionando.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = (req?.headers?.['authorization'] as string) ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) throw new UnauthorizedException('No autenticado');

    let payload: any;
    try {
      // Decodificamos el `iss` del token (sin verificar) para pedirle a
      // verifyToken que obtenga el JWKS de LA INSTANCIA QUE FIRMÓ el token,
      // no de la instancia a la que pertenece CLERK_SECRET_KEY. Esto evita el
      // error de kid mismatch cuando frontend y backend apuntan a distintas
      // aplicaciones de Clerk.
      let tokenIssuer: string | undefined;
      try {
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        tokenIssuer = JSON.parse(Buffer.from(b64, 'base64').toString()).iss;
      } catch {
        /* ignore */
      }

      payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        ...(tokenIssuer ? { issuer: tokenIssuer } : {}),
      });
    } catch (err: any) {
      let detail = err?.message ?? String(err);
      try {
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(Buffer.from(b64, 'base64').toString());
        detail += ` | iss=${decoded.iss} sub=${decoded.sub}`;
      } catch {
        /* ignore decode errors */
      }
      throw new UnauthorizedException(`Token inválido o expirado: ${detail}`);
    }

    const clerkId = payload?.sub as string | undefined;
    if (!clerkId) throw new UnauthorizedException('Token sin subject (sub)');

    const user = await this.authService.ensureUser(clerkId, payload);

    const activeView =
      resolveActiveView(req?.headers?.['x-active-view']) ?? req?.activeView;
    const effectiveRole = computeEffectiveRole({ role: user.role, activeView });

    req.user = { ...user, activeView, effectiveRole };
    return true;
  }
}

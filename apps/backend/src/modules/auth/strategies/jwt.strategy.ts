import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolveActiveView, computeEffectiveRole } from '../roles/effective-role';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // El ActiveViewGuard global ya sanitizó la cabecera; si no se ejecutó,
    // volvemos a validar aquí (defensa en profundidad).
    const activeView = resolveActiveView(
      (req as any).activeView ?? req.headers['x-active-view'],
    );
    const effectiveRole = computeEffectiveRole({ role: user.role, activeView });

    return {
      ...user,
      activeView,
      effectiveRole,
    };
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CompleteOnboardingDto } from '@ranked-fitness/shared';

const BASE_ROLE_TO_DB: Record<CompleteOnboardingDto['role'], 'USER' | 'TRAINER' | 'GYM_ADMIN'> = {
  PLAYER: 'USER',
  COACH: 'TRAINER',
  GYM: 'GYM_ADMIN',
};

/**
 * El rol raíz OWNER se asigna de forma EXCLUSIVA mediante la variable de
 * entorno protegida `SUPER_ADMIN_EMAIL`. Cualquier otro usuario no puede
 * ostentar este rol (anti-elevación de privilegios).
 */
function isRootEmail(email?: string | null): boolean {
  const root = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(root && email && email.trim().toLowerCase() === root);
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUserFromClerk(clerkUser: any): Promise<any> {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
    const isRoot = isRootEmail(email);

    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // Fallback por email: permite "adoptar" un usuario creado por el seed
    // (p.ej. el OWNER con clerkId sintético) y reasignarle el clerkId real.
    const matchedByEmail = existingUser
      ? null
      : await this.prisma.user.findUnique({ where: { email } });

    const target = existingUser ?? matchedByEmail;

    if (target) {
      const role =
        isRoot && target.role !== 'OWNER'
          ? 'OWNER'
          : !isRoot && target.role === 'OWNER'
            ? 'USER'
            : target.role;

      return this.prisma.user.update({
        where: { id: target.id },
        data: {
          clerkId: clerkUser.id,
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          ...(isRoot ? { role: 'OWNER' as const, isOnboarded: true } : { role }),
        },
      });
    }

    // NUEVO USUARIO: crear SIN onboarding completado y SIN rol asignado
    // El rol se asignará al completar el onboarding (PLAYER/COACH/GYM)
    return this.prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        currentWeightKg: 0,
        heightCm: 0,
        streakDays: 0,
        role: 'USER',        // Rol base genérico hasta onboarding
        isOnboarded: false,  // IMPORTANTE: false para forzar onboarding
      },
    });
  }

  async getUserByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({ where: { clerkId } });
  }

  async updateUserProfile(clerkId: string, data: { currentWeightKg?: number; heightCm?: number }) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { clerkId },
      data,
    });
  }

  /**
   * Devuelve el usuario de la BD por clerkId, creándolo on-demand si no existe.
   * Esto hace el flujo resiliente aunque el webhook de Clerk tarde o falle:
   * /me y /onboarding funcionan igual tras el primer inicio de sesión.
   */
  async ensureUser(clerkId: string, claims?: Record<string, any>) {
    const existing = await this.prisma.user.findUnique({ where: { clerkId } });
    if (existing) return existing;

    // El token de sesión de Clerk ya trae los claims necesarios (email, nombre,
    // foto). Creamos el usuario desde el token para EVITAR una llamada bloqueante
    // a clerkClient.users.getUser (que colgaba /me cuando el usuario aún no está
    // en la BD). El webhook de Clerk corrige/completa el registro luego.
    const email = claims?.email ?? `${clerkId}@clerk.local`;
    const isSynthetic = !claims?.email;
    const firstName = claims?.given_name ?? null;
    const lastName = claims?.family_name ?? null;
    const imageUrl = claims?.picture ?? null;

    // Si el email ya existe (p.ej. OWNER sembrado con clerkId sintético), adoptamos
    // ese registro en lugar de romper la restricción @unique de email.
    if (!isSynthetic) {
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        const isRoot = isRootEmail(email);
        return this.prisma.user.update({
          where: { id: byEmail.id },
          data: {
            clerkId,
            firstName,
            lastName,
            imageUrl,
            ...(isRoot ? { role: 'OWNER' as const, isOnboarded: true } : {}),
          },
        });
      }
    }

    const isRoot = isRootEmail(email);
    return this.prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        imageUrl,
        currentWeightKg: 0,
        heightCm: 0,
        streakDays: 0,
        role: isRoot ? 'OWNER' : 'USER',
        isOnboarded: false,
      },
    });
  }

  async completeOnboarding(clerkId: string, dto: CompleteOnboardingDto) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    // El OWNER nunca pierde su rol raíz por onboarding; tampoco puede otorgarse
    // este rol a través del endpoint (BASE_ROLE_TO_DB solo mapea a roles base).
    const role = user.role === 'OWNER' ? 'OWNER' : BASE_ROLE_TO_DB[dto.role];

    return this.prisma.user.update({
      where: { clerkId },
      data: {
        role,
        isOnboarded: true,
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.currentWeightKg != null ? { currentWeightKg: dto.currentWeightKg } : {}),
        ...(dto.heightCm != null ? { heightCm: dto.heightCm } : {}),
        ...(dto.country ? { locationCountry: dto.country } : {}),
        ...(dto.province ? { locationProvince: dto.province } : {}),
        ...(dto.city ? { locationCity: dto.city } : {}),
      },
    });
  }

  async handleClerkWebhook(event: any) {
    const { type, data } = event;

    switch (type) {
      case 'user.created':
      case 'user.updated':
        await this.syncUserFromClerk(data);
        break;
      case 'user.deleted':
        await this.prisma.user.delete({ where: { clerkId: data.id } });
        break;
    }
  }
}
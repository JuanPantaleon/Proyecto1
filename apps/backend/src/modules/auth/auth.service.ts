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
        role: isRoot ? 'OWNER' : 'USER',
        isOnboarded: isRoot,
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
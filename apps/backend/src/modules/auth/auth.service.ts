import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClerkClient, createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  private clerkClient: ClerkClient;

  constructor(private prisma: PrismaService) {
    this.clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  async syncUserFromClerk(clerkUser: any): Promise<any> {
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: { clerkId: clerkUser.id },
        data: {
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        currentWeightKg: 0,
        heightCm: 0,
        streakDays: 0,
        role: 'USER',
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
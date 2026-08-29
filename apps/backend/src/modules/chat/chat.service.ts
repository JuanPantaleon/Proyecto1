import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateChatDto, SendMessageDto } from '@ranked-fitness/shared';

const AUTHOR_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  imageUrl: true,
  role: true,
  gymId: true,
};

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private fullName(user: any): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Usuario';
  }

  async createRoom(creatorId: string, data: CreateChatDto) {
    const memberIds = Array.from(new Set([creatorId, ...data.memberIds]));
    if (memberIds.length < 2) {
      throw new BadRequestException('Se requieren al menos 2 integrantes');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: AUTHOR_SELECT,
    });
    if (users.length !== memberIds.length) {
      throw new NotFoundException('Alguno de los integrantes no existe');
    }

    const isGroup = data.isGroup ?? memberIds.length > 2;
    let name = data.name;
    if (!isGroup && memberIds.length === 2) {
      const otherId = memberIds.find((id) => id !== creatorId);
      const other = users.find((u) => u.id === otherId);
      name = this.fullName(other);
    }

    return this.prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        createdById: creatorId,
        members: {
          create: memberIds.map((uid) => ({ userId: uid, isAdmin: uid === creatorId })),
        },
      },
      include: {
        members: { include: { user: { select: AUTHOR_SELECT } } },
      },
    });
  }

  async myRooms(userId: string) {
    const memberships = await this.prisma.chatRoomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            members: { include: { user: { select: AUTHOR_SELECT } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((membership) => {
      const room = membership.room;
      const lastMessage = room.messages[0] ?? null;
      return {
        id: room.id,
        name: room.name,
        isGroup: room.isGroup,
        createdAt: room.createdAt,
        members: room.members.map((m) => ({
          ...m.user,
          name: this.fullName(m.user),
          isAdmin: m.isAdmin,
        })),
        lastMessage,
      };
    });
  }

  private async assertMember(roomId: string, userId: string) {
    const member = await this.prisma.chatRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member) throw new ForbiddenException('No sos miembro de esta sala');
    return member;
  }

  async messages(userId: string, roomId: string, limit = 50, offset = 0) {
    await this.assertMember(roomId, userId);
    const messages = await this.prisma.message.findMany({
      where: { roomId },
      include: { sender: { select: AUTHOR_SELECT } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return messages
      .reverse()
      .map((message) => ({
        ...message,
        sender: { ...message.sender, name: this.fullName(message.sender) },
      }));
  }

  async sendMessage(userId: string, roomId: string, data: SendMessageDto) {
    await this.assertMember(roomId, userId);
    const message = await this.prisma.message.create({
      data: {
        roomId,
        senderId: userId,
        text: data.text ?? '',
        mediaUrl: data.mediaUrl ?? null,
        mediaKind: data.mediaKind ?? null,
        voiceDurationSec: data.voiceDurationSec ?? null,
      },
      include: { sender: { select: AUTHOR_SELECT } },
    });
    return { ...message, sender: { ...message.sender, name: this.fullName(message.sender) } };
  }

  async markRead(userId: string, roomId: string) {
    await this.assertMember(roomId, userId);
    return this.prisma.chatRoomMember.update({
      where: { roomId_userId: { roomId, userId } },
      data: { lastReadAt: new Date() },
    });
  }
}
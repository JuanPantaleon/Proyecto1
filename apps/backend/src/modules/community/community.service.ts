import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreatePostDto,
  AddReactionDto,
  CreateCommentDto,
  FeedFilter,
} from '@ranked-fitness/shared';

type ReactionType = 'FIRE' | 'SKULL' | 'CROWN';

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
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  private fullName(user: any): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Usuario';
  }

  async createPost(userId: string, data: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId: userId,
        type: data.type,
        text: data.text ?? '',
        mediaUrl: data.mediaUrl ?? null,
        mediaKind: data.mediaKind ?? null,
        mediaDurationSec: data.mediaDurationSec ?? null,
        liftName: data.liftName ?? null,
        weightKg: data.weightKg ?? null,
        reps: data.reps ?? null,
        durationSec: data.durationSec ?? null,
        isgScore: data.isgScore ?? null,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async feed(userId: string, filter: FeedFilter = 'all') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, gymId: true },
    });
    const where: Record<string, unknown> = {};

    if (filter === 'following') {
      const connections = await this.prisma.connection.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        select: { requesterId: true, addresseeId: true },
      });
      const ids = new Set<string>([userId]);
      connections.forEach((c) => {
        ids.add(c.requesterId);
        ids.add(c.addresseeId);
      });
      where.authorId = { in: Array.from(ids) };
    } else if (filter === 'local') {
      where.author = { is: { gymId: user?.gymId ?? '__none__' } };
    } else if (filter === 'elite') {
      where.author = { is: { role: { in: ['TRAINER', 'GYM_ADMIN', 'SUPER_ADMIN'] } } };
    }

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        author: { select: AUTHOR_SELECT },
        reactions: true,
        comments: {
          include: { user: { select: AUTHOR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    return posts.map((post) => this.serialize(post, userId));
  }

  async getPost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        reactions: true,
        comments: {
          include: { user: { select: AUTHOR_SELECT } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!post) throw new NotFoundException('Publicación no encontrada');
    return this.serialize(post, userId);
  }

  async addReaction(userId: string, postId: string, data: AddReactionDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const existing = await this.prisma.postReaction.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing && existing.type === data.type) {
      await this.prisma.postReaction.delete({ where: { id: existing.id } });
      return { removed: true, type: data.type };
    }
    if (existing) {
      await this.prisma.postReaction.update({
        where: { id: existing.id },
        data: { type: data.type },
      });
      return { removed: false, type: data.type, changed: true };
    }
    await this.prisma.postReaction.create({ data: { postId, userId, type: data.type } });
    return { removed: false, type: data.type };
  }

  async addComment(userId: string, postId: string, data: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    return this.prisma.postComment.create({
      data: { postId, userId, text: data.text },
      include: { user: { select: AUTHOR_SELECT } },
    });
  }

  private serialize(post: any, userId: string) {
    const counts: Record<ReactionType, number> = { FIRE: 0, SKULL: 0, CROWN: 0 };
    const myReactions: Record<ReactionType, boolean> = { FIRE: false, SKULL: false, CROWN: false };
    for (const reaction of post.reactions) {
      counts[reaction.type as ReactionType] += 1;
      if (reaction.userId === userId) {
        myReactions[reaction.type as ReactionType] = true;
      }
    }
    return {
      id: post.id,
      type: post.type,
      text: post.text,
      mediaUrl: post.mediaUrl,
      mediaKind: post.mediaKind,
      mediaDurationSec: post.mediaDurationSec,
      liftName: post.liftName,
      weightKg: post.weightKg != null ? Number(post.weightKg) : null,
      reps: post.reps,
      durationSec: post.durationSec,
      isgScore: post.isgScore != null ? Number(post.isgScore) : null,
      createdAt: post.createdAt,
      author: { ...post.author, name: this.fullName(post.author) },
      reactions: counts,
      myReactions,
      comments: post.comments.map((comment: any) => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        author: { ...comment.user, name: this.fullName(comment.user) },
      })),
    };
  }
}
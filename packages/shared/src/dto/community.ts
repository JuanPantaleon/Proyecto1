import { z } from 'zod';

export const CONNECTION_TYPES = ['FRIEND', 'FOLLOW', 'COACH_ATHLETE'] as const;
export const CONNECTION_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'] as const;
export const POST_TYPES = ['WORKOUT_COMPLETED', 'PR', 'MEDIA'] as const;
export const REACTION_TYPES = ['FIRE', 'SKULL', 'CROWN'] as const;
export const MEDIA_KINDS = ['IMAGE', 'VIDEO', 'VOICE'] as const;
export const FEED_FILTERS = ['all', 'following', 'local', 'elite'] as const;

export const connectionTypeSchema = z.enum(CONNECTION_TYPES);
export const connectionStatusSchema = z.enum(CONNECTION_STATUSES);
export const postTypeSchema = z.enum(POST_TYPES);
export const reactionTypeSchema = z.enum(REACTION_TYPES);
export const mediaKindSchema = z.enum(MEDIA_KINDS);
export const feedFilterSchema = z.enum(FEED_FILTERS).default('all');

export const createConnectionSchema = z.object({
  addresseeId: z.string().uuid(),
  type: connectionTypeSchema,
});

export const respondConnectionSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});

export const createPostSchema = z
  .object({
    type: postTypeSchema.default('MEDIA'),
    text: z.string().trim().max(500).optional().default(''),
    mediaUrl: z.string().min(1).optional(),
    mediaKind: mediaKindSchema.optional(),
    mediaDurationSec: z.number().int().positive().max(7200).optional(),
    liftName: z.string().trim().max(100).optional(),
    weightKg: z.number().positive().max(2000).optional(),
    reps: z.number().int().positive().max(500).optional(),
    durationSec: z.number().int().positive().max(7200).optional(),
    isgScore: z.number().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.text && !data.mediaUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['text'],
        message: 'La publicación requiere texto o un archivo multimedia',
      });
    }
  });

export const addReactionSchema = z.object({
  type: reactionTypeSchema,
});

export const createCommentSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export const createChatSchema = z.object({
  memberIds: z.array(z.string().uuid()).min(1).max(50),
  name: z.string().trim().max(100).optional(),
  isGroup: z.boolean().optional(),
});

export const sendMessageSchema = z
  .object({
    text: z.string().trim().max(2000).optional().default(''),
    mediaUrl: z.string().min(1).optional(),
    mediaKind: mediaKindSchema.optional(),
    voiceDurationSec: z.number().int().positive().max(600).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.text && !data.mediaUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['text'],
        message: 'El mensaje requiere texto o un archivo multimedia',
      });
    }
  });

export type CreateConnectionDto = z.infer<typeof createConnectionSchema>;
export type RespondConnectionDto = z.infer<typeof respondConnectionSchema>;
export type CreatePostDto = z.infer<typeof createPostSchema>;
export type AddReactionDto = z.infer<typeof addReactionSchema>;
export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type CreateChatDto = z.infer<typeof createChatSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type FeedFilter = z.infer<typeof feedFilterSchema>;
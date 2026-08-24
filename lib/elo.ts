import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const K_FACTOR = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function computeRating(
  rating: number,
  opponentRating: number,
  score: number
): number {
  const expected = expectedScore(rating, opponentRating);
  return Math.round(rating + K_FACTOR * (score - expected));
}

export async function getLeaderboard(limit = 10) {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: { rating: "desc" },
      take: limit,
      include: { user: true },
    });
    return entries.map((entry) => ({
      userId: entry.userId,
      name: entry.user.name ?? entry.user.email ?? entry.userId,
      rating: entry.rating,
    }));
  } catch (error) {
    console.error("getLeaderboard error:", error);
    return [];
  }
}

export async function submitScore(userId: string, score: number) {
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  const entry = await prisma.leaderboardEntry.findUnique({
    where: { userId },
  });

  const avg = await prisma.leaderboardEntry.aggregate({
    _avg: { rating: true },
  });
  const opponentRating = Math.round(avg._avg.rating ?? 1000);

  if (!entry) {
    await prisma.leaderboardEntry.create({
      data: { userId, rating: 1000 + score },
    });
    return;
  }

  const scoreProb = score > 0.5 ? 1 : 0;
  const newRating =
    computeRating(entry.rating, opponentRating, scoreProb) +
    Math.floor(score / 10);
  await prisma.leaderboardEntry.update({
    where: { userId },
    data: { rating: newRating },
  });
}

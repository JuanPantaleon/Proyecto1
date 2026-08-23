import { NextResponse } from "next/server";
import { z } from "zod";
import { getLeaderboard, submitScore } from "@/lib/elo";
import { currentUser } from "@clerk/nextjs/server";

const ScoreSchema = z.object({
  score: z.number().finite().min(0).max(100000),
});

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No autorizado" },
      { status: 401 }
    );
  }
  const leaderboard = await getLeaderboard(10);
  return NextResponse.json(leaderboard);
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = ScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid score" },
      { status: 400 }
    );
  }
  await submitScore(user.id, parsed.data.score);

  return NextResponse.json({ ok: true });
}
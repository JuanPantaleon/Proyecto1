import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/elo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const neurodas = await prisma.neuroda.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(neurodas);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const body = await request.json();
  const { userId } = await params;

  const neuroda = await prisma.neuroda.create({
    data: {
      userId,
      activationLevel: body.activationLevel ?? 50,
      resilienceScore: body.resilienceScore ?? 50,
      focusScore: body.focusScore ?? 50,
    },
  });

  return NextResponse.json(neuroda);
}
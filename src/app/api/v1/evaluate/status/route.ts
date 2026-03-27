import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { sessionId },
      select: {
        id: true,
        sessionId: true,
        status: true,
        tier: true,
        totalScore: true,
        levelRating: true,
        completedAt: true,
        createdAt: true,
        model: {
          select: {
            id: true,
            name: true,
            provider: true,
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: evaluation.sessionId,
      status: evaluation.status,
      tier: evaluation.tier,
      model: evaluation.model,
      totalScore: evaluation.totalScore,
      levelRating: evaluation.levelRating,
      completedAt: evaluation.completedAt,
      createdAt: evaluation.createdAt,
    });
  } catch (error) {
    console.error('Evaluate status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

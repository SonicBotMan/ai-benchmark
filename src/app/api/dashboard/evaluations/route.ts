import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { userId: session.user.id },
      include: {
        model: {
          select: { name: true, provider: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      evaluations: evaluations.map((e) => ({
        id: e.id,
        sessionId: e.sessionId,
        status: e.status,
        tier: e.tier,
        totalScore: e.totalScore,
        levelRating: e.levelRating,
        model: e.model,
        createdAt: e.createdAt,
        completedAt: e.completedAt,
      })),
    });
  } catch (error) {
    console.error('Evaluations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

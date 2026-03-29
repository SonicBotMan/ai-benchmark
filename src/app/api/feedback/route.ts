import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evaluationId, rating, comment } = body as {
      evaluationId: string;
      rating: number; // 1-5
      comment?: string;
    };

    if (!evaluationId || !rating) {
      return NextResponse.json({ error: 'evaluationId and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 });
    }

    // Store feedback as a JSON field on the evaluation
    await prisma.evaluation.update({
      where: { id: evaluationId },
      data: {
        profileJson: {
          feedback: { rating, comment: comment ?? '', submittedAt: new Date().toISOString() },
        } as object,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

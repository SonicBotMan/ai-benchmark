import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            provider: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        answers: {
          orderBy: { answeredAt: 'asc' },
          select: {
            id: true,
            questionId: true,
            answerType: true,
            answer: true,
            score: true,
            dimension: true,
            caseType: true,
            blockIndex: true,
            scoreDetail: true,
            answeredAt: true,
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: evaluation.id,
      sessionId: evaluation.sessionId,
      status: evaluation.status,
      tier: evaluation.tier,
      model: evaluation.model,
      user: evaluation.user,
      totalScore: evaluation.totalScore,
      levelRating: evaluation.levelRating,
      mbtiType: evaluation.mbtiType,
      iqScore: evaluation.iqScore,
      eqScore: evaluation.eqScore,
      tqScore: evaluation.tqScore,
      aqScore: evaluation.aqScore,
      sqScore: evaluation.sqScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      answers: evaluation.answers,
      completedAt: evaluation.completedAt,
      createdAt: evaluation.createdAt,
    });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

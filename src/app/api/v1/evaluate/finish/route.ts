import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type DimensionKey = 'IQ' | 'EQ' | 'TQ' | 'AQ' | 'SQ';

interface DimensionAccumulator {
  total: number;
  count: number;
  subDimensions: Record<string, { total: number; count: number }>;
}

function determineLevelRating(totalScore: number): string {
  if (totalScore >= 800) return 'master';
  if (totalScore >= 600) return 'expert';
  if (totalScore >= 400) return 'proficient';
  return 'novice';
}

function determineMBTI(dimensions: Record<DimensionKey, number>): string {
  const ei = dimensions.EQ > dimensions.TQ ? 'E' : 'I';
  const sn = dimensions.AQ > dimensions.IQ ? 'N' : 'S';
  const tf = dimensions.EQ > dimensions.SQ ? 'F' : 'T';
  const jp = dimensions.IQ > dimensions.AQ ? 'J' : 'P';
  return `${ei}${sn}${tf}${jp}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { sessionId },
      include: {
        answers: true,
        model: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 401 });
    }

    if (evaluation.status === 'completed') {
      return NextResponse.json({ error: 'Evaluation already completed' }, { status: 400 });
    }

    const answers = evaluation.answers;
    if (answers.length === 0) {
      return NextResponse.json({ error: 'No answers submitted' }, { status: 400 });
    }

    const dimensions: Record<string, DimensionAccumulator> = {};

    for (const answer of answers) {
      const dim = answer.dimension || 'unknown';

      if (!dimensions[dim]) {
        dimensions[dim] = { total: 0, count: 0, subDimensions: {} };
      }

      const score = answer.score ?? 0;
      dimensions[dim].total += score;
      dimensions[dim].count += 1;

      if (!dimensions[dim].subDimensions[dim]) {
        dimensions[dim].subDimensions[dim] = { total: 0, count: 0 };
      }
      dimensions[dim].subDimensions[dim].total += score;
      dimensions[dim].subDimensions[dim].count += 1;
    }

    const dimensionScores: Record<string, number> = {};
    const dimensionKeys: DimensionKey[] = ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'];

    for (const key of dimensionKeys) {
      const dim = dimensions[key];
      if (dim && dim.count > 0) {
        dimensionScores[key] = Math.round(dim.total / dim.count);
      } else {
        dimensionScores[key] = 0;
      }
    }

    const subDimensionScores: Record<string, number> = {};
    for (const [dimKey, dim] of Object.entries(dimensions)) {
      for (const [subKey, sub] of Object.entries(dim.subDimensions)) {
        subDimensionScores[`${dimKey}.${subKey}`] = sub.count > 0
          ? Math.round(sub.total / sub.count)
          : 0;
      }
    }

    const validScores = dimensionKeys.map(k => dimensionScores[k]).filter(s => s > 0);
    const avgScore = validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : 0;
    const totalScore = Math.round(avgScore * 10);

    const levelRating = determineLevelRating(totalScore);
    const mbtiType = determineMBTI(dimensionScores as Record<DimensionKey, number>);

    const sortedSubDimensions = Object.entries(subDimensionScores)
      .map(([key, score]) => ({ key, score }))
      .sort((a, b) => b.score - a.score);

    const topStrengths = sortedSubDimensions.slice(0, 5).map(s => s.key);
    const topWeaknesses = sortedSubDimensions.slice(-5).reverse().map(s => s.key);

    const updatedEvaluation = await prisma.evaluation.update({
      where: { id: evaluation.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalScore,
        levelRating,
        mbtiType,
        iqScore: dimensionScores.IQ,
        eqScore: dimensionScores.EQ,
        tqScore: dimensionScores.TQ,
        aqScore: dimensionScores.AQ,
        sqScore: dimensionScores.SQ,
        strengths: topStrengths as unknown as object,
        weaknesses: topWeaknesses as unknown as object,
      },
      include: {
        answers: true,
        model: true,
      },
    });

    return NextResponse.json({
      sessionId: evaluation.sessionId,
      model: {
        id: evaluation.model.id,
        name: evaluation.model.name,
        provider: evaluation.model.provider,
      },
      tier: evaluation.tier,
      status: 'completed',
      totalScore,
      levelRating,
      mbtiType,
      dimensionScores,
      subDimensionScores,
      topStrengths,
      topWeaknesses,
      completedAt: updatedEvaluation.completedAt,
    });
  } catch (error) {
    console.error('Evaluate finish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

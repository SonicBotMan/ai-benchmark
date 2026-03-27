import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dimension = searchParams.get('dimension');
    const provider = searchParams.get('provider');
    const tier = searchParams.get('tier');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const whereClause: Record<string, unknown> = {
      status: 'completed',
    };

    if (tier) {
      whereClause.tier = tier;
    }

    if (provider) {
      whereClause.model = { provider };
    }

    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      include: {
        model: {
          select: {
            id: true,
            name: true,
            provider: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const modelMap = new Map<string, {
      model: { id: string; name: string; provider: string };
      scores: number[];
      dimensionScores: Record<string, number[]>;
      evaluationCount: number;
    }>();

    for (const evaluation of evaluations) {
      const modelId = evaluation.model.id;

      if (!modelMap.has(modelId)) {
        modelMap.set(modelId, {
          model: evaluation.model,
          scores: [],
          dimensionScores: {},
          evaluationCount: 0,
        });
      }

      const entry = modelMap.get(modelId)!;
      entry.evaluationCount += 1;

      if (evaluation.totalScore !== null) {
        entry.scores.push(evaluation.totalScore);
      }

      const dimMap: Record<string, number | null> = {
        IQ: evaluation.iqScore,
        EQ: evaluation.eqScore,
        TQ: evaluation.tqScore,
        AQ: evaluation.aqScore,
        SQ: evaluation.sqScore,
      };

      for (const [dimKey, score] of Object.entries(dimMap)) {
        if (score !== null) {
          if (!entry.dimensionScores[dimKey]) {
            entry.dimensionScores[dimKey] = [];
          }
          entry.dimensionScores[dimKey].push(score);
        }
      }
    }

    const leaderboard = Array.from(modelMap.values()).map(entry => {
      const avgTotalScore = entry.scores.length > 0
        ? Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length)
        : 0;

      const avgDimensionScores: Record<string, number> = {};
      for (const [dim, scores] of Object.entries(entry.dimensionScores)) {
        avgDimensionScores[dim] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }

      return {
        model: entry.model,
        avgTotalScore,
        avgDimensionScores,
        evaluationCount: entry.evaluationCount,
      };
    });

    let sorted = leaderboard.sort((a, b) => b.avgTotalScore - a.avgTotalScore);

    if (dimension) {
      sorted = sorted.filter(entry =>
        entry.avgDimensionScores[dimension] !== undefined
      );
      sorted.sort((a, b) =>
        (b.avgDimensionScores[dimension] || 0) - (a.avgDimensionScores[dimension] || 0)
      );
    }

    const paginated = sorted.slice(offset, offset + limit);

    return NextResponse.json({
      total: sorted.length,
      offset,
      limit,
      dimension: dimension || null,
      provider: provider || null,
      tier: tier || null,
      leaderboard: paginated,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dimension = searchParams.get('dimension');
    const platform = searchParams.get('platform');
    const tier = searchParams.get('tier');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const whereClause: Record<string, unknown> = {
      status: 'completed',
    };

    if (tier) {
      whereClause.tier = tier;
    }

    if (platform) {
      whereClause.agent = { platform };
    }

    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      include: {
        model: {
          select: { id: true, name: true, provider: true },
        },
        agent: {
          select: { id: true, name: true, platform: true, modelBackbone: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { totalScore: 'desc' },
    });

    // Each evaluation is a separate entry (agent instance ranking)
    const leaderboard = evaluations
      .filter(e => e.totalScore !== null && e.totalScore > 0)
      .map(evaluation => ({
        evaluationId: evaluation.id,
        sessionId: evaluation.sessionId,
        agent: evaluation.agent ? {
          id: evaluation.agent.id,
          name: evaluation.agent.name,
          platform: evaluation.agent.platform,
          modelBackbone: evaluation.agent.modelBackbone,
        } : null,
        model: {
          id: evaluation.model.id,
          name: evaluation.model.name,
          provider: evaluation.model.provider,
        },
        user: evaluation.user ? {
          name: evaluation.user.name || '匿名用户',
        } : null,
        totalScore: evaluation.totalScore,
        levelRating: evaluation.levelRating,
        tags: evaluation.tags,
        iqScore: evaluation.iqScore ?? 0,
        eqScore: evaluation.eqScore ?? 0,
        tqScore: evaluation.tqScore ?? 0,
        aqScore: evaluation.aqScore ?? 0,
        sqScore: evaluation.sqScore ?? 0,
        tier: evaluation.tier,
        completedAt: evaluation.completedAt,
      }));

    // Sort by dimension if specified
    let sorted = leaderboard;
    if (dimension) {
      const dimKey = `${dimension.toLowerCase()}Score` as 'iqScore' | 'eqScore' | 'tqScore' | 'aqScore' | 'sqScore';
      sorted = [...leaderboard].sort((a, b) => (b[dimKey] ?? 0) - (a[dimKey] ?? 0));
    }

    const paginated = sorted.slice(offset, offset + limit);

    // Calculate averages
    const allScores = leaderboard.map(e => e.totalScore ?? 0);
    const avgTotal = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) / allScores.length) : 0;
    const avgIq = leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, e) => s + e.iqScore, 0) / leaderboard.length) : 0;
    const avgEq = leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, e) => s + e.eqScore, 0) / leaderboard.length) : 0;
    const avgTq = leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, e) => s + e.tqScore, 0) / leaderboard.length) : 0;
    const avgAq = leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, e) => s + e.aqScore, 0) / leaderboard.length) : 0;
    const avgSq = leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, e) => s + e.sqScore, 0) / leaderboard.length) : 0;

    return NextResponse.json({
      total: sorted.length,
      offset,
      limit,
      dimension: dimension || null,
      platform: platform || null,
      tier: tier || null,
      leaderboard: paginated,
      averages: {
        total: avgTotal,
        iq: avgIq,
        eq: avgEq,
        tq: avgTq,
        aq: avgAq,
        sq: avgSq,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

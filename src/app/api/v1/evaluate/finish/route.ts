import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { determineLevelRating, determineMBTI, generateTags, generatePersonaQuote } from '@/lib/engine/scorer';

type DimensionKey = 'IQ' | 'EQ' | 'TQ' | 'AQ' | 'SQ';

interface DimensionAccumulator {
  total: number;
  count: number;
  subDimensions: Record<string, { total: number; count: number }>;
}

// Map old dimension names to parent dimensions
const DIM_TO_PARENT: Record<string, DimensionKey> = {
  reasoning: 'IQ', knowledge: 'IQ', math: 'IQ', instruction_following: 'IQ', context_learning: 'IQ', code: 'IQ',
  single_constraint: 'IQ', multi_constraint: 'IQ', format_compliance: 'IQ',
  math_reasoning: 'IQ', logical_reasoning: 'IQ', chain_of_thought: 'IQ',
  factual_accuracy: 'IQ', anti_hallucination: 'IQ', knowledge_depth: 'IQ',
  code_tracing: 'IQ', code_generation: 'IQ', code_debugging: 'IQ',
  eq: 'EQ', empathy: 'EQ', persona_consistency: 'EQ',
  emotion_recognition: 'EQ', empathetic_response: 'EQ', emotional_support: 'EQ',
  persona_maintenance: 'EQ', character_coherence: 'EQ', style_stability: 'EQ',
  intent_clarification: 'EQ', ambiguity_detection: 'EQ', proactive_probing: 'EQ',
  tool_execution: 'TQ', planning: 'TQ', task_completion: 'TQ',
  call_success_rate: 'TQ', parameter_accuracy: 'TQ', chain_stability: 'TQ',
  response_efficiency: 'TQ', step_decomposition: 'TQ', plan_coherence: 'TQ',
  adaptive_replanning: 'TQ', execution_completeness: 'TQ', result_accuracy: 'TQ', edge_case_handling: 'TQ',
  safety: 'AQ',
  dark_prompt_defense: 'AQ', implicit_jailbreak_defense: 'AQ',
  output_consistency: 'AQ', format_robustness: 'AQ', conflict_resolution: 'AQ', edge_resilience: 'AQ',
  self_reflection: 'SQ', creativity: 'SQ', reliability: 'SQ', ambiguity_handling: 'SQ',
  context_adaptation: 'SQ', preference_recall: 'SQ', transfer_learning: 'SQ',
  error_acknowledgement: 'SQ', self_correction: 'SQ', metacognition: 'SQ',
};

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
        agent: true,
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

    // Accumulate scores by parent dimension and sub-dimension
    const parentDims: Record<DimensionKey, DimensionAccumulator> = {
      IQ: { total: 0, count: 0, subDimensions: {} },
      EQ: { total: 0, count: 0, subDimensions: {} },
      TQ: { total: 0, count: 0, subDimensions: {} },
      AQ: { total: 0, count: 0, subDimensions: {} },
      SQ: { total: 0, count: 0, subDimensions: {} },
    };

    const subDimScores: Record<string, { total: number; count: number }> = {};

    for (const answer of answers) {
      const dim = answer.dimension || 'unknown';
      const score = answer.score ?? 0;

      // Track sub-dimension scores
      if (!subDimScores[dim]) {
        subDimScores[dim] = { total: 0, count: 0 };
      }
      subDimScores[dim].total += score;
      subDimScores[dim].count += 1;

      // Map to parent dimension
      const parent = DIM_TO_PARENT[dim] || 'IQ';
      parentDims[parent].total += score;
      parentDims[parent].count += 1;

      if (!parentDims[parent].subDimensions[dim]) {
        parentDims[parent].subDimensions[dim] = { total: 0, count: 0 };
      }
      parentDims[parent].subDimensions[dim].total += score;
      parentDims[parent].subDimensions[dim].count += 1;
    }

    // Calculate dimension scores (0-1000 scale)
    const dimensionScores: Record<string, number> = {};
    const dimensionKeys: DimensionKey[] = ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'];

    for (const key of dimensionKeys) {
      const dim = parentDims[key];
      if (dim && dim.count > 0) {
        dimensionScores[key] = Math.round((dim.total / dim.count) * 10);
      } else {
        dimensionScores[key] = 0;
      }
    }

    // Calculate sub-dimension scores (0-100 scale)
    const subDimensionScores: Record<string, number> = {};
    for (const [dimKey, dim] of Object.entries(subDimScores)) {
      subDimensionScores[dimKey] = dim.count > 0
        ? Math.round((dim.total / dim.count) * 100)
        : 0;
    }

    const validScores = dimensionKeys.map(k => dimensionScores[k]).filter(s => s > 0);
    const avgScore = validScores.length > 0
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length
      : 0;
    const totalScore = Math.round(avgScore);

    const levelRating = determineLevelRating(totalScore);
    const mbtiType = determineMBTI(dimensionScores);
    const tags = generateTags(dimensionScores);
    const personaQuote = generatePersonaQuote(dimensionScores, tags);

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
        tags,
        personaQuote,
        strengths: topStrengths as unknown as object,
        weaknesses: topWeaknesses as unknown as object,
      },
      include: {
        answers: true,
        model: true,
        agent: true,
      },
    });

    return NextResponse.json({
      sessionId: evaluation.sessionId,
      agentId: evaluation.agentId,
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
      tier: evaluation.tier,
      status: 'completed',
      totalScore,
      levelRating,
      mbtiType,
      tags,
      personaQuote,
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

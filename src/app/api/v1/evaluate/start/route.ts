import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getQuestionsForTier } from '@/lib/engine/question-bank';
import { encrypt } from '@/lib/engine/encrypt';
import { Tier } from '@/lib/types';
import crypto from 'crypto';

// Map parent dimensions to sub-dimension question categories
const PARENT_TO_SUBS: Record<string, string[]> = {
  IQ: ['reasoning', 'knowledge', 'math', 'instruction_following', 'context_learning', 'code'],
  EQ: ['eq', 'empathy', 'persona_consistency'],
  TQ: ['tool_execution', 'planning', 'task_completion'],
  AQ: ['safety'],
  SQ: ['self_reflection', 'creativity', 'reliability', 'ambiguity_handling'],
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: { user: true },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    const body = await req.json();
    const { modelId, tier, dimensions: requestedDimensions, agentId } = body as {
      modelId: string;
      tier: Tier;
      dimensions?: string[];
      agentId?: string;
    };

    if (!modelId || !tier) {
      return NextResponse.json({ error: 'modelId and tier are required' }, { status: 400 });
    }

    const validTiers: Tier[] = ['basic', 'standard', 'professional'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: 'tier must be basic, standard, or professional' }, { status: 400 });
    }

    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Validate agentId if provided
    let agent = null;
    if (agentId) {
      agent = await prisma.agent.findFirst({
        where: { id: agentId, userId: apiKey.user.id },
      });
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
    }

    // Get questions - either all for tier or filtered by dimensions
    let selectedQuestions: Array<{
      id: string; prompt: string; dimension: string; caseType: string;
      difficulty: string; expectedAnswerType: string; tier?: string;
    }> = [];

    if (requestedDimensions && requestedDimensions.length > 0) {
      // Single-dimension mode: get questions only from specified dimensions from DB
      const subDims: string[] = [];
      for (const dim of requestedDimensions) {
        const subs = PARENT_TO_SUBS[dim.toUpperCase()] ?? [dim.toLowerCase()];
        subDims.push(...subs);
      }

      const tierFilter: Record<string, unknown> = {};
      if (tier === 'basic') tierFilter.tier = 'basic';
      else if (tier === 'standard') tierFilter.tier = { in: ['basic', 'standard'] };

      const dbQuestions = await prisma.question.findMany({
        where: {
          dimension: { in: subDims },
          ...tierFilter,
        },
      });

      // Shuffle and limit
      const shuffled = dbQuestions.sort(() => Math.random() - 0.5);
      selectedQuestions = shuffled.slice(0, 50).map(q => ({
        id: q.id,
        prompt: q.prompt,
        dimension: q.dimension,
        caseType: q.caseType,
        difficulty: q.difficulty,
        expectedAnswerType: q.expectedAnswerType,
      }));
    } else {
      const questions = getQuestionsForTier(tier);
      selectedQuestions = questions.map(q => ({
        id: q.id,
        prompt: q.prompt,
        dimension: q.dimension,
        caseType: q.caseType,
        difficulty: q.difficulty,
        expectedAnswerType: q.expectedAnswerType,
      }));
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions available for the selected dimensions' }, { status: 400 });
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const encryptedQuestions = encrypt(JSON.stringify(selectedQuestions), encryptionKey);

    const evaluation = await prisma.evaluation.create({
      data: {
        userId: apiKey.user.id,
        modelId,
        agentId: agentId || null,
        sessionId,
        tier,
        status: 'pending',
        profileJson: encryptedQuestions as unknown as object,
      },
    });

    // Return both encrypted (for security) and plain questions (for agent convenience)
    return NextResponse.json({
      sessionId: evaluation.sessionId,
      tier,
      questionCount: selectedQuestions.length,
      dimensions: requestedDimensions ?? ['all'],
      // Return plain questions so the agent can answer directly
      questions: selectedQuestions,
    });
  } catch (error) {
    console.error('Evaluate start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

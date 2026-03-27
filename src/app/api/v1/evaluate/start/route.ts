import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getQuestionsForTier } from '@/lib/engine/question-bank';
import { encrypt } from '@/lib/engine/encrypt';
import { Tier } from '@/lib/types';
import crypto from 'crypto';

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
    const { modelId, tier } = body as { modelId: string; tier: Tier };

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

    const questions = getQuestionsForTier(tier);
    const sessionId = crypto.randomBytes(32).toString('hex');

    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const encryptedQuestions = encrypt(JSON.stringify(questions), encryptionKey);

    const evaluation = await prisma.evaluation.create({
      data: {
        userId: apiKey.user.id,
        modelId,
        sessionId,
        tier,
        status: 'pending',
        profileJson: encryptedQuestions as unknown as object,
      },
    });

    return NextResponse.json({
      sessionId: evaluation.sessionId,
      questions: encryptedQuestions,
      tier,
    });
  } catch (error) {
    console.error('Evaluate start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

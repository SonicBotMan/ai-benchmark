import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt, EncryptedBlob } from '@/lib/engine/encrypt';

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
        status: true,
        profileJson: true,
        answers: {
          select: { questionId: true },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 404 });
    }

    if (evaluation.status === 'completed') {
      return NextResponse.json({ error: 'Evaluation already completed', questions: [] }, { status: 400 });
    }

    if (!evaluation.profileJson) {
      return NextResponse.json({ error: 'No questions found for this session' }, { status: 404 });
    }

    // Decrypt the questions
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
    let questions;
    try {
      const blob = evaluation.profileJson as unknown as EncryptedBlob;
      const decrypted = decrypt(blob, encryptionKey);
      questions = JSON.parse(decrypted);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return NextResponse.json({ error: 'Failed to decrypt questions' }, { status: 500 });
    }

    // Filter out already-answered questions
    const answeredIds = new Set(evaluation.answers.map(a => a.questionId));
    const remaining = questions.filter((q: { id: string }) => !answeredIds.has(q.id));

    return NextResponse.json({
      sessionId,
      totalQuestions: questions.length,
      answeredCount: answeredIds.size,
      questions: remaining,
    });
  } catch (error) {
    console.error('Questions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

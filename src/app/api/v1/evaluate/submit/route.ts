import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ScorerEngine } from '@/lib/engine/scorer';
import { getQuestionById } from '@/lib/engine/question-bank';
import type { AnswerType } from '@/lib/types';

interface AnswerSubmission {
  questionId: string;
  answerType: string;
  answer: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, blockIndex, answers } = body as {
      sessionId: string;
      blockIndex: number;
      answers: AnswerSubmission[];
    };

    if (!sessionId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'sessionId and answers are required' }, { status: 400 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { sessionId },
      include: { model: true },
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 401 });
    }

    if (evaluation.status === 'completed' || evaluation.status === 'failed') {
      return NextResponse.json({ error: 'Evaluation already finished' }, { status: 400 });
    }

    if (evaluation.status === 'pending') {
      await prisma.evaluation.update({
        where: { id: evaluation.id },
        data: { status: 'running' },
      });
    }

    const scorer = new ScorerEngine();
    const results: Array<{ questionId: string; score: number; detail: Record<string, unknown> }> = [];

    for (const submission of answers) {
      const question = getQuestionById(submission.questionId);
      if (!question) {
        results.push({
          questionId: submission.questionId,
          score: 0,
          detail: { error: 'Question not found' },
        });
        continue;
      }

      const scoringResult = scorer.score(submission.answer, submission.answerType as AnswerType, question);

      await prisma.answer.create({
        data: {
          evaluationId: evaluation.id,
          questionId: submission.questionId,
          answerType: submission.answerType,
          answer: submission.answer,
          score: scoringResult.score,
          dimension: question.dimension,
          caseType: question.caseType,
          scoreDetail: scoringResult.detail as object,
          blockIndex,
        },
      });

      results.push({
        questionId: submission.questionId,
        score: scoringResult.score,
        detail: scoringResult.detail as Record<string, unknown>,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Evaluate submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

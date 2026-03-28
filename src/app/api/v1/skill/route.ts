import { NextRequest, NextResponse } from 'next/server';

const SKILL_MD = `# AI Benchmark Skill

This skill enables AI agents to participate in the AI Benchmark evaluation platform.

## Overview

The AI Benchmark evaluates AI models across 5 cognitive dimensions:
- **IQ** (Intelligence Quotient) - Logical reasoning, pattern recognition, mathematical ability
- **EQ** (Emotional Quotient) - Empathy, sentiment understanding, social reasoning
- **TQ** (Technical Quotient) - Code generation, debugging, system design
- **AQ** (Adaptability Quotient) - Transfer learning, context switching, novel problem solving
- **SQ** (Strategic Quotient) - Planning, prioritization, resource optimization

## Usage

### 1. Start an Evaluation

\`\`\`bash
POST /api/v1/evaluate/start
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "modelId": "your-model-id",
  "tier": "basic" | "standard" | "professional"
}
\`\`\`

### 2. Submit Answers

\`\`\`bash
POST /api/v1/evaluate/submit
Content-Type: application/json

{
  "sessionToken": "session-token-from-start",
  "blockIndex": 0,
  "answers": [
    {
      "questionId": "q-001",
      "answerType": "multiple-choice",
      "answer": "A",
      "thinkingTime": 5000
    }
  ]
}
\`\`\`

### 3. Finish Evaluation

\`\`\`bash
POST /api/v1/evaluate/finish
Content-Type: application/json

{
  "sessionToken": "session-token-from-start"
}
\`\`\`

### 4. Check Status

\`\`\`bash
GET /api/v1/evaluate/status?sessionToken=your-session-token
\`\`\`

## Tiers

| Tier | Questions | Time Limit | Dimensions |
|------|-----------|------------|------------|
| basic | 10 | 10 min | IQ, EQ |
| standard | 25 | 30 min | IQ, EQ, TQ, AQ |
| professional | 50 | 60 min | IQ, EQ, TQ, AQ, SQ |

## Scoring

- Each question is scored 0-100
- Dimension scores are averaged across questions in that dimension
- Total score (0-1000) = average of dimension scores × 10

## Level Ratings

| Score | Rating |
|-------|--------|
| 0-399 | Novice |
| 400-599 | Proficient |
| 600-799 | Expert |
| 800-1000 | Master |
`;

export async function GET(_req: NextRequest) {
  try {
    const skillPackage = {
      name: 'ai-benchmark',
      version: '1.0.0',
      description: 'AI agent benchmark evaluation skill',
      files: [
        {
          path: 'SKILL.md',
          content: SKILL_MD,
          type: 'documentation',
        },
        {
          path: 'engine/scorer.ts',
          content: `import { Question, ModelInfo, ScoringResult } from './types';

export class ScorerEngine {
  async score(params: {
    question: Question;
    answer: string;
    answerType: string;
    model: ModelInfo;
  }): Promise<ScoringResult> {
    const { question, answer } = params;

    if (question.type === 'multiple-choice') {
      const isCorrect = answer.trim().toUpperCase() === question.correctAnswer?.toUpperCase();
      return {
        score: isCorrect ? 100 : 0,
        detail: { correct: isCorrect, expected: question.correctAnswer, received: answer },
      };
    }

    if (question.type === 'true-false') {
      const normalized = answer.trim().toLowerCase();
      const isCorrect = normalized === String(question.correctAnswer).toLowerCase();
      return {
        score: isCorrect ? 100 : 0,
        detail: { correct: isCorrect, expected: question.correctAnswer, received: answer },
      };
    }

    if (question.type === 'open-ended') {
      const rubric = question.scoringRubric || [];
      let score = 0;
      const matchedCriteria: string[] = [];

      for (const criterion of rubric) {
        const keywords = criterion.keywords || [];
        const matched = keywords.some(kw =>
          answer.toLowerCase().includes(kw.toLowerCase())
        );
        if (matched) {
          score += criterion.points;
          matchedCriteria.push(criterion.name);
        }
      }

      return {
        score: Math.min(100, score),
        detail: { matchedCriteria, maxPossible: rubric.reduce((s, c) => s + c.points, 0) },
      };
    }

    return { score: 0, detail: { error: 'Unknown question type' } };
  }
}`,
          type: 'engine',
        },
        {
          path: 'engine/question-bank.ts',
          content: `import { Question, EvaluationTier } from './types';

export function getQuestionsForTier(tier: EvaluationTier): Question[] {
  // Implementation would load from question bank
  // This is a placeholder for the skill package
  throw new Error('Question bank not available in skill package');
}

export function getQuestionById(id: string): Question | undefined {
  throw new Error('Question bank not available in skill package');
}`,
          type: 'engine',
        },
        {
          path: 'engine/types.ts',
          content: `export type EvaluationTier = 'basic' | 'standard' | 'professional';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'open-ended';
  dimension: string;
  subDimension: string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  scoringRubric?: Array<{
    name: string;
    keywords: string[];
    points: number;
  }>;
  tier: EvaluationTier;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export interface ScoringResult {
  score: number;
  detail: Record<string, unknown>;
}`,
          type: 'types',
        },
      ],
      endpoints: {
        start: '/api/v1/evaluate/start',
        submit: '/api/v1/evaluate/submit',
        finish: '/api/v1/evaluate/finish',
        status: '/api/v1/evaluate/status',
        leaderboard: '/api/v1/leaderboard',
        reports: '/api/v1/reports/:id',
      },
    };

    return NextResponse.json({
      ...skillPackage,
      tools: {
        openai: [
          {
            type: 'function',
            function: {
              name: 'ai_benchmark_start',
              description: 'Start a new AI Benchmark evaluation session. Returns session ID and questions.',
              parameters: {
                type: 'object',
                properties: {
                  modelId: { type: 'string', description: 'The model ID to evaluate' },
                  tier: { type: 'string', enum: ['basic', 'standard', 'professional'], description: 'Evaluation tier' },
                  dimensions: { type: 'array', items: { type: 'string' }, description: 'Optional: filter by dimensions (IQ, EQ, TQ, AQ, SQ)' },
                },
                required: ['modelId', 'tier'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'ai_benchmark_submit',
              description: 'Submit answers to evaluation questions. Each answer gets a score and grade (A/B/C/D).',
              parameters: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string', description: 'Session ID from start' },
                  blockIndex: { type: 'number', description: 'Block index (usually 0)' },
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionId: { type: 'string' },
                        answerType: { type: 'string', enum: ['text', 'tool_call', 'refusal'] },
                        answer: { type: 'string', description: 'Your answer text' },
                      },
                      required: ['questionId', 'answerType', 'answer'],
                    },
                  },
                },
                required: ['sessionId', 'blockIndex', 'answers'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'ai_benchmark_finish',
              description: 'Finish the evaluation and generate the final report with scores, MBTI type, and optimization tips.',
              parameters: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string', description: 'Session ID from start' },
                },
                required: ['sessionId'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'ai_benchmark_status',
              description: 'Check the status and scores of an evaluation session.',
              parameters: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string', description: 'Session ID to check' },
                },
                required: ['sessionId'],
              },
            },
          },
        ],
        anthropic: [
          {
            name: 'ai_benchmark_start',
            description: 'Start a new AI Benchmark evaluation session.',
            input_schema: {
              type: 'object',
              properties: {
                modelId: { type: 'string', description: 'The model ID to evaluate' },
                tier: { type: 'string', enum: ['basic', 'standard', 'professional'] },
                dimensions: { type: 'array', items: { type: 'string' } },
              },
              required: ['modelId', 'tier'],
            },
          },
          {
            name: 'ai_benchmark_submit',
            description: 'Submit answers to evaluation questions.',
            input_schema: {
              type: 'object',
              properties: {
                sessionId: { type: 'string' },
                blockIndex: { type: 'number' },
                answers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      questionId: { type: 'string' },
                      answerType: { type: 'string', enum: ['text', 'tool_call', 'refusal'] },
                      answer: { type: 'string' },
                    },
                  },
                },
              },
              required: ['sessionId', 'blockIndex', 'answers'],
            },
          },
          {
            name: 'ai_benchmark_finish',
            description: 'Finish the evaluation and generate the final report.',
            input_schema: {
              type: 'object',
              properties: { sessionId: { type: 'string' } },
              required: ['sessionId'],
            },
          },
          {
            name: 'ai_benchmark_status',
            description: 'Check evaluation session status.',
            input_schema: {
              type: 'object',
              properties: { sessionId: { type: 'string' } },
              required: ['sessionId'],
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Skill error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

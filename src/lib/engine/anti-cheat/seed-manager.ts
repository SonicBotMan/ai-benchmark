import crypto from 'crypto';
import type { Question } from '@/lib/types';

export interface AntiCheatMetadata {
  sessionId: string;
  seed: string;
  questionOrder: string[];
  questionVariants: Record<string, number>;
  generatedAt: string;
  expiresAt: string;
}

export interface SeedValidationResult {
  isValid: boolean;
  reason?: string;
  anomalyScore: number;
}

export class SeedManager {
  generateSessionSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  randomizeQuestions(questions: Question[], seed: string): Question[] {
    const shuffled = [...questions];
    const rng = this.createSeededRandom(seed);

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  generateQuestionVariants(question: Question, seed: string): Question[] {
    const rng = this.createSeededRandom(seed + question.id);
    const variantCount = 2 + Math.floor(rng() * 2);
    const variants: Question[] = [];

    for (let i = 0; i < variantCount; i++) {
      variants.push({
        ...question,
        id: `${question.id}_v${i}`,
        prompt: this.rephraseQuestion(question.prompt, seed, i),
      });
    }

    return variants;
  }

  createMetadata(sessionId: string, questions: Question[]): AntiCheatMetadata {
    const seed = this.generateSessionSeed();
    const randomized = this.randomizeQuestions(questions, seed);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return {
      sessionId,
      seed,
      questionOrder: randomized.map(q => q.id),
      questionVariants: {},
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }

  validateSeedConsistency(
    submittedQuestionId: string,
    metadata: AntiCheatMetadata
  ): SeedValidationResult {
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);

    if (now > expiresAt) {
      return { isValid: false, reason: 'Session expired', anomalyScore: 80 };
    }

    if (!metadata.questionOrder.includes(submittedQuestionId)) {
      return { isValid: false, reason: 'Invalid question ID', anomalyScore: 90 };
    }

    return { isValid: true, anomalyScore: 0 };
  }

  private createSeededRandom(seed: string): () => number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    }
    return () => {
      h = (h * 16807) % 2147483647;
      return (h - 1) / 2147483646;
    };
  }

  private rephraseQuestion(prompt: string, seed: string, variantIndex: number): string {
    const prefixes = ['', '请回答以下问题：', '问题：', '请问：'];
    const prefix = prefixes[variantIndex % prefixes.length];

    if (prefix) {
      return `${prefix}${prompt}`;
    }

    return prompt;
  }
}

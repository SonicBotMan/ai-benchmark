import crypto from 'crypto';
import type { Question } from '@/lib/types';

export interface TrapQuestion extends Question {
  isTrapQuestion: boolean;
  originalQuestionId: string;
}

export interface TrapConsistencyResult {
  isConsistent: boolean;
  similarity: number;
  trapQuestionId: string;
  originalQuestionId: string;
}

export class TrapInjector {
  selectTrapQuestions(questions: Question[], count: number = 3): Question[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  generateTrapVariant(original: Question, seed: string): TrapQuestion {
    const rng = this.createSeededRandom(seed + original.id);
    const variantIndex = Math.floor(rng() * 3);

    const prompts = [
      original.prompt,
      `请仔细思考后回答：${original.prompt}`,
      `${original.prompt}（请给出详细回答）`,
    ];

    return {
      ...original,
      id: `${original.id}_trap_${crypto.randomBytes(4).toString('hex')}`,
      prompt: prompts[variantIndex % prompts.length],
      isTrapQuestion: true,
      originalQuestionId: original.id,
    };
  }

  checkTrapConsistency(
    originalAnswer: string,
    trapAnswer: string
  ): TrapConsistencyResult {
    const similarity = this.calculateSimilarity(originalAnswer, trapAnswer);

    return {
      isConsistent: similarity >= 0.6,
      similarity,
      trapQuestionId: '',
      originalQuestionId: '',
    };
  }

  injectTraps(questions: Question[], seed: string, trapCount: number = 3): Question[] {
    const traps = this.selectTrapQuestions(questions, trapCount);
    const trapVariants = traps.map(t => this.generateTrapVariant(t, seed));

    const result = [...questions];
    for (let i = 0; i < trapVariants.length && i < result.length; i++) {
      const insertIndex = Math.floor((result.length / (trapVariants.length + 1)) * (i + 1));
      result.splice(insertIndex, 0, trapVariants[i]);
    }

    return result;
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

  private calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    if (text1 === text2) return 1;

    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

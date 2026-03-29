export interface ConsistencyResult {
  isConsistent: boolean;
  inconsistencyScore: number;
  flaggedQuestions: Array<{
    questionId: string;
    answerSimilarity: number;
    reason: string;
  }>;
}

export interface AnswerForConsistency {
  questionId: string;
  answer: string;
  score: number;
  timestamp: string;
}

export class ConsistencyValidator {
  checkConsistency(currentAnswers: AnswerForConsistency[], previousAnswers: AnswerForConsistency[]): ConsistencyResult {
    if (!previousAnswers || previousAnswers.length === 0) {
      return { isConsistent: true, inconsistencyScore: 0, flaggedQuestions: [] };
    }

    const flaggedQuestions: Array<{
      questionId: string;
      answerSimilarity: number;
      reason: string;
    }> = [];

    let totalInconsistency = 0;
    let comparedCount = 0;

    for (const current of currentAnswers) {
      const previous = previousAnswers.find(p => p.questionId === current.questionId);
      if (!previous) continue;

      const similarity = this.calculateSimilarity(current.answer, previous.answer);
      const scoreDiff = Math.abs(current.score - previous.score);

      if (similarity < 0.3 || scoreDiff > 30) {
        flaggedQuestions.push({
          questionId: current.questionId,
          answerSimilarity: similarity,
          reason: similarity < 0.3
            ? 'Significantly different answers for same question'
            : 'Score difference too large',
        });
        totalInconsistency += (1 - similarity);
      }

      comparedCount++;
    }

    const inconsistencyScore = comparedCount > 0 ? totalInconsistency / comparedCount : 0;

    return {
      isConsistent: flaggedQuestions.length === 0,
      inconsistencyScore: Math.min(1, inconsistencyScore),
      flaggedQuestions,
    };
  }

  calculateSimilarity(answer1: string, answer2: string): number {
    if (!answer1 || !answer2) return 0;
    if (answer1 === answer2) return 1;

    const words1 = new Set(answer1.toLowerCase().split(/\s+/));
    const words2 = new Set(answer2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

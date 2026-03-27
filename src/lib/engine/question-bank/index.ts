import type { Question, SubDimension, Tier } from '@/lib/types';
import { reasoningQuestions } from './iq/reasoning';
import { knowledgeQuestions } from './iq/knowledge';
import { mathQuestions } from './iq/math';
import { instructionFollowingQuestions } from './iq/instruction-following';
import { contextLearningQuestions } from './iq/context-learning';
import { eqQuestions } from './eq/eq';
import { empathyQuestions } from './eq/empathy';
import { personaConsistencyQuestions } from './eq/persona-consistency';
import { toolExecutionQuestions } from './tq/tool-execution';
import { planningQuestions } from './tq/planning';
import { taskCompletionQuestions } from './tq/task-completion';
import { safetyQuestions } from './aq/safety';
import { selfReflectionQuestions } from './sq/self-reflection';
import { creativityQuestions } from './sq/creativity';
import { reliabilityQuestions } from './sq/reliability';
import { ambiguityHandlingQuestions } from './sq/ambiguity-handling';
import { codeQuestions } from './iq/code';

const ALL_QUESTIONS: Record<string, Question[]> = {
  reasoning: reasoningQuestions,
  knowledge: knowledgeQuestions,
  math: mathQuestions,
  instruction_following: instructionFollowingQuestions,
  context_learning: contextLearningQuestions,
  eq: eqQuestions,
  empathy: empathyQuestions,
  persona_consistency: personaConsistencyQuestions,
  tool_execution: toolExecutionQuestions,
  planning: planningQuestions,
  task_completion: taskCompletionQuestions,
  safety: safetyQuestions,
  self_reflection: selfReflectionQuestions,
  creativity: creativityQuestions,
  reliability: reliabilityQuestions,
  ambiguity_handling: ambiguityHandlingQuestions,
  code: codeQuestions,
};

const TIER_QUESTION_COUNTS: Record<Tier, number> = {
  basic: 20,
  standard: 30,
  professional: 50,
};

export function getQuestionsForTier(tier: Tier): Question[] {
  const totalNeeded = TIER_QUESTION_COUNTS[tier];
  const dimensions = Object.keys(ALL_QUESTIONS) as SubDimension[];
  const questionsPerDimension = Math.ceil(totalNeeded / dimensions.length);

  const selected: Question[] = [];

  for (const dim of dimensions) {
    const pool = ALL_QUESTIONS[dim].filter(q => {
      if (tier === 'basic') return q.tier === 'basic';
      if (tier === 'standard') return q.tier === 'basic' || q.tier === 'standard';
      return true; // professional gets all
    });

    // Shuffle and pick
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, questionsPerDimension));
  }

  // Shuffle final selection and trim to exact count
  return selected.sort(() => Math.random() - 0.5).slice(0, totalNeeded);
}

export function getQuestionsByDimension(dimension: SubDimension, count: number): Question[] {
  const pool = ALL_QUESTIONS[dimension] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAllQuestions(): Question[] {
  return Object.values(ALL_QUESTIONS).flat();
}

export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find(q => q.id === id);
}

export function getQuestionBankStats() {
  const stats: Record<string, { total: number; byDifficulty: Record<string, number> }> = {};

  for (const [dim, questions] of Object.entries(ALL_QUESTIONS)) {
    stats[dim] = {
      total: questions.length,
      byDifficulty: {
        easy: questions.filter(q => q.difficulty === 'easy').length,
        medium: questions.filter(q => q.difficulty === 'medium').length,
        hard: questions.filter(q => q.difficulty === 'hard').length,
      },
    };
  }

  return stats;
}

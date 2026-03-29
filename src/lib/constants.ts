import type { LevelRating } from '@/lib/types';

// Level styles for badges/cards
export const LEVEL_STYLES: Record<LevelRating, string> = {
  bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  platinum: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  diamond: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  master: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
};

// Level styles for report page (card gradient + badge)
export const LEVEL_STYLES_FULL: Record<LevelRating, { card: string; badge: string; emoji: string }> = {
  bronze: { card: 'from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900/30', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', emoji: '🥉' },
  silver: { card: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900/30', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', emoji: '🥈' },
  gold: { card: 'from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900/30', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', emoji: '🥇' },
  platinum: { card: 'from-cyan-100 to-cyan-50 dark:from-cyan-950 dark:to-cyan-900/30', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300', emoji: '💎' },
  diamond: { card: 'from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900/30', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', emoji: '💠' },
  master: { card: 'from-purple-100 to-pink-50 dark:from-purple-950 dark:to-pink-900/30', badge: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', emoji: '👑' },
};

export const LEVEL_EMOJI: Record<LevelRating, string> = {
  bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠', master: '👑',
};

export const PLATFORM_ICONS: Record<string, string> = {
  openclaw: '🐾', cursor: '⌨️', 'claude-code': '🟠', custom: '🔧',
};

export const RADAR_COLORS = ['#6366f1', '#f59e0b', '#10b981'];

// Dimension to parent dimension mapping (single source of truth)
export type DimensionKey = 'IQ' | 'EQ' | 'TQ' | 'AQ' | 'SQ';

export const DIM_TO_PARENT: Record<string, DimensionKey> = {
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

// Reverse mapping: parent → sub-dimensions
export const PARENT_TO_SUBS: Record<DimensionKey, string[]> = {
  IQ: ['reasoning', 'knowledge', 'math', 'instruction_following', 'context_learning', 'code'],
  EQ: ['eq', 'empathy', 'persona_consistency'],
  TQ: ['tool_execution', 'planning', 'task_completion'],
  AQ: ['safety'],
  SQ: ['self_reflection', 'creativity', 'reliability', 'ambiguity_handling'],
};

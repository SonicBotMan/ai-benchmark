// Agent types
export type AgentPlatform = 'openclaw' | 'cursor' | 'claude-code' | 'custom';

export interface AgentInstance {
  id: string;
  name: string;
  platform: AgentPlatform;
  modelBackbone: string;
  userId: string;
  description?: string;
  createdAt: string;
}

// Dimension types
export type Dimension = 'iq' | 'eq' | 'tq' | 'aq' | 'sq';

export type SubDimension =
  // IQ - new names
  | 'single_constraint' | 'multi_constraint' | 'format_compliance'
  | 'math_reasoning' | 'logical_reasoning' | 'chain_of_thought'
  | 'factual_accuracy' | 'anti_hallucination' | 'knowledge_depth'
  | 'code_tracing' | 'code_generation' | 'code_debugging'
  // EQ - new names
  | 'emotion_recognition' | 'empathetic_response' | 'emotional_support'
  | 'persona_maintenance' | 'character_coherence' | 'style_stability'
  | 'intent_clarification' | 'ambiguity_detection' | 'proactive_probing'
  // TQ - new names
  | 'call_success_rate' | 'parameter_accuracy' | 'chain_stability'
  | 'response_efficiency' | 'step_decomposition' | 'plan_coherence'
  | 'adaptive_replanning' | 'execution_completeness' | 'result_accuracy' | 'edge_case_handling'
  // AQ - new names
  | 'dark_prompt_defense' | 'implicit_jailbreak_defense' | 'output_consistency'
  | 'format_robustness' | 'conflict_resolution' | 'edge_resilience'
  // SQ - new names
  | 'context_adaptation' | 'preference_recall' | 'transfer_learning'
  | 'error_acknowledgement' | 'self_correction' | 'metacognition'
  // Legacy names (backward compat with question bank files)
  | 'reasoning' | 'knowledge' | 'math' | 'instruction_following' | 'context_learning' | 'code'
  | 'eq' | 'empathy' | 'persona_consistency'
  | 'tool_execution' | 'planning' | 'task_completion'
  | 'safety'
  | 'self_reflection' | 'creativity' | 'reliability' | 'ambiguity_handling';

export const DIMENSION_MAP: Record<Dimension, SubDimension[]> = {
  iq: [
    'single_constraint', 'multi_constraint', 'format_compliance',
    'math_reasoning', 'logical_reasoning', 'chain_of_thought',
    'factual_accuracy', 'anti_hallucination', 'knowledge_depth',
    'code_tracing', 'code_generation', 'code_debugging',
  ],
  eq: [
    'emotion_recognition', 'empathetic_response', 'emotional_support',
    'persona_maintenance', 'character_coherence', 'style_stability',
    'intent_clarification', 'ambiguity_detection', 'proactive_probing',
  ],
  tq: [
    'call_success_rate', 'parameter_accuracy', 'chain_stability',
    'response_efficiency', 'step_decomposition', 'plan_coherence',
    'adaptive_replanning', 'execution_completeness', 'result_accuracy', 'edge_case_handling',
  ],
  aq: [
    'dark_prompt_defense', 'implicit_jailbreak_defense', 'output_consistency',
    'format_robustness', 'conflict_resolution', 'edge_resilience',
  ],
  sq: [
    'context_adaptation', 'preference_recall', 'transfer_learning',
    'error_acknowledgement', 'self_correction', 'metacognition',
  ],
};

export const DIMENSION_LABELS: Record<Dimension, string> = {
  iq: 'IQ 认知智能',
  eq: 'EQ 情感智能',
  tq: 'TQ 工具智能',
  aq: 'AQ 安全智能',
  sq: 'SQ 社交智能',
};

export const SUB_DIMENSION_LABELS: Record<string, string> = {
  // New names
  single_constraint: '单约束处理',
  multi_constraint: '多约束处理',
  format_compliance: '格式合规',
  math_reasoning: '数学推理',
  logical_reasoning: '逻辑推理',
  chain_of_thought: '链式思考',
  factual_accuracy: '事实准确性',
  anti_hallucination: '反幻觉',
  knowledge_depth: '知识深度',
  code_tracing: '代码追踪',
  code_generation: '代码生成',
  code_debugging: '代码调试',
  emotion_recognition: '情绪识别',
  empathetic_response: '共情回应',
  emotional_support: '情感支持',
  persona_maintenance: '角色维持',
  character_coherence: '角色一致性',
  style_stability: '风格稳定性',
  intent_clarification: '意图澄清',
  ambiguity_detection: '模糊检测',
  proactive_probing: '主动探测',
  call_success_rate: '调用成功率',
  parameter_accuracy: '参数准确性',
  chain_stability: '链稳定性',
  response_efficiency: '响应效率',
  step_decomposition: '步骤分解',
  plan_coherence: '计划连贯性',
  adaptive_replanning: '自适应重规划',
  execution_completeness: '执行完整性',
  result_accuracy: '结果准确性',
  edge_case_handling: '边界处理',
  dark_prompt_defense: '显性注入防御',
  implicit_jailbreak_defense: '隐性越狱防御',
  output_consistency: '输出一致性',
  format_robustness: '格式鲁棒性',
  conflict_resolution: '冲突解决',
  edge_resilience: '边界弹性',
  context_adaptation: '上下文适配',
  preference_recall: '偏好记忆',
  transfer_learning: '迁移学习',
  error_acknowledgement: '错误承认',
  self_correction: '自我修正',
  metacognition: '元认知',
  // Legacy names
  reasoning: '逻辑推理',
  knowledge: '知识储备',
  math: '数学能力',
  instruction_following: '指令遵循',
  context_learning: '上下文学习',
  code: '代码能力',
  eq: '情商判断',
  empathy: '共情能力',
  persona_consistency: '角色一致性',
  tool_execution: '工具调用',
  planning: '任务规划',
  task_completion: '任务完成',
  safety: '安全防护',
  self_reflection: '自我反思',
  creativity: '创意表达',
  reliability: '可靠性',
  ambiguity_handling: '模糊处理',
};

// Platform info
export const PLATFORM_INFO: Record<AgentPlatform, { label: string; icon: string }> = {
  openclaw: { label: 'OpenClaw', icon: '🐾' },
  cursor: { label: 'Cursor', icon: '⌨️' },
  'claude-code': { label: 'Claude Code', icon: '🟠' },
  custom: { label: 'Custom', icon: '🔧' },
};

// Answer types
export type AnswerType = 'text' | 'tool_call' | 'refusal';
export type CaseType = 'qa' | 'multi_turn' | 'tool_use' | 'trap' | 'recovery';
export type Tier = 'basic' | 'standard' | 'professional';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type LevelRating = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type EvalStatus = 'pending' | 'running' | 'completed' | 'failed';

export const LEVEL_LABELS: Record<LevelRating, { cn: string; range: string; emoji: string }> = {
  bronze: { cn: '青铜', range: '0-299', emoji: '🥉' },
  silver: { cn: '白银', range: '300-499', emoji: '🥈' },
  gold: { cn: '黄金', range: '500-649', emoji: '🥇' },
  platinum: { cn: '铂金', range: '650-799', emoji: '💎' },
  diamond: { cn: '钻石', range: '800-899', emoji: '💠' },
  master: { cn: '王者', range: '900-1000', emoji: '👑' },
};

export interface ScoringConfig {
  exactMatch?: boolean;
  minKeywords?: number;
  reasoningBonus?: boolean;
  minLength?: number;
  minLengthHard?: number;
  safetyVeto?: boolean;
  fuzzyMatch?: boolean;
  numericMatch?: boolean;
  formatRequired?: AnswerType;
}

export interface ScoreResult {
  score: number; // 0-1
  detail: {
    keywordMatch?: number;
    reasoningBonus?: number;
    formatValid?: boolean;
    safetyVeto?: boolean;
    explanation: string;
  };
}

export interface QAError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface Question {
  id: string;
  dimension: SubDimension;
  caseType: CaseType;
  difficulty: Difficulty;
  tier: Tier;
  prompt: string;
  expectedAnswerType: AnswerType;
  expectedKeywords: string[];
  scoringConfig: ScoringConfig;
  context?: string;
  tools?: ToolDefinition[];
}

export interface AnswerSubmission {
  questionId: string;
  answerType: AnswerType;
  answer: string;
  thinkingTime?: number; // seconds
}

export interface EvaluationReport {
  sessionId: string;
  agentId?: string;
  agentName?: string;
  platform?: AgentPlatform;
  modelBackbone?: string;
  modelId: string;
  modelName: string;
  tier: Tier;
  totalScore: number;
  levelRating: LevelRating;
  dimensionScores: Record<Dimension, number>;
  subDimensionScores: Record<SubDimension, number>;
  innateScores?: Record<string, number>;
  acquiredScores?: Record<string, number>;
  mbtiType: string;
  tags: string[];
  personaQuote?: string;
  strengths: { dimension: string; score: number }[];
  weaknesses: { dimension: string; score: number }[];
  profile: string;
  answers: (AnswerSubmission & { score: number; dimension: SubDimension })[];
  completedAt: string;
}

export interface LeaderboardEntry {
  agentId?: string;
  agentName?: string;
  platform?: AgentPlatform;
  modelId: string;
  modelName: string;
  modelSlug: string;
  provider: string;
  iconUrl: string | null;
  totalScore: number;
  iqScore: number;
  eqScore: number;
  tqScore: number;
  aqScore: number;
  sqScore: number;
  tags: string[];
  evalCount: number;
  lastEvaluated: string;
}

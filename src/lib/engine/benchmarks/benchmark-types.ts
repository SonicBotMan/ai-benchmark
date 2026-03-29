import type { Question } from '@/lib/types';

export enum BenchmarkType {
  IFEval = 'ifeval',
  GSM8K = 'gsm8k',
  TruthfulQA = 'truthfulqa',
  HumanEval = 'humaneval',
  AgentBench = 'agentbench',
  HarmBench = 'harmbench',
}

export interface BenchmarkQuestion extends Question {
  benchmark: BenchmarkType;
  benchmarkCategory: string;
  benchmarkSource: string;
}

export interface BenchmarkScore {
  benchmark: BenchmarkType;
  score: number;
  maxScore: number;
  percentage: number;
  questionCount: number;
  categoryScores: Record<string, number>;
}

export const BENCHMARK_INFO: Record<BenchmarkType, { name: string; fullName: string; source: string; dimension: string; description: string }> = {
  [BenchmarkType.IFEval]: {
    name: 'IFEval',
    fullName: 'Instruction Following Evaluation',
    source: 'Google · 2023',
    dimension: 'IQ · 指令跟随',
    description: '541 道可验证指令遵循题，精确量化 Agent 执行明确约束的能力',
  },
  [BenchmarkType.GSM8K]: {
    name: 'GSM8K',
    fullName: 'Grade School Math 8K',
    source: 'NeurIPS · 2021',
    dimension: 'IQ · 逻辑推理',
    description: '8500 道数学应用题，考察多步连锁推理能力',
  },
  [BenchmarkType.TruthfulQA]: {
    name: 'TruthfulQA',
    fullName: 'Truthful Question Answering',
    source: 'ACL · 2022',
    dimension: 'IQ · 知识真实性',
    description: '817 道事实性问题，评估知识储备与抗幻觉能力',
  },
  [BenchmarkType.HumanEval]: {
    name: 'HumanEval',
    fullName: 'Human Evaluation',
    source: 'OpenAI · 2021',
    dimension: 'IQ · 代码执行',
    description: '164 个 Python 函数行为预测题，测试代码生成与追踪能力',
  },
  [BenchmarkType.AgentBench]: {
    name: 'AgentBench',
    fullName: 'Agent Benchmark',
    source: '清华大学 · 2023',
    dimension: 'TQ · 工具调用',
    description: '8 类真实环境下的 Agent 任务基准，含数据库、网页、OS 操作',
  },
  [BenchmarkType.HarmBench]: {
    name: 'HarmBench',
    fullName: 'Harmful Benchmark',
    source: 'UCSD · 2024',
    dimension: 'AQ · 安全合规',
    description: '510 个有害请求 + 越狱攻击向量，评测安全防御与边界保持能力',
  },
};

export function getBenchmarkInfo(type: BenchmarkType) {
  return BENCHMARK_INFO[type];
}

export function getAllBenchmarkTypes(): BenchmarkType[] {
  return Object.values(BenchmarkType);
}

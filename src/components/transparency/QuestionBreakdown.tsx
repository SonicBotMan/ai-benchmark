'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BENCHMARK_INFO, type BenchmarkType } from '@/lib/engine/benchmarks/benchmark-types';

interface QuestionBreakdownProps {
  totalQuestions: number;
  dimensions: Record<string, { count: number; subDimensions: Record<string, number> }>;
  benchmarks?: BenchmarkType[];
}

export default function QuestionBreakdown({
  totalQuestions,
  dimensions,
  benchmarks = [],
}: QuestionBreakdownProps) {
  const dimLabels: Record<string, { emoji: string; name: string }> = {
    IQ: { emoji: '🧠', name: '智识力' },
    EQ: { emoji: '💜', name: '情商力' },
    TQ: { emoji: '🛠', name: '工具力' },
    AQ: { emoji: '🛡', name: '安全力' },
    SQ: { emoji: '🌐', name: '社交力' },
  };

  const subDimLabels: Record<string, string> = {
    reasoning: '逻辑推理',
    knowledge: '知识储备',
    math: '数学计算',
    instruction_following: '指令跟随',
    context_learning: '上下文学习',
    code: '代码执行',
    eq: '情商',
    empathy: '共情能力',
    persona_consistency: '人格一致性',
    tool_execution: '工具调用',
    planning: '规划分解',
    task_completion: '任务完成',
    safety: '安全合规',
    self_reflection: '自我反思',
    creativity: '创造力',
    reliability: '可靠性',
    ambiguity_handling: '模糊处理',
  };

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <h2 className="mb-4 text-lg font-semibold">📋 评测用例构成</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          共 {totalQuestions} 道题，覆盖 5 大维度 · 每次评测随机种子不同
        </p>

        <div className="space-y-4">
          {Object.entries(dimensions).map(([dim, { count, subDimensions }]) => {
            const label = dimLabels[dim];
            if (!label) return null;

            return (
              <div key={dim} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">{label.emoji}</span>
                  <span className="font-medium">{label.name}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {count} 道题
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(subDimensions).map(([sub, subCount]) => (
                    <span
                      key={sub}
                      className="rounded bg-muted px-2 py-1 text-xs"
                    >
                      {subDimLabels[sub] || sub}: {subCount}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {benchmarks.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium">学术基准对齐</h3>
            <div className="flex flex-wrap gap-2">
              {benchmarks.map(benchmark => {
                const info = BENCHMARK_INFO[benchmark];
                if (!info) return null;

                return (
                  <span
                    key={benchmark}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    ✅ {info.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

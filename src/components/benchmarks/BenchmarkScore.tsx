'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BENCHMARK_INFO, type BenchmarkType } from '@/lib/engine/benchmarks/benchmark-types';

interface BenchmarkScoreProps {
  scores: Array<{
    benchmark: BenchmarkType;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
}

export default function BenchmarkScore({ scores }: BenchmarkScoreProps) {
  if (scores.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <h2 className="mb-4 text-lg font-semibold">📊 学术基准对齐</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          评测用例设计参考国际学术标准，确保评估的科学性和可信度
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scores.map(({ benchmark, score, maxScore, percentage }) => {
            const info = BENCHMARK_INFO[benchmark];
            if (!info) return null;

            return (
              <div key={benchmark} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{info.name}</span>
                  <span className="text-sm text-muted-foreground">{info.source}</span>
                </div>
                <div className="mb-1 text-2xl font-bold">{percentage}%</div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {info.dimension} · {score}/{maxScore} 分
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{info.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

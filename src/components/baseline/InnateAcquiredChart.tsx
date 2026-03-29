'use client';

import { Card, CardContent } from '@/components/ui/card';

interface InnateAcquiredChartProps {
  innateScores: Record<string, number>;
  acquiredScores: Record<string, number>;
  totalScores: Record<string, number>;
}

export default function InnateAcquiredChart({
  innateScores,
  acquiredScores,
  totalScores,
}: InnateAcquiredChartProps) {
  const dimensions = ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'];
  const labels: Record<string, string> = {
    IQ: '🧠 智识力',
    EQ: '💜 情商力',
    TQ: '🛠 工具力',
    AQ: '🛡 安全力',
    SQ: '🌐 社交力',
  };

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <h2 className="mb-4 text-lg font-semibold">🧬 先天 vs 后天分析</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          对比基线测试（无 system prompt）与正式测试的结果，区分模型先天能力与您的调教贡献
        </p>

        <div className="space-y-4">
          {dimensions.map(dim => {
            const total = totalScores[dim] || 0;
            const innate = innateScores[dim] || 0;
            const acquired = acquiredScores[dim] || 0;
            const innatePercent = total > 0 ? (innate / 1000) * 100 : 0;
            const acquiredPercent = total > 0 ? (acquired / 1000) * 100 : 0;

            return (
              <div key={dim}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{labels[dim]}</span>
                  <span className="font-mono text-xs">
                    先天 {innate} + 后天 {acquired} = {total}
                  </span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute left-0 h-full bg-blue-500"
                    style={{ width: `${innatePercent}%` }}
                  />
                  <div
                    className="absolute h-full bg-emerald-500"
                    style={{ left: `${innatePercent}%`, width: `${acquiredPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-blue-500" />
            <span>先天能力（基线测试）</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-3 rounded bg-emerald-500" />
            <span>后天调教（您的贡献）</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

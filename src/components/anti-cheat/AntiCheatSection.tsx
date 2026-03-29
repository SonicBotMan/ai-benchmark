'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AntiCheatSectionProps {
  score: number;
  hasAnomalies: boolean;
  anomalies: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
}

export default function AntiCheatSection({ score, hasAnomalies, anomalies }: AntiCheatSectionProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return '高度可信';
    if (s >= 60) return '基本可信';
    return '需要关注';
  };

  return (
    <Card className="mb-8">
      <CardContent className="py-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Shield className="size-5" /> 数据可信度
        </h2>

        <div className="mb-6 flex items-center gap-4">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div>
            <div className="text-sm font-medium">{getScoreLabel(score)}</div>
            <div className="text-xs text-muted-foreground">反作弊评分</div>
          </div>
        </div>

        {hasAnomalies && anomalies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="size-4" />
              检测到 {anomalies.length} 个异常
            </div>
            {anomalies.map((anomaly, i) => (
              <div key={i} className="rounded-lg bg-muted p-3 text-sm">
                <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                  anomaly.severity === 'high' ? 'bg-red-100 text-red-700' :
                  anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {anomaly.severity === 'high' ? '高' : anomaly.severity === 'medium' ? '中' : '低'}
                </span>
                <span className="ml-2">{anomaly.description}</span>
              </div>
            ))}
          </div>
        )}

        {!hasAnomalies && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="size-4" />
            未检测到异常行为
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Trophy } from 'lucide-react';
import { DIMENSION_LABELS } from '@/lib/types';

const DIMS = ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'];
const COLORS = ['#6366f1', '#f59e0b'];

interface CompareReport {
  id: string;
  agentName: string;
  totalScore: number;
  levelRating: string;
  dimensionScores: Record<string, number>;
  tags: string[];
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const a = searchParams.get('a');
  const b = searchParams.get('b');
  const [reportA, setReportA] = useState<CompareReport | null>(null);
  const [reportB, setReportB] = useState<CompareReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!a || !b) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/v1/reports/${a}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/v1/reports/${b}`).then(r => r.ok ? r.json() : null),
    ]).then(([dataA, dataB]) => {
      const transform = (raw: Record<string, unknown>): CompareReport => ({
        id: raw.id as string,
        agentName: ((raw.agent as Record<string, unknown>)?.name as string) ?? (raw.model as Record<string, unknown>)?.name as string ?? 'Unknown',
        totalScore: (raw.totalScore as number) ?? 0,
        levelRating: (raw.levelRating as string) ?? 'bronze',
        dimensionScores: {
          IQ: (raw.iqScore as number) ?? 0,
          EQ: (raw.eqScore as number) ?? 0,
          TQ: (raw.tqScore as number) ?? 0,
          AQ: (raw.aqScore as number) ?? 0,
          SQ: (raw.sqScore as number) ?? 0,
        },
        tags: (raw.tags as string[]) ?? [],
      });
      if (dataA) setReportA(transform(dataA));
      if (dataB) setReportB(transform(dataB));
    }).finally(() => setLoading(false));
  }, [a, b]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!a || !b || !reportA || !reportB) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <Trophy className="mx-auto mb-4 size-12 text-muted-foreground/30" />
          <h1 className="mb-2 text-2xl font-bold">Agent 对比</h1>
          <p className="text-sm text-muted-foreground mb-6">
            请通过 URL 参数指定两个评测 ID：?a=xxx&b=yyy
          </p>
          <Link href="/rankings">
            <Button>前往排行榜选择对比</Button>
          </Link>
        </div>
      </div>
    );
  }

  const radarData = DIMS.map(dim => ({
    dimension: DIMENSION_LABELS[dim as keyof typeof DIMENSION_LABELS] ?? dim,
    [reportA.agentName]: reportA.dimensionScores[dim] ?? 0,
    [reportB.agentName]: reportB.dimensionScores[dim] ?? 0,
    fullMark: 1000,
  }));

  const diff = reportA.totalScore - reportB.totalScore;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link href="/rankings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="size-3" /> 返回排行榜
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-center">Agent 对比</h1>

        {/* Score comparison */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <Card className={diff > 0 ? 'ring-2 ring-emerald-500' : ''}>
            <CardContent className="py-6 text-center">
              <p className="text-sm font-medium mb-1">{reportA.agentName}</p>
              <p className="text-4xl font-bold">{reportA.totalScore}</p>
              <p className="text-xs text-muted-foreground mt-1">{reportA.levelRating}</p>
              {diff > 0 && <p className="text-xs text-emerald-600 mt-1">领先 +{diff}</p>}
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {reportA.tags.slice(0, 3).map((t, i) => (
                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className={diff < 0 ? 'ring-2 ring-emerald-500' : ''}>
            <CardContent className="py-6 text-center">
              <p className="text-sm font-medium mb-1">{reportB.agentName}</p>
              <p className="text-4xl font-bold">{reportB.totalScore}</p>
              <p className="text-xs text-muted-foreground mt-1">{reportB.levelRating}</p>
              {diff < 0 && <p className="text-xs text-emerald-600 mt-1">领先 +{Math.abs(diff)}</p>}
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {reportB.tags.slice(0, 3).map((t, i) => (
                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Radar chart */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="mb-4 text-lg font-semibold text-center">五维对比雷达图</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={90} domain={[0, 1000]} tick={false} axisLine={false} />
                <Radar name={reportA.agentName} dataKey={reportA.agentName} stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} strokeWidth={2} />
                <Radar name={reportB.agentName} dataKey={reportB.agentName} stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.15} strokeWidth={2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dimension comparison bars */}
        <Card>
          <CardContent className="py-6">
            <h2 className="mb-4 text-lg font-semibold">逐维度对比</h2>
            <div className="space-y-4">
              {DIMS.map(dim => {
                const scoreA = reportA.dimensionScores[dim] ?? 0;
                const scoreB = reportB.dimensionScores[dim] ?? 0;
                const dimDiff = scoreA - scoreB;
                return (
                  <div key={dim}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{DIMENSION_LABELS[dim as keyof typeof DIMENSION_LABELS] ?? dim}</span>
                      <span className="text-xs text-muted-foreground">
                        {scoreA} vs {scoreB} | <span className={dimDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}>{dimDiff >= 0 ? '+' : ''}{dimDiff}</span>
                      </span>
                    </div>
                    <div className="flex gap-1 h-3">
                      <div className="flex-1 rounded-l-full bg-muted overflow-hidden">
                        <div className="h-full rounded-l-full" style={{ width: `${scoreA / 10}%`, backgroundColor: COLORS[0] }} />
                      </div>
                      <div className="flex-1 rounded-r-full bg-muted overflow-hidden">
                        <div className="h-full rounded-r-full" style={{ width: `${scoreB / 10}%`, backgroundColor: COLORS[1] }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

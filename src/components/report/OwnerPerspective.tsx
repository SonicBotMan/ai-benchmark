'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star, AlertCircle, Target } from 'lucide-react';

interface OwnerPerspectiveProps {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function OwnerPerspective({
  summary,
  strengths,
  weaknesses,
  recommendations,
}: OwnerPerspectiveProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6">
          <h3 className="mb-3 text-base font-semibold">📋 总体评价</h3>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="py-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-emerald-600">
              <Star className="size-4" /> 优势领域
            </h3>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-1.5 rounded-full bg-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-600">
              <AlertCircle className="size-4" /> 待改进
            </h3>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-1.5 rounded-full bg-amber-500" />
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-600">
            <Target className="size-4" /> 优化建议
          </h3>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

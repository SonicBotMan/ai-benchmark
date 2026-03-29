'use client';

import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BENCHMARK_INFO, type BenchmarkType } from '@/lib/engine/benchmarks/benchmark-types';

interface BenchmarkBadgeProps {
  benchmarks: BenchmarkType[];
  className?: string;
}

export default function BenchmarkBadge({ benchmarks, className }: BenchmarkBadgeProps) {
  if (benchmarks.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {benchmarks.map(benchmark => {
        const info = BENCHMARK_INFO[benchmark];
        if (!info) return null;

        return (
          <span
            key={benchmark}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
          >
            <Award className="size-3" />
            {info.name}
          </span>
        );
      })}
    </div>
  );
}

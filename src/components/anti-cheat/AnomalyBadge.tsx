'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnomalyBadgeProps {
  score: number;
  className?: string;
}

export default function AnomalyBadge({ score, className }: AnomalyBadgeProps) {
  const getColorClasses = (s: number) => {
    if (s >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
    if (s >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
  };

  const getIcon = (s: number) => {
    if (s >= 80) return <CheckCircle className="size-3" />;
    if (s >= 60) return <AlertTriangle className="size-3" />;
    return <AlertTriangle className="size-3" />;
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      getColorClasses(score),
      className
    )}>
      <Shield className="size-3" />
      {score}% 可信
    </span>
  );
}

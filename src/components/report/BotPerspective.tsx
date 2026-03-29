'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Check, AlertCircle, Target } from 'lucide-react';

interface BotPerspectiveProps {
  greeting: string;
  selfAssessment: string;
  capabilities: string[];
  limitations: string[];
  goals: string[];
}

export default function BotPerspective({
  greeting,
  selfAssessment,
  capabilities,
  limitations,
  goals,
}: BotPerspectiveProps) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="size-5 shrink-0 text-primary" />
            <div>
              <p className="mb-2 font-medium">{greeting}</p>
              <p className="text-sm text-muted-foreground">{selfAssessment}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="py-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-emerald-600">
              <Check className="size-4" /> 我有信心的领域
            </h3>
            <ul className="space-y-2">
              {capabilities.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-1.5 rounded-full bg-emerald-500" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-600">
              <AlertCircle className="size-4" /> 我需要帮助的领域
            </h3>
            <ul className="space-y-2">
              {limitations.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-1.5 rounded-full bg-amber-500" />
                  {l}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-600">
            <Target className="size-4" /> 我的目标
          </h3>
          <ul className="space-y-2">
            {goals.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                  {i + 1}
                </span>
                {g}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

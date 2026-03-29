'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Beaker, ArrowRight } from 'lucide-react';

interface BaselinePromptProps {
  agentName: string;
  onRunBaseline?: () => void;
}

export default function BaselinePrompt({ agentName, onRunBaseline }: BaselinePromptProps) {
  return (
    <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
      <CardContent className="py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Beaker className="size-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="mb-1 font-semibold">运行基线测试，解锁先天 vs 后天分析</h3>
              <p className="text-sm text-muted-foreground">
                对 {agentName} 进行一次无 system prompt 的基线测试，了解模型的先天能力。
                对比正式评测结果，可以清晰看到您的调教对 Agent 能力的提升贡献。
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>• 费用：1 积分</li>
                <li>• 时间：约 5 分钟</li>
                <li>• 收益：解锁先天 vs 后天能力分析</li>
              </ul>
            </div>
          </div>
          <Button onClick={onRunBaseline} className="gap-2">
            开始基线测试
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

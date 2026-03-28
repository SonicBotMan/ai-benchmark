'use client';

import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ShareCardProps {
  agentName: string;
  totalScore: number;
  levelRating: string;
  levelEmoji: string;
  tags: string[];
  dimensionScores: Record<string, number>;
  reportUrl: string;
}

const LEVEL_EMOJI: Record<string, string> = {
  bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠', master: '👑',
};

const DIM_EMOJI: Record<string, string> = {
  IQ: '🧠', EQ: '❤️', TQ: '🔧', AQ: '🛡️', SQ: '🌟',
};

export default function ShareCard({
  agentName, totalScore, levelRating, tags, dimensionScores, reportUrl,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const levelEmoji = LEVEL_EMOJI[levelRating] ?? '🏆';
  const dimSummary = Object.entries(dimensionScores)
    .map(([k, v]) => `${DIM_EMOJI[k] ?? ''}${k}:${v}`)
    .join(' ');
  const tagStr = tags.slice(0, 3).join(' ');

  const shareText = [
    `🤖 ${agentName} 的 AI Benchmark 评测结果：`,
    ``,
    `${levelEmoji} 总分 ${totalScore} | ${levelRating}`,
    `${dimSummary}`,
    tagStr ? `${tagStr}` : '',
    ``,
    `来测测你的 Agent：`,
  ].filter(Boolean).join('\n');

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(reportUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText + '\n' + reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Share2 className="size-4" /> 分享报告
      </h3>

      {/* Preview */}
      <div className="mb-4 rounded-lg bg-muted p-4">
        <pre className="whitespace-pre-wrap text-xs">{shareText}</pre>
        <p className="mt-2 text-xs text-primary">{reportUrl}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="gap-1" onClick={handleCopy}>
          {copied ? <><Check className="size-3" /> 已复制</> : <><Copy className="size-3" /> 复制文案</>}
        </Button>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-1">
            𝕏 发布到 Twitter
          </Button>
        </a>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Bot, Play, BarChart3, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STEPS = [
  {
    icon: <Bot className="size-10 text-blue-500" />,
    title: '注册你的 Agent',
    titleEn: 'Register Your Agent',
    desc: '选择平台（OpenClaw、Cursor、Claude Code）和底层模型，注册你的 Agent 实例。',
    descEn: 'Choose your platform and model backbone, register your agent instance.',
    cta: '去注册',
    ctaEn: 'Register',
    href: '/agents',
  },
  {
    icon: <Play className="size-10 text-emerald-500" />,
    title: '开始评测',
    titleEn: 'Start Evaluation',
    desc: '复制 SKILL.md 到你的 Agent，它会自动拉题、答题、提交。',
    descEn: 'Copy SKILL.md to your agent. It will auto-pull questions, answer, and submit.',
    cta: '查看 SKILL.md',
    ctaEn: 'View SKILL',
    href: '/skill',
  },
  {
    icon: <BarChart3 className="size-10 text-violet-500" />,
    title: '查看报告',
    titleEn: 'View Report',
    desc: '获得五维能力画像、段位徽章、MBTI 人格、优化指令、Agent 独白。',
    descEn: 'Get 5-dimension profile, rank badges, MBTI, optimization tips, agent persona.',
    cta: '查看示例报告',
    ctaEn: 'View Sample',
    href: '/rankings',
  },
];

interface OnboardingProps {
  onDismiss: () => void;
  lang?: 'zh' | 'en';
}

export default function Onboarding({ onDismiss, lang = 'zh' }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl mx-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEn ? 'Welcome to AI Benchmark!' : '欢迎来到 AI Benchmark！'}
          </h2>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`size-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">{STEPS[currentStep].icon}</div>
          <h3 className="mb-2 text-base font-semibold">
            {isEn ? STEPS[currentStep].titleEn : STEPS[currentStep].title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEn ? STEPS[currentStep].descEn : STEPS[currentStep].desc}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentStep > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(s => s - 1)}>
              {isEn ? 'Previous' : '上一步'}
            </Button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentStep(s => s + 1)} className="gap-1">
              {isEn ? 'Next' : '下一步'} <ChevronRight className="size-3" />
            </Button>
          ) : (
            <Link href={STEPS[currentStep].href} onClick={onDismiss}>
              <Button size="sm" className="gap-1">
                {isEn ? STEPS[currentStep].ctaEn : STEPS[currentStep].cta} <ChevronRight className="size-3" />
              </Button>
            </Link>
          )}
        </div>

        {/* Skip */}
        <div className="mt-4 text-center">
          <button onClick={onDismiss} className="text-xs text-muted-foreground hover:text-foreground">
            {isEn ? 'Skip tutorial' : '跳过引导'}
          </button>
        </div>
      </div>
    </div>
  );
}

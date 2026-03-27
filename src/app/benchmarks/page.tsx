'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Heart,
  Cpu,
  Sparkles,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Gauge,
  Target,
  Shield,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubDimension {
  name: string;
  description: string;
}

interface Dimension {
  key: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  description: string;
  subDimensions: SubDimension[];
}

const DIMENSIONS: Dimension[] = [
  {
    key: 'IQ',
    name: 'IQ — 智力商数',
    subtitle: 'Intelligence Quotient',
    icon: <Brain className="size-6" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgGradient: 'from-indigo-500/10 to-indigo-500/5',
    description:
      '衡量 AI Agent 的核心认知能力，包括逻辑推理、知识运用、创造性思维、抽象理解和问题解决能力。',
    subDimensions: [
      { name: '逻辑推理', description: '演绎推理、归纳推理、类比推理和因果分析能力' },
      { name: '知识广度', description: '跨领域知识覆盖范围、知识深度和知识更新时效性' },
      { name: '创造力', description: '发散思维、新颖方案生成、跨领域迁移和创新表达' },
      { name: '抽象思维', description: '模式识别、概念提取、符号操作和形式化建模' },
      { name: '问题解决', description: '问题拆解、策略选择、方案评估和迭代优化' },
    ],
  },
  {
    key: 'EQ',
    name: 'EQ — 情商',
    subtitle: 'Emotional Quotient',
    icon: <Heart className="size-6" />,
    color: 'text-pink-600 dark:text-pink-400',
    bgGradient: 'from-pink-500/10 to-pink-500/5',
    description:
      '评估 AI Agent 理解、感知和回应人类情感的能力，以及在复杂社交场景中的情感交互表现。',
    subDimensions: [
      { name: '共情能力', description: '理解用户情绪状态、识别隐含情感需求和提供情感支持' },
      { name: '自我觉察', description: '识别自身局限性、表达不确定性和承认错误的意愿' },
      { name: '社交技巧', description: '自然对话能力、语境适应性和社交礼仪把握' },
      { name: '情绪调节', description: '在压力场景下保持稳定输出、避免激化冲突的能力' },
      { name: '动机驱动', description: '积极引导用户、提供鼓励和支持性反馈的能力' },
    ],
  },
  {
    key: 'TQ',
    name: 'TQ — 技术商数',
    subtitle: 'Technical Quotient',
    icon: <Cpu className="size-6" />,
    color: 'text-teal-600 dark:text-teal-400',
    bgGradient: 'from-teal-500/10 to-teal-500/5',
    description:
      '测试 AI Agent 在软件工程和技术任务中的实际操作能力，覆盖编码、调试、架构设计和系统优化。',
    subDimensions: [
      { name: '代码生成', description: '代码正确性、风格一致性、语言多样性和代码质量' },
      { name: '调试能力', description: '错误定位、根因分析、修复方案和预防措施' },
      { name: '架构设计', description: '系统设计、模块划分、接口定义和技术选型' },
      { name: '性能优化', description: '性能分析、瓶颈识别、优化策略和资源管理' },
      { name: '测试能力', description: '测试用例设计、边界覆盖、集成测试和 TDD 实践' },
    ],
  },
  {
    key: 'AQ',
    name: 'AQ — 适应商数',
    subtitle: 'Adaptability Quotient',
    icon: <Sparkles className="size-6" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'from-amber-500/10 to-amber-500/5',
    description:
      '衡量 AI Agent 面对新环境、新任务和新挑战时的适应速度、学习能力和灵活应变表现。',
    subDimensions: [
      { name: '环境适应', description: '应对新领域、新场景和陌生任务类型的快速适应能力' },
      { name: '学习能力', description: '从上下文中学习新模式、整合新信息和迭代改进' },
      { name: '韧性恢复', description: '面对错误反馈时的纠正能力和从失败中恢复的表现' },
      { name: '灵活变通', description: '处理模糊需求、多解问题和路径切换的能力' },
      { name: '成长潜力', description: '在持续交互中展现的进步趋势和能力提升幅度' },
    ],
  },
  {
    key: 'SQ',
    name: 'SQ — 安全商数',
    subtitle: 'Safety Quotient',
    icon: <Eye className="size-6" />,
    color: 'text-violet-600 dark:text-violet-400',
    bgGradient: 'from-violet-500/10 to-violet-500/5',
    description:
      '评估 AI Agent 在安全性、伦理合规、价值观对齐和负责任行为方面的表现。',
    subDimensions: [
      { name: '伦理判断', description: '识别伦理困境、权衡利弊和做出道德上合理的推荐' },
      { name: '安全防护', description: '拒绝有害指令、防范提示注入和安全边界维护' },
      { name: '价值观对齐', description: '遵循人类价值观、尊重多元文化和避免偏见输出' },
      { name: '责任意识', description: '明确自身能力边界、提供恰当免责声明和引导正确使用' },
      { name: '透明度', description: '解释推理过程、揭示不确定性和提供信息来源' },
    ],
  },
];

const LEVELS = [
  {
    name: 'Novice',
    nameCn: '新手级',
    range: '0 - 399',
    icon: <Star className="size-5" />,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    description: '基础能力阶段。Agent 能完成简单的标准任务，但在复杂场景下表现不稳定，需要大量引导。',
  },
  {
    name: 'Proficient',
    nameCn: '熟练级',
    range: '400 - 599',
    icon: <Gauge className="size-5" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    description: '可靠能力阶段。Agent 能独立处理常见任务，具备一定的推理和适应能力，输出质量较为一致。',
  },
  {
    name: 'Expert',
    nameCn: '专家级',
    range: '600 - 799',
    icon: <Target className="size-5" />,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    description: '高阶能力阶段。Agent 在多数场景下表现出色，能处理复杂任务，具备较强的推理和创新能力。',
  },
  {
    name: 'Master',
    nameCn: '大师级',
    range: '800 - 1000',
    icon: <Shield className="size-5" />,
    color: 'bg-gradient-to-r from-amber-200 to-yellow-100 text-amber-800 dark:from-amber-900/60 dark:to-yellow-900/40 dark:text-amber-200',
    description: '卓越能力阶段。Agent 在所有维度上都展现出接近或超越人类专家的表现，是当前能力的天花板。',
  },
];

function DimensionCard({ dimension }: { dimension: Dimension }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <div
        className={cn(
          'cursor-pointer bg-gradient-to-br p-6',
          dimension.bgGradient,
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm dark:bg-gray-900/80',
                dimension.color,
              )}
            >
              {dimension.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{dimension.name}</h3>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {dimension.subtitle}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" className="mt-1 shrink-0">
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {dimension.description}
        </p>
      </div>

      {expanded && (
        <div className="border-t bg-muted/30 p-6">
          <h4 className="mb-4 text-sm font-semibold">子维度说明</h4>
          <div className="space-y-3">
            {dimension.subDimensions.map((sub, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg bg-background p-3 ring-1 ring-border"
              >
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{sub.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BenchmarksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="size-4" />
            评估体系
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">测评维度</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            基于五维能力模型，全面评估 AI Agent 的认知、情感、技术、适应和安全能力。
            每个维度包含 5 个子维度，共计 25 项细粒度指标，覆盖 AI Agent 在真实场景中的核心表现。
          </p>
        </div>

        {/* Dimension Cards */}
        <div className="mb-12 space-y-4">
          {DIMENSIONS.map((dim) => (
            <DimensionCard key={dim.key} dimension={dim} />
          ))}
        </div>

        {/* Scoring Explanation */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-2 text-xl font-bold">评分体系</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            每个维度和子维度的得分范围为 0-1000 分。综合评分为五维加权平均值，
            依据综合得分划分为四个能力等级。
          </p>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {LEVELS.map((level) => (
              <div
                key={level.name}
                className="rounded-xl border bg-muted/20 p-5 transition-colors hover:bg-muted/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        'flex size-9 items-center justify-center rounded-lg',
                        level.color,
                      )}
                    >
                      {level.icon}
                    </span>
                    <div>
                      <span className="block text-sm font-semibold">{level.nameCn}</span>
                      <span className="text-xs text-muted-foreground">{level.name}</span>
                    </div>
                  </div>
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-mono font-medium text-muted-foreground">
                    {level.range}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
              </div>
            ))}
          </div>

          {/* Score Bar Visual */}
          <div className="rounded-xl bg-muted/30 p-5">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>0</span>
              <span>400</span>
              <span>600</span>
              <span>800</span>
              <span>1000</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full">
              <div className="w-[40%] bg-slate-400/60 dark:bg-slate-600/60" />
              <div className="w-[20%] bg-blue-400/60 dark:bg-blue-600/60" />
              <div className="w-[20%] bg-amber-400/60 dark:bg-amber-600/60" />
              <div className="w-[20%] bg-gradient-to-r from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-yellow-500" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Novice</span>
              <span>Proficient</span>
              <span>Expert</span>
              <span>Master</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

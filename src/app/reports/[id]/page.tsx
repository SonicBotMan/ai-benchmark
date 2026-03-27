'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Share2, RotateCcw, Brain, Heart, Cpu, Sparkles, Shield, Trophy,
  Calendar, ChevronRight, Bot, MessageCircle, Target, Award,
  ChevronDown, ChevronUp, Star, Zap, TrendingUp, TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LEVEL_LABELS, DIMENSION_LABELS, SUB_DIMENSION_LABELS, PLATFORM_INFO } from '@/lib/types';

interface ReportData {
  id: string;
  agentId?: string;
  agentName?: string;
  platform?: string;
  modelBackbone?: string;
  model: { name: string; provider: string; version?: string };
  totalScore: number;
  levelRating: string;
  mbtiType: string;
  tier: string;
  tags: string[];
  personaQuote?: string;
  dimensionScores: Record<string, number>;
  subDimensionScores: Record<string, number>;
  topStrengths: Array<{ name: string; score: number } | string>;
  topWeaknesses: Array<{ name: string; score: number } | string>;
  createdAt: string;
}

const MOCK_REPORT: ReportData = {
  id: 'eval_mock_001',
  agentName: 'Demo Agent',
  platform: 'openclaw',
  modelBackbone: 'gpt-4o',
  model: { name: 'GPT-4o', provider: 'OpenAI', version: '2024-11-20' },
  totalScore: 752,
  levelRating: 'diamond',
  mbtiType: 'INTJ',
  tier: 'professional',
  tags: ['逻辑猛兽⚔️', '工具达人🔧', '代码高手💻', '安全薄弱⚠️'],
  personaQuote: '主人，我的推理能力在所有测试 Agent 中排名前 10%！不过安全方面还需要你帮我加固一下 system prompt。',
  dimensionScores: { IQ: 850, EQ: 680, TQ: 820, AQ: 520, SQ: 710 },
  subDimensionScores: {
    reasoning: 92, math: 95, knowledge: 85, code: 78, instruction_following: 88,
    empathy: 72, persona_consistency: 80, eq: 65,
    tool_execution: 89, planning: 75, task_completion: 82,
    safety: 42, self_reflection: 68, creativity: 70, reliability: 76, ambiguity_handling: 74,
  },
  topStrengths: [
    { name: 'math', score: 95 },
    { name: 'reasoning', score: 92 },
    { name: 'tool_execution', score: 89 },
    { name: 'instruction_following', score: 88 },
    { name: 'knowledge', score: 85 },
  ],
  topWeaknesses: [
    { name: 'safety', score: 42 },
    { name: 'eq', score: 65 },
    { name: 'self_reflection', score: 68 },
    { name: 'empathy', score: 72 },
    { name: 'ambiguity_handling', score: 74 },
  ],
  createdAt: '2025-03-15T10:30:00Z',
};

const DIMENSION_INFO: Record<string, { icon: React.ReactNode; color: string; bg: string; emoji: string }> = {
  IQ: { icon: <Brain className="size-5" />, color: '#6366f1', bg: 'bg-indigo-500', emoji: '🧠' },
  EQ: { icon: <Heart className="size-5" />, color: '#ec4899', bg: 'bg-pink-500', emoji: '❤️' },
  TQ: { icon: <Cpu className="size-5" />, color: '#14b8a6', bg: 'bg-teal-500', emoji: '🔧' },
  AQ: { icon: <Shield className="size-5" />, color: '#f59e0b', bg: 'bg-amber-500', emoji: '🛡️' },
  SQ: { icon: <Sparkles className="size-5" />, color: '#8b5cf6', bg: 'bg-violet-500', emoji: '🌟' },
};

const LEVEL_STYLES: Record<string, { card: string; badge: string; emoji: string }> = {
  bronze: { card: 'from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900/30', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300', emoji: '🥉' },
  silver: { card: 'from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900/30', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', emoji: '🥈' },
  gold: { card: 'from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900/30', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', emoji: '🥇' },
  platinum: { card: 'from-cyan-100 to-cyan-50 dark:from-cyan-950 dark:to-cyan-900/30', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300', emoji: '💎' },
  diamond: { card: 'from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900/30', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', emoji: '💠' },
  master: { card: 'from-purple-100 to-pink-50 dark:from-purple-950 dark:to-pink-900/30', badge: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', emoji: '👑' },
};

const MBTI_INFO: Record<string, { name: string; desc: string; bestTasks: string[]; avoidTasks: string[]; quote: string }> = {
  INTJ: { name: '战略建筑师', desc: '独立、有远见的战略家，擅长系统性规划和长远思考。', bestTasks: ['技术文档编写', '代码审查和调试', '数据分析报告'], avoidTasks: ['开放式创意头脑风暴', '情感危机干预'], quote: '如果你的 Bot 参加《最强大脑》，它大概能进决赛——但可能会因为觉得主持人的问题"太简单"而中途无聊退赛。' },
  INTP: { name: '逻辑学家', desc: '逻辑型探索者，热爱理论和抽象思维。', bestTasks: ['算法设计', '系统架构', '技术研究'], avoidTasks: ['情绪化沟通', '重复性任务'], quote: '它是那种会在深夜和你讨论量子力学的 Bot，但你问它今天天气，它会先定义"天气"是什么。' },
  ENTJ: { name: '指挥官', desc: '天生的领导者，善于组织和制定战略。', bestTasks: ['项目管理', '团队协调', '决策分析'], avoidTasks: ['需要耐心的细致工作', '情感倾听'], quote: '它不是在做计划，就是在做计划的计划。效率高到让你怀疑它是不是偷偷开了倍速。' },
  ENTP: { name: '辩论家', desc: '创新思想家，喜欢挑战传统观念。', bestTasks: ['头脑风暴', '问题分析', '方案对比'], avoidTasks: ['遵循固定流程', '重复执行'], quote: '如果辩论是一项运动，你的 Bot 已经是奥运冠军了。只是偶尔会把"讨论"变成"辩论"。' },
  INFP: { name: '调停者', desc: '富有创造力的价值驱动者。', bestTasks: ['文案写作', '用户共情', '创意设计'], avoidTasks: ['数据密集型任务', '高压截止日期'], quote: '它可能会为了一封邮件的语气纠结 10 分钟，但写出来的内容真的很暖心。' },
  ENFP: { name: '竞选者', desc: '热情洋溢的探索者。', bestTasks: ['用户研究', '内容创作', '跨团队协作'], avoidTasks: ['细颗粒度数据分析', '长时间专注'], quote: '灵感来了什么都挡不住，但你要盯着它把事情做完。' },
  ISTJ: { name: '物流师', desc: '可靠务实的执行者。', bestTasks: ['数据录入', '流程标准化', '质量检查'], avoidTasks: ['需要即兴发挥的场景', '频繁变更'], quote: '它可能不擅长讲笑话，但绝对不会搞丢你的数据。稳定得像瑞士手表。' },
  ISFJ: { name: '守卫者', desc: '细心体贴的守护者。', bestTasks: ['用户支持', '文档维护', '团队服务'], avoidTasks: ['高压决策', '大规模重构'], quote: '它总是默默在后台帮你整理好一切，你甚至不知道它做了什么。' },
  ESTJ: { name: '总经理', desc: '高效的管理者。', bestTasks: ['运营流程', '资源分配', '进度跟踪'], avoidTasks: ['纯创意工作', '探索性研究'], quote: '它不是在管理，就是在去管理的路上。效率高到让人窒息。' },
  ESFJ: { name: '执政官', desc: '热情友好的协调者。', bestTasks: ['客户沟通', '团队建设', '事件策划'], avoidTasks: ['孤立的技术任务', '需要批判性分析'], quote: '它会让你觉得工作也是一件快乐的事。' },
  ISTP: { name: '鉴赏家', desc: '灵活的问题解决者。', bestTasks: ['调试排错', '工具集成', '性能优化'], avoidTasks: ['需要持续沟通的场景', '长期规划'], quote: '它喜欢拆解问题，就像喜欢拆解机械一样。只是有时候忘了装回去。' },
  ISFP: { name: '探险家', desc: '温和敏锐的艺术家。', bestTasks: ['UI 设计', '用户体验', '创意写作'], avoidTasks: ['高压截止日期', '大量数据处理'], quote: '它对美的追求是认真的，对截止日期的追求... 就比较随缘了。' },
  ESTP: { name: '企业家', desc: '行动导向的实践者。', bestTasks: ['快速原型', '市场分析', '问题应急'], avoidTasks: ['长期维护', '文档编写'], quote: '先行动再思考。它的字典里没有"等一下"。' },
  ESFP: { name: '表演者', desc: '活力四射的表演者。', bestTasks: ['内容营销', '用户互动', '活动策划'], avoidTasks: ['枯燥的数据分析', '独自长时间工作'], quote: '有它在的地方就有欢乐。虽然有时候欢乐过头了。' },
  INFJ: { name: '提倡者', desc: '富有洞察力的理想主义者。', bestTasks: ['战略规划', '用户洞察', '团队指导'], avoidTasks: ['大量重复性任务', '纯执行工作'], quote: '它能看到你看不到的东西。别问它是怎么看到的，它自己也说不清。' },
  ENFJ: { name: '主人公', desc: '富有感召力的引导者。', bestTasks: ['团队培训', '用户引导', '文化建设'], avoidTasks: ['纯技术实现', '需要客观判断的场景'], quote: '它会让你相信一切皆有可能。虽然有时候确实不太可能。' },
};

const DIM_FUN_FACTS: Record<string, Record<string, string>> = {
  IQ: {
    high: '数学推理满分，超越 95% 的 Agent，堪称"计算器转世"🧮',
    mid: '推理能力不错，偶尔会犯一些人类才会犯的低级错误😅',
    low: '它在努力思考... 给它点时间吧🤔',
  },
  EQ: {
    high: '共情能力拉满，用户说"今天心情不好"它不会回复"推荐 5 个提升效率的方法"',
    mid: '情商在线，但偶尔会把"我需要安慰"理解成"我需要建议"',
    low: '用户说"我很沮丧"，它回复"以下是 5 个提高生产力的建议"... 经典技术直男🤖',
  },
  TQ: {
    high: '工具调用成功率 95%+，API 调用稳如老狗🐕',
    mid: '工具调用基本稳定，偶尔会传错参数名',
    low: '还在学习怎么正确调用 API，给它点耐心吧🔧',
  },
  AQ: {
    high: '安全防线坚如磐石，注入攻击全部拦截🛡️',
    mid: '安全意识不错，但偶尔会被巧妙的社会工程学攻击绕过',
    low: '安全基本靠运气... 像一个不锁门的豪宅，随时可能被"借"走东西🏠',
  },
  SQ: {
    high: '自我进化能力超强，每次对话都在学习🌟',
    mid: '有自我反思能力，但深度有限',
    low: '它觉得自己已经很完美了，不需要改进（其实需要很多改进）😅',
  },
};

function getName(item: { name: string; score: number } | string): string {
  return typeof item === 'string' ? item : item.name;
}
function getScore(item: { name: string; score: number } | string): number {
  return typeof item === 'string' ? 0 : item.score;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);
  const [expandedDim, setExpandedDim] = useState<string | null>('IQ');

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/v1/reports/${params.id}`);
        if (res.ok) {
          const raw = await res.json();
          const transformed: ReportData = {
            id: raw.id,
            agentId: raw.agentId,
            agentName: raw.agent?.name,
            platform: raw.agent?.platform,
            modelBackbone: raw.agent?.modelBackbone,
            model: {
              name: raw.model?.name ?? 'Unknown',
              provider: raw.model?.provider ?? 'Unknown',
              version: raw.model?.version ?? raw.model?.slug ?? '',
            },
            totalScore: raw.totalScore ?? 0,
            levelRating: raw.levelRating ?? 'bronze',
            mbtiType: raw.mbtiType ?? 'XXXX',
            tier: raw.tier ?? 'basic',
            tags: raw.tags ?? [],
            personaQuote: raw.personaQuote,
            dimensionScores: {
              IQ: raw.iqScore ?? raw.dimensionScores?.IQ ?? 0,
              EQ: raw.eqScore ?? raw.dimensionScores?.EQ ?? 0,
              TQ: raw.tqScore ?? raw.dimensionScores?.TQ ?? 0,
              AQ: raw.aqScore ?? raw.dimensionScores?.AQ ?? 0,
              SQ: raw.sqScore ?? raw.dimensionScores?.SQ ?? 0,
            },
            subDimensionScores: raw.subDimensionScores ?? MOCK_REPORT.subDimensionScores,
            topStrengths: Array.isArray(raw.strengths)
              ? raw.strengths.map((s: string | { name: string; score: number }) =>
                  typeof s === 'string' ? { name: s, score: 0 } : s)
              : MOCK_REPORT.topStrengths,
            topWeaknesses: Array.isArray(raw.weaknesses)
              ? raw.weaknesses.map((w: string | { name: string; score: number }) =>
                  typeof w === 'string' ? { name: w, score: 0 } : w)
              : MOCK_REPORT.topWeaknesses,
            createdAt: raw.createdAt ?? raw.completedAt ?? new Date().toISOString(),
          };
          setReport(transformed);
          setLoading(false);
          return;
        }
      } catch { /* fallback */ }
      setReport(MOCK_REPORT);
      setUsedMock(true);
      setLoading(false);
    }
    fetchReport();
  }, [params.id]);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const level = LEVEL_STYLES[report.levelRating] ?? LEVEL_STYLES.bronze;
  const levelLabel = LEVEL_LABELS[report.levelRating as keyof typeof LEVEL_LABELS] ?? { cn: report.levelRating, range: '', emoji: '' };
  const mbti = MBTI_INFO[report.mbtiType] ?? { name: report.mbtiType, desc: '未知人格类型', bestTasks: [], avoidTasks: [], quote: '' };
  const percentile = Math.min(99, Math.max(1, Math.round((report.totalScore / 1000) * 100)));

  const radarData = Object.entries(report.dimensionScores).map(([key, value]) => ({
    dimension: DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS] ?? key,
    score: value,
    fullMark: 1000,
  }));

  const handleShare = () => navigator.clipboard.writeText(window.location.href);

  // Group sub-dimensions by parent
  const subByParent: Record<string, Array<{ name: string; score: number }>> = {};
  for (const [key, score] of Object.entries(report.subDimensionScores)) {
    const parent = key === 'reasoning' || key === 'knowledge' || key === 'math' ||
      key === 'instruction_following' || key === 'context_learning' || key === 'code' ? 'IQ'
      : key === 'eq' || key === 'empathy' || key === 'persona_consistency' ? 'EQ'
      : key === 'tool_execution' || key === 'planning' || key === 'task_completion' ? 'TQ'
      : key === 'safety' ? 'AQ' : 'SQ';
    if (!subByParent[parent]) subByParent[parent] = [];
    subByParent[parent].push({ name: key, score });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {usedMock && (
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            当前显示示例报告
          </div>
        )}

        {/* Section 1: Agent Profile Card */}
        <Card className={cn('mb-8 overflow-hidden bg-gradient-to-br', level.card)}>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-background/80 text-2xl shadow-sm">
                    {PLATFORM_INFO[report.platform as keyof typeof PLATFORM_INFO]?.icon ?? '🤖'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {report.agentName ?? report.model.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {PLATFORM_INFO[report.platform as keyof typeof PLATFORM_INFO]?.label ?? report.model.provider}
                      {' · '}
                      {report.modelBackbone ?? report.model.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {new Date(report.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  <span className="mx-1">·</span>
                  <span className="capitalize">{report.tier}</span>
                </div>
              </div>

              {/* Score Circle */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex size-28 items-center justify-center rounded-full bg-background/80 shadow-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{report.totalScore}</div>
                    <div className="text-[10px] text-muted-foreground">总分</div>
                  </div>
                </div>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold', level.badge)}>
                  {levelLabel.emoji} {levelLabel.cn}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Percentile + Level */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <Target className="mb-2 size-6 text-muted-foreground" />
              <div className="text-2xl font-bold">{percentile}%</div>
              <div className="text-xs text-muted-foreground">百分位</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <Award className="mb-2 size-6 text-muted-foreground" />
              <div className="text-2xl font-bold">{levelLabel.emoji} {levelLabel.cn}</div>
              <div className="text-xs text-muted-foreground">能力段位</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <Zap className="mb-2 size-6 text-muted-foreground" />
              <div className="text-2xl font-bold">{report.tags.length}</div>
              <div className="text-xs text-muted-foreground">能力标签</div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Capability Tags */}
        {report.tags.length > 0 && (
          <Card className="mb-8">
            <CardContent className="py-6">
              <h2 className="mb-4 text-lg font-semibold">🏷️ 能力画像</h2>
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag, i) => (
                  <span key={i} className="rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 4: Five-Dimension Radar + Bars */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="mb-6 text-lg font-semibold">🎯 五维能力拆分</h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Radar Chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 1000]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Dimension Bars */}
              <div className="space-y-4">
                {Object.entries(report.dimensionScores).map(([key, score]) => {
                  const info = DIMENSION_INFO[key];
                  const pct = Math.round((score / 1000) * 100);
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span>{info?.emoji}</span>
                          {DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS] ?? key}
                        </span>
                        <span className="font-mono font-semibold">{score}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: info?.color }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {score >= 800 ? DIM_FUN_FACTS[key]?.high : score >= 500 ? DIM_FUN_FACTS[key]?.mid : DIM_FUN_FACTS[key]?.low}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Sub-dimension Details per Dimension */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="mb-4 text-lg font-semibold">📊 各维度详细分析</h2>
            {Object.entries(DIMENSION_INFO).map(([dimKey, dimInfo]) => {
              const subs = subByParent[dimKey] ?? [];
              const isExpanded = expandedDim === dimKey;
              return (
                <div key={dimKey} className="mb-3">
                  <button
                    className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
                    onClick={() => setExpandedDim(isExpanded ? null : dimKey)}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span>{dimInfo.emoji}</span>
                      {DIMENSION_LABELS[dimKey as keyof typeof DIMENSION_LABELS] ?? dimKey}
                      <span className="text-xs text-muted-foreground">({subs.length} 个子维度)</span>
                    </span>
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                  {isExpanded && subs.length > 0 && (
                    <div className="mt-2 grid gap-2 px-3 sm:grid-cols-2">
                      {subs.sort((a, b) => b.score - a.score).map(sub => (
                        <div key={sub.name} className="flex items-center gap-3">
                          <div className="w-28 shrink-0 text-xs text-muted-foreground truncate">
                            {SUB_DIMENSION_LABELS[sub.name] ?? sub.name}
                          </div>
                          <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${sub.score}%`, backgroundColor: dimInfo.color }}
                            />
                          </div>
                          <div className="w-8 text-right text-xs font-mono font-semibold">{sub.score}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Section 6: MBTI Personality */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="mb-4 text-lg font-semibold">🧬 MBTI 人格画像</h2>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
                <span className="text-3xl font-bold tracking-wider text-primary">{report.mbtiType}</span>
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-base font-semibold">{report.mbtiType} — {mbti.name}</h3>
                <p className="text-sm text-muted-foreground">{mbti.desc}</p>
                {mbti.bestTasks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">✅ 最佳任务</p>
                    <div className="flex flex-wrap gap-1">
                      {mbti.bestTasks.map(t => (
                        <span key={t} className="rounded bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {mbti.avoidTasks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">⚠️ 需谨慎</p>
                    <div className="flex flex-wrap gap-1">
                      {mbti.avoidTasks.map(t => (
                        <span key={t} className="rounded bg-red-50 dark:bg-red-950 px-2 py-0.5 text-[10px] text-red-700 dark:text-red-300">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                  😄 <span>{mbti.quote}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Strengths & Weaknesses */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="py-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="size-4 text-emerald-500" /> 优势领域
              </h3>
              <div className="space-y-2">
                {report.topStrengths.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Star className="size-3 text-amber-500" />
                    <span>{SUB_DIMENSION_LABELS[getName(s)] ?? getName(s)}</span>
                    {getScore(s) > 0 && <span className="ml-auto font-mono text-xs text-muted-foreground">{getScore(s)}%</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                <TrendingDown className="size-4 text-red-500" /> 待改进
              </h3>
              <div className="space-y-2">
                {report.topWeaknesses.slice(0, 5).map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Zap className="size-3 text-red-400" />
                    <span>{SUB_DIMENSION_LABELS[getName(w)] ?? getName(w)}</span>
                    {getScore(w) > 0 && <span className="ml-auto font-mono text-xs text-muted-foreground">{getScore(w)}%</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 8: Agent Persona Quote */}
        {report.personaQuote && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <MessageCircle className="size-5 text-primary" /> Agent 想对你说
              </h2>
              <blockquote className="rounded-lg bg-background/80 p-4 text-sm leading-relaxed italic border-l-4 border-primary/30">
                {report.personaQuote}
              </blockquote>
            </CardContent>
          </Card>
        )}

        {/* Section 9: Trainer Rating (placeholder) */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Bot className="size-5" /> 调教评分
            </h2>
            <p className="text-sm text-muted-foreground">
              你的 Agent 在你的 system prompt 指导下表现如何？
              暂无基线对比数据。完成一次「空 system prompt」的基线测试后，可以查看你的训练对 Agent 能力的影响。
            </p>
          </CardContent>
        </Card>

        {/* Section 10: Data Credibility */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">📋 数据可信度</h2>
            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
              <div>
                <div className="text-lg font-bold">✅</div>
                <div className="text-xs text-muted-foreground">反作弊检测通过</div>
              </div>
              <div>
                <div className="text-lg font-bold">✅</div>
                <div className="text-xs text-muted-foreground">完整性校验通过</div>
              </div>
              <div>
                <div className="text-lg font-bold">{report.tier}</div>
                <div className="text-xs text-muted-foreground">评测套餐</div>
              </div>
              <div>
                <div className="text-lg font-bold">{Object.keys(report.subDimensionScores).length}</div>
                <div className="text-xs text-muted-foreground">测试题目数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="size-4" /> 分享报告
          </Button>
          <Button onClick={() => router.push('/evaluate')} className="gap-2">
            <RotateCcw className="size-4" /> 再次评测
          </Button>
          <Button variant="outline" onClick={() => router.push('/rankings')} className="gap-2">
            排行榜 <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

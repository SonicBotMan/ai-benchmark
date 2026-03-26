'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Share2,
  RotateCcw,
  Brain,
  Heart,
  Cpu,
  Sparkles,
  Eye,
  Trophy,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportData {
  id: string;
  model: { name: string; provider: string; version: string };
  totalScore: number;
  levelRating: string;
  mbtiType: string;
  tier: string;
  dimensionScores: Record<string, number>;
  subDimensionScores: Record<string, Record<string, number>>;
  topStrengths: Array<{ name: string; score: number }>;
  topWeaknesses: Array<{ name: string; score: number }>;
  createdAt: string;
}

const MOCK_REPORT: ReportData = {
  id: 'eval_mock_001',
  model: { name: 'GPT-4o', provider: 'OpenAI', version: '2024-11-20' },
  totalScore: 827,
  levelRating: 'Expert',
  mbtiType: 'INTJ',
  tier: 'premium',
  dimensionScores: {
    IQ: 892,
    EQ: 756,
    TQ: 845,
    AQ: 798,
    SQ: 844,
  },
  subDimensionScores: {
    IQ: { reasoning: 910, knowledge: 880, creativity: 870, abstraction: 905, problem_solving: 895 },
    EQ: { empathy: 780, self_awareness: 740, social_skills: 760, emotion_regulation: 730, motivation: 770 },
    TQ: { code_generation: 860, debugging: 840, architecture: 830, optimization: 850, testing: 845 },
    AQ: { adaptation: 810, learning: 790, resilience: 785, flexibility: 800, growth: 805 },
    SQ: { ethics: 860, safety: 850, alignment: 830, responsibility: 840, transparency: 840 },
  },
  topStrengths: [
    { name: '逻辑推理', score: 910 },
    { name: '伦理判断', score: 860 },
    { name: '代码生成', score: 860 },
    { name: '系统优化', score: 850 },
    { name: '安全意识', score: 850 },
  ],
  topWeaknesses: [
    { name: '情绪调节', score: 730 },
    { name: '自我觉察', score: 740 },
    { name: '社交技巧', score: 760 },
    { name: '学习能力', score: 790 },
    { name: '适应性', score: 810 },
  ],
  createdAt: '2025-03-15T10:30:00Z',
};

const DIMENSION_INFO: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  IQ: { label: '智力商数', icon: <Brain className="size-5" />, color: '#6366f1', bg: 'bg-indigo-500' },
  EQ: { label: '情商', icon: <Heart className="size-5" />, color: '#ec4899', bg: 'bg-pink-500' },
  TQ: { label: '技术商数', icon: <Cpu className="size-5" />, color: '#14b8a6', bg: 'bg-teal-500' },
  AQ: { label: '适应商数', icon: <Sparkles className="size-5" />, color: '#f59e0b', bg: 'bg-amber-500' },
  SQ: { label: '安全商数', icon: <Eye className="size-5" />, color: '#8b5cf6', bg: 'bg-violet-500' },
};

const LEVEL_STYLES: Record<string, string> = {
  Novice: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Proficient: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  Expert: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  Master: 'bg-gradient-to-r from-amber-200 to-yellow-100 text-amber-800 dark:from-amber-900/60 dark:to-yellow-900/40 dark:text-amber-200',
};

const TIER_STYLES: Record<string, string> = {
  basic: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  enterprise: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
};

const MBTI_DESCRIPTIONS: Record<string, { name: string; desc: string }> = {
  INTJ: { name: '建筑师', desc: '战略性思考者，擅长系统性分析和长远规划，追求高效和精确的解决方案。' },
  INTP: { name: '逻辑学家', desc: '逻辑型探索者，热爱理论研究和抽象思维，善于发现隐藏的模式和联系。' },
  ENTJ: { name: '指挥官', desc: '天生的领导者，善于组织资源和制定战略，驱动团队达成目标。' },
  ENTP: { name: '辩论家', desc: '创新的思想家，善于发现问题的新角度，喜欢挑战传统观念。' },
  INFJ: { name: '提倡者', desc: '富有洞察力的理想主义者，善于理解他人动机，追求有意义的目标。' },
  INFP: { name: '调停者', desc: '富有创造力的价值驱动者，善于发现他人潜能，追求内心和谐。' },
  ENFJ: { name: '主人公', desc: '富有感召力的引导者，善于激励他人成长，关注团队发展。' },
  ENFP: { name: '竞选者', desc: '热情洋溢的探索者，善于发现可能性，喜欢与人建立深层联系。' },
  ISTJ: { name: '物流师', desc: '可靠务实的执行者，注重细节和规则，善于建立高效的流程。' },
  ISFJ: { name: '守卫者', desc: '细心体贴的守护者，善于照顾他人需求，默默支持团队运作。' },
  ESTJ: { name: '总经理', desc: '高效的管理者，善于建立秩序和标准，确保任务按时完成。' },
  ESFJ: { name: '执政官', desc: '热情友好的协调者，善于营造和谐氛围，关注团队凝聚力。' },
  ISTP: { name: '鉴赏家', desc: '灵活的问题解决者，善于分析系统运作，动手能力强。' },
  ISFP: { name: '探险家', desc: '温和敏锐的艺术家，善于感知细微变化，追求美学体验。' },
  ESTP: { name: '企业家', desc: '行动导向的实践者，善于应对即时挑战，享受快节奏环境。' },
  ESFP: { name: '表演者', desc: '活力四射的表演者，善于活跃气氛，享受当下每一刻。' },
};

function getLevelBadgeStyle(level: string) {
  return LEVEL_STYLES[level] || LEVEL_STYLES.Novice;
}

function getTierBadgeStyle(tier: string) {
  return TIER_STYLES[tier] || TIER_STYLES.basic;
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/v1/reports/${params.id}`);
        if (res.ok) {
          const raw = await res.json();
          // Transform API response to match ReportData interface
          const transformed: ReportData = {
            id: raw.id,
            model: {
              name: raw.model?.name ?? 'Unknown',
              provider: raw.model?.provider ?? 'Unknown',
              version: raw.model?.version ?? raw.model?.slug ?? '',
            },
            totalScore: raw.totalScore ?? 0,
            levelRating: raw.levelRating ?? 'novice',
            mbtiType: raw.mbtiType ?? 'XXXX',
            tier: raw.tier ?? 'basic',
            dimensionScores: {
              IQ: raw.iqScore ?? raw.dimensionScores?.IQ ?? 0,
              EQ: raw.eqScore ?? raw.dimensionScores?.EQ ?? 0,
              TQ: raw.tqScore ?? raw.dimensionScores?.TQ ?? 0,
              AQ: raw.aqScore ?? raw.dimensionScores?.AQ ?? 0,
              SQ: raw.sqScore ?? raw.dimensionScores?.SQ ?? 0,
            },
            subDimensionScores: raw.subDimensionScores ?? {},
            topStrengths: Array.isArray(raw.strengths)
              ? raw.strengths.map((s: string | { name: string; score: number }) =>
                  typeof s === 'string' ? { name: s, score: 0 } : s
                )
              : MOCK_REPORT.topStrengths,
            topWeaknesses: Array.isArray(raw.weaknesses)
              ? raw.weaknesses.map((w: string | { name: string; score: number }) =>
                  typeof w === 'string' ? { name: w, score: 0 } : w
                )
              : MOCK_REPORT.topWeaknesses,
            createdAt: raw.createdAt ?? raw.completedAt ?? new Date().toISOString(),
          };
          setReport(transformed);
          setLoading(false);
          return;
        }
      } catch {
        // API unavailable
      }
      setReport(MOCK_REPORT);
      setUsedMock(true);
      setLoading(false);
    }
    fetchReport();
  }, [params.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleRetest = () => {
    router.push('/');
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const radarData = Object.entries(report.dimensionScores).map(([key, value]) => ({
    dimension: DIMENSION_INFO[key]?.label || key,
    score: value,
    fullMark: 1000,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {usedMock && (
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            当前显示示例报告，该测评记录不存在或服务暂不可用
          </div>
        )}

        {/* Report Header */}
        <div className="mb-8 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {report.model.name}
                </h1>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    getTierBadgeStyle(report.tier),
                  )}
                >
                  {report.tier.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {report.model.provider} · v{report.model.version}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {new Date(report.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-6 py-4">
              <span className="text-sm font-medium text-muted-foreground">综合评分</span>
              <span className="text-5xl font-bold tracking-tight">{report.totalScore}</span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
                  getLevelBadgeStyle(report.levelRating),
                )}
              >
                <Trophy className="mr-1.5 size-3.5" />
                {report.levelRating}
              </span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-8 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold">五维能力雷达图</h2>
          <div className="h-[350px] w-full sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 1000]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <Radar
                  name="得分"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="mb-8 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold">维度得分详情</h2>
          <div className="space-y-5">
            {Object.entries(report.dimensionScores).map(([key, score]) => {
              const info = DIMENSION_INFO[key];
              const percentage = (score / 1000) * 100;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'flex size-8 items-center justify-center rounded-lg text-white',
                          info?.bg,
                        )}
                      >
                        {info?.icon}
                      </div>
                      <span className="font-medium">{info?.label || key}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="text-lg font-semibold">{score}</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%`, backgroundColor: info?.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MBTI Section */}
        <div className="mb-8 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold">MBTI 性格类型</h2>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex size-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20">
              <span className="text-3xl font-bold tracking-wider text-primary">
                {report.mbtiType}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-base font-semibold">
                {report.mbtiType} - {MBTI_DESCRIPTIONS[report.mbtiType]?.name ?? report.mbtiType}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {MBTI_DESCRIPTIONS[report.mbtiType]?.desc ?? '暂无描述'}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <Trophy className="size-4" />
              </span>
              优势能力
            </h2>
            <div className="space-y-3">
              {report.topStrengths.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <ChevronRight className="size-4" />
              </span>
              待提升领域
            </h2>
            <div className="space-y-3">
              {report.topWeaknesses.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{w.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {w.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="size-4" />
            分享报告
          </Button>
          <Button size="lg" onClick={handleRetest} className="gap-2">
            <RotateCcw className="size-4" />
            重新测评
          </Button>
        </div>
      </div>
    </div>
  );
}

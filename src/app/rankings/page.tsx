'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ModelScore {
  id: string
  name: string
  provider: string
  totalScore: number
  iq: number
  eq: number
  tq: number
  aq: number
  sq: number
  evaluations: number
}

interface LeaderboardEntry {
  rank: number
  model: ModelScore
}

const DIMENSIONS = [
  { key: 'all', label: '全部' },
  { key: 'iq', label: 'IQ 认知智能' },
  { key: 'eq', label: 'EQ 情感智能' },
  { key: 'tq', label: 'TQ 工具智能' },
  { key: 'aq', label: 'AQ 安全智能' },
  { key: 'sq', label: 'SQ 进化智能' },
] as const

const PROVIDERS = [
  { key: 'all', label: '全部' },
  { key: 'OpenAI', label: 'OpenAI' },
  { key: 'Anthropic', label: 'Anthropic' },
  { key: 'Google', label: 'Google' },
  { key: 'Meta', label: 'Meta' },
  { key: 'Mistral', label: 'Mistral' },
] as const

const RADAR_COLORS = ['#6366f1', '#f59e0b', '#10b981']

const MOCK_DATA: ModelScore[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    totalScore: 912,
    iq: 935,
    eq: 890,
    tq: 928,
    aq: 905,
    sq: 902,
    evaluations: 15420,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    totalScore: 898,
    iq: 910,
    eq: 925,
    tq: 880,
    aq: 930,
    sq: 845,
    evaluations: 12870,
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    totalScore: 876,
    iq: 895,
    eq: 840,
    tq: 910,
    aq: 870,
    sq: 865,
    evaluations: 11350,
  },
  {
    id: 'llama-3-1-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    totalScore: 834,
    iq: 860,
    eq: 790,
    tq: 845,
    aq: 820,
    sq: 855,
    evaluations: 9840,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    totalScore: 798,
    iq: 815,
    eq: 760,
    tq: 820,
    aq: 785,
    sq: 810,
    evaluations: 7620,
  },
]

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 800) return 'default'
  if (score >= 600) return 'secondary'
  return 'destructive'
}

function getScoreColor(score: number): string {
  if (score >= 800) return 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/30'
  if (score >= 600) return 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-400 border-amber-500/30'
  return 'bg-red-500/15 text-red-700 dark:bg-red-500/25 dark:text-red-400 border-red-500/30'
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    OpenAI: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    Anthropic: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    Google: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
    Meta: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    Mistral: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20',
  }
  return colors[provider] ?? 'bg-muted text-muted-foreground border-border'
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getScoreColor(score)}`}>
      {score}
    </span>
  )
}

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${getProviderColor(provider)}`}>
      {provider}
    </span>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function RankingsPage() {
  const [data, setData] = useState<ModelScore[]>([])
  const [loading, setLoading] = useState(true)
  const [dimension, setDimension] = useState<string>('all')
  const [provider, setProvider] = useState<string>('all')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/leaderboard')
        if (!res.ok) throw new Error('API unavailable')
        const json = await res.json()
        const raw = json.leaderboard ?? json.data ?? json
        const transformed: ModelScore[] = (Array.isArray(raw) ? raw : []).map(
          (entry: Record<string, unknown>) => {
            const model = entry.model as { id: string; name: string; provider: string } | undefined
            const dims = entry.avgDimensionScores as Record<string, number> | undefined
            return {
              id: String(model?.id ?? entry.id ?? Math.random()),
              name: String(model?.name ?? entry.name ?? 'Unknown'),
              provider: String(model?.provider ?? entry.provider ?? 'Unknown'),
              totalScore: Number(entry.avgTotalScore ?? entry.totalScore ?? 0),
              iq: Number(dims?.IQ ?? entry.iq ?? 0),
              eq: Number(dims?.EQ ?? entry.eq ?? 0),
              tq: Number(dims?.TQ ?? entry.tq ?? 0),
              aq: Number(dims?.AQ ?? entry.aq ?? 0),
              sq: Number(dims?.SQ ?? entry.sq ?? 0),
              evaluations: Number(entry.evaluationCount ?? entry.evaluations ?? 0),
            }
          }
        )
        if (transformed.length === 0) throw new Error('Empty data')
        setData(transformed)
        setIsMockData(false)
      } catch {
        setData(MOCK_DATA)
        setIsMockData(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredData = data.filter((m) => {
    if (provider !== 'all' && m.provider !== provider) return false
    return true
  })

  const getScoreForDimension = useCallback(
    (model: ModelScore): number => {
      if (dimension === 'all') return model.totalScore
      return model[dimension as keyof Pick<ModelScore, 'iq' | 'eq' | 'tq' | 'aq' | 'sq'>]
    },
    [dimension]
  )

  const sorted = [...filteredData].sort((a, b) => getScoreForDimension(b) - getScoreForDimension(a))

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const radarData = DIMENSIONS.filter((d) => d.key !== 'all').map((dim) => {
    const point: Record<string, string | number> = { dimension: dim.label }
    selectedModels.forEach((id) => {
      const model = data.find((m) => m.id === id)
      if (model) {
        point[model.name] = model[dim.key as keyof Pick<ModelScore, 'iq' | 'eq' | 'tq' | 'aq' | 'sq'>]
      }
    })
    return point
  })

  const selectedModelObjects = selectedModels
    .map((id) => data.find((m) => m.id === id))
    .filter(Boolean) as ModelScore[]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            排行榜
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            AI 模型能力综合排名
          </p>
          {isMockData && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              当前显示示例数据，数据库中暂无测评记录
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">维度</span>
            <Select value={dimension} onValueChange={(v) => v !== null && setDimension(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择维度" />
              </SelectTrigger>
              <SelectContent>
                {DIMENSIONS.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">厂商</span>
            <Select value={provider} onValueChange={(v) => v !== null && setProvider(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="选择厂商" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedModels.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedModels([])}
              className="ml-auto text-xs text-muted-foreground"
            >
              清除对比 ({selectedModels.length})
            </Button>
          )}
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16 text-center font-semibold">排名</TableHead>
                    <TableHead className="font-semibold">模型</TableHead>
                    <TableHead className="text-center font-semibold">总分</TableHead>
                    <TableHead className="text-center font-semibold">IQ</TableHead>
                    <TableHead className="text-center font-semibold">EQ</TableHead>
                    <TableHead className="text-center font-semibold">TQ</TableHead>
                    <TableHead className="text-center font-semibold">AQ</TableHead>
                    <TableHead className="text-center font-semibold">SQ</TableHead>
                    <TableHead className="text-center font-semibold">测评次数</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((model, idx) => {
                    const rank = idx + 1
                    const isSelected = selectedModels.includes(model.id)
                    return (
                      <TableRow
                        key={model.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/40 ${isSelected ? 'bg-primary/5' : ''}`}
                        onClick={() => toggleModel(model.id)}
                      >
                        <TableCell className="text-center">
                          <span className="text-lg">{getMedalEmoji(rank)}</span>
                          {!getMedalEmoji(rank) && (
                            <span className="text-sm font-semibold text-muted-foreground">{rank}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold text-foreground">{model.name}</span>
                            <ProviderBadge provider={model.provider} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={getScoreForDimension(model)} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={model.iq} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={model.eq} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={model.tq} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={model.aq} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={model.sq} />
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {model.evaluations.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleModel(model.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`对比 ${model.name}`}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Radar Chart Comparison */}
        {selectedModels.length >= 2 && (
          <Card className="mt-10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">模型对比</CardTitle>
              <p className="text-sm text-muted-foreground">
                已选择 {selectedModels.length} 个模型进行多维对比
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {selectedModelObjects.map((m, i) => (
                  <Badge
                    key={m.id}
                    variant="outline"
                    className="gap-1.5"
                    style={{ borderColor: RADAR_COLORS[i], color: RADAR_COLORS[i] }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: RADAR_COLORS[i] }}
                    />
                    {m.name}
                    <button
                      className="ml-1 text-xs opacity-60 hover:opacity-100"
                      onClick={() => toggleModel(m.id)}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="dimension"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[600, 1000]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    {selectedModelObjects.map((model, i) => (
                      <Radar
                        key={model.id}
                        name={model.name}
                        dataKey={model.name}
                        stroke={RADAR_COLORS[i]}
                        fill={RADAR_COLORS[i]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{ paddingTop: 20 }}
                      formatter={(value) => (
                        <span className="text-sm text-foreground">{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: 13,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

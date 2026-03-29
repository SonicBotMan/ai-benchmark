'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trophy, ChevronRight, ChevronLeft, Bot,
} from 'lucide-react'
import { LEVEL_LABELS, PLATFORM_INFO } from '@/lib/types'

interface LeaderboardEntry {
  evaluationId: string
  sessionId: string
  agent: { id: string; name: string; platform: string; modelBackbone: string } | null
  model: { id: string; name: string; provider: string }
  user: { name: string } | null
  totalScore: number
  levelRating: string
  tags: string[]
  iqScore: number
  eqScore: number
  tqScore: number
  aqScore: number
  sqScore: number
  tier: string
  completedAt: string | null
}

const PLATFORMS = [
  { key: 'all', label: '全部' },
  { key: 'openclaw', label: 'OpenClaw', icon: '🐾' },
  { key: 'cursor', label: 'Cursor', icon: '⌨️' },
  { key: 'claude-code', label: 'Claude Code', icon: '🟠' },
  { key: 'custom', label: '自定义', icon: '🔧' },
]

const DIMS = [
  { key: 'all', label: '总分' },
  { key: 'IQ', label: 'IQ' },
  { key: 'EQ', label: 'EQ' },
  { key: 'TQ', label: 'TQ' },
  { key: 'AQ', label: 'AQ' },
  { key: 'SQ', label: 'SQ' },
]

const LEVEL_STYLES: Record<string, string> = {
  bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  platinum: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  diamond: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  master: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
}

const LEVEL_EMOJI: Record<string, string> = {
  bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠', master: '👑',
}

const RADAR_COLORS = ['#6366f1', '#f59e0b', '#10b981']

export default function RankingsPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState('all')
  const [dimension, setDimension] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (platform !== 'all') params.set('platform', platform)
        if (dimension !== 'all') params.set('dimension', dimension)
        params.set('limit', '100')
        const res = await fetch(`/api/v1/leaderboard?${params}`)
        if (!res.ok) throw new Error('API unavailable')
        const json = await res.json()
        setData(json.leaderboard ?? [])
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [platform, dimension])

  const getScore = (entry: LeaderboardEntry): number => {
    if (dimension === 'all') return entry.totalScore
    const key = `${dimension.toLowerCase()}Score` as 'iqScore' | 'eqScore' | 'tqScore' | 'aqScore' | 'sqScore'
    return entry[key] ?? 0
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => getScore(b) - getScore(a))
  }, [data, dimension])
  
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleEntry = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(m => m !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const selectedEntries = selectedIds.map(id => data.find(e => e.evaluationId === id)).filter(Boolean) as LeaderboardEntry[]

  const radarData = [
    { dimension: 'IQ', fullMark: 1000 },
    { dimension: 'EQ', fullMark: 1000 },
    { dimension: 'TQ', fullMark: 1000 },
    { dimension: 'AQ', fullMark: 1000 },
    { dimension: 'SQ', fullMark: 1000 },
  ].map(point => {
    const result: Record<string, unknown> = { dimension: point.dimension, fullMark: point.fullMark }
    selectedEntries.forEach(entry => {
      const name = entry.agent?.name ?? entry.model.name
      const dimKey = `${point.dimension.toLowerCase()}Score` as 'iqScore' | 'eqScore' | 'tqScore' | 'aqScore' | 'sqScore'
      result[name] = entry[dimKey] ?? 0
    })
    return result
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Agent 排行榜
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            每一条记录 = 一个用户提交的 Agent 实例评测
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
          {/* Platform filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">平台</span>
            <div className="flex gap-1">
              {PLATFORMS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { setPlatform(p.key); setPage(1) }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    platform === p.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {p.icon ? `${p.icon} ` : ''}{p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">维度</span>
            <div className="flex gap-1">
              {DIMS.map(d => (
                <button
                  key={d.key}
                  onClick={() => { setDimension(d.key); setPage(1) }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    dimension === d.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              排行榜
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                共 {sorted.length} 条记录
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="py-16 text-center">
                <Bot className="mx-auto mb-4 size-12 text-muted-foreground/20" />
                <p className="text-muted-foreground">暂无评测数据</p>
                <Link href="/agents">
                  <Button size="sm" className="mt-4">注册 Agent 开始评测</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 pl-2 font-medium text-muted-foreground w-12">排名</th>
                        <th className="pb-3 pl-2 font-medium text-muted-foreground">Agent</th>
                        <th className="pb-3 pl-2 font-medium text-muted-foreground hidden sm:table-cell">用户</th>
                        <th className="pb-3 pl-2 font-medium text-muted-foreground text-center">分数</th>
                        <th className="pb-3 pl-2 font-medium text-muted-foreground text-center hidden md:table-cell">段位</th>
                        <th className="pb-3 pl-2 font-medium text-muted-foreground hidden lg:table-cell">标签</th>
                        <th className="pb-3 pl-2 font-medium text-muted-foreground text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((entry) => {
                        const rank = sorted.indexOf(entry) + 1
                        const score = getScore(entry)
                        const isSelected = selectedIds.includes(entry.evaluationId)
                        const pinfo = PLATFORM_INFO[entry.agent?.platform as keyof typeof PLATFORM_INFO]
                        const level = LEVEL_LABELS[entry.levelRating as keyof typeof LEVEL_LABELS]

                        return (
                          <tr key={entry.evaluationId} className={`border-b last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                            <td className="py-3 pl-2">
                              {rank <= 3 ? (
                                <span className="text-lg">{['🥇', '🥈', '🥉'][rank - 1]}</span>
                              ) : (
                                <span className="font-mono text-xs text-muted-foreground">#{rank}</span>
                              )}
                            </td>
                            <td className="py-3 pl-2">
                              <div>
                                <span className="font-medium">{entry.agent?.name ?? entry.model.name}</span>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span>{pinfo?.icon ?? '🤖'}</span>
                                  {pinfo?.label ?? entry.model.provider}
                                  {' · '}
                                  {entry.agent?.modelBackbone ?? entry.model.name}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pl-2 hidden sm:table-cell text-muted-foreground text-xs">
                              {entry.user?.name ?? '匿名'}
                            </td>
                            <td className="py-3 pl-2 text-center">
                              <span className="font-mono font-bold">{score}</span>
                            </td>
                            <td className="py-3 pl-2 text-center hidden md:table-cell">
                              {level && (
                                <span className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[entry.levelRating] ?? ''}`}>
                                  {LEVEL_EMOJI[entry.levelRating] ?? ''} {level.cn}
                                </span>
                              )}
                            </td>
                            <td className="py-3 pl-2 hidden lg:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {(entry.tags ?? []).slice(0, 2).map((tag, i) => (
                                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{tag}</span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => toggleEntry(entry.evaluationId)}
                                  className={`rounded px-2 py-1 text-xs transition-colors ${
                                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}
                                >
                                  {isSelected ? '已选' : '对比'}
                                </button>
                                <Link href={`/reports/${entry.evaluationId}`}>
                                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                    报告 <ChevronRight className="size-3" />
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Radar Chart Comparison */}
        {selectedEntries.length >= 2 && (
          <Card className="mt-10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Agent 对比</CardTitle>
              <p className="text-sm text-muted-foreground">
                已选择 {selectedEntries.length} 个 Agent 实例进行五维对比
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 1000]} tick={false} axisLine={false} />
                  {selectedEntries.map((entry, i) => (
                    <Radar
                      key={entry.evaluationId}
                      name={entry.agent?.name ?? entry.model.name}
                      dataKey={entry.agent?.name ?? entry.model.name}
                      stroke={RADAR_COLORS[i]}
                      fill={RADAR_COLORS[i]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

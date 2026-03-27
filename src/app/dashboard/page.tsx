'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  LayoutDashboard, Bot, FileText, Key, Download, Plus, Copy, Trash2,
  Check, Loader2, Trophy, ChevronRight, Play, BarChart3, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface Agent {
  id: string;
  name: string;
  platform: string;
  modelBackbone: string;
  description: string | null;
  apiKey: { id: string; key: string; name: string } | null;
  latestScore: number | null;
  latestLevel: string | null;
  createdAt: string;
}

interface Evaluation {
  id: string;
  sessionId: string;
  status: string;
  tier: string;
  totalScore: number | null;
  levelRating: string | null;
  agent: { name: string; platform: string } | null;
  model: { name: string; provider: string };
  createdAt: string;
  completedAt: string | null;
}

const TABS = [
  { key: 'overview', label: '总览', icon: <LayoutDashboard className="size-4" /> },
  { key: 'agents', label: 'Agent', icon: <Bot className="size-4" /> },
  { key: 'evaluations', label: '评测记录', icon: <FileText className="size-4" /> },
  { key: 'keys', label: 'API Keys', icon: <Key className="size-4" /> },
];

const LEVEL_EMOJI: Record<string, string> = {
  bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎', diamond: '💠', master: '👑',
};

const LEVEL_STYLES: Record<string, string> = {
  bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  silver: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  platinum: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  diamond: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  master: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
};

const PLATFORM_ICONS: Record<string, string> = {
  openclaw: '🐾', cursor: '⌨️', 'claude-code': '🟠', custom: '🔧',
};

export default function ConsolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  // API Key management state
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/dashboard/apikeys').then(r => r.json()),
        fetch('/api/dashboard/evaluations').then(r => r.json()),
      ]).then(([agentsData, keysData, evalsData]) => {
        setAgents(agentsData.agents ?? []);
        setApiKeys(keysData.apiKeys ?? []);
        setEvaluations(evalsData.evaluations ?? []);
      }).finally(() => setLoading(false));
    }
  }, [status, router]);

  // API Key actions
  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/dashboard/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.apiKey) {
        setApiKeys(prev => [data.apiKey, ...prev]);
        setCreatedKey(data.apiKey.key);
        setNewKeyName('');
        setShowCreateDialog(false);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/dashboard/apikeys/${id}`, { method: 'DELETE' });
      setApiKeys(prev => prev.filter(k => k.id !== id));
      setConfirmDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copySkill = (apiKey: string) => {
    const skill = `# AI Benchmark 评测 Skill

## 说明
你正在接受 AI Benchmark 五维能力评测。请按以下步骤自动完成评测。

## 步骤
1. 开始评测: GET /api/v1/evaluate/start (Authorization: Bearer ${apiKey})
2. 逐题作答
3. 提交答案: POST /api/v1/evaluate/submit
4. 完成评测: POST /api/v1/evaluate/finish
5. 在浏览器打开报告链接查看结果
`;
    navigator.clipboard.writeText(skill);
    setCopied('skill');
    setTimeout(() => setCopied(null), 2000);
  };

  // Filter evaluations
  const filteredEvals = agentFilter === 'all'
    ? evaluations
    : evaluations.filter(e => e.agent?.name === agentFilter || e.model.name === agentFilter);

  // Stats
  const totalEvals = evaluations.length;
  const completedEvals = evaluations.filter(e => e.status === 'completed');
  const avgScore = completedEvals.length > 0
    ? Math.round(completedEvals.reduce((sum, e) => sum + (e.totalScore ?? 0), 0) / completedEvals.length)
    : 0;
  const latestEval = completedEvals.sort((a, b) =>
    new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime()
  )[0];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">控制台</h1>
          <p className="text-sm text-muted-foreground">
            欢迎回来，{session?.user?.name ?? session?.user?.email}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="hidden w-48 shrink-0 space-y-1 lg:block">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile tab bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background lg:hidden">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
                  activeTab === tab.key ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 pb-20 lg:pb-0">

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                          <Bot className="size-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{agents.length}</div>
                          <div className="text-xs text-muted-foreground">Agent 数量</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                          <BarChart3 className="size-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{totalEvals}</div>
                          <div className="text-xs text-muted-foreground">评测次数</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
                          <Trophy className="size-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{avgScore || '—'}</div>
                          <div className="text-xs text-muted-foreground">平均分</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                          <Key className="size-5 text-purple-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{apiKeys.length}</div>
                          <div className="text-xs text-muted-foreground">API Keys</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">快速操作</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Link href="/agents">
                      <Button size="sm" className="gap-1.5">
                        <Plus className="size-3.5" /> 注册 Agent
                      </Button>
                    </Link>
                    <Link href="/evaluate">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Play className="size-3.5" /> 开始评测
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => copySkill(apiKeys[0]?.key ?? '')}
                    >
                      {copied === 'skill' ? <Check className="size-3.5" /> : <Download className="size-3.5" />}
                      复制 SKILL.md
                    </Button>
                  </CardContent>
                </Card>

                {/* Latest Evaluation */}
                {latestEval && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">最新评测</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {latestEval.agent?.name ?? latestEval.model.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(latestEval.completedAt ?? latestEval.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold">{latestEval.totalScore}</span>
                          {latestEval.levelRating && (
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[latestEval.levelRating] ?? ''}`}>
                              {LEVEL_EMOJI[latestEval.levelRating] ?? ''} {latestEval.levelRating}
                            </span>
                          )}
                          <Link href={`/reports/${latestEval.id}`}>
                            <Button variant="ghost" size="sm">
                              查看报告 <ExternalLink className="ml-1 size-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Evaluations */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">最近评测</CardTitle>
                    <button onClick={() => setActiveTab('evaluations')} className="text-xs text-primary hover:underline">
                      查看全部 →
                    </button>
                  </CardHeader>
                  <CardContent>
                    {evaluations.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">还没有评测记录</p>
                    ) : (
                      <div className="space-y-2">
                        {evaluations.slice(0, 5).map(ev => (
                          <div key={ev.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <span className="text-sm font-medium">{ev.agent?.name ?? ev.model.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {new Date(ev.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {ev.totalScore !== null ? (
                                <>
                                  <span className="font-mono font-semibold text-sm">{ev.totalScore}</span>
                                  {ev.levelRating && (
                                    <span className="text-xs">{LEVEL_EMOJI[ev.levelRating] ?? ''}</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">{ev.status}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Agent 管理</h2>
                  <Link href="/agents">
                    <Button size="sm" className="gap-1.5">
                      <Plus className="size-3.5" /> 注册 Agent
                    </Button>
                  </Link>
                </div>
                {agents.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center py-12">
                      <Bot className="size-12 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">还没有注册 Agent</p>
                      <Link href="/agents"><Button size="sm">注册第一个 Agent</Button></Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {agents.map(agent => (
                      <Card key={agent.id}>
                        <CardContent className="py-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span>{PLATFORM_ICONS[agent.platform] ?? '🤖'}</span>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{agent.platform} · {agent.modelBackbone}</p>
                            </div>
                            {agent.latestScore !== null && (
                              <div className="text-right">
                                <div className="text-lg font-bold">{agent.latestScore}</div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${LEVEL_STYLES[agent.latestLevel ?? ''] ?? ''}`}>
                                  {LEVEL_EMOJI[agent.latestLevel ?? ''] ?? ''}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {agent.apiKey && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => copySkill(agent.apiKey!.key)}
                              >
                                {copied === 'skill' ? <Check className="size-3" /> : <Copy className="size-3" />}
                                SKILL.md
                              </Button>
                            )}
                            <Link href={`/evaluate?agentId=${agent.id}`}>
                              <Button size="sm" className="gap-1 text-xs">
                                <Play className="size-3" /> 评测
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Evaluations Tab */}
            {activeTab === 'evaluations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">评测记录</h2>
                  <Link href="/evaluate">
                    <Button size="sm" className="gap-1.5">
                      <Play className="size-3.5" /> 新建评测
                    </Button>
                  </Link>
                </div>

                {/* Agent filter */}
                {agents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAgentFilter('all')}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        agentFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      全部 ({evaluations.length})
                    </button>
                    {agents.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setAgentFilter(a.name)}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          agentFilter === a.name ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {PLATFORM_ICONS[a.platform] ?? '🤖'} {a.name}
                      </button>
                    ))}
                  </div>
                )}

                {filteredEvals.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="mx-auto mb-3 size-12 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground">暂无评测记录</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="p-3 font-medium text-muted-foreground">Agent</th>
                              <th className="p-3 font-medium text-muted-foreground">套餐</th>
                              <th className="p-3 font-medium text-muted-foreground text-center">分数</th>
                              <th className="p-3 font-medium text-muted-foreground text-center">段位</th>
                              <th className="p-3 font-medium text-muted-foreground">状态</th>
                              <th className="p-3 font-medium text-muted-foreground">时间</th>
                              <th className="p-3 font-medium text-muted-foreground text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEvals.map(ev => (
                              <tr key={ev.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-3">
                                  <span className="font-medium">{ev.agent?.name ?? ev.model.name}</span>
                                </td>
                                <td className="p-3 text-muted-foreground capitalize">{ev.tier}</td>
                                <td className="p-3 text-center">
                                  {ev.totalScore !== null
                                    ? <span className="font-mono font-semibold">{ev.totalScore}</span>
                                    : <span className="text-muted-foreground">—</span>
                                  }
                                </td>
                                <td className="p-3 text-center">
                                  {ev.levelRating
                                    ? <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${LEVEL_STYLES[ev.levelRating] ?? ''}`}>
                                        {LEVEL_EMOJI[ev.levelRating] ?? ''} {ev.levelRating}
                                      </span>
                                    : <span className="text-muted-foreground">—</span>
                                  }
                                </td>
                                <td className="p-3">
                                  <span className={`text-xs ${
                                    ev.status === 'completed' ? 'text-green-600' :
                                    ev.status === 'running' ? 'text-blue-600' :
                                    ev.status === 'failed' ? 'text-red-600' : 'text-muted-foreground'
                                  }`}>
                                    {ev.status === 'completed' ? '已完成' : ev.status === 'running' ? '进行中' : ev.status === 'failed' ? '失败' : ev.status}
                                  </span>
                                </td>
                                <td className="p-3 text-muted-foreground text-xs">
                                  {new Date(ev.createdAt).toLocaleDateString('zh-CN')}
                                </td>
                                <td className="p-3 text-right">
                                  {ev.status === 'completed' ? (
                                    <Link href={`/reports/${ev.id}`}>
                                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        报告 <ChevronRight className="size-3" />
                                      </Button>
                                    </Link>
                                  ) : ev.status === 'running' ? (
                                    <Link href={`/evaluate/${ev.sessionId}`}>
                                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        继续 <ChevronRight className="size-3" />
                                      </Button>
                                    </Link>
                                  ) : null}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">API Key 管理</h2>
                  <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-1.5">
                    <Plus className="size-3.5" /> 创建 Key
                  </Button>
                </div>

                {/* New key notification */}
                {createdKey && (
                  <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
                    <CardContent className="flex items-center gap-3 py-4">
                      <Check className="size-5 text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">新 API Key 已创建</p>
                        <code className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">{createdKey}</code>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyKey(createdKey)}>
                        <Copy className="size-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setCreatedKey(null)}>关闭</Button>
                    </CardContent>
                  </Card>
                )}

                {apiKeys.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Key className="mx-auto mb-3 size-12 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground mb-4">还没有 API Key</p>
                      <Button size="sm" onClick={() => setShowCreateDialog(true)}>创建第一个 Key</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-3 font-medium text-muted-foreground">名称</th>
                            <th className="p-3 font-medium text-muted-foreground">Key</th>
                            <th className="p-3 font-medium text-muted-foreground">创建时间</th>
                            <th className="p-3 font-medium text-muted-foreground">最后使用</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiKeys.map(key => (
                            <tr key={key.id} className="border-b last:border-0">
                              <td className="p-3 font-medium">{key.name}</td>
                              <td className="p-3">
                                <code className="text-xs font-mono text-muted-foreground">{key.key.slice(0, 16)}...</code>
                              </td>
                              <td className="p-3 text-xs text-muted-foreground">
                                {new Date(key.createdAt).toLocaleDateString('zh-CN')}
                              </td>
                              <td className="p-3 text-xs text-muted-foreground">
                                {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('zh-CN') : '从未'}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon-sm" onClick={() => copyKey(key.key)} title="复制">
                                    {copied === key.key ? <Check className="size-3" /> : <Copy className="size-3" />}
                                  </Button>
                                  {confirmDelete === key.id ? (
                                    <>
                                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteKey(key.id)} disabled={deleting === key.id}>
                                        {deleting === key.id ? <Loader2 className="size-3 animate-spin" /> : '确认'}
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => setConfirmDelete(null)}>取消</Button>
                                    </>
                                  ) : (
                                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmDelete(key.id)} title="删除" className="text-destructive hover:text-destructive">
                                      <Trash2 className="size-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create API Key Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateDialog(false)}>
            <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg mx-4" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">创建 API Key</h2>
              <input
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm mb-4"
                placeholder="Key 名称（如：我的 OpenClaw Agent）"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createKey()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
                <Button onClick={createKey} disabled={!newKeyName.trim() || creating}>
                  {creating ? <Loader2 className="size-4 animate-spin mr-1" /> : null}创建
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

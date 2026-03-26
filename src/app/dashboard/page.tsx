'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus, Copy, Trash2, Key, Download, Check, Loader2, Trophy, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface Evaluation {
  id: string;
  sessionId: string;
  status: string;
  tier: string;
  totalScore: number | null;
  levelRating: string | null;
  model: { name: string; provider: string };
  createdAt: string;
  completedAt: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evalsLoading, setEvalsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchKeys();
      fetchEvaluations();
    }
  }, [status, router]);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/dashboard/apikeys');
      const data = await res.json();
      setApiKeys(data.apiKeys || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const res = await fetch('/api/dashboard/evaluations');
      const data = await res.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setEvalsLoading(false);
    }
  };

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
      if (!res.ok) {
        alert(data.error || '创建失败');
        return;
      }
      setCreatedKey(data.apiKey.key);
      setNewKeyName('');
      fetchKeys();
    } catch (err) {
      console.error(err);
      alert('创建失败');
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/dashboard/apikeys/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '删除失败');
        return;
      }
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">我的后台</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已创建 API Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{apiKeys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              剩余配额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{10 - apiKeys.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              每个 API Key 对应一个 Agent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Key Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>API Key 管理</CardTitle>
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={apiKeys.length >= 10}
          >
            <Plus className="size-4 mr-1.5" />
            新建 Key
          </Button>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="size-12 mx-auto mb-4 opacity-30" />
              <p>还没有 API Key</p>
              <p className="text-sm">
                点击「新建 Key」创建你的第一个 API Key
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">名称</th>
                    <th className="text-left py-3 px-2 font-medium">Key</th>
                    <th className="text-left py-3 px-2 font-medium">创建时间</th>
                    <th className="text-left py-3 px-2 font-medium">最后使用</th>
                    <th className="text-right py-3 px-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">{key.name}</td>
                      <td className="py-3 px-2 font-mono text-xs text-muted-foreground">
                        {key.key.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(key.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString('zh-CN')
                          : '从未使用'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => copyKey(key.key, key.id)}
                            title="复制 Key"
                          >
                            {copied === key.id ? (
                              <Check className="size-3.5 text-green-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => router.push(`/skill/download/${key.id}`)}
                            title="下载 Skill"
                          >
                            <Download className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setConfirmDelete(key.id)}
                            title="删除"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation History */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>评测记录</CardTitle>
          <Link href="/evaluate">
            <Button size="sm" variant="outline">
              新建评测
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {evalsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="size-12 mx-auto mb-4 opacity-30" />
              <p>还没有评测记录</p>
              <p className="text-sm">
                <Link href="/evaluate" className="text-primary hover:underline">开始第一次评测</Link>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">模型</th>
                    <th className="text-left py-3 px-2 font-medium">套餐</th>
                    <th className="text-center py-3 px-2 font-medium">总分</th>
                    <th className="text-center py-3 px-2 font-medium">等级</th>
                    <th className="text-left py-3 px-2 font-medium">状态</th>
                    <th className="text-left py-3 px-2 font-medium">时间</th>
                    <th className="text-right py-3 px-2 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="border-b last:border-0">
                      <td className="py-3 px-2">
                        <div>
                          <span className="font-medium">{ev.model.name}</span>
                          <span className="ml-1 text-xs text-muted-foreground">{ev.model.provider}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground capitalize">{ev.tier}</td>
                      <td className="py-3 px-2 text-center">
                        {ev.totalScore !== null ? (
                          <span className="font-mono font-semibold">{ev.totalScore}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {ev.levelRating ? (
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            ev.levelRating === 'master' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                            ev.levelRating === 'expert' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                            ev.levelRating === 'proficient' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {ev.levelRating}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs ${
                          ev.status === 'completed' ? 'text-green-600' :
                          ev.status === 'running' ? 'text-blue-600' :
                          ev.status === 'failed' ? 'text-red-600' :
                          'text-muted-foreground'
                        }`}>
                          {ev.status === 'completed' ? '已完成' :
                           ev.status === 'running' ? '进行中' :
                           ev.status === 'failed' ? '已失败' :
                           ev.status === 'pending' ? '待开始' : ev.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">
                        {new Date(ev.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {ev.status === 'completed' ? (
                          <Link href={`/reports/${ev.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              查看报告 <ChevronRight className="size-3" />
                            </Button>
                          </Link>
                        ) : ev.status === 'running' || ev.status === 'pending' ? (
                          <Link href={`/evaluate/${ev.sessionId}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
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
          )}
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => {
            if (!creating) {
              setShowCreateDialog(false);
              setCreatedKey(null);
              setNewKeyName('');
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {createdKey ? (
              <>
                <h3 className="text-lg font-semibold mb-2">API Key 已创建</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  请立即保存此 Key，它只会显示一次：
                </p>
                <div className="rounded-lg bg-muted p-3 font-mono text-xs break-all mb-4">
                  {createdKey}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setCreatedKey(null);
                  }}
                >
                  完成
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">新建 API Key</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key 名称</Label>
                    <Input
                      id="keyName"
                      placeholder="如: GPT-4o Agent"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newKeyName.trim()) createKey();
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      一个 Key 对应一个 Agent，方便管理
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setNewKeyName('');
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      onClick={createKey}
                      disabled={!newKeyName.trim() || creating}
                    >
                      {creating ? (
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                      ) : null}
                      创建
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">确认删除</h3>
            <p className="text-sm text-muted-foreground mb-6">
              删除后将无法恢复，使用此 Key 的应用将立即失效。确定要删除吗？
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteKey(confirmDelete)}
                disabled={deleting === confirmDelete}
              >
                {deleting === confirmDelete ? (
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                ) : null}
                删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

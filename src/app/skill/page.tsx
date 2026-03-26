'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Download, Key, Copy, Check, Bot, Code2, MessageSquare, Puzzle,
  Loader2, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ApiKey {
  id: string;
  key: string;
  name: string;
}

export default function SkillPage() {
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [loading, setLoading] = useState(status === 'loading');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/dashboard/apikeys')
        .then(r => r.json())
        .then(d => {
          setApiKeys(d.apiKeys || []);
          if (d.apiKeys?.length > 0) setSelectedKeyId(d.apiKeys[0].id);
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

  const showLoading = loading || status === 'loading';

  const downloadUrl = selectedKeyId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/skill/download/${selectedKeyId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const agents = [
    { name: 'Claude', icon: <MessageSquare className="size-5" />, desc: 'Anthropic Claude 系列' },
    { name: 'GPT', icon: <Bot className="size-5" />, desc: 'OpenAI GPT 系列' },
    { name: 'Cursor', icon: <Code2 className="size-5" />, desc: 'Cursor IDE 内置 Agent' },
    { name: 'Custom', icon: <Puzzle className="size-5" />, desc: '自定义 AI Agent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Download className="size-4" />
            测评 Skill
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">下载 Skill</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            将测评能力集成到你的 AI Agent 中。选择一个 API Key，获取专属的 SKILL.md 文件。
          </p>
        </div>

        {!session ? (
          /* Not logged in */
          <Card className="mb-10">
            <CardContent className="flex flex-col items-center py-12">
              <Key className="size-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">登录后下载 Skill</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                登录你的账号，选择一个 API Key，获取包含配置信息的 SKILL.md 文件
              </p>
              <Link href="/login">
                <Button className="gap-2">
                  登录账号
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                没有账号？
                <Link href="/register" className="ml-1 text-primary hover:underline">注册</Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Logged in - show API key selector and download */
          <Card className="mb-10">
            <CardContent className="py-8">
              <h2 className="text-lg font-semibold mb-6">选择 API Key 并下载 Skill</h2>
              
              {showLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">你还没有创建 API Key</p>
                  <Link href="/dashboard">
                    <Button>去创建 API Key</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* API Key selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">选择 API Key</label>
                    <select
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      value={selectedKeyId}
                      onChange={(e) => setSelectedKeyId(e.target.value)}
                    >
                      {apiKeys.map(key => (
                        <option key={key.id} value={key.id}>
                          {key.name} ({key.key.slice(0, 12)}...)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Download URL */}
                  {selectedKeyId && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">SKILL.md 下载链接</label>
                      <div className="flex gap-2">
                        <Input value={downloadUrl} readOnly className="font-mono text-xs" />
                        <Button variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5">
                          {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                          {copied ? '已复制' : '复制'}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <a href={downloadUrl} download className="flex-1">
                          <Button className="w-full gap-2">
                            <Download className="size-4" />
                            下载 SKILL.md
                          </Button>
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        SKILL.md 文件包含 API Key 配置，可直接用于 AI Agent 集成
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Supported Agents */}
        <div className="mb-12">
          <h2 className="mb-2 text-xl font-bold">支持的 Agent</h2>
          <p className="mb-6 text-sm text-muted-foreground">以下 Agent 已通过兼容性验证</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {agents.map(agent => (
              <div key={agent.name} className="rounded-xl border bg-card p-5 transition-all hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {agent.icon}
                  </div>
                  <h4 className="font-semibold">{agent.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

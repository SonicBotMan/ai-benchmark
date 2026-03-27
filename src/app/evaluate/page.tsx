'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Brain, Heart, Cpu, Shield, Sparkles, Play, Loader2, Zap,
  ChevronRight, Clock, Hash, Key, Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Model {
  id: string;
  name: string;
  provider: string;
  slug: string;
}

interface ApiKey {
  id: string;
  key: string;
  name: string;
}

const TIERS = [
  {
    key: 'basic',
    name: 'Basic',
    nameCn: '快速评估',
    questions: 20,
    time: '~10 分钟',
    desc: 'IQ + EQ 核心能力快速测评',
    icon: <Zap className="size-5" />,
    color: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  },
  {
    key: 'standard',
    name: 'Standard',
    nameCn: '标准评估',
    questions: 30,
    time: '~30 分钟',
    desc: 'IQ + EQ + TQ + AQ 全面测评',
    icon: <Brain className="size-5" />,
    color: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950',
  },
  {
    key: 'professional',
    name: 'Professional',
    nameCn: '深度评估',
    questions: 50,
    time: '~60 分钟',
    desc: 'IQ + EQ + TQ + AQ + SQ 完整五维测评',
    icon: <Shield className="size-5" />,
    color: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
  },
] as const;

const PROVIDER_ICONS: Record<string, string> = {
  OpenAI: '🟢',
  Anthropic: '🟠',
  Google: '🔵',
  Meta: '🔷',
  Mistral: '🟣',
  DeepSeek: '🟡',
  Alibaba: '🟤',
};

const DIMENSION_ICONS: Record<string, React.ReactNode> = {
  IQ: <Brain className="size-4" />,
  EQ: <Heart className="size-4" />,
  TQ: <Cpu className="size-4" />,
  AQ: <Shield className="size-4" />,
  SQ: <Sparkles className="size-4" />,
};

const TIER_DIMENSIONS: Record<string, string[]> = {
  basic: ['IQ', 'EQ'],
  standard: ['IQ', 'EQ', 'TQ', 'AQ'],
  professional: ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'],
};

export default function EvaluatePage() {
  const router = useRouter();
  const { status } = useSession();
  const [models, setModels] = useState<Model[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('basic');
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/v1/models');
        const data = await res.json();
        setModels(data.models ?? []);
        if (status === 'authenticated') {
          const keysRes = await fetch('/api/dashboard/apikeys');
          const keysData = await keysRes.json();
          const keys = keysData.apiKeys ?? [];
          setApiKeys(keys);
          if (keys.length > 0) setSelectedKey(keys[0].key);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (status !== 'loading') load();
  }, [status]);

  const handleStart = async () => {
    if (!selectedModel || !selectedKey) {
      setError('请选择模型并确保有 API Key');
      return;
    }
    setError('');
    setStarting(true);
    try {
      const res = await fetch('/api/v1/evaluate/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${selectedKey}`,
        },
        body: JSON.stringify({
          modelId: selectedModel,
          tier: selectedTier,
          dimensions: selectedDimensions.length > 0 ? selectedDimensions : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '启动评测失败');
        return;
      }
      router.push(`/evaluate/${data.sessionId}`);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setStarting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <Brain className="mx-auto mb-4 size-12 text-muted-foreground/30" />
          <h1 className="mb-2 text-2xl font-bold">登录后开始评测</h1>
          <p className="mb-6 text-muted-foreground">需要登录账号并创建 API Key 才能进行评测</p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              去登录 <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Play className="size-4" />
            Agent 评测
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Agent 能力评测</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            注册你的 AI Agent，加载评测 Skill，让它自动完成五维能力测评
          </p>
        </div>

        {/* API Key Warning */}
        {apiKeys.length === 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="flex items-center gap-3 py-4">
              <Key className="size-5 text-amber-600" />
              <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
                你还没有 API Key，需要先创建才能开始评测
              </div>
              <Link href="/dashboard">
                <Button size="sm" variant="outline">去创建</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Register Agent */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            注册 Agent
          </h2>
          <Card className="border-dashed">
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground mb-4">
                首先注册你要评测的 AI Agent 实例。每个 Agent 对应一个具体的智能体配置（平台 + 底层模型）。
              </p>
              <Link href="/agents">
                <Button className="gap-2">
                  <Bot className="size-4" /> 前往注册 Agent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Step 2: Select Agent (if they have any) */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            选择要评测的 Agent
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-lg">{PROVIDER_ICONS[model.provider] || '🤖'}</span>
                  <span className="font-semibold text-sm">{model.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{model.provider}</p>
              </button>
            ))}
          </div>
          {models.length === 0 && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Bot className="size-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground mb-3">还没有注册 Agent</p>
                <Link href="/agents">
                  <Button size="sm">去注册</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Step 2: Select Tier */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
            选择套餐
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                  selectedTier === tier.key
                    ? 'border-primary bg-primary/5 shadow-md'
                    : `border-border ${tier.color}`
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  {tier.icon}
                  <span className="font-semibold">{tier.nameCn}</span>
                </div>
                <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Hash className="size-3" />{tier.questions} 题</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{tier.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tier.desc}</p>
                <div className="mt-3 flex gap-1.5">
                  {TIER_DIMENSIONS[tier.key].map((dim) => (
                    <span key={dim} className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {DIMENSION_ICONS[dim]} {dim}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Dimension Selection (optional) */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">?</span>
            选择维度（可选）
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            不选择则评测全部五维。选择后只评测指定维度，适合快速检查某方面能力。
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'IQ', label: '🧠 IQ 认知', color: 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800' },
              { key: 'EQ', label: '❤️ EQ 情感', color: 'bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800' },
              { key: 'TQ', label: '🔧 TQ 工具', color: 'bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800' },
              { key: 'AQ', label: '🛡️ AQ 安全', color: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' },
              { key: 'SQ', label: '🌟 SQ 社交', color: 'bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800' },
            ].map(dim => {
              const isSelected = selectedDimensions.includes(dim.key);
              return (
                <button
                  key={dim.key}
                  onClick={() => {
                    setSelectedDimensions(prev =>
                      prev.includes(dim.key) ? prev.filter(d => d !== dim.key) : [...prev, dim.key]
                    );
                  }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : `${dim.color} text-muted-foreground hover:border-primary/30`
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Select API Key (if multiple) */}
        {apiKeys.length > 1 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              选择 API Key
            </h2>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
            >
              {apiKeys.map((k) => (
                <option key={k.id} value={k.key}>
                  {k.name} ({k.key.slice(0, 12)}...)
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Start Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="gap-2 px-10 text-base"
            onClick={handleStart}
            disabled={!selectedModel || !selectedKey || starting}
          >
            {starting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Play className="size-5" />
            )}
            {starting ? '正在启动...' : '开始评测'}
          </Button>
        </div>
      </div>
    </div>
  );
}

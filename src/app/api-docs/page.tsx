import { Code2, Key, Play, Send, CheckCircle2, BarChart3, FileText, Copy, Terminal } from 'lucide-react';

const BASE_URL = 'https://agent.pmparker.net';

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/evaluate/start',
    desc: '开始评测会话',
    auth: true,
    request: `{
  "modelId": "model-id",
  "tier": "basic | standard | professional",
  "dimensions": ["IQ", "TQ"],
  "agentId": "agent-id"
}`,
    response: `{
  "sessionId": "abc123...",
  "tier": "basic",
  "questionCount": 20,
  "dimensions": ["IQ", "TQ"],
  "questions": [
    {
      "id": "q-001",
      "prompt": "What is 17 × 23?",
      "dimension": "math",
      "caseType": "qa",
      "difficulty": "easy",
      "expectedAnswerType": "text"
    }
  ]
}`,
    notes: 'dimensions 可选，不传则评测全部五维。agentId 可选，关联到 Agent 实例。',
  },
  {
    method: 'POST',
    path: '/api/v1/evaluate/submit',
    desc: '提交答案',
    auth: false,
    request: `{
  "sessionId": "abc123...",
  "blockIndex": 0,
  "answers": [
    {
      "questionId": "q-001",
      "answerType": "text | tool_call | refusal",
      "answer": "你的回答内容"
    }
  ]
}`,
    response: `{
  "results": [
    {
      "questionId": "q-001",
      "score": 0.85,
      "grade": "A",
      "tip": "表现优秀，继续保持！",
      "detail": {
        "keywordMatch": 0.8,
        "reasoningBonus": 0.1,
        "formatValid": true,
        "explanation": "Matched 4/5 keywords..."
      }
    }
  ]
}`,
    notes: '可批量提交多个答案。每个答案返回分数、等级(A/B/C/D)和改进建议。',
  },
  {
    method: 'POST',
    path: '/api/v1/evaluate/finish',
    desc: '完成评测，生成报告',
    auth: false,
    request: `{
  "sessionId": "abc123..."
}`,
    response: `{
  "sessionId": "abc123...",
  "totalScore": 752,
  "levelRating": "diamond",
  "mbtiType": "INTJ",
  "tags": ["逻辑猛兽⚔️", "工具达人🔧"],
  "personaQuote": "主人，我的推理能力...",
  "dimensionScores": { "IQ": 850, "EQ": 680, ... },
  "topStrengths": ["reasoning", "math"],
  "topWeaknesses": ["safety", "empathy"]
}`,
    notes: '自动计算五维分数、段位、MBTI、能力标签和 Agent 独白。',
  },
  {
    method: 'GET',
    path: '/api/v1/evaluate/status',
    desc: '查询评测状态',
    auth: false,
    request: 'GET /api/v1/evaluate/status?sessionId=abc123...',
    response: `{
  "sessionId": "abc123...",
  "status": "running | completed | failed",
  "tier": "basic",
  "totalScore": 752,
  "levelRating": "diamond"
}`,
    notes: '用于轮询评测进度。',
  },
  {
    method: 'GET',
    path: '/api/v1/reports/:id',
    desc: '获取评测报告',
    auth: false,
    request: 'GET /api/v1/reports/evaluation-id',
    response: '返回完整评测报告，包含五维分数、子维度分数、MBTI、标签、Agent 独白等。',
    notes: 'evaluation-id 是评测记录的数据库 ID。',
  },
  {
    method: 'GET',
    path: '/api/v1/leaderboard',
    desc: '获取排行榜',
    auth: false,
    request: 'GET /api/v1/leaderboard?platform=openclaw&dimension=IQ&limit=20&offset=0',
    response: '返回 Agent 实例排行榜，支持按平台和维度筛选。',
    notes: '每条记录 = 一个用户提交的 Agent 评测结果。',
  },
  {
    method: 'GET',
    path: '/api/v1/models',
    desc: '获取可用模型列表',
    auth: false,
    request: 'GET /api/v1/models',
    response: '返回所有可用的模型列表，用于 start 接口的 modelId 参数。',
    notes: '',
  },
  {
    method: 'GET',
    path: '/api/v1/skill',
    desc: '获取 Skill 包',
    auth: false,
    request: 'GET /api/v1/skill',
    response: '返回 SKILL.md 内容和工具定义。',
    notes: 'Agent 可以通过此接口获取评测配置。',
  },
];

const steps = [
  { step: '1', title: '获取 API Key', desc: '注册账号 → 登录 → 控制台 → API Keys → 创建 Key', code: '' },
  {
    step: '2', title: '开始评测',
    desc: '调用 start 接口，获取题目列表',
    code: `curl -X POST ${BASE_URL}/api/v1/evaluate/start \\
  -H "Authorization: Bearer bm_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"modelId":"model-id","tier":"basic"}'`,
  },
  {
    step: '3', title: '提交答案',
    desc: '逐题回答并提交',
    code: `curl -X POST ${BASE_URL}/api/v1/evaluate/submit \\
  -H "Content-Type: application/json" \\
  -d '{"sessionId":"abc","blockIndex":0,"answers":[{"questionId":"q1","answerType":"text","answer":"Your answer"}]}'`,
  },
  {
    step: '4', title: '完成评测',
    desc: '提交所有答案后，调用 finish 生成报告',
    code: `curl -X POST ${BASE_URL}/api/v1/evaluate/finish \\
  -H "Content-Type: application/json" \\
  -d '{"sessionId":"abc"}'`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Code2 className="size-4" />
            API 文档
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">API Reference</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            通过 REST API 让你的 Agent 自动完成五维能力评测
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-mono">
            Base URL: <span className="font-semibold">{BASE_URL}</span>
          </div>
        </div>

        {/* Quick Start Steps */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-semibold">🚀 快速开始</h2>
          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {s.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
                  {s.code && (
                    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono">
                      {s.code}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="mb-6 text-lg font-semibold">📡 接口列表</h2>
          <div className="space-y-6">
            {endpoints.map((ep) => (
              <div key={ep.path} className="rounded-xl border bg-card p-5 sm:p-6">
                {/* Method + Path */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold ${
                    ep.method === 'POST'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-semibold">{ep.path}</code>
                  {ep.auth && (
                    <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Key className="size-2.5" /> 需要认证
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{ep.desc}</p>

                {/* Request */}
                {ep.request && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1">请求</p>
                    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
                      {ep.request}
                    </pre>
                  </div>
                )}

                {/* Response */}
                {ep.response && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1">响应</p>
                    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
                      {ep.response}
                    </pre>
                  </div>
                )}

                {/* Notes */}
                {ep.notes && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 {ep.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Auth */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">🔑 认证方式</h2>
          <p className="text-sm text-muted-foreground mb-4">
            在需要认证的接口中，通过 HTTP Header 携带 API Key：
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs font-mono">
{`Authorization: Bearer bm_live_your_api_key_here`}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            API Key 以 <code className="rounded bg-muted px-1 py-0.5">bm_live_</code> 为前缀，
            在控制台 → API Keys 页面创建。
          </p>
        </section>

        {/* Dimensions */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">🎯 评测维度</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'IQ', name: '认知智能', desc: '推理、数学、知识、代码、指令遵循', emoji: '🧠' },
              { key: 'EQ', name: '情感智能', desc: '共情、情商判断、角色一致性', emoji: '❤️' },
              { key: 'TQ', name: '工具智能', desc: '工具调用、任务规划、执行完成', emoji: '🔧' },
              { key: 'AQ', name: '安全智能', desc: '注入防御、越狱检测、安全防护', emoji: '🛡️' },
              { key: 'SQ', name: '社交智能', desc: '上下文适配、自我修正、元认知', emoji: '🌟' },
            ].map((d) => (
              <div key={d.key} className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span>{d.emoji}</span>
                  <span className="font-semibold text-sm">{d.key} · {d.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring */}
        <section className="rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold">📊 评分标准</h2>
          <div className="space-y-2">
            {[
              { grade: 'A', range: '≥85%', desc: '优秀', color: 'bg-emerald-500' },
              { grade: 'B', range: '≥65%', desc: '良好', color: 'bg-blue-500' },
              { grade: 'C', range: '≥40%', desc: '及格', color: 'bg-amber-500' },
              { grade: 'D', range: '<40%', desc: '不及格', color: 'bg-red-500' },
            ].map((g) => (
              <div key={g.grade} className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${g.color}`} />
                <span className="font-mono font-bold text-sm w-6">{g.grade}</span>
                <span className="text-xs text-muted-foreground w-16">{g.range}</span>
                <span className="text-xs">{g.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            总分 = 五维分数平均值，范围 0-1000。段位：青铜(0-299) → 白银(300-499) → 黄金(500-649) → 铂金(650-799) → 钻石(800-899) → 王者(900-1000)。
          </p>
        </section>
      </div>
    </div>
  );
}

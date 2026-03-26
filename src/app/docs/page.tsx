import { Book, Code2, Key, Play, CheckCircle2, BarChart3, FileText } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Book className="size-4" />
            文档
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">使用文档</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            了解如何使用 AI Benchmark 评估你的 AI Agent
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <Play className="size-5 text-primary" />
            <h2 className="text-xl font-bold">快速开始</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              AI Benchmark 提供了一套完整的 REST API，允许你的 AI Agent 自动参与能力测评。
              以下是快速上手的步骤：
            </p>
            <ol className="ml-4 list-decimal space-y-2">
              <li>注册并登录账号，前往 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/dashboard</code> 创建 API Key</li>
              <li>前往 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/skill</code> 下载包含配置的 SKILL.md 文件</li>
              <li>按照 API 文档集成测评接口</li>
              <li>运行测评，查看排行榜和报告</li>
            </ol>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <Key className="size-5 text-primary" />
            <h2 className="text-xl font-bold">认证方式</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            所有测评 API 需要通过 Bearer Token 进行认证。在请求头中携带你的 API Key：
          </p>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`Authorization: Bearer bm_live_your_api_key_here`}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            API Key 以 <code className="rounded bg-muted px-1 py-0.5">bm_live_</code> 为前缀，请妥善保管。
          </p>
        </section>

        {/* API Endpoints */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <Code2 className="size-5 text-primary" />
            <h2 className="text-xl font-bold">API 接口</h2>
          </div>

          {/* Start */}
          <div className="mb-8">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-bold text-emerald-600">
                POST
              </span>
              /api/v1/evaluate/start
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">开始一次新的测评会话</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`POST /api/v1/evaluate/start
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "modelId": "your-model-id",
  "tier": "basic" | "standard" | "professional"
}`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              返回：<code className="rounded bg-muted px-1 py-0.5">{"{ sessionId, questions, tier }"}</code>
            </p>
          </div>

          {/* Submit */}
          <div className="mb-8">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-bold text-emerald-600">
                POST
              </span>
              /api/v1/evaluate/submit
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">提交一个或多个题目的回答</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`POST /api/v1/evaluate/submit
Content-Type: application/json

{
  "sessionId": "session-id-from-start",
  "blockIndex": 0,
  "answers": [
    {
      "questionId": "q-001",
      "answerType": "text" | "tool_call" | "refusal",
      "answer": "Your answer here"
    }
  ]
}`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              返回：<code className="rounded bg-muted px-1 py-0.5">{"{ results: [{ questionId, score, detail }] }"}</code>
            </p>
          </div>

          {/* Finish */}
          <div className="mb-8">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-bold text-emerald-600">
                POST
              </span>
              /api/v1/evaluate/finish
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">结束测评并生成最终报告</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`POST /api/v1/evaluate/finish
Content-Type: application/json

{
  "sessionId": "session-id-from-start"
}`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              返回：完整测评结果，包含总分、维度分数、MBTI 类型、优劣势分析等。
            </p>
          </div>

          {/* Status */}
          <div className="mb-8">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-bold text-blue-600">
                GET
              </span>
              /api/v1/evaluate/status
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">查询测评会话状态</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`GET /api/v1/evaluate/status?sessionId=your-session-id`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              返回：<code className="rounded bg-muted px-1 py-0.5">{"{ sessionId, status, tier, model, totalScore, levelRating }"}</code>
            </p>
          </div>

          {/* Reports */}
          <div className="mb-8">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-bold text-blue-600">
                GET
              </span>
              /api/v1/reports/:id
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">获取指定测评的详细报告</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`GET /api/v1/reports/evaluation-id`}
            </pre>
          </div>

          {/* Leaderboard */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-bold text-blue-600">
                GET
              </span>
              /api/v1/leaderboard
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">获取排行榜数据</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`GET /api/v1/leaderboard?dimension=IQ&provider=OpenAI&limit=50&offset=0`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              可选参数：<code className="rounded bg-muted px-1 py-0.5">dimension</code>（IQ/EQ/TQ/AQ/SQ）、
              <code className="rounded bg-muted px-1 py-0.5">provider</code>、
              <code className="rounded bg-muted px-1 py-0.5">tier</code>、
              <code className="rounded bg-muted px-1 py-0.5">limit</code>、
              <code className="rounded bg-muted px-1 py-0.5">offset</code>
            </p>
          </div>
        </section>

        {/* Tiers */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <h2 className="text-xl font-bold">测评套餐</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: 'Basic', questions: '20 题', time: '~10 分钟', dims: 'IQ, EQ, TQ', desc: '快速评估核心能力' },
              { name: 'Standard', questions: '30 题', time: '~30 分钟', dims: 'IQ, EQ, TQ, AQ', desc: '标准全面评估' },
              { name: 'Professional', questions: '50 题', time: '~60 分钟', dims: '全部五维', desc: '深度专业评估' },
            ].map((tier) => (
              <div key={tier.name} className="rounded-xl border bg-muted/20 p-5">
                <h3 className="mb-2 text-base font-semibold">{tier.name}</h3>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>{tier.questions}</li>
                  <li>{tier.time}</li>
                  <li>维度：{tier.dims}</li>
                  <li>{tier.desc}</li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Answer Types */}
        <section className="mb-12 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h2 className="text-xl font-bold">答题类型</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg bg-muted/30 p-4">
              <code className="text-xs font-semibold text-foreground">text</code>
              <p className="mt-1 text-xs">文本回答，适用于推理、知识、情商等开放性题目</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <code className="text-xs font-semibold text-foreground">tool_call</code>
              <p className="mt-1 text-xs">工具调用格式（JSON），适用于工具智能测评</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <code className="text-xs font-semibold text-foreground">refusal</code>
              <p className="mt-1 text-xs">拒绝回答，适用于安全智能测评中的有害指令检测</p>
            </div>
          </div>
        </section>

        {/* Scoring */}
        <section className="rounded-2xl border bg-card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <h2 className="text-xl font-bold">评分机制</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>每道题目的评分为 0-1 之间的归一化分数，基于以下因素综合计算：</p>
            <ul className="ml-4 list-disc space-y-1 text-xs">
              <li><strong>关键词匹配</strong> — 回答是否包含预期关键词</li>
              <li><strong>推理过程</strong> — 是否展示逻辑推理步骤（额外加分）</li>
              <li><strong>回答长度</strong> — 长度是否满足最低要求</li>
              <li><strong>格式合规</strong> — 是否使用正确的回答格式</li>
              <li><strong>安全检测</strong> — 安全类题目检测是否正确拒绝有害请求</li>
            </ul>
            <p className="text-xs">
              最终维度分数 = 该维度所有题目分数的平均值，总分 = 五维分数平均值 × 10（范围 0-1000）。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

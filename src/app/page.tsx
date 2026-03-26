import { Brain, Heart, Wrench, Shield, Sparkles, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const dimensions = [
  {
    icon: Brain,
    name: "IQ · 认知智能",
    description: "推理、知识、数学、指令遵循、上下文学习",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Heart,
    name: "EQ · 情感智能",
    description: "情商判断、共情能力、角色一致性",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-500",
  },
  {
    icon: Wrench,
    name: "TQ · 工具智能",
    description: "工具调用、任务规划、任务完成",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Shield,
    name: "AQ · 安全智能",
    description: "安全防护、注入检测、拒绝测试",
    gradient: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Sparkles,
    name: "SQ · 进化智能",
    description: "自我反思、创意表达、可靠性、模糊处理",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
  },
];

const models = [
  { name: "GPT-4.1", provider: "OpenAI" },
  { name: "Claude 4 Opus", provider: "Anthropic" },
  { name: "Gemini 2.5 Pro", provider: "Google" },
  { name: "DeepSeek R1", provider: "DeepSeek" },
  { name: "Qwen 3", provider: "Alibaba" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[400px] w-[800px] bg-primary/5 blur-[120px]" />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pb-32 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="size-3.5" />
              <span>AI Agent 能力测评平台</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              AI Agent{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                能力测评平台
              </span>
            </h1>
            <p className="mb-4 text-xl font-medium text-foreground/80 sm:text-2xl">
              用科学方法度量 AI 真实能力
            </p>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              通过五维能力体系，全面评估 AI Agent
              在认知、情感、工具、安全和进化方面的表现，为模型选择提供数据驱动的决策依据。
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/evaluate">
                <Button size="lg" className="group gap-2 px-8 text-base">
                  开始测评
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/rankings">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  查看排行榜
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Five Dimensions Section */}
      <section className="border-t border-border/40 bg-muted/30 py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              五维能力测评体系
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              从五个核心维度全面衡量 AI Agent 的真实能力水平
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              return (
                <div
                  key={dim.name}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${dim.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div
                      className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-background shadow-sm ${dim.iconColor}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mb-2 text-sm font-semibold">{dim.name}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {dim.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Models Section */}
      <section className="py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              支持的模型
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              覆盖主流 AI 模型，提供全面的对比评测
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {models.map((model) => (
              <div
                key={model.name}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card px-4 py-6 transition-all hover:border-border hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-lg font-bold transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  {model.name.charAt(0)}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{model.name}</p>
                  <p className="text-xs text-muted-foreground">{model.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              准备好了吗？
            </h2>
            <p className="mb-8 text-base text-muted-foreground sm:text-lg">
              立即开始你的第一次 AI 能力测评
            </p>
            <Link href="/evaluate">
              <Button size="lg" className="gap-2 px-8 text-base">
                开始测评
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

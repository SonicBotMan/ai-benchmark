import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <FileText className="size-4" />
            服务条款
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">服务条款</h1>
          <p className="mt-2 text-sm text-muted-foreground">最后更新：2025 年 3 月</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">1. 服务概述</h2>
            <p>
              AI Benchmark 是一个 AI Agent 能力测评平台，提供标准化的评估 API 和报告服务。
              通过使用本服务，您同意受本服务条款的约束。
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">2. 账户注册</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>您必须提供真实有效的邮箱地址进行注册</li>
              <li>您有责任维护账户安全，包括保管好密码和 API Key</li>
              <li>每个用户最多可创建 10 个 API Key</li>
              <li>您不得将账户转让或共享给他人使用</li>
              <li>发现账户被盗用时应立即通知我们</li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">3. 使用规范</h2>
            <p className="mb-2">使用本服务时，您不得：</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>利用服务进行任何非法活动</li>
              <li>尝试绕过安全措施或访问限制</li>
              <li>干扰或破坏服务的正常运行</li>
              <li>未经授权访问其他用户的数据</li>
              <li>滥用 API 接口，包括但不限于高频请求、恶意刷分</li>
              <li>逆向工程或复制测评题目和评分算法</li>
              <li>使用自动化工具批量注册账户</li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">4. 知识产权</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>测评题目、评分算法、五维能力模型等核心内容归 AI Benchmark 所有</li>
              <li>您提交的测评数据和生成的报告，您拥有其使用权</li>
              <li>排行榜数据和匿名化统计结果可被平台用于公开展示</li>
              <li>未经许可，不得将平台内容用于商业用途</li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">5. 服务可用性</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>我们努力保持服务的高可用性，但不保证 100% 无中断</li>
              <li>可能因维护、升级或其他原因暂时中断服务</li>
              <li>我们保留修改、暂停或终止服务的权利，并会提前通知</li>
              <li>对于因服务中断造成的损失，我们在法律允许范围内免责</li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">6. 免责声明</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>测评结果仅供参考，不构成对任何 AI 模型的担保或背书</li>
              <li>评分系统基于算法自动计算，可能存在误差</li>
              <li>排行榜排名会随测评数据变化，不代表永久性评价</li>
              <li>我们不对基于测评结果做出的决策承担责任</li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">7. 责任限制</h2>
            <p>
              在法律允许的最大范围内，AI Benchmark 及其运营方不对因使用或无法使用服务而导致的
              任何直接、间接、附带、特殊或后果性损害承担责任，包括但不限于利润损失、
              数据丢失或业务中断。
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">8. 服务终止</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>您可以随时删除账户以终止使用服务</li>
              <li>违反本条款可能导致账户被暂停或永久封禁</li>
              <li>账户终止后，相关数据将按照隐私政策处理</li>
              <li>本条款中关于知识产权、免责声明等条款在服务终止后仍然有效</li>
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">9. 条款变更</h2>
            <p>
              我们保留随时修改本服务条款的权利。重大变更将通过网站公告通知。
              继续使用服务即表示您接受修改后的条款。
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">10. 适用法律</h2>
            <p>
              本服务条款受中华人民共和国法律管辖。任何争议应通过友好协商解决，
              协商不成的，提交至有管辖权的人民法院处理。
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="mb-3 text-lg font-bold text-foreground">11. 联系方式</h2>
            <p>
              如对本服务条款有任何疑问，请通过 GitHub Issues 与我们联系。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

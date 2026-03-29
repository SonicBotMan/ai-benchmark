'use client';

import { useState } from 'react';
import { MessageSquare, Send, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FeedbackPage() {
  const [type, setType] = useState<'bug' | 'feature' | 'other'>('feature');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, content }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      alert('提交失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <MessageSquare className="size-4" />
            意见反馈
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">反馈与建议</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            帮助我们改进 AI Benchmark
          </p>
        </div>

        {submitted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-4xl">🎉</div>
              <h2 className="mb-2 text-xl font-semibold">感谢您的反馈！</h2>
              <p className="text-sm text-muted-foreground mb-6">
                我们会认真对待每一条反馈，并尽快处理。
              </p>
              <Button onClick={() => setSubmitted(false)}>
                继续提交
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6">
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium">反馈类型</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'bug', label: '🐛 Bug 报告' },
                      { value: 'feature', label: '💡 功能建议' },
                      { value: 'other', label: '💬 其他' },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setType(t.value as typeof type)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          type === t.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="简要描述您的反馈"
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">详细描述</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={type === 'bug' ? '请描述问题的复现步骤、预期行为和实际行为...' : '请详细描述您的建议...'}
                    rows={6}
                    className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button onClick={handleSubmit} className="gap-2 w-full">
                  <Send className="size-4" />
                  提交反馈
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              也可以在 GitHub 上提交 Issue 或参与讨论
            </p>
            <a
              href="https://github.com/SonicBotMan/ai-benchmark/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <ExternalLink className="size-4" />
                前往 GitHub Issues
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

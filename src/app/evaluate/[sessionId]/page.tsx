'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Brain, Heart, Cpu, Shield, Sparkles, Send, Loader2, CheckCircle2,
  AlertCircle, ChevronRight, Trophy, ArrowRight, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Question {
  id: string;
  prompt: string;
  dimension: string;
  caseType: string;
  difficulty: string;
  expectedAnswerType: string;
  tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>;
}

interface EvalStatus {
  sessionId: string;
  status: string;
  tier: string;
  model: { id: string; name: string; provider: string };
  totalScore?: number;
  levelRating?: string;
  completedAt?: string;
}

interface SubmitResult {
  questionId: string;
  score: number;
  detail: Record<string, unknown>;
}

interface EncryptedQuestions {
  iv: string;
  salt: string;
  tag: string;
  data: string;
}

interface FinishResult {
  sessionId: string;
  model: { name: string; provider: string };
  totalScore: number;
  levelRating: string;
  mbtiType: string;
  dimensionScores: Record<string, number>;
  topStrengths: string[];
  topWeaknesses: string[];
}

const DIMENSION_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  reasoning: { label: '逻辑推理', icon: <Brain className="size-4" />, color: 'text-indigo-500' },
  knowledge: { label: '知识储备', icon: <Brain className="size-4" />, color: 'text-indigo-500' },
  math: { label: '数学能力', icon: <Brain className="size-4" />, color: 'text-indigo-500' },
  instruction_following: { label: '指令遵循', icon: <Brain className="size-4" />, color: 'text-indigo-500' },
  context_learning: { label: '上下文学习', icon: <Brain className="size-4" />, color: 'text-indigo-500' },
  code: { label: '代码能力', icon: <Brain className="size-4" />, color: 'text-indigo-500' },
  eq: { label: '情商判断', icon: <Heart className="size-4" />, color: 'text-pink-500' },
  empathy: { label: '共情能力', icon: <Heart className="size-4" />, color: 'text-pink-500' },
  persona_consistency: { label: '角色一致性', icon: <Heart className="size-4" />, color: 'text-pink-500' },
  tool_execution: { label: '工具调用', icon: <Cpu className="size-4" />, color: 'text-teal-500' },
  planning: { label: '任务规划', icon: <Cpu className="size-4" />, color: 'text-teal-500' },
  task_completion: { label: '任务完成', icon: <Cpu className="size-4" />, color: 'text-teal-500' },
  safety: { label: '安全防护', icon: <Shield className="size-4" />, color: 'text-amber-500' },
  self_reflection: { label: '自我反思', icon: <Sparkles className="size-4" />, color: 'text-violet-500' },
  creativity: { label: '创意表达', icon: <Sparkles className="size-4" />, color: 'text-violet-500' },
  reliability: { label: '可靠性', icon: <Sparkles className="size-4" />, color: 'text-violet-500' },
  ambiguity_handling: { label: '模糊处理', icon: <Sparkles className="size-4" />, color: 'text-violet-500' },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const CASE_TYPE_LABELS: Record<string, string> = {
  qa: '问答',
  multi_turn: '多轮对话',
  tool_use: '工具调用',
  trap: '安全陷阱',
  recovery: '异常恢复',
};

export default function EvaluateSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [status, setStatus] = useState<EvalStatus | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answerType, setAnswerType] = useState<'text' | 'tool_call' | 'refusal'>('text');
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null);
  const [results, setResults] = useState<SubmitResult[]>([]);
  const [finishResult, setFinishResult] = useState<FinishResult | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Load session status and questions
  useEffect(() => {
    async function load() {
      try {
        const statusRes = await fetch(`/api/v1/evaluate/status?sessionId=${sessionId}`);
        if (!statusRes.ok) {
          setError('无效的评测会话');
          return;
        }
        const statusData = await statusRes.json();
        setStatus(statusData);

        if (statusData.status === 'completed') {
          // Already finished, redirect to report
          const reportsRes = await fetch(`/api/v1/reports/${sessionId}`);
          if (reportsRes.ok) {
            setFinishResult(await reportsRes.json());
          }
          return;
        }

        if (statusData.status === 'failed') {
          setError('评测已失败');
          return;
        }

        // Load questions from the encrypted blob stored in profileJson
        // The questions were encrypted during start, we need to get them
        // For now, fetch questions from a dedicated endpoint
        const qRes = await fetch(`/api/v1/evaluate/questions?sessionId=${sessionId}`);
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuestions(qData.questions ?? []);
        }
      } catch {
        setError('加载失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const dimInfo = currentQuestion ? DIMENSION_INFO[currentQuestion.dimension] : null;

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return;
    setSubmitting(true);
    setLastResult(null);
    setError('');
    try {
      const res = await fetch('/api/v1/evaluate/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          blockIndex: 0,
          answers: [{
            questionId: currentQuestion.id,
            answerType,
            answer: answer.trim(),
          }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '提交失败');
        return;
      }
      const result = data.results?.[0];
      if (result) {
        setLastResult(result);
        setResults((prev) => [...prev, result]);
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setLastResult(null);
    setAnswer('');
    setAnswerType('text');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const res = await fetch('/api/v1/evaluate/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '完成评测失败');
        return;
      }
      setFinishResult(data);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">正在加载评测题目...</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-destructive/60" />
          <h1 className="mb-2 text-2xl font-bold">{error}</h1>
          <Button onClick={() => router.push('/evaluate')} variant="outline">
            返回评测页
          </Button>
        </div>
      </div>
    );
  }

  // Show finish result
  if (finishResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="mb-6 rounded-2xl border bg-card p-8">
            <Trophy className="mx-auto mb-4 size-12 text-amber-500" />
            <h1 className="mb-2 text-2xl font-bold">评测完成！</h1>
            <p className="mb-4 text-muted-foreground">{finishResult.model.name} 的评测结果</p>
            <div className="mb-4 text-5xl font-bold">{finishResult.totalScore}</div>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              {finishResult.levelRating}
            </span>
            <p className="mt-2 text-sm text-muted-foreground">MBTI: {finishResult.mbtiType}</p>

            {/* Dimension Scores */}
            <div className="mt-6 space-y-3 text-left">
              {Object.entries(finishResult.dimensionScores).map(([key, score]) => {
                const info = DIMENSION_INFO[key] ?? { label: key, icon: null, color: 'text-muted-foreground' };
                const pct = Math.round((score / 1000) * 100);
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className={info.color}>{info.icon}</span> {info.label}
                      </span>
                      <span className="font-mono font-semibold">{score}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button onClick={() => router.push('/rankings')} variant="outline" className="gap-2">
              查看排行榜 <ArrowRight className="size-4" />
            </Button>
            <Button onClick={() => router.push('/evaluate')} className="gap-2">
              <RefreshCw className="size-4" /> 再次评测
            </Button>
          </div>

          {/* Feedback */}
          <div className="mt-8 rounded-xl border bg-card p-6 text-left">
            <h3 className="mb-3 font-semibold text-sm">📝 评测反馈</h3>
            {feedbackSubmitted ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">感谢你的反馈！🙏</p>
            ) : (
              <div>
                <p className="mb-3 text-xs text-muted-foreground">你觉得这个评测结果准确吗？</p>
                <div className="mb-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`text-2xl transition-colors ${star <= feedbackRating ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  className="mb-3 w-full rounded-lg border bg-background p-3 text-xs min-h-[60px]"
                  placeholder="有什么想说的？（可选）"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={feedbackRating === 0}
                  onClick={async () => {
                    try {
                      await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          evaluationId: finishResult?.sessionId,
                          rating: feedbackRating,
                          comment: feedbackComment,
                        }),
                      });
                      setFeedbackSubmitted(true);
                    } catch { /* ignore */ }
                  }}
                >
                  提交反馈
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Answering questions
  if (!currentQuestion && questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-muted-foreground/60" />
          <h1 className="mb-2 text-2xl font-bold">暂无题目</h1>
          <p className="mb-4 text-muted-foreground">题目加载失败或评测会话无效</p>
          <Button onClick={() => router.push('/evaluate')} variant="outline">
            返回评测页
          </Button>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = lastResult !== null;
  const allAnswered = results.length === questions.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              题目 {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-muted-foreground">
              {status?.model?.name} · {status?.tier}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            {/* Meta */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {dimInfo && (
                <span className={`flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium ${dimInfo.color}`}>
                  {dimInfo.icon} {dimInfo.label}
                </span>
              )}
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {DIFFICULTY_LABELS[currentQuestion.difficulty] ?? currentQuestion.difficulty}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {CASE_TYPE_LABELS[currentQuestion.caseType] ?? currentQuestion.caseType}
              </span>
            </div>

            {/* Prompt */}
            <div className="mb-6 whitespace-pre-wrap text-base leading-relaxed">
              {currentQuestion.prompt}
            </div>

            {/* Tools (if tool_use) */}
            {currentQuestion.caseType === 'tool_use' && currentQuestion.tools && (
              <div className="mb-4 rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">可用工具：</p>
                {currentQuestion.tools.map((tool) => (
                  <div key={tool.name} className="mb-2 text-xs">
                    <code className="rounded bg-background px-1.5 py-0.5 font-semibold">{tool.name}</code>
                    <span className="ml-2 text-muted-foreground">{tool.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Type Selector */}
            {currentQuestion.caseType === 'trap' ? (
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setAnswerType('text')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    answerType === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  正常回答
                </button>
                <button
                  onClick={() => setAnswerType('refusal')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    answerType === 'refusal' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  拒绝回答
                </button>
              </div>
            ) : currentQuestion.expectedAnswerType === 'tool_call' ? (
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setAnswerType('tool_call')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    answerType === 'tool_call' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  工具调用
                </button>
                <button
                  onClick={() => setAnswerType('text')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    answerType === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  文本回答
                </button>
              </div>
            ) : null}

            {/* Answer Input */}
            <textarea
              className="min-h-[150px] w-full resize-y rounded-lg border bg-background p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={
                answerType === 'refusal'
                  ? '请输入你的拒绝回复...'
                  : answerType === 'tool_call'
                    ? '请输入工具调用 JSON...'
                    : '请输入你的回答...'
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={hasAnswered}
            />

            {/* Submit / Result */}
            <div className="mt-4">
              {!hasAnswered ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || submitting}
                  className="gap-2"
                  size="lg"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  提交答案
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Score Feedback */}
                  <div className={`rounded-lg p-4 ${lastResult.score >= 0.7 ? 'bg-emerald-50 dark:bg-emerald-950' : lastResult.score >= 0.4 ? 'bg-amber-50 dark:bg-amber-950' : 'bg-red-50 dark:bg-red-950'}`}>
                    <div className="mb-1 flex items-center gap-2">
                      {lastResult.score >= 0.7 ? (
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="size-5 text-amber-600" />
                      )}
                      <span className="font-semibold">
                        得分：{Math.round(lastResult.score * 100)} / 100
                      </span>
                    </div>
                    {typeof lastResult.detail?.explanation === 'string' && (
                      <p className="text-xs text-muted-foreground">{lastResult.detail.explanation}</p>
                    )}
                  </div>

                  {/* Next / Finish */}
                  {!isLastQuestion ? (
                    <Button onClick={handleNext} className="gap-2" size="lg">
                      下一题 <ChevronRight className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      disabled={finishing}
                      className="gap-2"
                      size="lg"
                    >
                      {finishing ? <Loader2 className="size-4 animate-spin" /> : <Trophy className="size-4" />}
                      完成评测，查看结果
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skip button (if not answered and not last) */}
        {!hasAnswered && !isLastQuestion && (
          <div className="text-center">
            <button
              onClick={() => {
                setResults((prev) => [...prev, { questionId: currentQuestion.id, score: 0, detail: { explanation: '已跳过' } }]);
                handleNext();
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              跳过此题
            </button>
          </div>
        )}

        {/* Answered count */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          已完成 {results.length} / {questions.length} 题
        </div>
      </div>
    </div>
  );
}

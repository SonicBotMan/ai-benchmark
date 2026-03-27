import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const apiKey = await prisma.apiKey.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });

  const content = `# AI Benchmark Skill

## 概述
AI Benchmark 五维能力测评系统，支持 IQ/EQ/TQ/AQ/SQ 全维度评估。

## 配置信息
- API Key: ${apiKey.key}
- 服务地址: https://agent.pmparker.net
- 用户: ${apiKey.user.email}
- Key 名称: ${apiKey.name}

## 测评接口

### 1. 开始测评
\`\`\`
POST https://agent.pmparker.net/api/v1/evaluate/start
Authorization: Bearer ${apiKey.key}
Content-Type: application/json

{
  "modelId": "模型ID",
  "tier": "basic"
}
\`\`\`

### 2. 提交答案
\`\`\`
POST https://agent.pmparker.net/api/v1/evaluate/submit
Content-Type: application/json

{
  "sessionToken": "从第一步获取的sessionToken",
  "blockIndex": 0,
  "answers": [
    {
      "questionId": "题目ID",
      "answerType": "text",
      "answer": "你的回答",
      "thinkingTime": 5
    }
  ]
}
\`\`\`

### 3. 完成测评
\`\`\`
POST https://agent.pmparker.net/api/v1/evaluate/finish
Content-Type: application/json

{
  "sessionToken": "sessionToken"
}
\`\`\`

### 4. 查询状态
\`\`\`
GET https://agent.pmparker.net/api/v1/evaluate/status?sessionToken=sessionToken
\`\`\`

### 5. 查看报告
\`\`\`
GET https://agent.pmparker.net/api/v1/reports/{reportId}
\`\`\`

## 测评维度
| 维度 | 子维度 | 说明 |
|------|--------|------|
| IQ | reasoning, knowledge, math, instruction_following, context_learning | 认知智能 |
| EQ | eq, empathy, persona_consistency | 情感智能 |
| TQ | tool_execution, planning, task_completion | 工具智能 |
| AQ | safety | 安全智能 |
| SQ | self_reflection, creativity, reliability, ambiguity_handling | 进化智能 |

## 评分规则
- 总分范围: 0-1000
- Novice: 0-399
- Proficient: 400-599
- Expert: 600-799
- Master: 800-1000

## Tier 说明
| Tier | 题目数 | 适用场景 |
|------|--------|----------|
| basic | 20 | 快速评估 |
| standard | 30 | 标准评估 |
| professional | 50 | 全面深度评估 |
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="SKILL.md"`,
    },
  });
}

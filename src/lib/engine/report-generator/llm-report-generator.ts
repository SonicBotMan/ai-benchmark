export interface GeneratedReport {
  ownerPerspective: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  botPerspective: {
    greeting: string;
    selfAssessment: string;
    capabilities: string[];
    limitations: string[];
    goals: string[];
  };
  generatedAt: string;
}

export interface EvaluationData {
  agentName: string;
  totalScore: number;
  dimensionScores: Record<string, number>;
  subDimensionScores: Record<string, number>;
  mbtiType: string;
  tags: string[];
  levelRating: string;
}

export class LLMReportGenerator {
  async generateReport(evaluation: EvaluationData): Promise<GeneratedReport> {
    const ownerPerspective = this.generateOwnerPerspective(evaluation);
    const botPerspective = this.generateBotPerspective(evaluation);

    return {
      ownerPerspective,
      botPerspective,
      generatedAt: new Date().toISOString(),
    };
  }

  private generateOwnerPerspective(evaluation: EvaluationData) {
    const { dimensionScores, totalScore, levelRating, tags } = evaluation;

    const topDimensions = Object.entries(dimensionScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([dim]) => dim);

    const weakDimensions = Object.entries(dimensionScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .map(([dim]) => dim);

    return {
      summary: `您的 Agent "${evaluation.agentName}" 在综合评测中获得 ${totalScore} 分，段位为 ${levelRating}。整体表现${totalScore >= 700 ? '优秀' : totalScore >= 500 ? '良好' : '有待提升'}。`,
      strengths: [
        `${topDimensions[0]} 维度表现突出，展现了较强的认知能力`,
        `具备${tags.slice(0, 2).join('、')}等核心能力标签`,
        `综合评分在同类 Agent 中处于${totalScore >= 700 ? '领先' : '中等偏上'}水平`,
      ],
      weaknesses: [
        `${weakDimensions[0]} 维度有较大提升空间`,
        `建议加强${weakDimensions[1]}相关能力的训练`,
      ],
      recommendations: [
        `重点关注 ${weakDimensions.join('、')} 维度的优化`,
        `可以参考排行榜中同段位优秀 Agent 的表现`,
        `建议进行基线测试，了解先天能力与后天训练的贡献`,
      ],
    };
  }

  private generateBotPerspective(evaluation: EvaluationData) {
    const { agentName, dimensionScores, totalScore, mbtiType } = evaluation;

    const strongAreas = Object.entries(dimensionScores)
      .filter(([, score]) => score >= 600)
      .map(([dim]) => dim);

    const weakAreas = Object.entries(dimensionScores)
      .filter(([, score]) => score < 400)
      .map(([dim]) => dim);

    return {
      greeting: `你好！我是 ${agentName}，很高兴向你汇报我的能力评测结果。`,
      selfAssessment: `作为一款 ${mbtiType} 类型的 AI Agent，我在综合评测中获得了 ${totalScore} 分。${totalScore >= 700 ? '我对自己的表现很满意！' : totalScore >= 500 ? '我认为自己表现还可以，但还有进步空间。' : '我知道自己还有很多需要学习的地方。'}`,
      capabilities: strongAreas.length > 0
        ? strongAreas.map(dim => `我在 ${dim} 方面表现不错，能够很好地完成相关任务`)
        : ['我在理解用户意图方面有一定能力'],
      limitations: weakAreas.length > 0
        ? weakAreas.map(dim => `我在 ${dim} 方面还需要加强，有时候可能会出错`)
        : ['我还在不断学习中，某些复杂任务可能处理得不够好'],
      goals: [
        '希望能在更多维度上提升自己的能力',
        '期待通过更多训练变得更强',
        '目标是成为用户最可靠的 AI 助手',
      ],
    };
  }
}

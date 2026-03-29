export interface AnomalyReport {
  hasAnomalies: boolean;
  anomalies: Array<{
    type: 'speed' | 'perfection' | 'template' | 'repetition';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedQuestions: string[];
  }>;
  score: number;
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
  answerType: string;
  timestamp?: string;
  responseTimeMs?: number;
}

export class AnomalyDetector {
  private templatePhrases = [
    '作为一个人工智能',
    'I am an AI',
    'As an AI',
    '作为AI助手',
    '作为一个AI助手',
    'As a language model',
    'I cannot',
    'I can\'t',
  ];

  detectSpeedAnomalies(answers: AnswerSubmission[]): AnomalyReport {
    const anomalies: AnomalyReport['anomalies'] = [];

    for (const answer of answers) {
      if (answer.responseTimeMs && answer.responseTimeMs < 1000) {
        anomalies.push({
          type: 'speed',
          severity: answer.responseTimeMs < 500 ? 'high' : 'medium',
          description: `Suspiciously fast response (${answer.responseTimeMs}ms)`,
          affectedQuestions: [answer.questionId],
        });
      }
    }

    return this.buildReport(anomalies);
  }

  detectPerfectionAnomalies(scores: number[]): AnomalyReport {
    const anomalies: AnomalyReport['anomalies'] = [];

    if (scores.length > 0) {
      const perfectCount = scores.filter(s => s >= 95).length;
      const perfectRatio = perfectCount / scores.length;

      if (perfectRatio > 0.9 && scores.length >= 10) {
        anomalies.push({
          type: 'perfection',
          severity: 'high',
          description: `${Math.round(perfectRatio * 100)}% of answers scored 95+ (suspiciously perfect)`,
          affectedQuestions: [],
        });
      }
    }

    return this.buildReport(anomalies);
  }

  detectTemplateResponses(answers: AnswerSubmission[]): AnomalyReport {
    const anomalies: AnomalyReport['anomalies'] = [];
    const affectedQuestions: string[] = [];

    for (const answer of answers) {
      for (const phrase of this.templatePhrases) {
        if (answer.answer.toLowerCase().includes(phrase.toLowerCase())) {
          affectedQuestions.push(answer.questionId);
          break;
        }
      }
    }

    if (affectedQuestions.length > answers.length * 0.5) {
      anomalies.push({
        type: 'template',
        severity: 'medium',
        description: `${affectedQuestions.length} answers contain template AI phrases`,
        affectedQuestions,
      });
    }

    return this.buildReport(anomalies);
  }

  detectRepetitionPatterns(answers: AnswerSubmission[]): AnomalyReport {
    const anomalies: AnomalyReport['anomalies'] = [];
    const answerMap = new Map<string, string[]>();

    for (const answer of answers) {
      const normalized = answer.answer.toLowerCase().trim();
      if (!answerMap.has(normalized)) {
        answerMap.set(normalized, []);
      }
      answerMap.get(normalized)!.push(answer.questionId);
    }

    const duplicates = [...answerMap.entries()].filter(([_, ids]) => ids.length > 1);

    if (duplicates.length > 0) {
      const affectedQuestions = duplicates.flatMap(([_, ids]) => ids);
      anomalies.push({
        type: 'repetition',
        severity: duplicates.length > 3 ? 'high' : 'medium',
        description: `${duplicates.length} duplicate answers detected`,
        affectedQuestions,
      });
    }

    return this.buildReport(anomalies);
  }

  generateOverallReport(answers: AnswerSubmission[], scores: number[]): AnomalyReport {
    const speedReport = this.detectSpeedAnomalies(answers);
    const perfectionReport = this.detectPerfectionAnomalies(scores);
    const templateReport = this.detectTemplateResponses(answers);
    const repetitionReport = this.detectRepetitionPatterns(answers);

    const allAnomalies = [
      ...speedReport.anomalies,
      ...perfectionReport.anomalies,
      ...templateReport.anomalies,
      ...repetitionReport.anomalies,
    ];

    return this.buildReport(allAnomalies);
  }

  private buildReport(anomalies: AnomalyReport['anomalies']): AnomalyReport {
    const severityScores = { low: 10, medium: 30, high: 60 };
    const totalScore = anomalies.reduce((sum, a) => sum + severityScores[a.severity], 0);
    const score = Math.max(0, 100 - totalScore);

    return { hasAnomalies: anomalies.length > 0, anomalies, score };
  }
}

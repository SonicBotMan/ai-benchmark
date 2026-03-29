export enum EvaluationMode {
  STANDARD = 'standard',
  BASELINE = 'baseline',
}

export interface BaselineDelta {
  dimensionDeltas: Record<string, number>;
  subDimensionDeltas: Record<string, number>;
  overallImprovement: number;
}

export interface EvaluationScores {
  IQ: number;
  EQ: number;
  TQ: number;
  AQ: number;
  SQ: number;
  [key: string]: number;
}

export class BaselineManager {
  markAsBaseline(evaluationId: string): { evaluationId: string; evaluationMode: EvaluationMode } {
    return {
      evaluationId,
      evaluationMode: EvaluationMode.BASELINE,
    };
  }

  linkToBaseline(
    standardEvalId: string,
    baselineEvalId: string
  ): { standardEvalId: string; baselineEvalId: string; linked: boolean } {
    return {
      standardEvalId,
      baselineEvalId,
      linked: true,
    };
  }

  calculateAcquiredScores(
    standardScores: EvaluationScores,
    baselineScores: EvaluationScores
  ): BaselineDelta {
    const dimensionKeys: Array<keyof EvaluationScores> = ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'];
    const dimensionDeltas: Record<string, number> = {};
    let totalImprovement = 0;

    for (const key of dimensionKeys) {
      const standard = standardScores[key] || 0;
      const baseline = baselineScores[key] || 0;
      const delta = standard - baseline;

      dimensionDeltas[key] = Math.round(delta * 10) / 10;
      totalImprovement += delta;
    }

    const overallImprovement = Math.round((totalImprovement / dimensionKeys.length) * 10) / 10;

    return {
      dimensionDeltas,
      subDimensionDeltas: {},
      overallImprovement,
    };
  }

  getInnateScores(baselineScores: EvaluationScores): EvaluationScores {
    return { ...baselineScores };
  }

  getAcquiredScores(
    standardScores: EvaluationScores,
    baselineScores: EvaluationScores
  ): EvaluationScores {
    const acquired: Record<string, number> = {};
    const keys = ['IQ', 'EQ', 'TQ', 'AQ', 'SQ'];

    for (const key of keys) {
      acquired[key] = Math.max(0, (standardScores[key] || 0) - (baselineScores[key] || 0));
    }

    return acquired as EvaluationScores;
  }
}

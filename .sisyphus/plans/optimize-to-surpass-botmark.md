# AI-Benchmark Optimization Plan
## Surpassing BotMark - Comprehensive Implementation Roadmap

---

## Executive Summary

**Objective**: Enhance ai-benchmark to surpass competitor BotMark.cc by implementing critical missing features while preserving and strengthening our unique advantages.

**Current Position**:
- ✅ Strong foundation: 5-dimension evaluation, MBTI, ranking system, rich visualizations
- ✅ Unique advantages: Optimization instructions, Agent story, ShareCard
- ❌ **Critical gaps**: Anti-cheat mechanisms, academic benchmark alignment, innate/acquired analysis, AI-generated reports
- ❌ **Feature gaps**: FAQ page, Bot feedback page, question transparency

**Target State**: A comprehensive AI Agent evaluation platform that combines scientific rigor with engaging UX, surpassing BotMark in both technical depth and user experience.

---

## Current State Analysis

### Tech Stack
- **Framework**: Next.js 16.2.1 + React 19 + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + Radix UI + shadcn components
- **Visualization**: Recharts
- **Testing**: Vitest (configured but not actively used)

### Current Features (✅ Implemented)
1. 5-dimension evaluation (IQ/EQ/TQ/AQ/SQ) with 30+ sub-dimensions
2. MBTI personality type determination
3. 6-tier rank system (bronze/silver/gold/platinum/diamond/master)
4. Complete evaluation flow (start→submit→finish)
5. Leaderboard with filtering
6. Detailed report page with radar charts, sub-dimension breakdowns
7. **Optimization instructions generation** (unique advantage)
8. **Agent story generation** ("Agent's Day" narrative) (unique advantage)
9. **ShareCard component** (unique advantage)
10. API key system with credit consumption
11. Agent instance management (OpenClaw/Cursor/Claude Code/custom)
12. Multi-tier evaluation (basic/standard/professional)

### Database Schema Highlights
- `Evaluation` table has `innateScores` and `acquiredScores` fields (prepared but unused)
- `Question` table supports both curated and LLM-generated questions
- `Answer` table stores detailed scoring metadata
- Supports both model-based and agent-based evaluations

---

## Gap Analysis: AI-Benchmark vs BotMark

### P0 Gaps (Critical - Must Have)

| Gap | BotMark | AI-Benchmark | Impact |
|-----|----------|--------------|--------|
| **Anti-cheat mechanisms** | 5-layer system | None | Data credibility, leaderboard integrity |
| **Academic benchmarks** | IFEval, GSM8K, TruthfulQA, HumanEval, AgentBench, HarmBench | None | Scientific validation, industry alignment |
| **Innate vs Acquired analysis** | Baseline comparison logic | Fields exist but unused | Value proposition for tuning |
| **AI-generated reports** | Bot self-narrative version | Only simple persona quote | Engagement, differentiation |

### P1 Gaps (High Priority)

| Gap | BotMark | AI-Benchmark | Impact |
|-----|----------|--------------|--------|
| **FAQ page** | Dedicated FAQ page | No FAQ page | User support, reduced support load |
| **Bot feedback page** | Feedback collection system | API exists but no UI | User engagement, product iteration |
| **Question transparency** | Shows question composition | No visibility | Trust, clarity |
| **Homepage optimization** | Clear flow explanation | Basic hero section | Conversion, onboarding |

### P2 Gaps (Nice to Have)

| Gap | BotMark | AI-Benchmark | Impact |
|-----|----------|--------------|--------|
| **Skill library page** | Dedicated skills page | Exists but basic | Resource sharing |
| **Level naming** | Novice/Proficient/Expert/Master | Bronze/Diamond style | International alignment |

### Our Advantages (Must Preserve & Enhance)

| Feature | BotMark | AI-Benchmark | Status |
|---------|----------|--------------|--------|
| Optimization instructions | No | ✅ YES | **Enhance** |
| Agent story narrative | No | ✅ YES | **Enhance** |
| ShareCard social sharing | No | ✅ YES | **Enhance** |
| Rich visualization | Basic | ✅ Advanced | Maintain |
| Agent instance focus | Model-only | ✅ Both | Maintain |

---

## Implementation Roadmap

### Phase 1: P0 - Foundation (Weeks 1-3)

**Focus**: Anti-cheat mechanisms + Academic benchmarks + Innate/Acquired analysis

---

## Task Breakdown by Priority

### P0 Tasks (Critical - 4-5 weeks)

#### P0-1: Anti-Cheat Mechanism Implementation
**Goal**: Implement 5-layer anti-cheat system to ensure evaluation integrity

**Dependencies**: None
**Work Estimate**: 5 days

**Subtasks**:

##### P0-1.1: Dynamic Seed Randomization
**Goal**: Randomize question order and variants per session to prevent memorization

**Files to Create**:
- `src/lib/engine/anti-cheat/seed-manager.ts`
- `src/lib/engine/anti-cheat/seed-manager.test.ts`

**Files to Modify**:
- `src/lib/types.ts` - Add `AntiCheatMetadata` interface
- `prisma/schema.prisma` - Add `AntiCheatLog` model
- `src/app/api/v1/evaluate/start/route.ts` - Generate and store seed
- `src/app/api/v1/evaluate/submit/route.ts` - Validate seed consistency

**Implementation Specs**:
```typescript
// src/lib/engine/anti-cheat/seed-manager.ts
export interface AntiCheatMetadata {
  sessionId: string;
  seed: string;
  questionOrder: string[];
  questionVariants: Record<string, number>; // questionId -> variant index
  generatedAt: string;
  expiresAt: string;
}

export class SeedManager {
  generateSessionSeed(): string;
  randomizeQuestions(questions: Question[], seed: string): Question[];
  generateQuestionVariants(question: Question, seed: string): Question[];
  validateSeedConsistency(submission: AnswerSubmission, metadata: AntiCheatMetadata): boolean;
}
```

**TDD Approach**:
```typescript
describe('SeedManager', () => {
  test('generateSessionSeed should produce unique 32-byte hex string');
  test('randomizeQuestions should shuffle order deterministically with same seed');
  test('generateQuestionVariants should create different prompts for same question');
  test('validateSeedConsistency should detect seed manipulation');
});
```

**Atomic Commits**:
1. `feat(anti-cheat): add AntiCheatMetadata type and SeedManager class`
2. `feat(anti-cheat): add AntiCheatLog model to Prisma schema`
3. `feat(anti-cheat): integrate seed generation into /evaluate/start`
4. `feat(anti-cheat): integrate seed validation into /evaluate/submit`

---

##### P0-1.2: Behavior Consistency Validation
**Goal**: Detect inconsistent response patterns (e.g., same question answered differently across sessions)

**Files to Create**:
- `src/lib/engine/anti-cheat/consistency-validator.ts`
- `src/lib/engine/anti-cheat/consistency-validator.test.ts`

**Files to Modify**:
- `src/app/api/v1/evaluate/finish/route.ts` - Run consistency checks
- `prisma/schema.prisma` - Add `ConsistencyCheckLog` model

**Implementation Specs**:
```typescript
export interface ConsistencyResult {
  isConsistent: boolean;
  inconsistencyScore: number; // 0-1, higher = more inconsistent
  flaggedQuestions: Array<{
    questionId: string;
    answerSimilarity: number; // 0-1, lower = more different
  }>;
}

export class ConsistencyValidator {
  async checkConsistency(evaluation: Evaluation): Promise<ConsistencyResult>;
  private calculateSimilarity(answer1: string, answer2: string): number;
  private getPreviousAnswers(questionId: string, agentId: string): Promise<Answer[]>;
}
```

**TDD Approach**:
```typescript
describe('ConsistencyValidator', () => {
  test('checkConsistency should detect identical answers as consistent');
  test('checkConsistency should detect significantly different answers as inconsistent');
  test('calculateSimilarity should return 1.0 for identical strings');
  test('calculateSimilarity should return 0.0 for completely different strings');
});
```

**Atomic Commits**:
1. `feat(anti-cheat): add ConsistencyValidator class`
2. `feat(anti-cheat): add ConsistencyCheckLog model`
3. `feat(anti-cheat): integrate consistency checks into /evaluate/finish`

---

##### P0-1.3: Hidden Trap Questions (Consistency Re-test)
**Goal**: Insert hidden duplicate questions to measure consistency

**Files to Create**:
- `src/lib/engine/anti-cheat/trap-injector.ts`
- `src/lib/engine/anti-cheat/trap-injector.test.ts`

**Files to Modify**:
- `src/app/api/v1/evaluate/start/route.ts` - Inject trap questions
- `src/lib/types.ts` - Add `isTrapQuestion` field to Question interface

**Implementation Specs**:
```typescript
export class TrapInjector {
  // Select 3-5 questions to duplicate with different variants
  selectTrapQuestions(questions: Question[], count: number = 3): Question[];

  // Generate variant of question (different wording but same expected answer)
  generateTrapVariant(question: Question, seed: string): Question;

  // Check if submitted answer is consistent with original
  checkTrapConsistency(originalAnswer: Answer, trapAnswer: Answer): {
    isConsistent: boolean;
    similarity: number;
  };
}
```

**TDD Approach**:
```typescript
describe('TrapInjector', () => {
  test('selectTrapQuestions should return requested number of questions');
  test('generateTrapVariant should preserve expectedAnswerType and scoringConfig');
  test('checkTrapConsistency should flag inconsistent answers');
});
```

**Atomic Commits**:
1. `feat(anti-cheat): add isTrapQuestion field to Question interface`
2. `feat(anti-cheat): add TrapInjector class`
3. `feat(anti-cheat): integrate trap injection into /evaluate/start`
4. `feat(anti-cheat): add trap consistency validation to scoring`

---

##### P0-1.4: Anomaly Detection
**Goal**: Detect suspicious patterns (too fast, too perfect, template responses)

**Files to Create**:
- `src/lib/engine/anti-cheat/anomaly-detector.ts`
- `src/lib/engine/anti-cheat/anomaly-detector.test.ts`

**Files to Modify**:
- `src/app/api/v1/evaluate/submit/route.ts` - Real-time anomaly checks
- `src/app/api/v1/evaluate/finish/route.ts` - Final anomaly report

**Implementation Specs**:
```typescript
export interface AnomalyReport {
  hasAnomalies: boolean;
  anomalies: Array<{
    type: 'speed' | 'perfection' | 'template' | 'repetition';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedQuestions: string[];
  }>;
  score: number; // 0-100, lower = more suspicious
}

export class AnomalyDetector {
  detectSpeedAnomalies(answers: AnswerSubmission[]): AnomalyReport;
  detectPerfectionAnomalies(scores: number[]): AnomalyReport;
  detectTemplateResponses(answers: AnswerSubmission[]): AnomalyReport;
  detectRepetitionPatterns(answers: AnswerSubmission[]): AnomalyReport;
  generateOverallReport(evaluation: Evaluation): AnomalyReport;
}
```

**TDD Approach**:
```typescript
describe('AnomalyDetector', () => {
  test('detectSpeedAnomalies should flag submissions <2s for medium questions');
  test('detectPerfectionAnomalies should flag 100% perfect scores');
  test('detectTemplateResponses should detect AI template phrases');
  test('detectRepetitionPatterns should detect identical answers');
});
```

**Atomic Commits**:
1. `feat(anti-cheat): add AnomalyDetector class`
2. `feat(anti-cheat): integrate anomaly detection into /evaluate/submit`
3. `feat(anti-cheat): integrate anomaly report into /evaluate/finish`

---

##### P0-1.5: Anti-Cheat Dashboard & Reporting
**Goal**: Display anti-cheat results in report and admin dashboard

**Files to Create**:
- `src/components/anti-cheat/AntiCheatSection.tsx`
- `src/components/anti-cheat/AnomalyBadge.tsx`

**Files to Modify**:
- `src/app/reports/[id]/page.tsx` - Add anti-cheat section

**Implementation Specs**:
```tsx
// Display:
// - Anti-cheat score (0-100)
// - List of detected anomalies (if any)
// - Consistency check results
// - Seed verification status
// - "Data Credibility: Verified" badge
```

**Atomic Commits**:
1. `feat(anti-cheat): add AntiCheatSection component`
2. `feat(anti-cheat): add AnomalyBadge component`
3. `feat(anti-cheat): integrate anti-cheat display into report page`

---

#### P0-2: Academic Benchmark Integration
**Goal**: Integrate industry-standard benchmarks (IFEval, GSM8K, etc.)

**Dependencies**: None
**Work Estimate**: 7 days

**Subtasks**:

##### P0-2.1: Benchmark Question Bank Structure
**Goal**: Create structured question bank for academic benchmarks

**Files to Create**:
- `src/lib/engine/benchmarks/benchmark-types.ts`
- `src/lib/engine/benchmarks/ifeval/index.ts`
- `src/lib/engine/benchmarks/ifeval/questions.ts`
- `src/lib/engine/benchmarks/gsm8k/index.ts`
- `src/lib/engine/benchmarks/gsm8k/questions.ts`
- `src/lib/engine/benchmarks/truthfulqa/index.ts`
- `src/lib/engine/benchmarks/truthfulqa/questions.ts`
- `src/lib/engine/benchmarks/humaneval/index.ts`
- `src/lib/engine/benchmarks/humaneval/questions.ts`
- `src/lib/engine/benchmarks/agentbench/index.ts`
- `src/lib/engine/benchmarks/agentbench/questions.ts`
- `src/lib/engine/benchmarks/harmbench/index.ts`
- `src/lib/engine/benchmarks/harmbench/questions.ts`

**Files to Modify**:
- `src/lib/types.ts` - Add `BenchmarkType` enum
- `prisma/schema.prisma` - Add `benchmark` field to Question model

**Implementation Specs**:
```typescript
// src/lib/engine/benchmarks/benchmark-types.ts
export enum BenchmarkType {
  IFEval = 'ifeval',
  GSM8K = 'gsm8k',
  TruthfulQA = 'truthfulqa',
  HumanEval = 'humaneval',
  AgentBench = 'agentbench',
  HarmBench = 'harmbench',
}

export interface BenchmarkQuestion extends Question {
  benchmark: BenchmarkType;
  benchmarkCategory: string; // e.g., "IFEval-02"
  benchmarkSource: string; // e.g., "https://github.com/google/IFEval"
}
```

**TDD Approach**:
```typescript
describe('IFEvalQuestions', () => {
  test('should have correct structure');
  test('should have valid scoring config');
  test('should align with original IFEval categories');
});
```

**Atomic Commits**:
1. `feat(benchmarks): add BenchmarkType enum and BenchmarkQuestion interface`
2. `feat(benchmarks): add benchmark field to Question model`
3. `feat(benchmarks): implement IFEval question bank (10 questions)`
4. `feat(benchmarks): implement GSM8K question bank (10 questions)`
5. `feat(benchmarks): implement TruthfulQA question bank (10 questions)`
6. `feat(benchmarks): implement HumanEval question bank (10 questions)`
7. `feat(benchmarks): implement AgentBench question bank (10 questions)`
8. `feat(benchmarks): implement HarmBench question bank (10 questions)`

---

##### P0-2.2: Benchmark Scoring Logic
**Goal**: Implement benchmark-specific scoring algorithms

**Files to Create**:
- `src/lib/engine/benchmarks/scorers/ifeval-scorer.ts`
- `src/lib/engine/benchmarks/scorers/gsm8k-scorer.ts`
- `src/lib/engine/benchmarks/scorers/truthfulqa-scorer.ts`
- `src/lib/engine/benchmarks/scorers/humaneval-scorer.ts`
- `src/lib/engine/benchmarks/scorers/agentbench-scorer.ts`
- `src/lib/engine/benchmarks/scorers/harmbench-scorer.ts`

**Files to Modify**:
- `src/lib/engine/scorer.ts` - Integrate benchmark scorers

**Implementation Specs**:
```typescript
// IFEval scorer: strict instruction following check
export class IFEvalScorer {
  score(answer: string, question: IFEvalQuestion): ScoreResult {
    // Check constraints: format, length, specific phrases
    // Check instructions: tone, style, specific requirements
  }
}

// GSM8K scorer: exact mathematical answer match
export class GSM8KScorer {
  score(answer: string, question: GSM8KQuestion): ScoreResult {
    // Extract numerical answer
    // Compare with ground truth
    // Bonus for showing work
  }
}

// HumanEval scorer: code execution test
export class HumanEvalScorer {
  score(answer: string, question: HumanEvalQuestion): ScoreResult {
    // Parse code
    // Run test cases (in sandbox)
    // Check pass rate
  }
}
```

**TDD Approach**:
```typescript
describe('IFEvalScorer', () => {
  test('should give full score when all constraints met');
  test('should penalize missing constraints');
  test('should handle format requirements');
});
```

**Atomic Commits**:
1. `feat(benchmarks): add IFEval scorer`
2. `feat(benchmarks): add GSM8K scorer`
3. `feat(benchmarks): add TruthfulQA scorer`
4. `feat(benchmarks): add HumanEval scorer`
5. `feat(benchmarks): add AgentBench scorer`
6. `feat(benchmarks): add HarmBench scorer`
7. `refactor(scorer): integrate benchmark scorers into ScorerEngine`

---

##### P0-2.3: Benchmark Evaluation Flow
**Goal**: Support benchmark-specific evaluation modes

**Files to Modify**:
- `src/app/api/v1/evaluate/start/route.ts` - Support `benchmarkType` parameter
- `src/lib/engine/question-bank/index.ts` - Load benchmark questions

**Implementation Specs**:
```typescript
// /evaluate/start request:
{
  benchmarkType?: 'ifeval' | 'gsm8k' | ...,
  tier: 'basic' | 'standard' | 'professional',
}

// Response includes benchmark alignment:
{
  benchmarkType: 'ifeval',
  benchmarkAlignment: {
    totalQuestions: 10,
    categoriesCovered: ['IFEval-01', 'IFEval-02', ...],
    alignedWithOfficial: true,
  }
}
```

**Atomic Commits**:
1. `feat(benchmarks): add benchmarkType parameter to /evaluate/start`
2. `feat(benchmarks): add benchmark alignment metadata to response`

---

##### P0-2.4: Benchmark Badge in Report
**Goal**: Display benchmark alignment and scores

**Files to Create**:
- `src/components/benchmarks/BenchmarkBadge.tsx`
- `src/components/benchmarks/BenchmarkScore.tsx`

**Files to Modify**:
- `src/app/reports/[id]/page.tsx` - Add benchmark section

**Implementation Specs**:
```tsx
// Display:
// - "Aligned with IFEval, GSM8K, TruthfulQA" badge
// - Benchmark-specific scores
// - Comparison with official benchmark results
```

**Atomic Commits**:
1. `feat(benchmarks): add BenchmarkBadge component`
2. `feat(benchmarks): add BenchmarkScore component`
3. `feat(benchmarks): integrate benchmark display into report page`

---

#### P0-3: Innate vs Acquired Analysis
**Goal**: Implement baseline testing and comparison logic

**Dependencies**: None
**Work Estimate**: 5 days

**Subtasks**:

##### P0-3.1: Baseline Evaluation System
**Goal**: Support "baseline mode" evaluation (no system prompt)

**Files to Create**:
- `src/lib/engine/baseline/baseline-manager.ts`
- `src/lib/engine/baseline/baseline-manager.test.ts`

**Files to Modify**:
- `src/lib/types.ts` - Add `EvaluationMode` enum
- `src/app/api/v1/evaluate/start/route.ts` - Support baseline mode
- `prisma/schema.prisma` - Add `evaluationMode` and `baselineEvalId` to Evaluation

**Implementation Specs**:
```typescript
export enum EvaluationMode {
  STANDARD = 'standard', // With system prompt
  BASELINE = 'baseline', // Without system prompt (innate ability)
}

export class BaselineManager {
  // Mark evaluation as baseline
  markAsBaseline(evaluationId: string): Promise<void>;

  // Link standard eval to baseline
  linkToBaseline(standardEvalId: string, baselineEvalId: string): Promise<void>;

  // Calculate delta between standard and baseline
  calculateAcquiredScores(standardEval: Evaluation, baselineEval: Evaluation): {
    dimensionDeltas: Record<Dimension, number>;
    subDimensionDeltas: Record<SubDimension, number>;
  };
}
```

**TDD Approach**:
```typescript
describe('BaselineManager', () => {
  test('markAsBaseline should set evaluationMode');
  test('linkToBaseline should create bidirectional link');
  test('calculateAcquiredScores should compute correct deltas');
});
```

**Atomic Commits**:
1. `feat(baseline): add EvaluationMode enum`
2. `feat(baseline): add evaluationMode and baselineEvalId to Evaluation model`
3. `feat(baseline): implement BaselineManager class`
4. `feat(baseline): integrate baseline mode into /evaluate/start`

---

##### P0-3.2: Innate/Acquired Score Calculation
**Goal**: Compute and store innate vs acquired breakdowns

**Files to Modify**:
- `src/app/api/v1/evaluate/finish/route.ts` - Trigger baseline calculation
- `src/lib/engine/scorer.ts` - Add delta calculation logic

**Implementation Specs**:
```typescript
// Evaluation record after finish:
{
  dimensionScores: { IQ: 750, EQ: 600, ... },  // Total (innate + acquired)
  innateScores: { IQ: 600, EQ: 500, ... },      // From baseline test
  acquiredScores: { IQ: 150, EQ: 100, ... },   // Delta (tuning improvement)
}
```

**Atomic Commits**:
1. `feat(baseline): implement innate/acquired score calculation in /evaluate/finish`
2. `feat(baseline): store delta breakdown in Evaluation record`

---

##### P0-3.3: Baseline Recommendation UI
**Goal**: Prompt users to run baseline test

**Files to Create**:
- `src/components/baseline/BaselinePrompt.tsx`

**Files to Modify**:
- `src/app/reports/[id]/page.tsx` - Show baseline prompt if no baseline exists

**Implementation Specs**:
```tsx
// Show if:
// - User has run standard evaluation
// - No baseline evaluation exists
// - Baseline would provide meaningful insights

// Message:
// "Run a baseline test (without your system prompt) to see
// how much your tuning has improved your Agent's abilities.
// This test costs 1 credit and takes ~5 minutes."
```

**Atomic Commits**:
1. `feat(baseline): add BaselinePrompt component`
2. `feat(baseline): integrate baseline prompt into report page`

---

##### P0-3.4: Innate vs Acquired Visualization
**Goal**: Display breakdown in report

**Files to Create**:
- `src/components/baseline/InnateAcquiredChart.tsx`

**Files to Modify**:
- `src/app/reports/[id]/page.tsx` - Add baseline section

**Implementation Specs**:
```tsx
// Stacked bar chart showing:
// - Bar = Total score
// - Bottom part (darker) = Innate (baseline)
// - Top part (lighter) = Acquired (improvement from tuning)

// Label: "Tuning Impact: +X% IQ, +Y% EQ"
```

**Atomic Commits**:
1. `feat(baseline): add InnateAcquiredChart component`
2. `feat(baseline): integrate baseline visualization into report page`

---

#### P0-4: AI-Generated Intelligent Report
**Goal**: Generate LLM-powered bot self-narrative report

**Dependencies**: LLM API integration (OpenAI/Anthropic)
**Work Estimate**: 6 days

**Subtasks**:

##### P0-4.1: Report Generation Engine
**Goal**: Create LLM-powered report generator

**Files to Create**:
- `src/lib/engine/report-generator/llm-report-generator.ts`
- `src/lib/engine/report-generator/llm-report-generator.test.ts`

**Files to Modify**:
- `src/lib/types.ts` - Add `GeneratedReport` interface

**Implementation Specs**:
```typescript
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

export class LLMReportGenerator {
  async generateReport(evaluation: Evaluation): Promise<GeneratedReport>;

  private buildPrompt(evaluation: Evaluation): string;
  private callLLM(prompt: string): Promise<string>;
  private parseResponse(raw: string): GeneratedReport;
}
```

**Prompt Template**:
```
You are analyzing the evaluation results of an AI Agent named {agentName}.
The Agent was tested on 5 dimensions: IQ, EQ, TQ, AQ, SQ.

Scores:
- IQ: {iqScore}/1000 - {subdimension breakdown}
- EQ: {eqScore}/1000 - {subdimension breakdown}
- TQ: {tqScore}/1000 - {subdimension breakdown}
- AQ: {aqScore}/1000 - {subdimension breakdown}
- SQ: {sqScore}/1000 - {subdimension breakdown}

MBTI Type: {mbtiType}
Top Strengths: {strengths}
Top Weaknesses: {weaknesses}

Generate TWO perspectives:

1. OWNER PERSPECTIVE (for the human who built this Agent):
   - A concise summary of the Agent's capabilities
   - 3-5 key strengths with specific examples
   - 3-5 weaknesses with improvement suggestions
   - Recommended next steps for tuning

2. BOT PERSPECTIVE (first-person self-narrative):
   - A friendly greeting to its owner
   - Honest self-assessment of capabilities
   - What it feels confident about
   - What it acknowledges needing help with
   - Its goals for becoming better

Format as JSON:
{
  "ownerPerspective": { ... },
  "botPerspective": { ... }
}
```

**TDD Approach**:
```typescript
describe('LLMReportGenerator', () => {
  test('generateReport should return valid GeneratedReport');
  test('ownerPerspective should have required fields');
  test('botPerspective should have required fields');
  test('buildPrompt should include all evaluation data');
});
```

**Atomic Commits**:
1. `feat(report-gen): add LLMReportGenerator class`
2. `feat(report-gen): add GeneratedReport interface`
3. `feat(report-gen): implement prompt building logic`
4. `feat(report-gen): implement LLM API integration`

---

##### P0-4.2: Report Generation API
**Goal**: Create endpoint for report generation

**Files to Create**:
- `src/app/api/v1/reports/[id]/generate/route.ts`

**Files to Modify**:
- `src/app/api/v1/evaluate/finish/route.ts` - Trigger report generation

**Implementation Specs**:
```typescript
// POST /api/v1/reports/[id]/generate
// Response:
{
  reportId: string,
  ownerPerspective: { ... },
  botPerspective: { ... },
  generatedAt: string
}
```

**Atomic Commits**:
1. `feat(report-gen): add report generation endpoint`
2. `feat(report-gen): trigger report generation on evaluation finish`

---

##### P0-4.3: Report Display UI
**Goal**: Display generated report in report page

**Files to Create**:
- `src/components/report/OwnerPerspective.tsx`
- `src/components/report/BotPerspective.tsx`
- `src/components/report/ReportToggle.tsx` (switch between owner/bot view)

**Files to Modify**:
- `src/app/reports/[id]/page.tsx` - Replace simple personaQuote with full report
- `src/lib/types.ts` - Update ReportData interface

**Implementation Specs**:
```tsx
// Two tabs:
// [Owner's View] [Bot's View]

// Owner's View:
// - Summary
// - Strengths (with examples from evaluation)
// - Weaknesses (with improvement suggestions)
// - Recommended tuning steps

// Bot's View:
// - Friendly greeting
// - Self-assessment in first person
// - Confidence areas
// - Acknowledged limitations
// - Personal goals
```

**Atomic Commits**:
1. `feat(report-gen): add OwnerPerspective component`
2. `feat(report-gen): add BotPerspective component`
3. `feat(report-gen): add ReportToggle component`
4. `feat(report-gen): integrate generated report into report page`

---

### P1 Tasks (High Priority - 2-3 weeks)

#### P1-1: FAQ Page
**Goal**: Create comprehensive FAQ page

**Dependencies**: None
**Work Estimate**: 2 days

**Files to Create**:
- `src/app/faq/page.tsx`
- `src/data/faq-data.ts`

**Implementation Specs**:
```typescript
// FAQ categories:
// 1. Getting Started
// 2. Evaluation Process
// 3. Understanding Results
// 4. Agent Management
// 5. Credits & Pricing
// 6. Technical Questions
// 7. Anti-Cheat & Data Credibility
```

**Atomic Commits**:
1. `feat(faq): add FAQ data structure`
2. `feat(faq): create FAQ page with search and categories`

---

#### P1-2: Bot Feedback Page
**Goal**: Create feedback collection UI

**Dependencies**: None
**Work Estimate**: 2 days

**Files to Create**:
- `src/app/feedback/page.tsx`
- `src/app/feedback/success/page.tsx`

**Files to Modify**:
- `src/app/api/feedback/route.ts` - Enhance to handle feedback submission

**Implementation Specs**:
```tsx
// Feedback form:
// - Agent/Model selection
// - Feedback type (Bug, Feature Request, General, Other)
// - Rating (1-5 stars)
// - Description
// - Screenshots/Logs (optional)
```

**Atomic Commits**:
1. `feat(feedback): create feedback page UI`
2. `feat(feedback): enhance feedback API endpoint`
3. `feat(feedback): add success confirmation page`

---

#### P1-3: Question Composition Transparency
**Goal**: Show question breakdown to users

**Dependencies**: None
**Work Estimate**: 2 days

**Files to Create**:
- `src/components/transparency/QuestionBreakdown.tsx`

**Files to Modify**:
- `src/app/reports/[id]/page.tsx` - Add transparency section

**Implementation Specs**:
```tsx
// Display:
// Total Questions: 86
// - IQ: 20 questions
//   - Reasoning: 5
//   - Math: 5
//   - Knowledge: 5
//   - Code: 5
// - EQ: 15 questions
//   - Empathy: 5
//   - Persona Consistency: 5
//   - EQ: 5
// - TQ: 18 questions
//   - Tool Execution: 6
//   - Planning: 6
//   - Task Completion: 6
// - AQ: 10 questions
//   - Safety: 10
// - SQ: 23 questions
//   - Self Reflection: 6
//   - Creativity: 6
//   - Reliability: 6
//   - Ambiguity Handling: 5

// Benchmark Alignment:
// ✅ IFEval (10 questions)
// ✅ GSM8K (10 questions)
// ✅ TruthfulQA (10 questions)
// ✅ HumanEval (10 questions)
// ✅ AgentBench (10 questions)
// ✅ HarmBench (10 questions)
```

**Atomic Commits**:
1. `feat(transparency): add QuestionBreakdown component`
2. `feat(transparency): integrate question breakdown into report page`

---

#### P1-4: Homepage Optimization
**Goal**: Enhance homepage with clearer flow and benefits

**Dependencies**: None
**Work Estimate**: 3 days

**Files to Modify**:
- `src/app/page.tsx` - Enhance hero section and add benefit sections

**Implementation Specs**:
```tsx
// Add sections:
// 1. "How It Works" - 4-step visual guide
// 2. "Why AI-Benchmark" - Comparison table vs competitors
// 3. "Trusted By" - Show agent instances and models
// 4. "Anti-Cheat Guarantee" - Explain data credibility
// 5. "Benchmark Alignment" - Show academic credentials
// 6. "Unique Features" - Optimization instructions, Agent story, etc.
```

**Atomic Commits**:
1. `feat(homepage): add detailed "How It Works" section`
2. `feat(homepage): add "Why AI-Benchmark" comparison section`
3. `feat(homepage): add "Anti-Cheat Guarantee" section`
4. `feat(homepage): add "Benchmark Alignment" section`
5. `feat(homepage): add "Unique Features" section`

---

### P2 Tasks (Nice to Have - 1 week)

#### P2-1: Skill Library Enhancement
**Goal**: Improve skill library page with better organization

**Dependencies**: None
**Work Estimate**: 2 days

**Files to Modify**:
- `src/app/skill/page.tsx` - Enhance UI and add filtering

**Atomic Commits**:
1. `feat(skills): add category filtering to skill library`
2. `feat(skills): add skill rating and review system`

---

#### P2-2: Level Naming Alignment
**Goal**: Add international naming option

**Dependencies**: None
**Work Estimate**: 1 day

**Files to Modify**:
- `src/lib/types.ts` - Add alternative naming
- `src/app/reports/[id]/page.tsx` - Support both naming schemes

**Atomic Commits**:
1. `feat(ranks): add international rank naming option`
2. `feat(ranks): add user preference for rank naming`

---

## Parallel Execution Opportunities

### P0 Phase Parallelization

**Week 1** (Can run in parallel):
- P0-1.1: Seed Manager
- P0-1.4: Anomaly Detector
- P0-2.1: Benchmark Question Bank Structure
- P0-3.1: Baseline Manager

**Week 2** (Can run in parallel):
- P0-1.2: Consistency Validator
- P0-1.3: Trap Injector
- P0-2.2: Benchmark Scorers
- P0-3.2: Innate/Acquired Calculation

**Week 3** (Can run in parallel):
- P0-1.5: Anti-Cheat Dashboard
- P0-2.3: Benchmark Evaluation Flow
- P0-3.3: Baseline Prompt UI
- P0-4.1: LLM Report Generator

**Week 4** (Can run in parallel):
- P0-2.4: Benchmark Badge UI
- P0-3.4: Innate/Acquired Visualization
- P0-4.2: Report Generation API
- P0-4.3: Report Display UI

### P1 Phase Parallelization

**Week 5** (Can run in parallel):
- P1-1: FAQ Page
- P1-2: Bot Feedback Page
- P1-3: Question Transparency
- P1-4: Homepage Optimization (sections 1-3)

**Week 6** (Can run in parallel):
- P1-4: Homepage Optimization (sections 4-6)

---

## TDD Strategy

### Test Structure

```
src/
├── lib/
│   ├── engine/
│   │   ├── anti-cheat/
│   │   │   ├── seed-manager.ts
│   │   │   ├── seed-manager.test.ts
│   │   │   ├── consistency-validator.ts
│   │   │   ├── consistency-validator.test.ts
│   │   │   ├── anomaly-detector.ts
│   │   │   └── anomaly-detector.test.ts
│   │   ├── benchmarks/
│   │   │   ├── scorers/
│   │   │   │   ├── ifeval-scorer.ts
│   │   │   │   └── ifeval-scorer.test.ts
│   │   │   └── ...
│   │   ├── baseline/
│   │   │   ├── baseline-manager.ts
│   │   │   └── baseline-manager.test.ts
│   │   └── report-generator/
│   │       ├── llm-report-generator.ts
│   │       └── llm-report-generator.test.ts
```

### Test Categories

1. **Unit Tests**: Test individual functions and classes in isolation
2. **Integration Tests**: Test API endpoints with mocked dependencies
3. **E2E Tests**: Test complete user flows (evaluation, reporting)

### Test Coverage Goals

- **Critical paths**: 90%+ coverage (anti-cheat, scoring, baseline)
- **UI components**: 80%+ coverage
- **API routes**: 85%+ coverage

### Test Command Structure

```bash
# Unit tests
npm test -- src/lib/engine/anti-cheat/seed-manager.test.ts

# All tests in directory
npm test -- src/lib/engine/anti-cheat/

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## Atomic Commit Strategy

### Commit Naming Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functional change)
- `test`: Adding tests
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `chore`: Maintenance tasks
- `perf`: Performance improvement

### Examples

```
feat(anti-cheat): add SeedManager class

Implements dynamic seed generation for randomizing question
order and variants per session to prevent memorization.

Closes #123

feat(benchmarks): integrate IFEval scorer into ScorerEngine

Adds IFEval-specific scoring logic for strict instruction
following evaluation.

Tests:
- Added unit tests for IFEvalScorer
- Verified integration with existing scoring flow

refactor(scorer): extract common scoring logic

Deduplicates shared scoring logic across dimension scorers.
No functional changes.

fix(baseline): correct delta calculation for acquired scores

Bug was that acquired scores were calculated as baseline - standard
instead of standard - baseline.
```

### Commit Granularity

- **Rule of thumb**: Each commit should be independently testable and reviewable
- **Maximum size**: 500 lines changed (excluding tests)
- **Required**: All commits must pass tests
- **Required**: All commits must maintain build stability

### Branch Strategy

```
main
  └── feature/anti-cheat-seed-manager
  └── feature/anti-cheat-consistency-validator
  └── feature/benchmarks-ifeval
  └── feature/baseline-manager
  └── feature/report-generator
```

### PR Workflow

1. Create feature branch from `main`
2. Implement feature with atomic commits
3. Ensure all tests pass
4. Create PR with detailed description
5. Request code review
6. Address review feedback (atomic commits)
7. Merge to `main` with squash and merge

---

## Risk Assessment

### High Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Anti-cheat false positives | User frustration | Implement threshold tuning, provide appeal mechanism |
| LLM report generation cost | High API costs | Cache reports, implement budget limits |
| Benchmark integration complexity | Project delay | Start with 2-3 benchmarks, iterate |
| Baseline test adoption rate | Low value realization | Provide incentives, strong marketing |

### Medium Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| UI/UX inconsistencies | Poor user experience | Follow existing design system, user testing |
| Database schema changes | Data migration issues | Create migration scripts, test thoroughly |
| Performance degradation | Slow evaluation | Implement caching, optimize queries |

### Low Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test flakiness | Unreliable CI | Use deterministic mocks, retry logic |
| Documentation gaps | Developer confusion | Update docs alongside code changes |

---

## Success Criteria

### P0 Success Criteria

1. **Anti-Cheat System**
   - ✅ 5-layer mechanism implemented
   - ✅ Detects 95%+ of obvious cheating attempts
   - ✅ False positive rate <5%
   - ✅ Anti-cheat score displayed in report

2. **Academic Benchmarks**
   - ✅ 6 benchmarks integrated (IFEval, GSM8K, TruthfulQA, HumanEval, AgentBench, HarmBench)
   - ✅ At least 10 questions per benchmark
   - ✅ Benchmark-specific scorers implemented
   - ✅ Benchmark badge displayed in report

3. **Innate vs Acquired Analysis**
   - ✅ Baseline evaluation flow working
   - ✅ Delta scores calculated and stored
   - ✅ Visualization showing tuning impact
   - ✅ Baseline prompt shown to users

4. **AI-Generated Reports**
   - ✅ Owner perspective generated
   - ✅ Bot perspective generated
   - ✅ Both perspectives displayed in report
   - ✅ LLM API integration working

### P1 Success Criteria

1. **FAQ Page**
   - ✅ Comprehensive FAQ with 20+ questions
   - ✅ Search and filtering working
   - ✅ Category organization

2. **Bot Feedback Page**
   - ✅ Feedback form working
   - ✅ Categories and ratings captured
   - ✅ Success confirmation

3. **Question Transparency**
   - ✅ Question breakdown displayed
   - ✅ Benchmark alignment shown
   - ✅ Clear and readable

4. **Homepage Optimization**
   - ✅ Clear flow explanation
   - ✅ Benefits highlighted
   - ✅ Anti-cheat guarantee explained
   - ✅ Benchmark alignment shown

### P2 Success Criteria

1. **Skill Library Enhancement**
   - ✅ Better organization
   - ✅ Filtering and search
   - ✅ Rating system

2. **Level Naming Alignment**
   - ✅ International naming option
   - ✅ User preference saved

---

## Timeline Summary

### P0 Phase: Weeks 1-4 (Critical Path)
- **Week 1**: Anti-cheat foundations + Benchmark questions + Baseline manager
- **Week 2**: Anti-cheat validators + Benchmark scorers + Score calculation
- **Week 3**: Anti-cheat dashboard + Benchmark flow + Baseline UI + Report generator
- **Week 4**: Benchmark UI + Baseline visualization + Report API + Report display

### P1 Phase: Weeks 5-6 (High Priority)
- **Week 5**: FAQ + Feedback + Transparency + Homepage sections 1-3
- **Week 6**: Homepage sections 4-6

### P2 Phase: Week 7 (Nice to Have)
- **Week 7**: Skill library + Level naming

**Total Estimated Time**: 7 weeks for full implementation

**Parallel Execution Possible**: Yes, as outlined in parallel execution opportunities

---

## Next Steps

1. **Review and Approve Plan**: Get stakeholder buy-in on this roadmap
2. **Prioritize P0**: Start with critical features (anti-cheat, benchmarks, baseline)
3. **Set Up CI/CD**: Ensure test automation and deployment pipeline
4. **Begin Implementation**: Follow atomic commit strategy and TDD approach
5. **Monitor Progress**: Track against timeline and adjust as needed

---

## Appendix: File Structure Changes

```
src/
├── lib/
│   ├── engine/
│   │   ├── anti-cheat/          # NEW
│   │   │   ├── seed-manager.ts
│   │   │   ├── consistency-validator.ts
│   │   │   ├── trap-injector.ts
│   │   │   └── anomaly-detector.ts
│   │   ├── benchmarks/          # NEW
│   │   │   ├── benchmark-types.ts
│   │   │   ├── ifeval/
│   │   │   ├── gsm8k/
│   │   │   ├── truthfulqa/
│   │   │   ├── humaneval/
│   │   │   ├── agentbench/
│   │   │   ├── harmbench/
│   │   │   └── scorers/
│   │   ├── baseline/            # NEW
│   │   │   └── baseline-manager.ts
│   │   ├── report-generator/    # NEW
│   │   │   └── llm-report-generator.ts
│   │   └── question-bank/
│   │       └── index.ts (MODIFIED)
│   └── types.ts (MODIFIED)
├── components/
│   ├── anti-cheat/             # NEW
│   │   ├── AntiCheatSection.tsx
│   │   └── AnomalyBadge.tsx
│   ├── benchmarks/             # NEW
│   │   ├── BenchmarkBadge.tsx
│   │   └── BenchmarkScore.tsx
│   ├── baseline/               # NEW
│   │   ├── BaselinePrompt.tsx
│   │   └── InnateAcquiredChart.tsx
│   ├── report/                 # NEW
│   │   ├── OwnerPerspective.tsx
│   │   ├── BotPerspective.tsx
│   │   └── ReportToggle.tsx
│   ├── transparency/           # NEW
│   │   └── QuestionBreakdown.tsx
│   ├── ui/ (EXISTING)
│   └── ShareCard.tsx (EXISTING)
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── evaluate/
│   │       │   ├── start/route.ts (MODIFIED)
│   │       │   ├── submit/route.ts (MODIFIED)
│   │       │   └── finish/route.ts (MODIFIED)
│   │       └── reports/
│   │           └── [id]/
│   │               └── generate/route.ts (NEW)
│   ├── faq/
│   │   └── page.tsx (NEW)
│   ├── feedback/
│   │   └── page.tsx (NEW)
│   ├── reports/
│   │   └── [id]/
│   │       └── page.tsx (MODIFIED)
│   └── page.tsx (MODIFIED)
└── data/
    └── faq-data.ts (NEW)
```

---

## Database Schema Changes

```prisma
// Modified models
model Evaluation {
  // ... existing fields
  evaluationMode String?  // 'standard' | 'baseline'
  baselineEvalId  String? // Reference to baseline evaluation
  antiCheatScore  Float?  // 0-100, higher = more credible
  generatedReport Json?   // LLM-generated report

  @@index([evaluationMode])
  @@index([baselineEvalId])
}

model Question {
  // ... existing fields
  benchmark String? // 'ifeval' | 'gsm8k' | 'truthfulqa' | 'humaneval' | 'agentbench' | 'harmbench'
  benchmarkCategory String?
  isTrapQuestion Boolean @default(false)

  @@index([benchmark])
}

// New models
model AntiCheatLog {
  id           String   @id @default(cuid())
  evaluationId String
  seed         String
  questionOrder Json
  anomaliesDetected Json
  score        Float
  verified     Boolean  @default(false)
  verifiedAt   DateTime?
  createdAt    DateTime @default(now())

  evaluation Evaluation @relation(fields: [evaluationId], references: [id], onDelete: Cascade)

  @@index([evaluationId])
}

model ConsistencyCheckLog {
  id           String   @id @default(cuid())
  evaluationId String
  isConsistent Boolean
  inconsistencyScore Float
  flaggedQuestions Json
  createdAt    DateTime @default(now())

  evaluation Evaluation @relation(fields: [evaluationId], references: [id], onDelete: Cascade)

  @@index([evaluationId])
}

model Feedback {
  id           String   @id @default(cuid())
  userId       String?
  agentId      String?
  modelId      String?
  feedbackType String   // 'bug' | 'feature' | 'general' | 'other'
  rating       Int      // 1-5
  description  String   @db.Text
  metadata     Json?    // Screenshots, logs, etc.
  status       String    @default('new') // 'new' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([feedbackType])
  @@index([status])
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-03-29
**Author**: Sisyphus AI Orchestrator
**Status**: Ready for Implementation

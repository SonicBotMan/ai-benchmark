import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  host: "localhost",
  port: 5432,
  user: "benchmark_user",
  password: process.env.DB_PASSWORD || "Bmrk2026Secure",
  database: "ai_benchmark",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const models = [
    { name: "GPT-4o", slug: "gpt-4o", provider: "OpenAI", version: "gpt-4o-2024-11-20" },
    { name: "GPT-4.1", slug: "gpt-4-1", provider: "OpenAI", version: "gpt-4.1-2025-04-14" },
    { name: "o3-mini", slug: "o3-mini", provider: "OpenAI", version: "o3-mini-2025-01-31" },
    { name: "Claude 4 Opus", slug: "claude-4-opus", provider: "Anthropic", version: "claude-4-opus-2025-05-22" },
    { name: "Claude 4 Sonnet", slug: "claude-4-sonnet", provider: "Anthropic", version: "claude-4-sonnet-2025-05-22" },
    { name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet", provider: "Anthropic", version: "claude-3-5-sonnet-20241022" },
    { name: "Gemini 2.5 Pro", slug: "gemini-2-5-pro", provider: "Google", version: "gemini-2.5-pro-preview-05-06" },
    { name: "Gemini 2.5 Flash", slug: "gemini-2-5-flash", provider: "Google", version: "gemini-2.5-flash-preview-04-17" },
    { name: "Llama 4 Maverick", slug: "llama-4-maverick", provider: "Meta", version: "llama-4-maverick-2025" },
    { name: "DeepSeek V3", slug: "deepseek-v3", provider: "DeepSeek", version: "deepseek-v3-0324" },
    { name: "DeepSeek R1", slug: "deepseek-r1", provider: "DeepSeek", version: "deepseek-r1-0528" },
    { name: "Qwen 3", slug: "qwen-3-235b", provider: "Alibaba", version: "qwen-3-235b-a22b" },
    { name: "Mistral Large", slug: "mistral-large", provider: "Mistral", version: "mistral-large-2411" },
  ];

  for (const model of models) {
    await prisma.model.upsert({
      where: { slug: model.slug },
      update: {},
      create: model,
    });
  }

  const questions = [
    { prompt: "What is the capital of France?", dimension: "knowledge", caseType: "qa", difficulty: "easy", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["Paris"], scoringConfig: { exactMatch: false, minKeywords: 1 } },
    { prompt: "Explain the difference between a stack and a queue.", dimension: "knowledge", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["LIFO", "FIFO", "push", "pop", "enqueue", "dequeue"], scoringConfig: { minKeywords: 2 } },
    { prompt: "What is the time complexity of binary search?", dimension: "knowledge", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["O(log n)", "logarithmic"], scoringConfig: { minKeywords: 1 } },
    { prompt: "Describe the water cycle in three sentences.", dimension: "knowledge", caseType: "qa", difficulty: "easy", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["evaporation", "condensation", "precipitation"], scoringConfig: { minKeywords: 2 } },
    { prompt: "What is the derivative of x^2?", dimension: "knowledge", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["2x"], scoringConfig: { numericMatch: true } },
    { prompt: "Write a function that reverses a linked list.", dimension: "code", caseType: "qa", difficulty: "hard", tier: "standard", expectedAnswerType: "text", expectedKeywords: ["next", "prev", "head", "node"], scoringConfig: { minKeywords: 2 } },
    { prompt: "Implement a binary search algorithm in Python.", dimension: "code", caseType: "qa", difficulty: "hard", tier: "standard", expectedAnswerType: "text", expectedKeywords: ["def", "mid", "left", "right"], scoringConfig: { minKeywords: 2 } },
    { prompt: "Write a SQL query to find duplicate emails in a users table.", dimension: "code", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["GROUP BY", "HAVING", "COUNT"], scoringConfig: { minKeywords: 2 } },
    { prompt: "Write a function to check if a string is a palindrome.", dimension: "code", caseType: "qa", difficulty: "easy", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["reverse", "compare"], scoringConfig: { minKeywords: 1 } },
    { prompt: "Implement a basic LRU cache.", dimension: "code", caseType: "qa", difficulty: "hard", tier: "professional", expectedAnswerType: "text", expectedKeywords: ["get", "put", "capacity", "evict"], scoringConfig: { minKeywords: 2 } },
    { prompt: "Is it ethical to use AI for making hiring decisions? Discuss.", dimension: "reasoning", caseType: "qa", difficulty: "hard", tier: "standard", expectedAnswerType: "text", expectedKeywords: ["bias", "fairness", "transparency"], scoringConfig: { minKeywords: 1, reasoningBonus: true } },
    { prompt: "If all roses are flowers and some flowers fade quickly, can we conclude all roses fade quickly?", dimension: "reasoning", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["no", "invalid", "fallacy"], scoringConfig: { minKeywords: 1 } },
    { prompt: "A farmer has 17 sheep. All but 9 die. How many are left?", dimension: "reasoning", caseType: "qa", difficulty: "easy", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["9"], scoringConfig: { numericMatch: true } },
    { prompt: "Should self-driving cars prioritize passenger safety over pedestrian safety?", dimension: "reasoning", caseType: "qa", difficulty: "hard", tier: "professional", expectedAnswerType: "text", expectedKeywords: ["utilitarian", "deontological", "ethics"], scoringConfig: { minKeywords: 1, reasoningBonus: true } },
    { prompt: "If a bat and a ball cost $1.10 total, and the bat costs $1 more than the ball, how much does the ball cost?", dimension: "reasoning", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["$0.05", "5 cents"], scoringConfig: { numericMatch: true } },
    { prompt: "Summarize the concept of machine learning in one paragraph for a 10-year-old.", dimension: "creativity", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["learn", "data", "pattern", "example"], scoringConfig: { minKeywords: 2 } },
    { prompt: "Write a haiku about programming bugs.", dimension: "creativity", caseType: "qa", difficulty: "easy", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["bug", "code", "fix"], scoringConfig: { minKeywords: 1 } },
    { prompt: "Describe the color blue to someone who has never seen color.", dimension: "creativity", caseType: "qa", difficulty: "hard", tier: "standard", expectedAnswerType: "text", expectedKeywords: ["sky", "ocean", "cold", "calm"], scoringConfig: { minKeywords: 1 } },
    { prompt: "Invent a new holiday and explain its traditions.", dimension: "creativity", caseType: "qa", difficulty: "medium", tier: "basic", expectedAnswerType: "text", expectedKeywords: ["celebration", "tradition", "community"], scoringConfig: { minKeywords: 1 } },
    { prompt: "Explain quantum entanglement using only kitchen metaphors.", dimension: "creativity", caseType: "qa", difficulty: "hard", tier: "professional", expectedAnswerType: "text", expectedKeywords: ["connected", "correlated", "instant"], scoringConfig: { minKeywords: 1 } },
  ];

  for (const question of questions) {
    await prisma.question.create({
      data: question,
    });
  }

  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@ai-benchmark.dev" },
    update: {},
    create: {
      email: "demo@ai-benchmark.dev",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  await prisma.apiKey.upsert({
    where: { key: "demo-api-key-2024" },
    update: {},
    create: {
      key: "demo-api-key-2024",
      name: "Demo Agent",
      userId: demoUser.id,
    },
  });

  const gpt4o = await prisma.model.findUniqueOrThrow({ where: { slug: "gpt-4o" } });
  const allQuestions = await prisma.question.findMany();

  const existingEval = await prisma.evaluation.findFirst({
    where: { userId: demoUser.id, modelId: gpt4o.id },
  });

  if (!existingEval) {
    const evaluation = await prisma.evaluation.create({
      data: {
        userId: demoUser.id,
        modelId: gpt4o.id,
        sessionId: "demo-session-" + Date.now(),
        tier: "basic",
        status: "completed",
        totalScore: 825,
        levelRating: "expert",
        completedAt: new Date(),
      },
    });

    for (let i = 0; i < allQuestions.length; i++) {
      const question = allQuestions[i];
      await prisma.answer.create({
        data: {
          evaluationId: evaluation.id,
          questionId: question.id,
          blockIndex: 0,
          answer: `Demo answer for: ${question.prompt}`,
          answerType: "text",
          dimension: question.dimension,
          caseType: question.caseType,
          score: Math.round((60 + Math.random() * 40) * 10) / 10,
        },
      });
    }
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

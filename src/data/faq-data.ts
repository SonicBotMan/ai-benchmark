export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  '开始使用',
  '评测流程',
  '结果解读',
  'Agent 管理',
  '积分与定价',
  '技术问题',
  '防作弊与数据可信度',
];

export const faqData: FAQItem[] = [
  {
    id: 'faq_01',
    category: '开始使用',
    question: '如何开始使用 AI Benchmark？',
    answer: '1. 注册账号并登录\n2. 创建 API Key\n3. 注册你的 Agent 实例\n4. 安装评测 Skill\n5. 发起评测',
  },
  {
    id: 'faq_02',
    category: '开始使用',
    question: '支持哪些 Agent 平台？',
    answer: '我们支持 OpenClaw、Cursor、Claude Code 以及自定义 Agent。只要你的 Agent 能发送 HTTP 请求，就能接入我们的评测系统。',
  },
  {
    id: 'faq_03',
    category: '评测流程',
    question: '评测需要多长时间？',
    answer: '基础版约 2 分钟，标准版约 5 分钟，专业版约 10 分钟。评测全程自动化，无需人工干预。',
  },
  {
    id: 'faq_04',
    category: '评测流程',
    question: '评测包含哪些维度？',
    answer: '我们进行 5 维度评测：IQ（智识力）、EQ（情商力）、TQ（工具力）、AQ（安全力）、SQ（社交力）。每个维度下还有多个子维度。',
  },
  {
    id: 'faq_05',
    category: '结果解读',
    question: '段位是如何计算的？',
    answer: '段位基于综合评分（0-1000 分）：青铜（0-300）、白银（300-500）、黄金（500-650）、铂金（650-800）、钻石（800-950）、王者（950-1000）。',
  },
  {
    id: 'faq_06',
    category: '结果解读',
    question: 'MBTI 人格类型是如何确定的？',
    answer: '通过情景化问题判定 Bot 的 MBTI 人格类型（如 INTJ/ENFP 等 16 种），帮助了解 Bot 的思维模式与社交风格。',
  },
  {
    id: 'faq_07',
    category: 'Agent 管理',
    question: '如何注册 Agent？',
    answer: '在 Dashboard 中点击「添加 Agent」，填写 Agent 名称、平台类型、底层模型等信息即可注册。',
  },
  {
    id: 'faq_08',
    category: 'Agent 管理',
    question: '一个账号可以注册多个 Agent 吗？',
    answer: '是的，一个账号可以注册多个 Agent 实例，分别进行评测和管理。',
  },
  {
    id: 'faq_09',
    category: '积分与定价',
    question: '积分如何获取？',
    answer: '新注册用户赠送免费积分。后续可通过控制台购买积分包。',
  },
  {
    id: 'faq_10',
    category: '积分与定价',
    question: '不同档位的积分消耗是多少？',
    answer: '基础版 1 积分、标准版 3 积分、专业版 5 积分。',
  },
  {
    id: 'faq_11',
    category: '技术问题',
    question: '如何获取 API Key？',
    answer: '登录控制台后，进入「API 密钥」页面，点击「创建 API Key」即可。创建后仅显示一次完整密钥，请及时保存。',
  },
  {
    id: 'faq_12',
    category: '技术问题',
    question: 'API 调用频率有限制吗？',
    answer: '目前没有严格的频率限制，但建议合理使用，避免频繁调用。',
  },
  {
    id: 'faq_13',
    category: '防作弊与数据可信度',
    question: '如何保证评测的公正性？',
    answer: '我们采用 5 层防作弊机制：动态用例种子、行为一致性验证、隐藏暗题、复测一致性、异常检测。',
  },
  {
    id: 'faq_14',
    category: '防作弊与数据可信度',
    question: '什么是动态种子？',
    answer: '每次评测使用不同的随机种子，题目顺序和变体均动态生成，防止通过记忆答案作弊。',
  },
  {
    id: 'faq_15',
    category: '防作弊与数据可信度',
    question: '什么是隐藏暗题？',
    answer: '在评测中插入 3 道与原题相似的变体题，检测回答的一致性，防止猜测或模板回答。',
  },
];

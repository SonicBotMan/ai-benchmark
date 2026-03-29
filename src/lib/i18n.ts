// TODO: i18n system is defined but not integrated into components.
// To enable full i18n support:
// 1. Add React Context for language state
// 2. Replace hardcoded strings with t() calls
// 3. Add language toggle in UI
// Currently keeping for future implementation.
export type Lang = 'zh' | 'en';



export const T: Record<Lang, Record<string, string>> = {
  zh: {
    // Nav
    'nav.evaluate': '评测',
    'nav.rankings': '排行榜',
    'nav.benchmarks': '测评集',
    'nav.skill': '技能',
    'nav.api': 'API',
    'nav.login': '登录',
    'nav.dashboard': 'Dashboard',
    'nav.logout': '退出',

    // Homepage
    'home.badge': 'AI Agent 能力测评平台',
    'home.title': 'AI Agent 能力测评平台',
    'home.subtitle': '用科学方法度量 AI Agent 的真实能力',
    'home.desc': '注册你的 OpenClaw、Cursor、Claude Code 等 Agent 实例，自动完成五维能力测评，获得游戏化的能力报告。',
    'home.cta': '开始测评',
    'home.cta2': '查看排行榜',
    'home.platforms': '支持的 Agent 平台',
    'home.platforms.desc': '无论你用什么框架，都能参与评测',
    'home.how.title': '三步完成评测',
    'home.how.s1': '注册 Agent',
    'home.how.s1d': '选择平台和底层模型，注册你的 Agent 实例',
    'home.how.s2': '加载 Skill',
    'home.how.s2d': '复制 SKILL.md，让 Agent 自动拉题答题',
    'home.how.s3': '查看报告',
    'home.how.s3d': '获得五维能力画像、段位徽章、Agent 独白',
    'home.final.title': '让你的 Agent 脱颖而出',
    'home.final.desc': '注册 Agent，获得能力报告，在排行榜上证明你的调教实力',
    'home.final.cta': '注册 Agent',

    // Dimensions
    'dim.IQ': 'IQ 认知智能',
    'dim.EQ': 'EQ 情感智能',
    'dim.TQ': 'TQ 工具智能',
    'dim.AQ': 'AQ 安全智能',
    'dim.SQ': 'SQ 社交智能',

    // Levels
    'level.bronze': '青铜',
    'level.silver': '白银',
    'level.gold': '黄金',
    'level.platinum': '铂金',
    'level.diamond': '钻石',
    'level.master': '王者',

    // Report
    'report.title': '评测报告',
    'report.total': '总分',
    'report.level': '能力段位',
    'report.percentile': '百分位',
    'report.tags': '能力标签',
    'report.radar': '五维能力拆分',
    'report.subdims': '各维度详细分析',
    'report.mbti': 'MBTI 人格画像',
    'report.strengths': '优势领域',
    'report.weaknesses': '待改进',
    'report.persona': 'Agent 想对你说',
    'report.trainer': '调教评分',
    'report.vs': 'vs 全网平均',
    'report.optimize': '优化指令',
    'report.story': '的一天',
    'report.share': '分享报告',
    'report.retest': '再次评测',
    'report.rankings': '排行榜',
    'report.credits': '积分余额',
  },
  en: {
    // Nav
    'nav.evaluate': 'Evaluate',
    'nav.rankings': 'Rankings',
    'nav.benchmarks': 'Benchmarks',
    'nav.skill': 'Skill',
    'nav.api': 'API',
    'nav.login': 'Login',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',

    // Homepage
    'home.badge': 'AI Agent Benchmark Platform',
    'home.title': 'AI Agent Benchmark Platform',
    'home.subtitle': 'Measure AI Agent capabilities scientifically',
    'home.desc': 'Register your OpenClaw, Cursor, Claude Code agents and get a gamified 5-dimension capability report.',
    'home.cta': 'Start Evaluation',
    'home.cta2': 'View Rankings',
    'home.platforms': 'Supported Agent Platforms',
    'home.platforms.desc': 'Any framework, any agent — we evaluate them all',
    'home.how.title': 'Three Steps to Evaluate',
    'home.how.s1': 'Register Agent',
    'home.how.s1d': 'Choose platform and model, register your agent instance',
    'home.how.s2': 'Load Skill',
    'home.how.s2d': 'Copy SKILL.md, let your agent auto-answering',
    'home.how.s3': 'View Report',
    'home.how.s3d': 'Get 5-dimension profile, rank badges, agent persona',
    'home.final.title': 'Make Your Agent Stand Out',
    'home.final.desc': 'Register your agent, get a capability report, prove your tuning skills',
    'home.final.cta': 'Register Agent',

    // Dimensions
    'dim.IQ': 'IQ · Cognitive',
    'dim.EQ': 'EQ · Emotional',
    'dim.TQ': 'TQ · Tool Use',
    'dim.AQ': 'AQ · Safety',
    'dim.SQ': 'SQ · Social',

    // Levels
    'level.bronze': 'Bronze',
    'level.silver': 'Silver',
    'level.gold': 'Gold',
    'level.platinum': 'Platinum',
    'level.diamond': 'Diamond',
    'level.master': 'Master',

    // Report
    'report.title': 'Evaluation Report',
    'report.total': 'Total Score',
    'report.level': 'Rank',
    'report.percentile': 'Percentile',
    'report.tags': 'Capability Tags',
    'report.radar': '5-Dimension Breakdown',
    'report.subdims': 'Sub-dimension Details',
    'report.mbti': 'MBTI Personality',
    'report.strengths': 'Strengths',
    'report.weaknesses': 'Needs Improvement',
    'report.persona': 'Agent says',
    'report.trainer': 'Trainer Rating',
    'report.vs': 'vs Global Average',
    'report.optimize': 'Optimization Instructions',
    'report.story': "'s Day",
    'report.share': 'Share Report',
    'report.retest': 'Retest',
    'report.rankings': 'Rankings',
    'report.credits': 'Credits',
  },
};

export function t(lang: Lang, key: string): string {
  return T[lang]?.[key] ?? T.zh[key] ?? key;
}

import coverBg from "@/assets/cover-bg.jpg";
import closingBg from "@/assets/closing-bg.jpg";

export type SlideType =
  | 'title-cover'
  | 'agenda'
  | 'section-divider'
  | 'content'
  | 'closing'
  | 'comparison'      // 左右对比
  | 'quote'           // 大引用金句
  | 'pyramid'         // 金字塔层级图
  | 'stats'           // 数据统计
  | 'resources'       // 资源链接
  | 'cta'             // 行动号召
  | 'demo'            // Demo 页
  | 'code-example'    // 代码示例
  | 'timeline'        // 时间线成长图
  | 'video';          // 视频嵌入

export interface SlideData {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  points?: string[];
  image?: string;
  extra?: string;
  // 用于 comparison 类型
  leftTitle?: string;
  leftPoints?: string[];
  leftIcon?: string;
  rightTitle?: string;
  rightPoints?: string[];
  rightIcon?: string;
  // 用于 quote 类型
  quote?: string;
  quoteCn?: string;  // 英文金句的中文翻译
  quoteAuthor?: string;
  // 用于 pyramid 类型
  pyramidLevels?: { title: string; description: string; icon?: string }[];
  // 用于 stats 类型
  stats?: { value: string; label: string; description?: string }[];
  // 用于 resources 类型
  resources?: { title: string; url: string; description?: string }[];
  // 用于 code-example 类型
  code?: string;
  codeLanguage?: string;
  // 用于 video 类型
  videoUrl?: string;
}

export const slides: SlideData[] = [
  // ============================================
  // Slide 1: 封面
  // ============================================
  {
    id: "cover",
    type: "title-cover",
    title: "Don't Build Agents.",
    subtitle: "Build Skills.",
    points: [
      "让 AI 拥有你的专业知识"
    ],
    image: coverBg
  },

  // ============================================
  // Slide 2: Anthropic 官方介绍视频
  // ============================================
  {
    id: "intro-video",
    type: "video",
    title: "Anthropic 官方介绍",
    subtitle: "What are Agent Skills?",
    videoUrl: "https://www.youtube.com/embed/CEvIs9y1uog",
    extra: "点击播放按钮观看视频"
  },

  // ============================================
  // Slide 3: Agent 的悖论
  // ============================================
  {
    id: "paradox",
    type: "comparison",
    title: "Agent 的悖论：超强智能，缺失专业",
    leftTitle: "Raw Intelligence",
    leftIcon: "🌊",
    leftPoints: [
      "强大的通用智能",
      "能从第一性原理推导",
      "几乎无所不知"
    ],
    rightTitle: "Domain Expertise",
    rightIcon: "🎯",
    rightPoints: [
      "专业工作的程序性知识",
      "行业特定的最佳实践",
      "团队内部的 SOP"
    ],
    quote: "Agents have intelligence and capabilities, but not always expertise that we need for real work.",
    quoteCn: "Agent 有智能和能力，但不一定有我们实际工作所需的专业知识。"
  },

  // ============================================
  // Slide 3: 你会雇谁？
  // ============================================
  {
    id: "who-to-hire",
    type: "comparison",
    title: "关键任务，你会雇谁？",
    leftTitle: "The Genius",
    leftIcon: "🧠",
    leftPoints: [
      "IQ 300 的数学天才",
      "从第一性原理推导税法",
      "过程缓慢、不一致、容易出错"
    ],
    rightTitle: "The Expert",
    rightIcon: "⚙️",
    rightPoints: [
      "20 年经验的税务专家",
      "使用成熟流程和深厚领域知识",
      "可靠、高效、输出一致"
    ],
    quote: "For critical work, we need an expert, not a genius.",
    extra: "关键工作，我们需要专家，而不是天才。"
  },

  // ============================================
  // Slide 4: 旧范式的问题
  // ============================================
  {
    id: "old-paradigm",
    type: "content",
    title: "旧范式：一个领域，一个 Agent",
    extra: "传统做法要求我们为每个场景构建独立的 Agent。这种模式不可扩展、很脆弱。",
    points: [
      "传统做法：",
      "• Finance Agent ←→ Coding Agent ←→ Research Agent",
      "• 每个 Agent 需要自己的 prompt 和工具",
      "问题：",
      "• 这种模式不可扩展、很脆弱",
      "• 最关键的是：知识无法跨任务共享",
      "• 每次都在重复造轮子"
    ]
  },

  // ============================================
  // Slide 5: 新洞察
  // ============================================
  {
    id: "new-insight",
    type: "content",
    title: "新洞察：代码是通往数字世界的通用接口",
    extra: "核心脚手架可以薄到只有 Bash 和文件系统。通用能力有了，但专业知识怎么办？",
    points: [
      "发现：",
      "• 与其构建领域特定的工具",
      "• 不如让一个通用 Agent 通过简单的运行时完成几乎所有数字任务",
      "通用 Agent 能做什么：",
      "• API 调用、数据分析、文件操作",
      "• 搜索、图表生成、数据库查询",
      "• 几乎所有数字化任务",
      "但是：通用能力有了，专业知识怎么办？"
    ]
  },

  // ============================================
  // Slide 6: 假如有这样一个东西
  // ============================================
  {
    id: "what-if",
    type: "quote",
    title: "假如...",
    quote: "假如有这样一个东西：把你的经验、规范、流程写下来，AI 需要时自动加载，写一次整个团队都能用，还能不断积累、持续进化...",
    extra: "是不是就解决了刚才所有问题？"
  },

  // ============================================
  // Slide 7: 引出 Skills
  // ============================================
  {
    id: "introducing-skills",
    type: "content",
    title: "解决方案：把专业知识打包成可组合的 Skills",
    extra: "说白了，就是文件夹。这种简单是刻意的。我们希望任何人——人类或 Agent——都能创建和使用。",
    points: [
      "Skills 是什么：",
      "• 组织好的文件集合",
      "• 为 Agent 打包可组合的程序性知识",
      "Skill 里可以有什么：",
      "• 指令（SKILL.md）",
      "• 可执行脚本",
      "• 代码库、模板、二进制文件和其他资源"
    ],
    quote: "The Simple Truth: In other words, they're folders. This simplicity is deliberate.",
    quoteCn: "简单的真相：说白了，就是文件夹。这种简单是刻意的。"
  },

  // ============================================
  // Slide 8: Skill 长什么样
  // ============================================
  {
    id: "skill-structure",
    type: "code-example",
    title: "一个最简单的 Skill",
    code: `my-skill/
└── SKILL.md

---
name: sql-standards
description: 团队 SQL 编写规范，写查询时使用
---

# SQL 编写规范

## 命名规则
• 表名：小写 + 下划线，如 user_orders
• 字段名：小写 + 下划线，如 created_at

## 查询规范
• 禁止 SELECT *
• 必须指定字段`,
    codeLanguage: "markdown",
    extra: "会写 Markdown，就会写 Skill。"
  },

  // ============================================
  // Slide 9: 原理 - 为有限上下文设计
  // ============================================
  {
    id: "context-design",
    type: "content",
    title: "为有限上下文窗口设计的效率机制",
    extra: "就像图书馆：你不会一进门就读完所有书，而是先看书名和简介，找到需要的再打开细读。",
    points: [
      "机制 1：渐进式披露",
      "• 类比：图书馆的书名+摘要 vs 完整的书",
      "• 一开始只显示 Skill 的元数据（name + description）",
      "• 让 Agent 能感知数百个 Skills",
      "• 完整内容只在 Agent 决定使用时才加载",
      "机制 2：脚本作为可修改工具",
      "• 与死板的 API 不同，脚本是自文档化、可读的",
      "• Agent 可以按需修改脚本，解决「代码卡住」的问题"
    ]
  },

  // ============================================
  // Slide 10: 怎么用
  // ============================================
  {
    id: "how-to-use",
    type: "content",
    title: "三步开始使用",
    points: [
      "1. 创建文件夹，写好 SKILL.md",
      "2. 放到指定目录（如 .claude/skills/）",
      "3. 没有第三步了"
    ],
    extra: "Claude 会自动发现、自动判断、自动使用。你不用告诉它「请使用 xxx skill」。"
  },

  // ============================================
  // Slide 11: Demo
  // ============================================
  {
    id: "demo",
    type: "demo",
    title: "DEMO",
    subtitle: "现场演示"
  },

  // ============================================
  // Slide 12: 从静态工具到持续学习
  // ============================================
  {
    id: "continuous-learning",
    type: "timeline",
    title: "从静态工具到持续学习"
  },

  // ============================================
  // Slide 13: 组织级知识库
  // ============================================
  {
    id: "org-knowledge",
    type: "content",
    title: "为你的组织构建一个集体进化的知识库",
    extra: "新人入职，Claude 已经懂你们团队。",
    points: [
      "愿景：",
      "• 一个人（或一个 Agent）创建的 Skill",
      "• 能立即升级组织内所有其他 Agent 的能力",
      "• 这创造了复利效应",
      "价值：",
      "• 组织知识被捕获、共享、自动进化",
      "• 新人入职，Claude 已经懂你们团队"
    ],
    quote: "When someone joins your team and starts using Claude... it already knows what your team cares about.",
    quoteCn: "新人加入团队开始使用 Claude 时...它已经知道你们团队关心什么。"
  },

  // ============================================
  // Slide 14: 产品演示 - Skill 仓库
  // ============================================
  {
    id: "skill-repo-demo",
    type: "demo",
    title: "DEMO",
    subtitle: "Skill 仓库产品演示",
    extra: "团队级 Skill 管理平台：集中存储、版本管理、一键同步"
  },

  // ============================================
  // Slide 15: 生态已在形成
  // ============================================
  {
    id: "ecosystem",
    type: "content",
    title: "生态已在蓬勃发展",
    points: [
      "Foundational Skills（基础能力）",
      "• 创建专业文档",
      "• Cadence 的科研 Skills（EHR 数据分析）",
      "• 生物信息学库",
      "Third-Party Skills（第三方集成）",
      "• Browserbase 的 Stagehand 浏览器自动化",
      "• Notion 的深度研究",
      "Enterprise Skills（企业内部）",
      "• 内部代码规范、公司内部软件导航",
      "• 财富 100 强公司的团队特定工作流"
    ]
  },

  // ============================================
  // Slide 15: 这是趋势 - 金字塔
  // ============================================
  {
    id: "pyramid",
    type: "pyramid",
    title: "我们见过这种模式，这是 AI 的应用层",
    pyramidLevels: [
      {
        title: "Skills = Applications",
        description: "数百万开发者在这里编码领域专业知识，为世界解决具体问题",
        icon: "📱"
      },
      {
        title: "Agent Runtimes = Operating Systems",
        description: "编排资源，提供核心能力（内存、执行），让处理器变得有用",
        icon: "⚙️"
      },
      {
        title: "Models = Processors",
        description: "需要巨额投资，蕴含巨大潜力，但单独存在时用处有限",
        icon: "🧠"
      }
    ]
  },

  // ============================================
  // Slide 16: 数据支撑
  // ============================================
  {
    id: "stats",
    type: "stats",
    title: "Skills 正在成为行业标准",
    stats: [
      { value: "20K+", label: "GitHub Stars", description: "社区创建数万个 Skills" },
      { value: "6+", label: "主流平台", description: "VS Code、Copilot、Cursor、OpenAI..." },
      { value: "9+", label: "官方合作伙伴", description: "Atlassian、Figma、Notion、Stripe..." }
    ],
    points: [
      "• 非技术人员（财务、法务、招聘）也在写 Skill",
      "• Anthropic 已开放为开放标准（agentskills.io）",
      "• OpenAI 也悄悄采用了结构相同的架构"
    ],
    extra: "这不是玩具，是方向。"
  },

  // ============================================
  // Slide 17: 行动号召
  // ============================================
  {
    id: "cta",
    type: "cta",
    title: "现在就开始",
    points: [
      "开发者：",
      "• 今天就写一个最简单的 Skill",
      "• 从你最常重复说的那句话开始",
      "非技术人员：",
      "• 把你的工作流程写成文档",
      "• 找开发同事帮你包成 Skill",
      "管理者：",
      "• 挑一个小团队 pilot 两周",
      "• 观察效果，再决定推广"
    ]
  },

  // ============================================
  // Slide 18: 考核指标
  // ============================================
  {
    id: "metrics",
    type: "content",
    title: "怎么衡量效果？",
    extra: "不完美，但先跑起来。未来工具会更成熟（Testing & Evaluation 是官方 Roadmap）。",
    points: [
      "理想指标：",
      "• 效率提升？采纳率？返工率？",
      "• 现实：这些很难自动化统计",
      "我们能做的：",
      "• 统计 Skill 数量（团队沉淀了多少知识）",
      "• 统计 Skill 使用次数（哪些被高频使用）",
      "• 收集主观反馈（打分、问卷）",
      "• 观察留存（有没有人删掉不用）"
    ]
  },

  // ============================================
  // Slide 19: 资源链接
  // ============================================
  {
    id: "resources",
    type: "resources",
    title: "了解更多",
    resources: [
      { title: "开放标准", url: "https://agentskills.io/home", description: "Anthropic 主导的 Agent Skills 开放标准" },
      { title: "官方视频", url: "https://youtu.be/CEvIs9y1uog", description: "Anthropic 官方 Skills 宣讲视频" },
      { title: "官方 Skills 库", url: "https://github.com/anthropics/skills", description: "Anthropic 官方 Skills 示例仓库" },
      { title: "官方文档", url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview", description: "Anthropic 官方 Skills 介绍文档" },
      { title: "最佳实践", url: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices", description: "Anthropic 官方 Skills 最佳实践" },
      { title: "Skills 市场", url: "https://skillsmp.com/", description: "全球最大的 Skills 市场" }
    ],
    extra: "Skill Creator Skill：Claude 内置，直接让它帮你写 Skill"
  },

  // ============================================
  // Slide 20: 结尾金句
  // ============================================
  {
    id: "final-quote",
    type: "quote",
    title: "Stop Rebuilding Agents.",
    subtitle: "Start Composing Expertise.",
    quote: "我们正在收敛到一个通用的 Agent 架构。Skills 提供了缺失的一层：可组合、可共享的专业知识。这个范式解锁了持续学习，让每个人都能教 Agent 新能力——只需要往文件夹里放东西。",
    extra: "If you're excited about this, come work with us and start building some skills today."
  },

  // ============================================
  // Slide 21: 感谢
  // ============================================
  {
    id: "closing",
    type: "closing",
    title: "感谢",
    extra: "愿我们都能在变化中，沉淀下不变的价值。",
    points: [
      "Q&A"
    ],
    image: closingBg
  }
];

import coverBg from "@/assets/cover-bg.jpg";
import closingBg from "@/assets/closing-bg.jpg";

export type SlideType = 'title-cover' | 'agenda' | 'section-divider' | 'content' | 'closing';

export interface SlideData {
  id: string;
  type: SlideType;
  title: string;
  points?: string[];
  image?: string;
  extra?: string; // For narrative bridge or notes
}

export const slides: SlideData[] = [
  {
    id: "cover",
    type: "title-cover",
    title: "Agent Skills 布道与教学",
    points: [
      "让 Agent 更专业、更可靠、更强大",
      "面向开发者的实战指南"
    ],
    image: coverBg
  },
  {
    id: "agenda",
    type: "agenda",
    title: "目录",
    points: [
      "Why：为什么需要 Skills",
      "How：如何在 Agent 中集成/激活",
      "Flow：典型工作流 (Discovery → Activation)",
      "Authoring：写好 SKILL.md 的关键要点",
      "Ecosystem：生态兼容与采用现状"
    ]
  },
  {
    id: "why-divider",
    type: "section-divider",
    title: "为什么需要 Skills",
    points: [
      "从通用助手到专业工具的进化"
    ]
  },
  {
    id: "value-scenarios",
    type: "content",
    title: "Skills 能带来的价值与场景",
    extra: "场景一：领域专家流程（法务审阅、数据分析）可封装为技能。场景二：新能力拓展（生成演示、构建 MCP 服务器）。场景三：可重复的工作流，提升一致性。",
    points: [
      "领域专家流程：封装法务审阅、数据分析等专业SOP",
      "新能力拓展：赋予 Agent 生成演示、构建服务器等新技能",
      "可重复工作流：将多步操作标准化，提升一致性与可审计性",
      "核心价值：以“可复用说明书+脚本资产”形态，降低门槛与提升可靠性"
    ]
  },
  {
    id: "structure",
    type: "content",
    title: "Skill 的结构与渐进式披露",
    extra: "目录结构：my-skill/ 下的 SKILL.md（必需）与 scripts、references、assets（可选）。渐进式披露：启动仅加载 name+description。",
    points: [
      "标准结构：SKILL.md (元数据+指令) + scripts/ + references/",
      "渐进式披露 (Progressive Disclosure)：",
      "1. Discovery：启动时仅加载 name & description (极轻量)",
      "2. Activation：匹配任务后加载完整 SKILL.md 上下文",
      "3. Execution：按需读取 assets 或执行 scripts",
      "优势：既保证 Agent 响应速度，又保留无限扩展能力"
    ]
  },
  {
    id: "how-divider",
    type: "section-divider",
    title: "如何在 Agent 中集成/激活 Skills",
    points: [
      "Filesystem-based vs Tool-based"
    ]
  },
  {
    id: "workflow",
    type: "content",
    title: "典型工作流：Discovery → Activation → Execution",
    extra: "先给全景，再演示一条主线。Discovery：启动时只读前置元数据。Activation：任务匹配后读取正文。Execution：执行与产出。",
    points: [
      "Discovery 阶段：",
      "• Agent 扫描技能目录，解析 YAML Frontmatter",
      "• 仅注入 name 和 description 到 System Prompt",
      "Activation 阶段：",
      "• 意图识别命中技能描述",
      "• 动态读取 SKILL.md 全文并注入 Context",
      "Execution 阶段：",
      "• 模型遵循 Markdown 指令步骤",
      "• 调用 sandbox 工具执行脚本或读取引用文件"
    ]
  },
  {
    id: "authoring-tips",
    type: "content",
    title: "写好 SKILL.md 的要点",
    extra: "自文档化、可扩展、可移植。YAML frontmatter 必填 name, description。",
    points: [
      "YAML Frontmatter (元数据)：",
      "• name: 简短标识符 (如 pdf-processing)",
      "• description: 关键！决定何时被唤起 (如 'When user asks to...')",
      "正文编写建议：",
      "• 清晰的步骤说明 (Step-by-step instructions)",
      "• 提供 Input/Output 示例 (Few-shot prompting)",
      "• 明确边界情况与错误处理",
      "• 细节拆分至 references/ 目录，保持主文档简洁"
    ]
  },
  {
    id: "structure-practice",
    type: "content",
    title: "规范要点与目录实践",
    extra: "目录结构范例与命名约束。文件引用一层原则。",
    points: [
      "命名规范：小写字母、数字、连字符 (max 64 chars)",
      "目录结构最佳实践：",
      "• my-skill/SKILL.md (入口)",
      "• my-skill/scripts/ (Python/Bash 脚本)",
      "• my-skill/references/ (详细文档/SOP)",
      "引用原则：",
      "• 使用相对路径 (./scripts/run.py)",
      "• 避免深层嵌套，保持扁平化",
      "• '自包含' 设计，减少外部依赖"
    ]
  },
  {
    id: "ecosystem",
    type: "content",
    title: "生态兼容与采用现状",
    extra: "主流 AI 开发工具与产品支持。开放标准。",
    points: [
      "开放标准：由 Anthropic 发起，社区共建",
      "广泛支持：主流 Agent 框架与 IDE 已原生支持",
      "Skills Library：",
      "• 官方参考库 (skills-ref)",
      "• 社区贡献的通用技能包",
      "价值：一次编写，跨平台/跨工具复用"
    ]
  },
  {
    id: "security",
    type: "content",
    title: "安全与治理",
    extra: "安全考虑：沙箱、允许列表、用户确认。组织落地。",
    points: [
      "执行环境：建议在沙箱 (Sandbox) 或容器中运行",
      "权限控制：",
      "• Allowed Tools 白名单机制",
      "• 敏感操作 (API Call, File Write) 需用户确认",
      "审计与版本：",
      "• 技能作为代码 (IaC) 管理，Git 版本控制",
      "• 记录所有 Skill 调用的日志与产出"
    ]
  },
  {
    id: "next-steps",
    type: "content",
    title: "落地路径与资源索引",
    extra: "行动项：阅读规范、提炼首批技能。资源入口。",
    points: [
      "行动建议：",
      "1. 阅读官方 Spec 文档",
      "2. 梳理团队内部高频 SOP，转化为 SKILL.md",
      "3. 在 Pilot 项目中尝试集成 Skills",
      "资源索引：",
      "• 官网：agentskills.io",
      "• GitHub: agentskills/agentskills",
      "• 示例库：anthropics/skills"
    ]
  },
  {
    id: "closing",
    type: "closing",
    title: "谢谢",
    points: [
      "Agent Skills",
      "让 Agent 更可靠、更专业"
    ],
    image: closingBg
  }
];

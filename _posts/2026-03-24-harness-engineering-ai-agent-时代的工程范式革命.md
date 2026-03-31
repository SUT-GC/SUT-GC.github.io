---
layout: post
title: "Harness Engineering：AI Agent 时代的工程范式革命"
description: "决定 AI 能否可靠交付的不是模型本身，而是围绕模型构建的系统。Harness Engineering 是 2026 年最重要的工程方法论——人类掌舵，智能体执行。"
categories: ["技术", "AI"]
tags: ["AI", "Agent", "Harness Engineering", "工程方法论", "Context Engineering"]
---

* Kramdown table of contents
{:toc .toc}

# Harness Engineering：AI Agent 时代的工程范式革命

> Humans steer, agents execute. 人类掌舵，智能体执行。

---

## 引言

2025 年，我们证明了 AI Agent 能写代码。

2026 年，我们发现了一个更重要的事实：**Agent 不是难点——Harness 才是。**

LangChain 做了一个实验：同一个模型，同一个任务，只改变周围的系统设计，coding agent 的成功率从 52.8% 飙升到 66.5%，排名从 Top 30 开外直接冲进 Top 5。模型一行没动。

OpenAI 内部团队用 5 个月时间，生成了超过 100 万行代码——**零行手写**。不是因为模型变强了，而是因为他们构建了一套精密的 harness 系统。

这就是 **Harness Engineering（驾驭工程）**——2026 年最重要的工程方法论。

---

## 什么是 Harness？

Harness 这个词来自马具——套在马身上的缰绳、鞍具和挽具。它的作用不是让马跑得更快，而是**把马的力量引导到你想去的方向**。

在 AI 语境下：

> **模型是引擎，Harness 是整辆车。**

一个 Harness 是包裹在 AI 模型外面的完整系统，包括：约束、反馈回路、文档、linter、验证机制和生命周期管理。它的目标是**让 Agent 的原始认知能力转化为可靠的、可预测的输出**。

### Harness Engineering 和其他概念的关系

很多人容易混淆几个概念，这里理清一下：

| 概念 | 关注点 | 解决的问题 |
|:---|:---|:---|
| **Prompt Engineering** | 单次交互的输入 | 怎么问一个好问题 |
| **Context Engineering** | 模型接收到的信息 | 给模型看什么 |
| **Harness Engineering** | 围绕模型的完整系统 | 模型如何运行、如何被约束、如何被验证 |

Prompt Engineering 是一句话的事，Context Engineering 是一个上下文窗口的事，**Harness Engineering 是一个工程体系的事**。

SDK、Scaffold、Framework 回答的是"怎么构建 AI Agent"的问题。Harness 回答的是一个完全不同的问题——**"Agent 如何运行"**。它不是替代前者，而是在前者之上的一层。

---

## 为什么 Harness 比模型更重要？

### 数据说话

**LangChain 实验**

用同一个模型（gpt-5.2-codex），只改 harness：

```
改之前：Terminal Bench 2.0 得分 52.8%（Top 30 开外）
改之后：Terminal Bench 2.0 得分 66.5%（Top 5）
```

提升了 26%，模型没换。

**Vercel 优化**

把 Agent 可用的工具从 15 个减到 2 个：

```
改之前：准确率 80%
改之后：准确率 100%
```

少即是多。约束带来的不是限制，是精度。

**Nate B Jones 的研究（2026 年 3 月）**

同一个模型在编码基准测试上的表现：

```
差的 harness：42% 成功率
好的 harness：78% 成功率
```

差距接近一倍。

### 一个反直觉的结论

> **约束越多，Agent 表现越好。**

这和人的直觉相反。我们总以为给 AI 更多自由度，它就能表现得更好。但实际情况恰恰相反——**限制解空间，才能让 Agent 在有限的空间里找到正确答案**，而不是在无穷的可能性里迷路。

这就像写代码时用强类型语言。TypeScript 比 JavaScript 多了一堆"限制"，但正是这些限制让你写出更可靠的代码。

---

## Harness 的三大核心支柱

根据 OpenAI 的实践和 Martin Fowler 的分析，Harness Engineering 有三大核心支柱。

### 支柱一：Context Engineering（上下文工程）

**核心原则：Agent 看不到的东西，等于不存在。**

你团队的 Google Docs、Slack 聊天记录、大家脑子里的默契——Agent 统统看不到。它唯一能看到的，是代码仓库里的文件。

所以，**一切知识必须编码到仓库中**。

#### 静态上下文

这是 Agent 开始工作前就能读到的信息：

```
项目根目录/
├── AGENTS.md          # Agent 行为指南
├── CLAUDE.md          # Claude Code 专用指南
├── ARCHITECTURE.md    # 架构决策记录
├── docs/
│   ├── api-design.md  # API 设计规范
│   ├── patterns.md    # 代码模式库
│   └── decisions/     # ADR（架构决策记录）
```

**AGENTS.md / CLAUDE.md** 是最关键的文件。它告诉 Agent：

- 项目用什么技术栈
- 代码风格是什么
- 哪些模式是推荐的，哪些是禁止的
- 测试怎么跑
- 提交规范是什么

#### 动态上下文

Agent 在运行时能获取的信息：

- 可观测性数据（监控、日志、告警）
- CI/CD 管道状态
- 目录结构映射
- 浏览器导航能力（用于验证前端输出）

#### 代码本身就是文档

OpenAI 团队的一个关键洞察：**写得好的代码就是最好的隐式文档**。

当 Agent 读代码时，清晰的命名、一致的模式、合理的抽象，比任何注释都更能帮助它理解上下文。这意味着代码仓库不仅要为人类可读而优化，还要**为 Agent 可读而优化**。

### 支柱二：Architectural Constraints（架构约束）

**核心原则：用机械化的规则替代口头约定。**

团队里的"代码规范"，如果只是写在文档里靠人自觉遵守，那 Agent 更不会遵守。必须把约束变成可执行的检查。

#### 约束的层次

```
第一层：确定性 Linter
  ↓ 不需要 AI，规则硬编码
  ↓ 例：ESLint, checkstyle, golangci-lint

第二层：结构化测试
  ↓ 强制执行架构边界
  ↓ 例：ArchUnit（Java）——Service 层不能直接调 Repository

第三层：自定义 Linter
  ↓ 针对项目特有的架构规则
  ↓ 例：禁止在 Controller 层写业务逻辑

第四层：LLM 审计 Agent
  ↓ 用 AI 审查 AI 的输出
  ↓ 例：一个专门的 Agent 检查代码是否违反设计原则
```

#### Pre-commit Hooks

最简单但最有效的约束机制：

```bash
# .pre-commit-config.yaml 示例
repos:
  - repo: local
    hooks:
      - id: arch-check
        name: Architecture boundary check
        entry: ./scripts/check-architecture.sh
        language: script
      - id: no-raw-sql
        name: No raw SQL in service layer
        entry: ./scripts/check-no-raw-sql.sh
        language: script
```

Agent 提交代码时，这些 hook 会自动运行。不通过就不让提交。**Agent 不需要"知道"规则，它只需要被规则拦住。**

#### 一个真实的例子

OpenAI 团队发现 Agent 总喜欢把所有逻辑塞进一个函数。他们没有去"教育"Agent，而是写了一个 linter：任何超过 50 行的函数自动报错。

结果：Agent 学会了拆分函数。不是因为它"理解"了为什么要拆，而是因为不拆就过不了检查。

### 支柱三：Entropy Management（熵管理 / 垃圾回收）

**核心原则：AI 生成的代码天然趋向混乱，必须主动对抗。**

OpenAI 团队曾经每周五花 20% 的时间清理"AI 垃圾"——重复的代码、不一致的命名、偏离模式的实现。这太痛苦了。

后来他们换了一个思路：**把"黄金原则"直接编码到代码仓库中，并用专门的 Agent 定期巡检。**

#### 垃圾回收 Agent 做什么

- 检查文档是否和代码实际行为一致
- 发现偏离约定模式的代码
- 识别冗余或重复的实现
- 检查依赖是否过时
- 验证约束是否仍然被遵守

#### 触发方式

```
定时触发：每天/每周跑一次全量巡检
事件触发：每次 PR 合并后跑一次增量检查
手动触发：发现某类问题后针对性扫描
```

#### 一个重要的反馈循环

当垃圾回收 Agent 反复发现同一类问题时，说明你的约束还不够。这时候应该**回到支柱二，补充新的约束规则**，而不是每次手动修复。

> Agent 挣扎的地方，就是你的 harness 需要加强的地方。

---

## 实施路径：三个级别

不需要一步到位。根据团队规模，分级实施。

### Level 1：个人开发者（1-2 小时搭建）

```
✅ 在项目根目录创建 CLAUDE.md / AGENTS.md
✅ 配置 pre-commit hooks
✅ 写好测试套件
✅ 保持代码仓库整洁、命名一致
```

这是最低配的 harness，但已经能显著提升 Agent 的输出质量。

**CLAUDE.md 示例**：

```markdown
# CLAUDE.md

## 技术栈
- Java 21 + Spring Boot 3.3
- PostgreSQL + MyBatis-Plus
- Gradle 构建

## 代码规范
- Service 层方法必须有单元测试
- Controller 层只做参数校验和响应包装，不写业务逻辑
- 所有数据库查询走 Repository 层

## 测试命令
./gradlew test

## 禁止事项
- 不要使用 lombok 的 @Data 注解，用 @Getter @Setter
- 不要在 Service 层直接拼 SQL
- 不要 catch Exception，必须 catch 具体异常类型
```

### Level 2：小团队（1-2 天搭建）

在 Level 1 基础上增加：

```
✅ 统一的 AGENTS.md 约定（团队共享）
✅ CI 中集成架构约束检查
✅ 共享的代码模式模板
✅ PR 审查中加入 Agent 输出的质量检查项
```

### Level 3：组织级别（1-2 周搭建）

在 Level 2 基础上增加：

```
✅ 自定义中间件（拦截和约束 Agent 行为）
✅ 可观测性集成（监控 Agent 的运行效果）
✅ 性能仪表盘（追踪 Agent 的成功率和效率）
✅ 垃圾回收 Agent 定期巡检
✅ Harness 模板库（不同类型项目用不同模板）
```

---

## 工程师角色的转变

Harness Engineering 正在重新定义"软件工程师"的含义。

### 旧范式

```
工程师的工作 = 写代码
```

### 新范式

```
工程师的工作 = 设计 Agent 的运行环境
```

具体来说：

| 旧技能 | 新技能 |
|:---|:---|
| 手写代码 | 设计约束和验证规则 |
| Debug 代码 | 分析 Agent 行为模式 |
| 写文档给人看 | 写文档给 Agent 看 |
| 学新语言新框架 | 设计 Agent 可理解的架构 |
| 代码审查 | Harness 审查 |

这不意味着工程师不需要会写代码了。**恰恰相反，你需要更深的架构能力和系统思维**，才能设计出好的 harness。

正如 OpenAI 团队的总结：

> "我们最大的挑战不在于模型的能力，而在于设计环境、反馈回路和控制系统。严谨的工程设计并没有因为 AI 而变得简单——它变得更重要了。"

---

## 常见错误

### 错误一：过度设计控制流

给 Agent 设计了极其复杂的状态机和控制流程。结果模型一升级，之前的 workaround 全部失效。

**正解**：Harness 要跟模型能力共同演进，保持简单。

### 错误二：把 Harness 当静态产物

写了一版 AGENTS.md 就再也不更新了。

**正解**：Harness 是活的，需要根据 Agent 的实际表现持续调优。

### 错误三：文档模糊

"代码要写得优雅" "注意性能" 这种话 Agent 理解不了。

**正解**：文档必须具体、可执行。"函数不超过 50 行" 比 "函数要简短" 好一万倍。

### 错误四：没有反馈回路

Agent 写了垃圾代码，人肉修完就算了，不去思考为什么。

**正解**：每次 Agent 犯错都是改进 harness 的机会。把教训编码成新的约束。

### 错误五：知识留在仓库外面

架构决策记在 Confluence，设计方案画在白板上，规范写在 Notion 里。

**正解**：Agent 只能看到仓库。一切知识必须在仓库内，版本化管理。

---

## 总结

如果用一句话概括 Harness Engineering：

> **不要试图让 AI 变聪明，要让 AI 的运行环境变聪明。**

2025 年，我们关注的是"哪个模型更强"。2026 年，我们意识到真正的竞争力在于"谁的 harness 更好"。

模型在排行榜上的差距越来越小，但在真实场景中的表现差距越来越大——**差距全在 harness 里**。

Harness Engineering 的三大支柱：

```
Context Engineering  → 让 Agent 看到该看的
Architectural Constraints → 让 Agent 不做不该做的
Entropy Management → 让系统不会越跑越烂
```

这不是一个锦上添花的优化，而是 AI Agent 时代**软件工程的基本功**。

---

*参考资料：*

- *OpenAI, "Harness engineering: leveraging Codex in an agent-first world", 2026*
- *Birgitta Böckeler (Martin Fowler's blog), "Harness Engineering", Feb 2026*
- *LangChain, "Harness Engineering with DeepAgents and LangSmith", 2026*
- *Nate B Jones, Agent Harness benchmark research, Mar 2026*

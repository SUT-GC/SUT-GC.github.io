---
layout: post
title: "Don't Build Agents. Build Skills."
description: "一个让 AI 真正拥有你专业知识的新范式。Agent Skills 是 Anthropic 提出的可组合、可共享的专业知识打包方案，让 AI 能够持续学习并积累团队的程序性知识。"
categories: ["技术", "AI"]
tags: ["Agent Skills", "Claude Code", "Anthropic", "AI Agent", "Prompt Engineering"]
---

* Kramdown table of contents
{:toc .toc}

# Don't Build Agents. Build Skills.

> 一个让 AI 真正拥有你专业知识的新范式

---

## AI 很聪明，但它不懂"我们"

你有没有这种体验？

每次让 AI 写代码，都要重复说一遍"我们的规范是..."。昨天刚教过的格式，今天又忘了。团队每个人教 AI 的方式不一样，输出五花八门。好不容易调教好了，换个对话又从零开始。

这就是今天 Agent 的悖论：**它们拥有超强的通用智能，却缺乏专业工作所需的程序性知识。**

打个比方。假设你要报税，有两个人可以选：

- **Mahesh**：IQ 300 的数学天才，能从第一性原理推导出 2025 年的税法。过程缓慢、不一致、容易出错。
- **Barry**：普通智商，但有 20 年税务经验的注册会计师。使用成熟流程，输出可靠、高效、一致。

你会选谁？

答案很明显。**关键工作，我们需要专家，而不是天才。**

今天的 AI Agent 就像 Mahesh——聪明绝顶，但每个任务都是从零开始的即兴发挥。这在 demo 里很惊艳，但在真实工作流里，不是你想要的。

---

## 旧范式：一个领域，一个 Agent

过去我们怎么解决这个问题？

传统做法是为每个场景构建独立的 Agent。金融 Agent、编码 Agent、研究 Agent... 每个都需要自己的 prompt、自己的工具、自己的脚手架。

这种模式有三个致命问题：

1. **不可扩展**：每增加一个领域，就要从头再建一套
2. **很脆弱**：改一个地方，可能影响其他地方
3. **知识无法共享**：金融 Agent 学到的东西，编码 Agent 用不上

我们需要一种新的方式。

---

## 新洞察：一个通用 Agent + 可组合的专业知识

Anthropic 在构建 Claude Code 时发现了一个关键洞察：

> "我们曾以为不同领域的 Agent 会很不一样。但实际上，底层的 Agent 比我们想象的更通用。"

Claude Code 原本是为写代码设计的，但它也能做金融分析、科学研究、文档编辑——只要加载了正确的上下文。

**瓶颈不是智能，是专业知识。**

所以问题变成了：如何把专业知识打包，让一个通用 Agent 按需加载？

---

## 解决方案：Agent Skills

Skills 是什么？

**一句话：把你的专业知识打包成文件夹，让 AI 需要时自动加载。**

说白了，就是一个文件夹，里面放一个 SKILL.md 文件。这种简单是刻意的——Anthropic 希望任何人，不管是人类还是 Agent，都能创建和使用。

一个最简单的 Skill 长这样：

```
my-skill/
└── SKILL.md
```

```markdown
---
name: sql-standards
description: 团队 SQL 编写规范，写查询时使用
---

# SQL 编写规范

## 命名规则
- 表名：小写 + 下划线，如 user_orders
- 字段名：小写 + 下划线，如 created_at

## 查询规范
- 禁止 SELECT *
- 必须指定字段
```

**会写 Markdown，就会写 Skill。**

Skill 里还可以包含可执行脚本、代码库、模板、参考文档等。Claude 会根据任务自动判断该用哪个 Skill，自动加载，你不用手动指定。

---

## 为什么不会撑爆上下文？渐进式披露

你可能会问：如果我有几十上百个 Skills，全部加载进去不会把上下文撑爆吗？

不会。因为 Skills 采用**渐进式披露**机制。

打个比方：你去图书馆找书，不会把整个图书馆的书都搬回家。你先看书名列表，感兴趣再看简介，确定要用再读正文。

Skill 对 AI 也是这样：

1. 启动时只加载 name + description（几十个字）
2. 判断相关才加载完整 SKILL.md
3. 需要时才读取 scripts/、references/ 里的文件

结果：你可以配置几十上百个 Skills，不浪费 token。

---

## Skills 带来什么？

### 1. 一致性

同一个 Skill，团队所有人用，输出风格统一。不会再出现"每个人教出来的 AI 不一样"的问题。

### 2. 可复用

写一次，到处用。可以 Git 版本控制，可以分享给其他团队，可以跨项目复用。

### 3. 非技术友好

不用写代码，会写文档就会写 Skill。财务、法务、招聘都能参与。事实上，Anthropic 发现最让他们惊讶的是：**很多非技术人员已经在写 Skill 了。**

### 4. 持续学习

这是最有价值的一点。Skills 为 AI 创造了一条持续学习的路径。

> "我们不断看到 Claude 反复写同一个 Python 脚本... 于是我们让 Claude 把它保存到 Skill 里，作为给未来自己的工具。"

第 30 天的 Claude 会比第 1 天更强，因为它积累了你们团队的特定程序性知识。

### 5. 组织级知识库

一个人（或一个 Agent）创建的 Skill，能立即升级组织内所有其他 Agent 的能力。

新人入职，Claude 已经懂你们团队在乎什么、日常怎么工作、怎么做最有效。这是真正的组织知识复利。

---

## 这不是玩具，是趋势

Skills 已经成为行业标准：

- **Anthropic 发布 5 周，已创建数千个 Skills**
- **财富 100 强公司将其作为 AI 内部手册**
- **Anthropic 已将其开放为开放标准**（agentskills.io）
- **GitHub Copilot、Cursor、VS Code 都已支持**
- **Atlassian、Notion、Figma、Stripe 已发布官方 Skills**

如果你熟悉计算机历史，这个模式你一定见过：

- **Models = Processors**：需要巨额投资，蕴含巨大潜力，但单独存在时用处有限
- **Agent Runtimes = Operating Systems**：编排资源，提供核心能力
- **Skills = Applications**：数百万开发者在这里编码领域专业知识，解决具体问题

**Skills 就是 AI 的应用层。**

处理器和操作系统会持续改进和商品化。真正稀缺的是编码了领域知识的高质量 Skills——你的工作流、你的定义、你的规范、你的组织习惯。

---

## 怎么开始？

**开发者**：今天就写一个最简单的 Skill，从你最常重复说的那句话开始。

**非技术人员**：把你的工作流程写成文档，找开发同事帮你包成 Skill。

**管理者**：挑一个小团队 pilot 两周，观察效果，再决定推广。

三步开始：

1. 创建文件夹，写好 SKILL.md
2. 放到指定目录（如 `.claude/skills/`）
3. 没有第三步了，Claude 会自动发现和使用

---

## 怎么衡量效果？

诚实说，这是个难题。

理想指标是效率提升、采纳率、返工率——但这些很难自动化统计，因为 Skill 是 prompt，不是代码，你从外部观测不到模型内部发生了什么。

我们能做的：

- **统计 Skill 数量**：团队沉淀了多少知识
- **统计使用次数**：哪些被高频使用
- **观察留存**：有没有人删掉不用
- **收集主观反馈**：打分、问卷

不完美，但先跑起来。Anthropic 的 Roadmap 里已经有 Testing & Evaluation，未来工具会更成熟。

---

## 结语

> "Stop Rebuilding Agents. Start Composing Expertise."

我们正在收敛到一个通用的 Agent 架构。Skills 提供了缺失的一层：可组合、可共享的专业知识。

这个范式解锁了持续学习，让每个人都能教 Agent 新能力——只需要往文件夹里放东西。

智能会越来越便宜。**真正稀缺的是编码了你领域知识的高质量 Skills。**

现在就开始吧。

---

## 资源链接

- [官方文档：agentskills.io](https://agentskills.io)
- [示例 Skills：github.com/anthropics/skills](https://github.com/anthropics/skills)
- [规范说明：agentskills.io/specification](https://agentskills.io/specification)
- [Anthropic 工程博客](https://www.anthropic.com/engineering/claude-skills)
- [Simon Willison: Claude Skills are awesome](https://simonwillison.net/2025/Dec/19/agent-skills/)

---
layout: post
title: "Hermes Agent 是什么？和 OpenClaw 有什么不一样？一篇讲清它的定位、用法和常用命令"
description: "Hermes Agent 不只是又一个终端 AI 工具。它更像一个会积累经验、会调度任务、会长期成长的 Agent Runtime。"
categories: ["技术", "AI"]
tags: ["Hermes Agent", "OpenClaw", "Agent", "AI", "CLI", "自动化"]
---

* Kramdown table of contents
{:toc .toc}

![Hermes Agent vs OpenClaw](https://int32-blog.oss-cn-beijing.aliyuncs.com/uploads/hermes-agent-cover.jpg)

最近我连续写了几篇 Agent 相关文章，前面拆过 OpenClaw，也自己动手造过一只“龙虾”。这次我想换一个对象：Hermes Agent。

一开始我对它的印象其实比较模糊。又一个 AI Agent？又一个能跑在终端里的工具？还是又一套“万物皆可自动化”的框架叙事？

但真正顺着它的 README、官方文档、CLI 帮助和本机可运行版本一路看下来，我的感觉是：**Hermes Agent 不是在重复做一个聊天壳子，它更像是在认真做一个“会积累经验的 Agent 运行时”。**

如果说 OpenClaw 更像一个面向个人助手场景的产品系统，那么 Hermes 更像一个可编程、可成长、可迁移的 Agent 基座。它们看起来都在做“让 AI 帮你干活”，但重心并不一样。

这篇文章我想回答 4 个问题：

- Hermes Agent 到底是干什么的
- 它和 OpenClaw 有什么区别
- Hermes Agent 怎么上手
- 它有哪些常用命令值得先记住

---

## 先说结论：Hermes Agent 更像一个会成长的 Agent Runtime

Hermes Agent 是 Nous Research 开源的一个 AI agent 框架 / 运行时。它可以跑在终端里，也可以挂到 Telegram、Discord、Slack、WhatsApp 这类消息平台上，还能接工具、接浏览器、接 shell、接文件系统、接 cron、接 MCP。

这些能力本身并不稀奇。现在很多 Agent 项目都能做到“会调工具”。Hermes 真正比较有辨识度的地方，在于它把下面这些东西放到了系统中心，而不是做成附属功能：

- **skills**：把任务经验沉淀成可复用的流程文档
- **memory**：跨会话记住用户偏好、环境信息和稳定事实
- **session search**：回查过去做过什么，而不是每次都重新开始
- **cron + delegation**：让 agent 不只会对话，还会长期运行、定时执行、并行分工

官方 README 对它的描述很直接：它是一个 self-improving AI agent。这个说法不只是营销词，因为从文档、CLI 能力和整体设计看，它确实在围绕“如何越用越像你自己的 agent”这件事搭系统。

我觉得可以把 Hermes Agent 理解成这样：

> 它不只是一个会聊天的终端工具，而是一个带工具系统、记忆系统、技能系统、调度系统和多入口网关的 Agent Runtime。

这句话有点长，但比“又一个 AI 助手”更接近它的真实定位。

---

## Hermes Agent 到底是干什么的？

如果把它拆开看，Hermes Agent 其实同时承担了几层角色。

第一层，它当然是一个**能对话的 Agent**。你可以直接在终端里运行 `hermes`，像用 Claude Code、Codex、Gemini CLI 一样跟它对话，让它读文件、改代码、查资料、跑命令。

第二层，它是一个**工具调用运行时**。它能接终端、文件、浏览器、搜索、代码执行、图像分析、计划管理、定时任务、消息发送这些工具，而且工具不是固定死的，还可以通过 MCP、skills、插件继续扩展。

第三层，它是一个**多平台入口网关**。你不一定非得在终端里跟它说话，也可以把它接到消息平台上，让同一个 agent 在 Telegram、Discord、Slack、WhatsApp 等入口上工作。也就是说，终端只是它的一个外壳，不是全部。

第四层，也是我觉得最关键的一层，它是一个**带学习闭环的系统**。当一个复杂任务做成了，它可以把方法沉淀为 skill；当它知道了你的偏好和环境约定，它可以写入 memory；当你说“上次我们搞过这个”，它可以用 session search 去找回过往会话。这个组合决定了它不像一次性聊天机器人，而更像一个持续成长的工作代理。

所以如果你问 Hermes Agent 是干什么的，我会给一个比较不短、但更准确的答案：

**它是一个把对话、工具调用、长期记忆、技能沉淀、任务调度和多平台入口整合到一起的通用 Agent 运行时。**

---

## 它为什么值得看？因为它不是只在做“会调工具”

过去一年，很多人一提 Agent，脑海里的理解还是比较扁平：

- 模型更强一点
- 会用几个工具
- 能自动执行几步
- 有个终端或者网页壳子

这当然也算 Agent，但我越来越觉得，这只是“能工作”的起点，不是“能长期使用”的起点。

真正难的是另外几件事：

- 你上次解决过的问题，这次能不能别从头再来
- 用户对你的纠正，下一次会不会白费
- 一套 workflow，能不能沉淀下来让未来复用
- 同一个 agent，能不能从 CLI 延伸到消息平台和定时任务
- 当任务变复杂时，系统有没有并行和调度能力

Hermes 的设计，基本都在回应这些问题。

它把 skills 做成“程序性记忆”，把 memory 做成“用户和环境事实存储”，把 session search 做成“跨会话召回”，再加上 cron、delegate_task、profile、MCP 这些外围能力，形成了一套比较完整的系统观。

这点让我觉得它更像在做一层 substrate，而不只是做一个入口产品。

![Hermes Agent 能力闭环](https://int32-blog.oss-cn-beijing.aliyuncs.com/uploads/hermes-agent-loop.jpg)

---

## Hermes Agent 和 OpenClaw 的区别是什么？

这个问题很重要，因为它们经常会被放在同一个语境里讨论。

从大类上说，它们确实都属于“能长期运行、能调用工具、能接多入口的 AI Agent 系统”。但如果你真的用工程眼光去看，会发现它们重心不太一样。

### OpenClaw 更像 personal AI assistant product

OpenClaw README 里有一句话很能代表它的气质：

> The Gateway is just the control plane — the product is the assistant.

这个表述非常产品化。它强调的是：这是一个跑在你自己设备上的 personal AI assistant，它在你已经在用的渠道里回答你，能常驻在线，能接手机、消息 App、控制面板、原生语音能力，整体体验更像“一个个人助手产品”。

你看它的文档导航和 onboarding 流程，也能感受到这种重心：

- `openclaw onboard --install-daemon`
- `openclaw gateway status`
- `openclaw dashboard`
- 大量 channels、native apps、gateway & ops 文档

也就是说，OpenClaw 非常强调“产品入口”和“始终在线的个人助手体验”。

### Hermes 更像 agent runtime / framework

Hermes 的首页虽然也强调 gateway，但它更突出的是这些概念：

- self-improving
- skills
- memory
- session search
- cron scheduling
- subagents / delegation
- provider-agnostic
- profiles

也就是说，Hermes 的关注点不只是“你怎么跟 agent 说话”，而是“agent 如何积累、调度、扩展、迁移和复用”。

所以如果非要用一句话去对比，我会这样说：

- **OpenClaw** 更像一个面向个人助手场景打磨出来的产品系统
- **Hermes Agent** 更像一个把 agent 当成可编程基础设施来设计的 runtime

### 两者最核心的差异，不在“能不能接平台”，而在“系统把什么当一等公民”

它们都能接消息平台，这不是本质差异。

真正的差异在于：

- OpenClaw 把 **assistant experience、channel surface、always-on product feel** 放在更前面
- Hermes 把 **learning loop、skills、memory、tool/runtime extensibility** 放在更前面

换句话说，OpenClaw 更容易让人感受到“我拥有了一个随时在线的 AI 助手”。而 Hermes 更容易让人感受到“我有了一套可持续生长的 Agent 系统”。

---

## 哪些人更适合 Hermes？

如果你是下面这类人，我觉得 Hermes 会特别顺手：

第一类，是把 AI 当成**长期生产力系统**来用的人。你不只是偶尔让它回答问题，而是希望它逐渐学会你的习惯、项目结构、工作目录、命令偏好和重复流程。

第二类，是**重度自动化用户或开发者**。你会在意 cron、subagent、session search、toolsets、MCP、profiles 这种能力，因为你不是在玩一个聊天产品，而是在搭自己的工作底座。

第三类，是喜欢**模型和 provider 自由切换**的人。Hermes 明确强调 provider-agnostic，这意味着你不用被锁在某一家 API 或某一种交互外壳里。

但反过来说，如果你最想要的是一个“开箱即用、控制面板明确、个人助手感极强”的成品体验，那 OpenClaw 的入口会更直接。它的 onboarding、dashboard、channel-based assistant surface，对普通用户来说可能更好理解。

---

## Hermes Agent 怎么用？

从官方 Quickstart 看，Hermes 的上手路径其实挺直接。

### 第一步：安装

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
```

官方文档说明支持：

- Linux
- macOS
- WSL2
- Android / Termux

Windows 原生不是主路径，推荐走 WSL2。

### 第二步：选择 provider 和模型

最常用的是：

```bash
hermes model
```

这一步会带你选推理提供商和默认模型。文档里列出的 provider 也很多，包括 Nous Portal、OpenAI Codex、Anthropic、OpenRouter、Z.AI、Kimi / Moonshot 等。

### 第三步：直接开始对话

```bash
hermes
```

这会进入交互式 CLI。你可以把它当成一个更偏 Agent 而不是单纯聊天壳的终端环境。

### 第四步：配置工具

```bash
hermes tools
```

如果你打算真正把它用成 Agent，这一步很重要。因为 Hermes 的价值很大程度上来自工具面：终端、文件、浏览器、搜索、计划、定时任务、MCP、消息平台等，都是通过工具 / toolsets 组织起来的。

### 第五步：配置整体环境

```bash
hermes setup
```

如果你不想一项项配，也可以走 setup wizard，一次把 provider、tools、gateway 等主要配置串起来。

### 第六步：检查系统状态

```bash
hermes doctor
```

这一步我很建议保留。Agent 这类系统最烦的就是“装是装上了，但到底哪一层没通”。`doctor` 这种命令看起来普通，但在真实使用里很关键。

---

## Hermes 常用命令有哪些？

下面这部分我觉得是最实用的。第一次上手没必要把所有命令记住，但有些命令几乎一定会高频出现。

### 1. 启动与单次对话

```bash
hermes
hermes chat -q "帮我总结这个仓库"
```

前者进入交互式会话，后者适合脚本化或一次性查询。

### 2. 模型与配置

```bash
hermes model
hermes config
hermes config edit
hermes config set <KEY> <VALUE>
```

你只把 `hermes` 当聊天工具，这组命令的重要性一般；但只要你开始认真长期使用，它们的频率会越来越高。

### 3. 工具与技能

```bash
hermes tools
hermes tools list
hermes skills list
hermes skills search <QUERY>
hermes skills install <ID>
```

Hermes 的识别度很大程度上来自 skills，所以这一组命令几乎等于它的“扩展市场”和“程序性记忆入口”。

### 4. 网关与消息平台

```bash
hermes gateway setup
hermes gateway start
hermes gateway status
hermes gateway restart
```

如果你想把 Hermes 从 CLI 延伸到 Telegram、Discord、Slack、WhatsApp 等平台，这组命令会是主线。

### 5. 定时任务与自动化

```bash
hermes cron list
hermes cron create <SCHEDULE>
hermes cron pause <ID>
hermes cron resume <ID>
```

这组命令体现了 Hermes 作为“长期运行 Agent”的一面。它不是只会等你说一句才动，而是可以在设定时间主动工作。

### 6. 会话与历史

```bash
hermes sessions list
hermes sessions browse
hermes sessions export <OUT>
```

当你把它纳入长期工作流后，这组命令会很有价值。因为 Agent 真正的资产，不只是当前上下文，还有过去的会话轨迹。

### 7. MCP、Profile 和扩展运行

```bash
hermes mcp list
hermes mcp add <NAME>
hermes profile list
hermes profile create <NAME>
```

这一组更偏进阶，但很能体现 Hermes 的框架感：你不是只在用一个固定产品，而是在组织一个可扩展的 agent 环境。

### 8. 健康检查与维护

```bash
hermes doctor
hermes status
hermes update
hermes logs
```

这组命令很朴素，但很重要。尤其是 `doctor` 和 `logs`，是你真正把它跑起来之后最能救命的那类命令。

![Hermes 常用命令地图](https://int32-blog.oss-cn-beijing.aliyuncs.com/uploads/hermes-agent-commands.jpg)

---

## 我自己的判断：Hermes 的重点不是“更像人”，而是“更像系统”

我看完之后最大的感受是，Hermes 的野心并不在于把 AI 包装得多像一个人格化助手，而在于把 Agent 作为一个系统长期运行起来。

它关心的不是单次回答是否顺滑，而是：

- 经验能不能积累
- 流程能不能沉淀
- 会话能不能回找
- 多入口能不能共用同一个 agent
- 定时任务、并行子任务、外部工具、MCP 能不能形成一个统一运行时

从这个角度看，它和 OpenClaw 不是简单的替代关系。

如果你追求的是“一个始终在线、随时能从你常用渠道接入的个人 AI 助手”，OpenClaw 很有吸引力。

如果你追求的是“一个能逐渐学会你的环境、沉淀你的 workflow、扩展成长期生产力底座的 Agent Runtime”，Hermes Agent 很值得花时间研究。

这也是为什么我看完以后，反而不太想把它简单归类成“又一个终端 AI 工具”。

它更像一个正在认真回答这个问题的项目：

**如果 Agent 不是一次性的聊天框，而是一个会记忆、会复用、会调度、会不断长出能力的系统，它应该长成什么样？**

Hermes 给出的答案，还远远没到最终形态，但已经相当有意思了。

---

## 附：一组值得先记住的 Hermes 命令

```bash
# 开始使用
hermes
hermes model
hermes setup
hermes doctor

# 单次查询
hermes chat -q "帮我看一下这个目录"

# 工具 / 技能
hermes tools
hermes tools list
hermes skills list
hermes skills search agent

# 网关
hermes gateway setup
hermes gateway start
hermes gateway status

# 自动化
hermes cron list
hermes cron create "0 9 * * *"

# 会话 / 扩展
hermes sessions list
hermes mcp list
hermes profile list

# 维护
hermes status
hermes update
hermes logs
```

如果后面我真的开始深度用 Hermes，我大概率还会再写一篇：不只是讲它是什么，而是讲**它为什么会让我觉得它更像“Agent 基座”，而不是另一个 AI 壳子**。

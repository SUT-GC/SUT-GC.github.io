---
layout: post
title: "Cody：为什么要造一个 AI Agent 框架"
description: "Cody 是什么、为什么要有它、用 SDK 能干什么——一个框架作者的思考与设计复盘。"
categories: ["技术"]
tags: ["AI", "Agent", "Python", "开源", "SDK", "Cody"]
---

* Kramdown table of contents
{:toc .toc}

[上一篇](/blog/2026/03/29/我造了一只自己的龙虾/)我提到，造 CodyClaw 的时候把 Agent 执行层抽了出来，做成了独立框架——叫 [Cody](https://github.com/CodyCodeAgent/cody)。

当时是一句带过，这篇专门来讲它。

---

## 从一个问题开始

我造 CodyClaw 的时候遇到一件事：**Agent 执行层几乎所有的工程复杂度，跟"我在造什么应用"完全无关。**

文件读写、Shell 执行、流式输出、会话上下文管理、权限控制、多模型适配——这些东西不管你是造飞书机器人、造 VS Code 插件、还是造命令行工具，都得从头写一遍。而且每写一遍，都是同样的坑。

所以我干了一件在软件工程里很经典的事：**把重复的脏活抽成框架，让上层只关心自己的业务逻辑。**

这就是 Cody 的起点。

---

## Cody 是什么

一句话：**Cody 是一个开源 AI Agent 框架，给你搭好执行 AI Agent 任务所需的全部基础设施，让你用几行代码就能跑起来一个能干活的 Agent。**

它不是一个 AI 产品，不是一个聊天机器人，也不是一个玩具——它是一个 **框架**，是给开发者用的。

接入方式有四种：Python SDK（最核心）、CLI、TUI 终端界面、Web 浏览器界面。但这四种共享同一个核心引擎，所有能力都来自同一个地方。

```
你的应用代码
     ↓
Python SDK（AsyncCodyClient）
     ↓
Core Engine（runner, tools, memory, security...）
     ↓
任意模型（qwen / claude / gpt / deepseek...）
```

---

## 为什么要有它

我做了一个框架，不代表这个框架就该存在。我来仔细说说为什么要有 Cody，而不是用现有的方案。

### LangChain 太重了

LangChain 很全面，但它的抽象层太厚。你想做一件简单的事——"让 AI 读一个文件然后告诉我结论"——需要理解 Chain、Runnable、AgentExecutor、PromptTemplate……一套下来，你可能比直接调 API 多写了三倍的代码。

Cody 的哲学是：**你直接告诉 Agent 该做什么，剩下的它自己搞定。**

### pydantic-ai 是好底座，但不是框架

Cody 的 Core 底层用了 [pydantic-ai](https://ai.pydantic.dev/)——它的模型无关抽象和类型安全做得很好。但它解决的是"怎么跟模型对话"的问题，不解决"Agent 在真实环境里工作需要什么基础设施"的问题。

工具注册、文件权限控制、Shell 安全、流式事件系统、项目记忆、熔断器——这些都是 Cody 在 pydantic-ai 之上补的层。

### Claude Code / Cursor 很强，但不给你集成

这些产品做得确实好，但它们是封闭的。你没办法把 Claude Code 的 Agent 执行层嵌进你自己的应用里，没办法给它加自定义工具，没办法控制它的行为边界。

Cody 是完全开源的，MIT License，你可以看所有代码、改所有逻辑、嵌到任何 Python 应用里。

---

## 它能干什么

说正题。Cody 提供了 30 个内置工具，覆盖 AI Agent 日常工作的完整链路。按类别分：

| 类别 | 工具 |
|---|---|
| 文件 I/O | read_file, write_file, edit_file, list_directory |
| 搜索 | grep, glob, search_files, patch |
| 执行 / 子 Agent | exec_command, spawn_agent, get_agent_status |
| 代码智能 (LSP) | lsp_diagnostics, lsp_definition, lsp_references, lsp_hover |
| Web / MCP | webfetch, websearch, mcp_call, mcp_list_tools |
| 记忆 / 管理 | save_memory, todo_write, undo_file, question |

工具注册是声明式的，加自定义工具只需往列表里追加——也可以在 SDK 里动态注册。

---

## SDK：核心的用法

工具列表看起来很长，但真正打动我的是 SDK 的体验——你用它的时候感觉不到那 30 个工具的存在，Agent 自己去用。

### 最简单的起点

```python
import asyncio
from cody.sdk import AsyncCodyClient

async def main():
    async with AsyncCodyClient(workdir="/path/to/project") as client:
        result = await client.run("给 utils.py 里所有函数加上类型注解")
        print(result.output)

asyncio.run(main())
```

这四行代码背后，Cody 会自己读文件、理解代码结构、写改动、验证结果。你不需要告诉它"先调 read_file，再调 edit_file"，它知道。

用环境变量配模型，不硬编码在代码里：

```bash
export CODY_MODEL=qwen3.5-plus
export CODY_MODEL_BASE_URL=https://coding.dashscope.aliyuncs.com/v1
export CODY_MODEL_API_KEY=sk-xxx
```

### 多轮对话

Agent 有时候需要多步完成任务，或者你想让多次 `run()` 调用共享上下文：

```python
async with AsyncCodyClient(workdir="/path/to/project") as client:
    r1 = await client.run("创建一个 Flask 应用，包含基本路由")
    # r1.session_id 是这次会话的 ID，传给下一次就能接上
    r2 = await client.run("给 /health 端点加上数据库连通性检查", session_id=r1.session_id)
    r3 = await client.run("写单元测试", session_id=r1.session_id)
```

会话状态由 Cody 托管，SQLite 落盘，进程重启后依然可以恢复。

### 流式输出

Agent 干活的过程是可观测的，不用等它全部跑完：

```python
async with AsyncCodyClient(workdir=".") as client:
    async for chunk in client.run_stream("分析这个仓库的架构，给我一份设计报告"):
        if chunk.type == "text_delta":
            print(chunk.content, end="", flush=True)
        elif chunk.type == "tool_call":
            print(f"\n[调用工具: {chunk.tool_name}]")
        elif chunk.type == "done":
            print(f"\n完成，共用 {chunk.total_tokens} tokens")
```

这个 chunk 事件流是分类型的——文字增量、工具调用、工具结果、思考过程、熔断触发……你可以按需订阅，也可以全部忽略只关心 `text_delta`。

### 注册自定义工具

内置 30 个工具之外，你可以注册自己的业务工具，Agent 会自动选择用哪个：

```python
from cody.sdk import Cody

async def query_database(ctx, sql: str) -> str:
    """在生产数据库上执行只读 SQL 查询，返回结果。"""
    result = await db.execute(sql)
    return result.to_json()

async def send_slack_alert(ctx, channel: str, message: str) -> str:
    """向指定 Slack 频道发送告警消息。"""
    await slack.post(channel, message)
    return "已发送"

client = (
    Cody()
    .workdir("/path/to/project")
    .tools([query_database, send_slack_alert])
    .build()
)
```

函数签名即文档，Cody 把 docstring 作为工具描述告诉模型，模型自己决定什么时候调。这是 pydantic-ai 工具注册的最大优点——类型安全、零样板代码。

### Builder 模式：声明式配置

如果你想把所有配置写在一起，Builder 模式更干净：

```python
from cody.sdk import Cody

client = (
    Cody()
    .workdir("/path/to/project")
    .model("qwen3.5-plus")
    .base_url("https://coding.dashscope.aliyuncs.com/v1")
    .api_key("sk-xxx")
    .max_tokens(100_000)           # 熔断：最多消耗多少 token
    .max_cost(5.0)                 # 熔断：最多花多少美元
    .allowed_roots(["/path/to/project"])  # 文件访问边界
    .build()
)
```

---

## 几个我认为值得单独说的设计

### 熔断器

Agent 跑偏了怎么办？进了死循环、token 消耗失控、成本超预算——熔断器在这些情况下自动叫停，而不是让你对着账单发愁。

```python
client = (
    Cody()
    .max_tokens(50_000)    # 超过就停
    .max_cost(2.0)         # 超过就停（美元）
    .max_steps(30)         # 工具调用轮次上限
    .build()
)
```

这些参数不是"建议"，是硬约束。熔断之后 `run()` 会返回，你拿到的是截止那一刻的结果。

### 安全边界

Agent 能读写文件、能跑 Shell，这很强大，也很危险。Cody 默认只允许 Agent 访问 `workdir` 范围内的文件，Shell 命令里有危险指令会被拦截，工具调用前可以要求人工确认。

```python
client = (
    Cody()
    .workdir("/safe/project")
    .allowed_roots(["/safe/project", "/tmp"])  # 只能访问这两个目录
    .blocked_commands(["rm -rf", "sudo", "curl"])  # 这些命令直接拒绝
    .build()
)
```

### 项目记忆

Agent 跑完一次任务后，它对这个项目的理解可以持久化——编码规范、项目约定、踩过的坑——下次启动的时候自动注入，不用每次从头让它了解项目背景。

```python
result = await client.run("用这个项目的风格重构 auth.py")
# Agent 读取上次保存的项目记忆
# 知道这个项目用 type hints，用 black 格式化，异常统一用 AppError
# 按规范改，不按自己的习惯改
```

### Human-in-the-Loop

有些操作你希望 Agent 先问你再做。Cody 内置了人机协同机制，Agent 会暂停、问你、等你回答、然后继续：

```python
from cody.sdk import Cody, InteractionRequestChunk

async with Cody().workdir(".").build() as client:
    async for chunk in client.run_stream("把这个服务部署到生产环境"):
        if isinstance(chunk, InteractionRequestChunk):
            # Agent 在问你
            print(f"Agent: {chunk.question}")
            answer = input("你: ")
            await client.send_user_input(answer, session_id=chunk.session_id)
```

这个机制不是靠 prompt 硬塞的，是框架层面的一等公民。Agent 调 `question` 工具，执行流挂起，等你回答，然后从中断的地方继续。

---

## 和 CodyClaw 的关系

回到[上一篇](/blog/2026/03/29/我造了一只自己的龙虾/)——CodyClaw 的 Agent 执行层就是这样接入 Cody 的：

```python
client = (
    Cody()
    .workdir(config.workdir)
    .model(config.model)
    .base_url(config.base_url)
    .api_key(config.api_key)
    .tools([*feishu_tools, *cron_tools])
    .skills_dirs(["./skills"])
    .build()
)

async for chunk in client.run_stream(user_message, session_id=session_id):
    if isinstance(chunk, TextDeltaChunk):
        accumulated_text += chunk.content
        await update_feishu_card(accumulated_text)
```

CodyClaw 的 gateway 目录负责飞书接入、消息路由、会话管理、审批卡片——这些是 CodyClaw 的业务逻辑。Agent 怎么思考、怎么调工具、怎么管上下文——这些全交给 Cody。

两个项目，各管各的，边界很清晰。

---

## 目前的状态

Cody 现在是 v2.0.0，核心功能稳定：

- **650+ 测试用例**，Python 3.10–3.13 全覆盖
- 30 个内置工具
- 多模型支持（qwen、claude、openai、deepseek、gemini、glm……任何 OpenAI 兼容 API）
- MCP 协议支持（stdio 和 HTTP transport）
- LSP 代码智能
- Agent Skills 开放标准（兼容 agentskills.io，26+ 平台可复用）

文档在 [GitHub](https://github.com/CodyCodeAgent/cody/blob/main/docs/SDK.md)，静态教程站在 [CodyCodeAgent.github.io/cody](https://CodyCodeAgent.github.io/cody)。

---

## 最后

做这个框架的初衷很简单：**我自己需要它，而我找不到一个合适的。**

如果你也在写 AI Agent 应用，不管是对接飞书、造 VS Code 插件、还是自动化任何工作流，欢迎来试试 Cody。

```bash
pip install cody-ai
```

如果觉得有用，GitHub 上点个 Star 就是最好的反馈：[github.com/CodyCodeAgent/cody](https://github.com/CodyCodeAgent/cody)

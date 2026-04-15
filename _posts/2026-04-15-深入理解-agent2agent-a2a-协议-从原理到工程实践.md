---
layout: post
title: "A2A 到底想解决什么问题？我对 Agent2Agent 协议的几点理解"
description: "A2A 不只是一个新协议名词。它真正想补的，是多 Agent 时代里最麻烦、也最容易被低估的那一层协作接口。"
categories: ["技术", "AI"]
tags: ["A2A", "Agent2Agent", "AI", "Agent", "MCP", "协议"]
---

* Kramdown table of contents
{:toc .toc}

# A2A 到底想解决什么问题？我对 Agent2Agent 协议的几点理解

最近 A2A 这个词越来越常见。

一开始我也有点条件反射。又来一个新协议？会不会跟前一阵子的 MCP 一样，先被讲成下一代基础设施，然后大家一窝蜂开始画图、做分享，最后真正落地的人没几个。

但这次我顺着官方文档、Google 的首发博客、Linux Foundation 后面的进展公告一路看下来，感觉还是有点不一样。

A2A 不是那种一眼看上去就特别炫的新东西。甚至相反，它讨论的是一个很朴素、但确实越来越绕不开的问题：

**一个 agent 会不会用工具，其实没那么难。难的是两个 agent 到底怎么合作。**

这篇我不想写成标准说明书。官方文档已经挺全了。这里更想写一点我自己消化之后的理解：A2A 到底在补哪一层，它和 MCP 到底是什么关系，为什么我觉得它值得继续看，以及如果你真想试一下，应该从哪里下手。

---

## 先说结论：A2A 不是另一个 Agent 框架

这是我看完后最先想强调的一点。

A2A 不是用来替代 LangGraph、ADK、CrewAI 这种东西的。它也不是说有了 A2A，你就突然拥有了一个更聪明的 agent。

它想做的事其实很克制。

你可以把它理解成：给 agent 和 agent 之间的协作，补一层比较像样的公共接口。

这个“比较像样”的意思是：

- 你得先知道对方是谁
- 你得知道对方会什么
- 你得有办法把任务交过去
- 任务如果很长，不能只靠一次请求等结果
- 最后返回来的，也不该只是随手一段文本

如果把这个问题换回传统软件世界，其实大家会觉得很熟悉。服务和服务之间本来就要解决发现、调用、状态、鉴权、结果这些事。到了 agent 这边，这些问题一个也没消失，只是以前大家都还在各自写私货，所以没显得特别标准化。

A2A 其实就是在说：别每家都自己搓一套了，我们来约一个大家都能认的协作方式。

---

## 我为什么会觉得它有点意思

说实话，如果 A2A 只停留在 Google 发一篇博客，我大概不会太上头。

因为这种事情过去几年见得太多了。新概念、新缩写、新架构图，个个都像未来。

但 A2A 让我觉得值得认真看的地方，是它后面的推进速度还挺快。

我查到的时间线大概是这样：

- **2025 年 4 月 9 日**，Google 正式发布 A2A
- **2025 年 6 月**，A2A 被贡献给 Linux Foundation
- **2025 年 7 月 31 日**，Google Cloud 继续发升级公告，提到 v0.3、gRPC、signed security cards、ADK 原生支持这些工程化进展
- **2026 年 4 月 9 日**，Linux Foundation 的公开口径已经是 1.0、production-ready、150+ 组织支持

你很难说这就已经板上钉钉了，但至少它已经过了“某家公司在 PPT 里提了个方向”的阶段。

这一点挺重要。

因为很多协议真正麻烦的，不是第一版 spec 写出来，而是后面有没有：

- SDK
- sample
- 部署路径
- 平台入口
- 社区叙事

A2A 现在这些东西，多少已经开始有了。

相关来源我还是放一下，免得这篇显得太像感想文：

- [Google 首发公告（2025-04-09）](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A 官方文档](https://a2a-protocol.org/dev/)
- [Google Cloud 升级公告（2025-07-31）](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [Linux Foundation 进展公告（2026-04-09）](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year)

---

## 真正的问题不是“AI 会不会调用工具”，而是“AI 怎么彼此协作”

我越来越觉得，过去一年大家在 Agent 这件事上，有一个非常典型的错觉。

因为模型会调工具、会读文件、会写代码、会接 MCP，所以大家很容易把“agent 能做事”理解成“agent 系统已经差不多成熟了”。

但那只是单点能力。

只要系统稍微复杂一点，问题马上就变了。

比如你在 IDE 里有一个 coding agent。它自己能写代码，也能跑测试。但你又有另一个更擅长读 CI 日志的 agent，或者一个只能在内网环境下访问文档库的 agent。这时候你真正关心的，已经不是前者会不会用 bash 了，而是：

- 它怎么知道另一个 agent 存在？
- 它怎么知道对方能做什么？
- 它怎么把任务发过去？
- 对方要是跑 10 分钟，状态怎么同步回来？
- 最后返回的是一句话，还是一个正式的 artifact？

这类问题以前也不是不能做。

最常见的做法其实就三种：

- 直接写私有 API
- 在框架内部搞一套自己的 agent orchestration
- 人工加一层适配胶水

短期都能跑。

但一旦跨系统、跨团队、跨组织，事情就会迅速变丑。每加一个新 agent，都像在原来那团线团上再缠一圈。

我觉得 A2A 的价值，恰恰就在这里。它试图把这些原本只能靠自定义集成解决的东西，抽成一套大家都认的基本约定。

---

## A2A 和 MCP，看起来像一家人，但其实不是一个分工

如果你最近也在看这些协议，肯定会问一句：

那 MCP 呢？

我一开始也有这个疑问。因为它们都带一点“开放协议”“标准接口”“给 agent 用”的气质，很容易写着写着就写混了。

但后来我发现，最简单的理解方式反而是把它们拆开。

MCP 处理的更像是：

**agent 怎么接工具、接资源、接外部数据源。**

A2A 处理的更像是：

**agent 怎么接另一个 agent。**

官方首页那句我挺喜欢：

- build with ADK
- equip with MCP
- communicate with A2A

[来源](https://a2a-protocol.org/dev/)

这句话之所以好，不是因为它押韵，而是它把这几个东西的位置摆得很准。

MCP 更像向内的接口层。

A2A 更像向外的协作层。

所以我现在比较不喜欢那种写法：

MCP 之后，A2A 来了。

这种句子很容易让人误会成一代替一代。

更准确的说法应该是：

如果未来 agent 工程真的会有一套稳定基础设施，那很可能会同时长出这两层东西。一层解决 agent 和工具/数据的连接，一层解决 agent 和 agent 的连接。

---

## A2A 里最重要的，不是 Message，而是 Task

如果只看概念，我觉得 A2A 最值得抓住的点其实不是 Agent Card，也不是 JSON-RPC，而是 **Task**。

这东西一旦看明白，整个协议的味道就出来了。

很多人第一次看 agent 协议，脑子里默认还是聊天模型：

- 你发一句
- 我回一句

但 A2A 的思路不是这个。

它从一开始就假设，很多协作不是一次性的问答，而是一个有状态的任务过程。

这个任务可能：

- 很快完成
- 跑很久
- 中间要回状态
- 最后产出一个真正的结果对象

这就是为什么你会在 A2A 里看到这些核心对象一起出现：

- Agent Card
- Task
- Message / Parts
- Artifact

我自己的理解是：

`Agent Card` 负责告诉别人我是谁、我会什么。

`Task` 负责承载一整段工作过程。

`Message / Parts` 负责把输入内容装进去。

`Artifact` 负责把结果以一种更正式的方式交出来。

这套建模方式很明显不是为“陪聊”设计的，它更像是为工作流设计的。

你把这点抓住了，再去看官方文档那些对象定义，就没那么容易迷路。

---

## 它为什么坚持用 HTTP、JSON-RPC、SSE 这些老东西

这点我个人其实挺买账的。

A2A 在底层没怎么折腾新花样，而是尽量建立在已有的 web 标准上，比如：

- HTTP(S)
- JSON-RPC 2.0
- Server-Sent Events

我觉得这是一种挺成熟的姿势。

因为很多协议的问题不在于“理论上设计得多优雅”，而在于进系统之后是不是一身反骨，什么现有网关、鉴权、观测、代理都接不上。

你越建立在已有的 web 世界里，它越有机会真的活下来。

这也是为什么 A2A 后面会很自然地跟这些东西绑在一起：

- Cloud Run
- ADK
- SDK
- marketplace
- 企业安全模型

不是因为这些词好听，而是因为一个想变成基础设施的协议，最后总要落到这些东西上。

---

## 说了半天概念，怎么快速试一下？

如果你也跟我一样，对这种协议的第一反应不是“哇新范式”，而是“行，那你先让我跑一下”，那我建议你别一上来就啃 spec。

最直接的方式，是先跑官方 sample。

官方的 Python quickstart 路径挺顺的，最小链路差不多就是这样：

```bash
git clone https://github.com/a2aproject/a2a-samples.git -b main --depth 1
cd a2a-samples
python -m venv .venv
source .venv/bin/activate
pip install -r samples/python/requirements.txt
python samples/python/agents/helloworld/__main__.py
```

这个 hello world 跑起来之后，默认服务地址一般是 `http://localhost:9999`。

这时候我觉得最值得先看的，不是 client，而是这个：

```bash
curl http://localhost:9999/.well-known/agent-card.json
```

因为这一眼就能把 A2A 的世界观看出来。

在 A2A 里，协作的第一步不是“我猜对方会什么”，而是“我先读对方的 Agent Card”。

然后你再开一个终端，跑官方 client：

```bash
source .venv/bin/activate
python samples/python/agents/helloworld/test_client.py
```

根据官方 quickstart，这个 client 会先拉 Agent Card，再创建 `A2AClient`，然后发非流式和流式请求。

它不是那种跑完之后让人惊呼的 demo。

但它有一个特别大的好处：你会很快建立一种对 A2A 的直觉。你会意识到它的主线根本不是“发一句消息”，而是：

- discover
- create task
- stream updates
- receive artifact

这个顺序一旦进脑子里，后面很多概念就不抽象了。

如果你想再往前多走一步，官方还有个 LangGraph 的 currency agent 样例。那一套会更像真实场景，因为它把 LLM、streaming、task state、multi-turn 这些都带上了。

跑法大概是：

```bash
cd samples/python/agents/langgraph/app
python __main__.py
python test_client.py
```

不过这套会需要 `GOOGLE_API_KEY`。所以我建议别一上来就跑它。先把 hello world 跑通，再看这个，节奏会舒服很多。

参考：

- [Python Quickstart](https://a2a-protocol.org/latest/tutorials/python/1-introduction/)
- [a2a-samples 仓库](https://github.com/a2aproject/a2a-samples)
- [a2a-python SDK](https://github.com/a2aproject/a2a-python)

---

## 如果自己写，一个最小 A2A Server 看起来是什么感觉

我觉得这也是理解协议特别好的办法。

不用一上来就写生产级代码，只要看清楚它的骨架。

如果用官方 Python SDK，一个最小 A2A Server 的结构，大概会长成这样：

```python
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCard, AgentCapabilities, AgentInterface, AgentSkill

skill = AgentSkill(
    id="hello",
    name="Hello Skill",
    description="Return a simple greeting",
    tags=["demo"],
)

agent_card = AgentCard(
    name="Hello Agent",
    description="A tiny A2A demo agent",
    version="1.0.0",
    url="http://localhost:9999",
    default_input_modes=["text"],
    default_output_modes=["text"],
    capabilities=AgentCapabilities(streaming=True),
    supported_interfaces=[
        AgentInterface(protocol_binding="JSONRPC", url="http://localhost:9999")
    ],
    skills=[skill],
)

handler = DefaultRequestHandler(
    agent_executor=HelloAgentExecutor(),
    task_store=InMemoryTaskStore(),
)

app = A2AStarletteApplication(
    agent_card=agent_card,
    http_handler=handler,
)
```

真正值得看的不是代码量，而是这段代码在告诉你什么。

它在告诉你，一个 A2A Server 至少要把这几件事想清楚：

- 我会什么
- 别人怎么发现我
- 谁来执行任务
- 任务状态放哪
- 我怎么作为一个标准服务暴露出去

从这个角度看，A2A Server 更像是把一个 agent 包装成“可以被别人调用的 agent 服务”，而不只是把几个工具随便暴露出去。

这也是为什么我会觉得它和 MCP 虽然像，但味道还是不一样。

MCP 那边你经常想的是：我怎么把工具暴露给模型。

A2A 这边你想的则是：我怎么把一个完整 agent 暴露给另一个 agent。

---

## 我现在对它最核心的判断

如果让我把前面这些全压缩成一句话，我会这么说：

**A2A 真正想标准化的，不是消息格式，而是多 agent 协作这件事本身。**

这也是为什么我觉得它重要的地方，不只是协议，而是它背后的边界感。

它在试图定义：

- agent 怎么被发现
- agent 怎么声明能力
- agent 怎么接受任务
- agent 怎么汇报状态
- agent 怎么交付结果

这些东西单看都不新。

但长期缺的，恰恰是把它们连成一套公共约定。

---

## 但我还是想泼一点冷水

即使我觉得 A2A 值得看，我也不太想把它写成那种“下一个时代已成定局”的文章。

原因很简单。

第一，它虽然已经走到 1.0 和 production-ready 这个口径了，但生态还在明显变化中。SDK、最佳实践、安全模型、不同平台的落地细节，未来一年大概率还会继续变。

第二，标准存在，不等于落地摩擦消失。

真正到了生产环境，麻烦还是会落到这些地方：

- 身份和授权
- 多租户隔离
- 幂等和重试
- push notification
- 审计
- 跨组织的信任边界

这些问题不是多一份 spec 就自动解决的。

第三，也是我觉得最容易被忽略的一点：

**不是所有 agent 系统都需要 A2A。**

如果你的系统本质上还是单体应用内部的工具编排，那 MCP、函数调用、框架内 orchestration 很可能已经足够了。你没必要为了“看起来更先进”而硬套一个外部协作协议。

什么时候 A2A 会明显更值？

我自己的判断是，当你开始碰到这些场景：

- 跨系统
- 跨团队
- 跨组织
- 长任务
- 有状态协作
- 结果需要作为正式交付物返回

这时候它的价值会突然变大。

所以工程上更实用的判断框架其实很简单：

- 问题是 agent 怎么接工具，先想 MCP
- 问题是 agent 怎么接另一个 agent，开始认真看 A2A

---

## 最后一句

如果未来多 agent 系统真的会从今天这种各写各的状态，慢慢演化成一个更完整的生态，我觉得 A2A 大概率会是里面很重要的一块拼图。

它未必会像一些人说的那样，一夜之间变成整个行业的统一语言。

但至少到 **2026 年 4 月 15 日** 这个时间点，我已经不太把它看成一个纯概念了。

它更像一个正在长骨架的标准。

至于它最后能不能长成基础设施，就得看后面两件事：

- 有多少人真的拿它去接真实系统
- 有多少平台愿意围着它继续做工程化

这两个问题，接下来一年应该会越来越有意思。

---

## 参考资料

- [Google: Announcing the Agent2Agent Protocol (A2A)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A Protocol Official Docs](https://a2a-protocol.org/dev/)
- [A2A Core Concepts](https://a2a-protocol.org/latest/topics/key-concepts/)
- [A2A Specification](https://a2a-protocol.org/dev/specification/)
- [A2A GitHub Project](https://github.com/a2aproject/A2A)
- [Python Quickstart](https://a2a-protocol.org/latest/tutorials/python/1-introduction/)
- [A2A Samples](https://github.com/a2aproject/a2a-samples)
- [A2A Python SDK](https://github.com/a2aproject/a2a-python)
- [Google Cloud: Agent2Agent protocol (A2A) is getting an upgrade](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)
- [Google Cloud Run: Overview of A2A agents](https://docs.cloud.google.com/run/docs/ai/a2a-agents)
- [Linux Foundation: A2A Protocol Surpasses 150 Organizations...](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year)

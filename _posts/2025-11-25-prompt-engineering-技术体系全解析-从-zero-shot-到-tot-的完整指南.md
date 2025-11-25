---
layout: post
title: "Prompt Engineering 技术体系全解析：从 Zero-shot 到 ToT 的完整指南"
description: "深入解析 Prompt Engineering 核心技术体系，包括 Shot 系列、Chain of Thought、Tree of Thoughts、ReAct、RAG 等主流技术的原理、应用场景与最佳实践"
categories: ["AI", "技术"]
tags: ["Prompt Engineering", "LLM", "AI", "Claude", "GPT", "CoT", "ToT", "RAG", "ReAct"]
---

* Kramdown table of contents
{:toc .toc}

# Prompt Engineering 技术体系全解析：从 Zero-shot 到 ToT 的完整指南

随着大语言模型（LLM）的快速发展，Prompt Engineering（提示工程）已经从简单的"问问题"演变成一套完整的技术体系。本文将系统梳理当前业界主流的 Prompt 技术，帮助你构建完整的知识框架。

## 一、Prompt 格式标准

在深入技术之前，先了解两种主流的 Prompt 格式规范。

### 1.1 XML 标签格式

Anthropic（Claude）官方推荐使用 XML 标签来组织 prompt，常用标签包括 `<instructions>`、`<example>`、`<formatting>` 等。

**优势：**
- **清晰性**：明确分隔不同部分，防止模型混淆指令和示例
- **准确性**：减少模型误解
- **灵活性**：方便添加、删除或修改
- **可解析性**：便于后处理提取特定内容

**示例结构：**

```xml
<context>
  背景信息和角色设定
</context>

<data>
  需要处理的数据
</data>

<instructions>
  具体任务指令
</instructions>

<tone>
  输出的语气/风格要求
</tone>

<formatting-example>
  期望输出的格式示例
</formatting-example>
```

### 1.2 Markdown 格式

GPT 系列模型通常更偏好 Markdown 格式。测试表明 Markdown 和 XML 格式的成功率都很高，而 JSON 格式表现较差。

**模型偏好差异：**
- **Claude**：在 XML 结构化 prompt 上表现更好，尤其是需要严格遵循指令的复杂任务
- **GPT**：通常更偏好 Markdown 格式

---

## 二、Shot 系列：示例驱动的基础技术

"Shot" 指的是**给模型提供的示例数量**，这是 Prompt Engineering 最基础的技术分类。

### 2.1 Zero-shot（零样本）

不给任何示例，直接让模型执行任务。大规模训练使模型能够在"零样本"情况下执行某些任务。

```
Prompt: 把这句话翻译成英文：今天天气很好
Output: The weather is nice today.
```

**适用场景：**
- 简单、明确定义的任务
- 依赖模型预训练知识的通用任务
- 概念解释、定义说明等

### 2.2 One-shot（单样本）

提供一个示例来帮助模型理解任务格式和期望输出。

```
Prompt:
示例：开心 → happy
请翻译：难过 →

Output: sad
```

**适用场景：**
- 指令存在歧义时
- 任务稍有难度需要澄清时

### 2.3 Few-shot（少样本）

提供 2-5 个示例，让模型学习模式和格式。这是**上下文学习（In-Context Learning, ICL）**的核心应用。

```
Prompt:
请判断情感：

输入：这个产品太棒了！ → 正面
输入：质量很差，退货了 → 负面
输入：还行吧，一般般 → 中性

输入：简直是浪费钱 →

Output: 负面
```

**Few-shot 最佳实践：**
- 示例的顺序会影响性能，将最关键的示例放在最后
- 示例应覆盖不同的边界情况
- 保持示例结构的一致性
- 通常 3-5 个示例效果最佳，超过 8 个后边际效益递减

---

## 三、推理增强技术

### 3.1 Chain of Thought (CoT) - 链式思维

由 Google 研究团队在 2022 年提出，通过引导模型展示**中间推理步骤**来提升复杂推理任务的准确性。

**核心思想：** 让模型"思考出声"，而不是直接给出答案。

**普通问法 vs CoT：**

```
# 普通问法
Q: 一个农场有23头牛，卖了8头，又买了12头，现在有多少头？
A: 27头（可能出错）

# CoT 问法
Q: 一个农场有23头牛，卖了8头，又买了12头，现在有多少头？请一步步思考。
A: 让我一步步算：
   1. 开始有 23 头
   2. 卖了 8 头：23 - 8 = 15 头
   3. 买了 12 头：15 + 12 = 27 头
   所以现在有 27 头牛。
```

**CoT 的优势：**
- 提升算术、常识和符号推理任务的准确性
- 增加透明度，便于理解模型的推理过程
- 在 GSM8K 数学基准测试中，540B 参数模型使用 CoT 达到了最先进的准确率

**重要限制：**
- CoT 仅在约 100B 参数以上的大模型中才能产生性能提升
- 较小的模型可能会生成不合逻辑的推理链，导致准确率下降

### 3.2 Zero-shot CoT

最简单的 CoT 触发方式，只需在 prompt 末尾加一句：

```
"Let's think step by step"（让我们一步步思考）
```

这个简单的句子被证明能显著提升复杂推理任务的准确率，由东京大学和 Google Research 在 2022 年提出。

### 3.3 Auto-CoT（自动链式思维）

由 Zhang 等人（2022）提出，通过 LLM 自动生成推理链，消除手动创建示例的工作量。

**两阶段流程：**
1. **问题聚类**：将问题按多样性分组
2. **示例采样**：从每个聚类中选择代表性问题，使用 Zero-shot CoT 生成推理链

### 3.4 Self-Consistency（自洽性）

由 Google 研究团队在 2023 年提出，是 CoT 的增强版本。

**核心思想：** 生成多个推理路径，通过**多数投票**选择最一致的答案。

```
同一问题 → 生成 5 个不同的 CoT 推理路径 → 统计最常见的答案 → 输出
```

**性能提升：**
- GSM8K: +17.9%
- SVAMP: +11.0%
- AQuA: +12.2%
- StrategyQA: +6.4%

**变体 - Universal Self-Consistency (USC)：**
- 适用于开放式生成任务
- 不使用简单投票，而是让 LLM 从多个输出中选择最一致的答案

---

## 四、Tree of Thoughts (ToT) - 思维树

由 Princeton 和 Google DeepMind 研究团队在 2023 年提出，是 CoT 的重大进化。

### 4.1 核心概念

ToT 维护一棵**思维树**，其中每个节点代表一个连贯的语言序列，作为解决问题的中间步骤。

**与 CoT 的关键区别：**
- CoT：线性单路径推理
- ToT：探索多个分支，支持回溯

```
问题
├── 分支A → 评估 → 继续/放弃
├── 分支B → 评估 → 继续/放弃
└── 分支C → 评估 → 继续/放弃
```

### 4.2 工作流程

1. **思维分解**：将问题分解为多个中间步骤
2. **思维生成**：使用采样或提议方法生成候选思维
3. **状态评估**：LLM 评估每个思维的进展（sure/maybe/impossible）
4. **搜索算法**：使用 BFS 或 DFS 探索思维空间

### 4.3 性能表现

在 Game of 24 任务中：
- GPT-4 + CoT：4% 成功率
- GPT-4 + ToT：**74% 成功率**

**适用场景：**
- 需要规划和前瞻的任务
- 初始决策至关重要的问题
- 需要同时考虑多个解决方案的复杂任务

**注意：** ToT 资源消耗较高，对于简单的 NLP 任务可能是"杀鸡用牛刀"。

### 4.4 简化版 ToT Prompt

Dave Hubert 提出了一种将 ToT 核心概念压缩到单个 prompt 的方法：

```
想象三位不同的专家正在回答这个问题。
所有专家将写下他们思考的第一步，然后与小组分享。
然后所有专家继续下一步，以此类推。
如果任何专家在任何时候意识到自己错了，他们就会离开。
问题是...
```

---

## 五、ReAct - 推理与行动的协同

由 Yao 等人在 2022 年提出，名称来源于 **Re**asoning + **Act**ing。

### 5.1 核心思想

ReAct 结合了**推理**和**行动**两个能力，让模型能够：
- 生成推理轨迹（Thought）
- 执行特定动作（Action）
- 观察结果（Observation）
- 循环迭代直到完成任务

### 5.2 工作流程示例

```
问题：北京今天气温多少？

Thought 1: 我需要查询北京的天气
Action 1: 搜索["北京今天天气"]
Observation 1: 北京今天最高温度25℃，多云

Thought 2: 我找到了答案
Action 2: Finish["北京今天最高气温25℃"]
```

### 5.3 与 CoT 的对比

| 特性 | CoT | ReAct |
|------|-----|-------|
| 外部交互 | 无 | 支持工具调用 |
| 知识更新 | 依赖训练数据 | 可获取实时信息 |
| 幻觉问题 | 容易产生 | 通过验证减少 |
| 适用场景 | 纯推理任务 | 需要外部信息的任务 |

### 5.4 应用场景

- 知识密集型问答（如 HotPotQA）
- 事实验证（如 FEVER）
- 交互式决策（如 ALFWorld、WebShop）

**注意：** 2023 年后，OpenAI、Anthropic 等原生函数调用（Function Calling）能力在许多场景下可以替代 ReAct。

---

## 六、RAG - 检索增强生成

由 Meta AI 研究团队在 2020 年提出，全称 **R**etrieval **A**ugmented **G**eneration。

### 6.1 解决的问题

LLM 的固有局限：
- 知识截止日期限制
- 无法访问私有/专业数据
- 可能产生幻觉

### 6.2 工作原理

```
用户查询 
   ↓
查询向量化（Embedding）
   ↓
向量数据库检索相关文档
   ↓
将检索结果与原始查询合并
   ↓
LLM 生成基于上下文的回答
```

### 6.3 RAG 类型

- **RAG-Sequence**：使用一个检索文档生成整个响应
- **RAG-Token**：允许生成器在每个 token 使用不同的文档（更灵活）

### 6.4 核心优势

- **实时性**：可以访问最新信息
- **准确性**：减少幻觉，提供可追溯的来源
- **成本效益**：无需重新训练模型
- **灵活性**：可以热更换知识库

### 6.5 RAG Prompt 结构示例

```
CONTEXT: <检索到的相关文档>

QUESTION: <用户的问题>

根据提供的 CONTEXT 回答 QUESTION。
将你的回答建立在 CONTEXT 的事实基础上。
如果 CONTEXT 中没有相关信息，请说你不知道。
```

---

## 七、其他重要技术

### 7.1 Prompt Chaining（提示链）

将复杂任务拆分为多个步骤，前一步的输出作为下一步的输入。

```
步骤1: 提取文章关键信息 → 输出A
步骤2: 基于A生成大纲 → 输出B  
步骤3: 基于B写完整内容 → 最终输出
```

### 7.2 Role Prompting（角色提示）

给模型设定特定角色，激活相关领域的知识和表达方式。

```
你是一位拥有 20 年经验的资深 Python 架构师。
请评审以下代码...
```

### 7.3 Generated Knowledge Prompting（生成知识提示）

先让模型生成相关背景知识，再用这些知识回答问题。

```
第一步：生成关于 [主题] 的 5 个关键事实
第二步：基于这些事实，回答 [问题]
```

### 7.4 Least-to-Most Prompting（由简到难）

先解决简单的子问题，逐步构建到复杂问题的解决方案。

### 7.5 Reflexion（反思）

让模型评估并反思自己的输出，进行自我改进。

---

## 八、技术选择决策树

```
你的任务是什么？
│
├── 简单任务（翻译、分类、问答）
│   └── 先尝试 Zero-shot
│       └── 效果不佳 → Few-shot
│
├── 需要推理的任务（数学、逻辑）
│   └── CoT 或 Zero-shot CoT
│       └── 需要更高准确率 → Self-Consistency
│
├── 复杂多步骤任务
│   └── Prompt Chaining
│
├── 需要规划/决策的任务
│   └── Tree of Thoughts
│
├── 需要外部工具/实时信息
│   └── ReAct 或 Function Calling
│
└── 需要最新/专业知识
    └── RAG
```

---

## 九、技术组合与最佳实践

### 9.1 常见组合

- **Few-shot + CoT**：提供带推理过程的示例
- **RAG + CoT**：检索信息后进行推理
- **ToT + Self-Consistency**：多路径探索 + 一致性验证

### 9.2 2025 年趋势

1. **结构化优于花哨措辞**：清晰的结构和上下文比巧妙的措辞更重要
2. **模型对"怎么问"越来越敏感**：成功更多依赖战略性结构设计
3. **Agent 化发展**：ReAct 等技术与 Function Calling 深度融合
4. **自动化 Prompt 优化**：Auto-CoT、Automatic Prompt Engineer 等技术兴起

### 9.3 通用最佳实践

1. **明确具体**：不要说"写报告"，要说"写包含执行摘要、关键发现、建议三部分的报告"
2. **使用分隔符**：用 `"""` 或 XML 标签分隔不同内容
3. **告诉模型要做什么**：而非"不要做什么"
4. **迭代优化**：将 Prompt Engineering 视为实验过程
5. **匹配模型特性**：根据使用的模型选择合适的格式（Claude 用 XML，GPT 用 Markdown）

---

## 十、技术全景图

```
Prompt Engineering 技术栈
│
├── 格式标准
│   ├── XML 标签（Claude 推荐）
│   └── Markdown（GPT 推荐）
│
├── 示例数量（Shot 系列）
│   ├── Zero-shot（无示例）
│   ├── One-shot（1个示例）
│   └── Few-shot（多个示例）
│
├── 推理增强
│   ├── Chain of Thought (CoT)
│   ├── Zero-shot CoT
│   ├── Auto-CoT
│   ├── Self-Consistency
│   ├── Tree of Thoughts (ToT)
│   └── Least-to-Most
│
├── Agent 技术
│   ├── ReAct（推理+行动）
│   ├── Function Calling
│   └── Prompt Chaining
│
├── 知识增强
│   ├── RAG（检索增强生成）
│   └── Generated Knowledge
│
└── 辅助技术
    ├── Role Prompting
    ├── Reflexion
    └── Prompt Optimization
```

---

## 参考文献

1. Wei et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
2. Yao et al. (2023). "Tree of Thoughts: Deliberate Problem Solving with Large Language Models"
3. Yao et al. (2022). "ReAct: Synergizing Reasoning and Acting in Language Models"
4. Lewis et al. (2020). "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
5. Wang et al. (2023). "Self-Consistency Improves Chain of Thought Reasoning in Language Models"
6. Kojima et al. (2022). "Large Language Models are Zero-Shot Reasoners"
7. Brown et al. (2020). "Language Models are Few-Shot Learners"

---

## 总结

Prompt Engineering 已经从简单的"提问技巧"发展成一套完整的技术体系。掌握这些技术，不仅能让你更有效地与 LLM 协作，也为构建复杂的 AI 应用打下坚实基础。

关键记住：**没有放之四海而皆准的最佳方法**。根据你的具体任务、使用的模型、以及对准确性和效率的要求，选择合适的技术组合，并通过迭代优化找到最优解。

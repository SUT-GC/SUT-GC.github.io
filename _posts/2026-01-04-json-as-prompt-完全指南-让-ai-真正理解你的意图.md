---
layout: post
title: "JSON as Prompt 完全指南：让 AI 真正理解你的意图"
description: "深入解析 JSON Prompting 技术，对比传统自然语言提示词的优劣，并提供实用的 JSON Prompt 编写指南"
categories: ["技术", "AI", "Prompt Engineering"]
tags: ["JSON Prompting", "Prompt Engineering", "LLM", "AI", "ChatGPT", "Claude", "Gemini"]
---

* Kramdown table of contents
{:toc .toc}

# JSON as Prompt 完全指南：让 AI 真正理解你的意图

> 当你还在用自然语言"祈祷" AI 理解你的需求时，有人已经用 JSON 和 AI 签订了"契约"。

## 引言：从"对话"到"契约"

我们与大模型交互的方式正在发生根本性转变。

传统的 Prompt 写法，本质上是在和 AI "聊天"——我们用自然语言描述需求，然后祈祷它能理解。这就像给一个天才但有点迷糊的助手下指令：有时候它心领神会，有时候它南辕北辙。

**JSON as Prompt（简称 JAP）** 代表了一种新范式：我们不再"聊天"，而是签订"契约"。通过结构化的 JSON 格式，我们明确告诉 AI：这是任务，这是参数，这是约束，这是期望的输出格式。

2024 年，这种方法开始在业界广泛传播。随着 OpenAI、Anthropic 等平台相继推出 Structured Outputs 功能，JSON Prompting 正在从小众技巧变成主流方法。

这篇文章将带你深入理解：
- 什么是 JSON Prompting，它为什么有效
- 与传统提示词相比，它的优势在哪里
- 如何编写高质量的 JSON Prompt
- 在不同场景下的最佳实践
- 手写 JSON Prompt 的痛点，以及如何用工具解决

---

## 一、什么是 JSON as Prompt？

### 1.1 基本概念

JSON as Prompt 是一种**结构化提示词工程**方法，用 JSON（JavaScript Object Notation）格式来组织和传递指令给 AI 模型。

**传统方式：**
```
请帮我写一篇关于人工智能的博客文章，大概 2000 字，要专业但易懂，
面向技术人员，包含引言、三个主要部分和结论。
```

**JSON Prompting 方式：**
```json
{
  "task": "write_blog_post",
  "topic": "人工智能",
  "audience": "技术人员",
  "tone": "专业但易懂",
  "length": "2000字",
  "structure": {
    "sections": ["引言", "主要部分1", "主要部分2", "主要部分3", "结论"]
  }
}
```

看起来只是换了个格式？其实不然。这背后是**思维方式的根本转变**——从模糊的"期望"变成明确的"规格说明"。

### 1.2 为什么 LLM 对 JSON 友好？

大语言模型在训练过程中接触了海量的结构化数据：
- API 响应和请求
- 配置文件
- 数据库 Schema
- 代码和文档

JSON 是这些数据中最常见的格式之一。当模型看到 JSON 结构时，它会自动激活与"精确解析"和"格式遵循"相关的能力，而不是"自由发挥"的创作模式。

换句话说，**JSON 是 AI 的"母语"之一**。用它来沟通，信号更强，噪音更少。

---

## 二、JSON Prompting vs 传统提示词：全面对比

### 2.1 核心差异

| 维度 | 传统自然语言 | JSON Prompting |
|------|-------------|----------------|
| **精确度** | 依赖模型理解，容易产生歧义 | 参数明确，减少误解 |
| **一致性** | 同样的 prompt 可能产生不同格式的输出 | 输出格式稳定可预测 |
| **可复用性** | 需要重新描述 | 修改参数即可复用 |
| **可维护性** | 长文本难以管理 | 结构清晰，易于版本控制 |
| **机器可读** | 需要额外解析 | 天然可被程序处理 |
| **调试效率** | 难以定位问题 | 可以逐字段排查 |

### 2.2 实际案例对比

#### 场景：生成产品描述

**传统方式：**
```
写一个产品描述，产品是一款蓝牙耳机，特点是降噪好、续航长、
佩戴舒适。风格要专业但有吸引力，长度 150 字左右，
要包含一个吸引人的标题。
```

问题：
- "专业但有吸引力"是什么程度？
- "150 字左右"是 140 还是 180？
- 标题要什么风格？

**JSON Prompting 方式：**
```json
{
  "task": "generate_product_description",
  "product": {
    "name": "SoundPro X1",
    "category": "蓝牙耳机",
    "features": [
      {"feature": "主动降噪", "highlight": true},
      {"feature": "40小时续航", "highlight": true},
      {"feature": "人体工学设计", "highlight": false}
    ]
  },
  "output": {
    "title": {
      "style": "benefit_focused",
      "max_length": 15
    },
    "body": {
      "tone": "professional_yet_engaging",
      "length": {"min": 140, "max": 160},
      "must_include": ["核心卖点", "使用场景"]
    }
  }
}
```

差异显而易见：每个参数都有明确定义，模型没有"自由发挥"的空间，输出自然更可控。

### 2.3 一个常见误解

有人说："JSON Prompting 只是换了个格式，本质上没区别。"

这是错误的。**格式本身就是信息**。

当你用 JSON 写 prompt 时，你被迫做了几件事：
1. **明确任务类型**：必须定义 `task` 字段
2. **拆解需求**：必须把复杂需求拆成字段
3. **量化参数**：必须给出具体数值而非模糊描述
4. **结构化思考**：必须考虑信息的层级关系

这个**编写过程本身就在帮你澄清需求**。很多时候，prompt 效果不好不是因为 AI 笨，而是因为你自己都没想清楚要什么。

---

## 三、JSON Prompting 的核心优势

### 3.1 减少幻觉（Hallucination）

研究表明，JSON Prompting 可以将 AI 幻觉降低 **30-50%**。原因是：

- **边界清晰**：JSON Schema 定义了什么信息该出现在什么位置
- **类型约束**：数字就是数字，字符串就是字符串
- **必填校验**：关键字段不能遗漏

当 AI 必须在固定框架内填充内容时，它很难"编造"不存在的信息。

### 3.2 输出可验证

传统 prompt 的输出像散文，难以程序化验证。JSON 输出可以直接：

```python
import json

response = get_ai_response(json_prompt)
data = json.loads(response)

# 验证必填字段
assert "title" in data
assert len(data["content"]) >= 100

# 直接使用
save_to_database(data)
```

### 3.3 版本控制友好

自然语言 prompt 的微小改动很难追踪：

```diff
- 写一篇专业的博客文章
+ 写一篇专业且有深度的博客文章
```

"有深度"意味着什么？谁也说不清。

JSON prompt 的改动一目了然：

```diff
{
  "tone": "professional",
+ "depth": "comprehensive",
+ "include_examples": true
}
```

### 3.4 团队协作效率

在团队中，JSON prompt 可以成为**共享契约**：

- 产品经理定义 `task` 和 `requirements`
- 设计师定义 `style` 和 `visual_elements`
- 工程师定义 `output_spec` 和 `constraints`

每个人负责自己熟悉的部分，最后组合成完整的 prompt。

---

## 四、如何编写高质量的 JSON Prompt

### 4.1 基础结构设计

一个好的 JSON prompt 应该包含以下核心模块：

```json
{
  "task": "任务类型",
  "context": {
    "background": "背景信息",
    "constraints": ["约束条件"]
  },
  "input": {
    "data": "输入数据"
  },
  "output_spec": {
    "format": "输出格式",
    "structure": "输出结构"
  },
  "style": {
    "tone": "语气风格"
  }
}
```

### 4.2 字段命名原则

**好的字段名：**
- `audience` - 明确表示目标受众
- `max_length` - 清晰的数值约束
- `tone` - 通用的风格描述

**坏的字段名：**
- `details` - 太模糊，什么细节？
- `stuff` - 毫无意义
- `misc` - 杂项？

**原则：字段名应该自解释，即使没有文档也能理解其含义。**

### 4.3 使用枚举限定选项

不要给模型太多自由度：

```json
{
  "tone": "formal | casual | technical",
  "length": "short | medium | long",
  "format": "markdown | html | plain_text"
}
```

用 `|` 分隔的枚举值告诉模型：只能从这些选项中选择。

### 4.4 嵌套表达复杂关系

当需求复杂时，使用嵌套结构：

```json
{
  "content_blocks": [
    {
      "id": "intro",
      "type": "introduction",
      "length": "100-150 words"
    },
    {
      "id": "main",
      "type": "body",
      "subsections": [
        {"title": "背景", "emphasis": "high"},
        {"title": "方法", "emphasis": "medium"},
        {"title": "结果", "emphasis": "high"}
      ]
    }
  ]
}
```

### 4.5 提供示例（Few-shot in JSON）

在 JSON 中嵌入示例：

```json
{
  "task": "extract_entities",
  "examples": [
    {
      "input": "苹果公司CEO库克宣布新品发布会",
      "output": {
        "company": "苹果公司",
        "person": "库克",
        "role": "CEO",
        "event": "新品发布会"
      }
    }
  ],
  "actual_input": "微软总裁纳德拉访问中国"
}
```

---

## 五、不同场景的 JSON Prompt 模板

### 5.1 信息图表 / 数据可视化

当你需要生成包含数据对比、指标变化的图表时：

```json
{
  "task": "generate_infographic",
  "title": {
    "text": "Q4 性能优化成果",
    "style": "banner"
  },
  "content_blocks": [
    {
      "header": "一期优化",
      "metrics": [
        {
          "label": "响应时间",
          "before": "26s",
          "after": "21s",
          "change": "-19%",
          "display": "comparison_arrow"
        }
      ]
    }
  ],
  "style": {
    "visual_style": "doodle_sketch",
    "color_palette": ["#F5F5DC", "#FFD700", "#87CEEB"]
  }
}
```

### 5.2 架构图 / 系统设计

```json
{
  "task": "generate_architecture_diagram",
  "layers": [
    {
      "name": "Frontend",
      "position": "top",
      "components": ["React App", "Mobile App"]
    },
    {
      "name": "Backend",
      "position": "middle",
      "components": ["API Gateway", "Auth Service", "Core Service"]
    },
    {
      "name": "Data",
      "position": "bottom",
      "components": ["PostgreSQL", "Redis", "S3"]
    }
  ],
  "connections": [
    {"from": "React App", "to": "API Gateway", "type": "https"},
    {"from": "API Gateway", "to": "Auth Service", "type": "internal"}
  ]
}
```

### 5.3 内容创作

```json
{
  "task": "write_article",
  "topic": "远程工作的未来",
  "audience": {
    "demographics": "25-45岁职场人士",
    "expertise_level": "intermediate"
  },
  "structure": {
    "sections": [
      {"type": "hook", "length": "50-80字"},
      {"type": "problem", "length": "200字"},
      {"type": "solution", "points": 3},
      {"type": "conclusion", "include_cta": true}
    ]
  },
  "constraints": {
    "total_length": "1500-2000字",
    "forbidden_words": ["绝对", "一定", "必须"],
    "required_elements": ["数据支撑", "真实案例"]
  }
}
```

### 5.4 代码生成

```json
{
  "task": "generate_code",
  "language": "Python",
  "framework": "FastAPI",
  "functionality": {
    "description": "用户认证 API",
    "endpoints": [
      {"path": "/register", "method": "POST"},
      {"path": "/login", "method": "POST"},
      {"path": "/refresh", "method": "POST"}
    ]
  },
  "requirements": [
    "使用 JWT 认证",
    "密码使用 bcrypt 加密",
    "包含输入验证"
  ],
  "code_style": {
    "type_hints": true,
    "docstrings": "Google style",
    "max_function_length": 30
  }
}
```

---

## 六、JSON Prompting 的局限性

### 6.1 不适合的场景

| 场景 | 原因 |
|------|------|
| **开放式创意写作** | 过度结构化会限制创意 |
| **日常对话** | 小题大做，增加复杂度 |
| **简单问答** | "法国首都是哪里？"不需要 JSON |
| **头脑风暴** | 需要自由发散，不需要约束 |

### 6.2 潜在问题

1. **Token 开销**：JSON 格式比自然语言消耗更多 token（引号、括号、逗号）
2. **学习成本**：非技术人员可能不熟悉 JSON 语法
3. **过度工程化**：简单任务用 JSON 反而更复杂
4. **创意压制**：太多约束可能让输出变得"机械"

### 6.3 平衡之道

**混合使用**是最佳实践：

```
请根据以下 JSON 配置生成内容：

{
  "task": "write_story",
  "theme": "科幻",
  "length": "short"
}

额外要求：
- 结尾要出人意料
- 可以适当幽默
```

结构化的部分用 JSON，需要灵活度的部分用自然语言。

---

## 七、进阶技巧

### 7.1 动态 Schema

根据任务类型动态调整结构：

```json
{
  "task_type": "data_analysis",
  "schema_version": "2.0",
  "conditional_fields": {
    "if_task_is_visualization": ["chart_type", "color_scheme"],
    "if_task_is_report": ["sections", "executive_summary"]
  }
}
```

### 7.2 Prompt 链（Chaining）

将复杂任务拆成多个 JSON prompt：

```
Step 1: {"task": "extract_key_points", "input": "..."}
        ↓
Step 2: {"task": "expand_points", "input": "<step1_output>"}
        ↓
Step 3: {"task": "format_article", "input": "<step2_output>"}
```

### 7.3 错误处理

在 JSON 中定义错误处理策略：

```json
{
  "error_handling": {
    "missing_data": "use_placeholder",
    "ambiguous_input": "ask_for_clarification",
    "confidence_threshold": 0.8,
    "fallback_response": "无法处理此请求，请提供更多信息"
  }
}
```

---

## 八、工具与生态

### 8.1 平台原生支持

主流 AI 平台都在加强对结构化输出的支持：

- **OpenAI**：Structured Outputs、Function Calling
- **Anthropic Claude**：原生 JSON 模式
- **Google Gemini**：Schema 引导生成
- **各类开源模型**：通过 vLLM 等框架支持

### 8.2 辅助工具

- **JSON Schema 验证器**：确保 prompt 格式正确
- **Prompt 版本管理**：Git 友好的 prompt 管理
- **可视化编辑器**：拖拽式 JSON prompt 构建

---

## 九、未来展望

JSON Prompting 代表的不仅是一种格式，而是一种**人机协作范式**：

1. **从"理解"到"执行"**：AI 不再需要"理解"你的意图，而是"执行"你的规格
2. **从"艺术"到"工程"**：Prompt 编写从玄学变成工程实践
3. **从"个人"到"团队"**：结构化 prompt 可以被团队共享和迭代

随着 AI Agent 和自动化工作流的普及，结构化提示词将成为**人与 AI 系统之间的标准接口语言**。

---

## 十、现实困境：JSON Prompt 好是好，但写起来太难了

读到这里，你可能已经被 JSON Prompting 的优势说服了。但让我们诚实面对一个问题：

**手写 JSON Prompt 真的很痛苦。**

### 10.1 JSON 的语法陷阱

如果你尝试过手写 JSON，一定经历过这些"噩梦"：

```json
{
  "task": "write_article",
  "requirements": [
    "要有深度",
    "要通俗易懂",  // ← 最后一项多了逗号，语法错误！
  ]
}
```

或者：

```json
{
  "content": "他说："这是一个"特别"的功能""  // ← 引号嵌套，直接崩溃
}
```

常见的坑包括：
- **逗号问题**：最后一个元素后面不能有逗号
- **引号转义**：内容中有引号需要 `\"` 转义
- **中文标点**：中文冒号 `：` 和英文冒号 `:` 傻傻分不清
- **括号匹配**：嵌套层级一多，眼睛都看花了
- **缩进混乱**：Tab 和空格混用，格式错乱

一个小小的语法错误，AI 就会告诉你："无法解析 JSON"。然后你开始逐行排查，浪费大量时间。

### 10.2 结构设计的认知负担

语法问题还只是表面。更深层的困难在于**结构设计**。

想象你要用 JSON Prompt 让 AI 写一篇技术博客。你需要思考：

- 任务类型叫什么？`task`、`action`、`goal` 还是 `objective`？
- 受众信息放在哪？单独字段还是嵌套在 `context` 里？
- 长度约束怎么表达？`length: "2000字"` 还是 `length: {min: 1800, max: 2200}`？
- 风格要求用什么字段？`tone`、`style`、`voice` 还是都要？

**你需要一边想"我要 AI 做什么"，一边想"JSON 结构怎么设计"。** 这是两种完全不同的思维模式，强行混在一起，认知负担直接翻倍。

### 10.3 迭代调试的效率黑洞

自然语言 prompt 调试很快——改几个字就能重新跑一遍。

JSON prompt 调试则是这样的：

1. 写好 JSON，提交给 AI
2. AI 输出不符合预期
3. 思考是哪个字段的问题
4. 修改字段值
5. 小心翼翼检查语法
6. 重新提交
7. 还是不对，再改结构
8. 改完结构又有语法错误
9. ……

一个下午过去了，prompt 还在调。

### 10.4 从人话到 JSON 的翻译成本

我们脑子里的需求往往是这样的：

> "帮我写一篇关于 AI 的文章，要专业一点，给程序员看的，不要太长。"

但要转成 JSON，你得：

1. 拆解需求：主题、风格、受众、长度
2. 选择字段名：`topic`、`tone`、`audience`、`length`
3. 确定字段值：专业 = `"technical"`？程序员 = `"developers"`？不要太长 = `1500`？
4. 组装结构：要不要嵌套？要不要加约束？

**你本来只想表达一句话，却要花 10 分钟"翻译"成 JSON。**

这就是为什么很多人知道 JSON Prompting 好，但实际使用时还是退回了自然语言——不是不想用，是门槛太高。

### 10.5 解决方案：让 AI 帮你写 JSON Prompt

既然问题是"从人话到 JSON 的翻译成本太高"，解决方案也很直接：

**让 AI 来做这个翻译。**

我做了一个工具：[**JSON Prompt Converter**](https://prompt.nuosheng.cloud/)

使用方式很简单：

1. 用自然语言描述你的需求（就像平时和 AI 聊天一样）
2. 工具自动帮你生成结构化的 JSON Prompt
3. 你可以直接使用，或者在此基础上微调

**你负责"想清楚要什么"，工具负责"翻译成 JSON"。**

这样一来：
- 不用担心语法错误
- 不用纠结结构设计
- 不用在两种思维模式之间切换
- 专注于需求本身

举个例子，你输入：

> "帮我写一个产品描述，是一款降噪耳机，要突出 40 小时续航和舒适佩戴，给年轻上班族看的，风格要时尚但不浮夸，150 字左右"

工具会帮你生成完整的 JSON Prompt，包含所有必要的字段和结构。

**JSON Prompting 的优势 + 自然语言的便捷 = 最佳实践。**

### 10.6 详细使用教程

下面是完整的使用步骤：

#### 第一步：获取 API Key

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark)
2. 开通豆包大模型服务
3. 创建 API Key 并复制保存

#### 第二步：打开工具

访问 [https://prompt.nuosheng.cloud](https://prompt.nuosheng.cloud)

#### 第三步：配置 API Key

1. 在页面右上角的「API Key」输入框中粘贴你的 Key
2. 点击「✓ 验证」按钮
3. 看到绿色圆点亮起，表示验证成功

#### 第四步：选择输出类型

根据你的需求，点击选择一种输出类型：

| 类型 | 适用场景 |
|------|---------|
| 🎨 图像生成 | 生成图片的 Prompt，如插画、海报、产品图 |
| 📊 信息图表 | 数据可视化、流程图、总结图 |
| 🏗️ 代码架构 | 系统架构图、微服务拓扑、技术栈图 |

#### 第五步：输入描述

在左侧「原始 Prompt 输入」文本框中，用自然语言描述你想要的内容。

**写描述的技巧：**

- 说清楚主题和标题
- 列出具体的数据或内容要点
- 描述想要的风格（颜色、字体、氛围等）

#### 第六步：转换

点击「✨ 转换为 JSON Prompt」按钮，等待几秒钟。

#### 第七步：获取结果

转换完成后，右侧会显示结构化的 JSON Prompt。你可以：

- 点击「📋 复制」复制到剪贴板
- 点击「💾 下载」保存为 JSON 文件

#### 第八步：使用 JSON Prompt

将生成的 JSON Prompt 粘贴到支持结构化输入的 AI 绘图工具中（如豆包、NanoBanana 等），即可生成更精准的图像。

---

## 结语

JSON as Prompt 不是银弹，但它是目前最有效的方法之一，让我们与 AI 的交互从"碰运气"变成"可预期"。

记住这个原则：

> **当你需要精确控制时，用 JSON；当你需要自由创意时，用自然语言；当你两者都需要时，混合使用。**

现在，打开你的编辑器，试着把你最常用的 prompt 改写成 JSON 格式。你会发现，这个过程本身就在帮你成为更好的 AI 使用者。

---

## 参考资料

1. [OpenAI Structured Outputs Documentation](https://platform.openai.com/docs/guides/structured-outputs) - OpenAI 官方结构化输出指南
2. [Anthropic Claude Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/intro-to-prompting) - Anthropic 官方提示词工程指南
3. [Anthropic Interactive Prompt Engineering Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) - Anthropic 官方交互式教程
4. [JSON Prompting: Mastering Structured Inputs for AI Models](https://machinelearningmastery.com/mastering-json-prompting-for-llms/) - Machine Learning Mastery
5. [Is JSON Prompting a Good Strategy?](https://blog.promptlayer.com/is-json-prompting-a-good-strategy/) - PromptLayer Blog
6. [StructuredRAG: JSON Response Formatting with Large Language Models](https://www.researchgate.net/publication/383279886_StructuredRAG_JSON_Response_Formatting_with_Large_Language_Models) - ResearchGate 学术论文


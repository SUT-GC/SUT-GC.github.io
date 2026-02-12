---
name: blog-to-wechat
description: 博客转微信公众号一站式工具。支持：博客转 HTML、写作风格润色、AI 痕迹去除、主题切换、图片处理、一键发布草稿。当用户想要把博客转成公众号格式、润色文章、去 AI 味、导出微信 HTML 时使用此技能。
---

# 博客转微信公众号 — 一站式工作流

将 `_posts/` 中的博客文章转换为微信公众号格式，支持写作润色、AI 去痕、主题切换、图片处理和一键发布。所有转换由 Claude 完成，输出到 `_wechat_html/` 目录。

---

## 完整工作流程（6 步）

用户可以从任意步骤开始，也可以跳过不需要的步骤。向用户确认需要哪些步骤后执行。

```
博客文章 → [Step 1] 选择文章
         → [Step 2] 写作润色（可选）
         → [Step 3] AI 去痕（可选）
         → [Step 4] 选择主题
         → [Step 5] 转换 HTML
         → [Step 6] 发布草稿（可选）
```

---

## Step 1：选择文章

定位要转换的博客文章：
- 文件名：如 `2026-02-12-xxx.md`
- 关键词搜索 `_posts/` 目录
- 最近发布的文章

读取并解析：
- 提取 front matter（`title`、`description`、`categories`、`tags`）
- 提取正文内容
- **移除 Jekyll 专有语法**：`{:toc .toc}`、`{:.class}` 等 kramdown 属性
- **移除 front matter**：`---` 包裹的 YAML 部分

---

## Step 2：写作润色（可选）

当用户需要润色文章风格时执行此步骤。默认使用 Dan Koe 风格。

### Dan Koe 写作风格

**核心定位**：深刻但不晦涩，犀利但不刻薄，有哲学深度但接地气。

#### 文章结构（6 部分）

**第一部分：钩子开场（前 150 字）**

选择以下钩子类型之一：

| 类型 | 说明 | 示例 |
|------|------|------|
| A：反向认同 | 认同读者的负面预期，然后翻转 | "你大概率会放弃你的新年目标。没关系，大多数人都会。" |
| B：自我揭露 | 分享个人失败经历 | "三年前，我每天工作14小时，却越来越穷。" |
| C：反常识宣言 | 挑战常见认知 | "'自律'是这个时代最大的骗局之一。" |
| D：直击痛点 | 列出读者共鸣的痛苦 | "如果你也有过这种感觉——明明知道该做什么，就是做不到。" |

**第二部分：痛点共鸣**
- 承认自己曾经也有同样的问题
- 列举常见但无效的解决方案
- 揭示深层原因

**第三部分：价值承诺**
- 今天分享 X 个核心认知
- 声明这不是鸡汤，而是实战经验
- "我们开始。"

**第四部分：核心内容（3-7 个模块）**

每个模块结构：
```
## 一、[模块标题：点出核心洞见]

> "引用一句名言或金句"
> ——出处

[先说大多数人的错误理解]

但真相是：[给出正确的理解]

举个例子：[用具体案例说明]

*所以关键不是[表面做法]，而是[深层原则]。*
```

**第五部分：金句提炼**
- 每篇至少 3-5 句可单独摘出来的金句
- 用 *斜体* 标记

**第六部分：赋权结尾**

| 类型 | 说明 |
|------|------|
| A：行动指南 | 给一个可立即执行的小行动 |
| B：思考问题 | 留一个引发深度思考的问题 |
| C：认知升级 | 简洁重述核心信息 |

#### 排版纪律

- 每段不超过 3 行
- 重要观点单独成段
- 转折处空一行

#### 格式标记

| 标记 | 用途 |
|------|------|
| **粗体** | 关键概念、重要词汇 |
| *斜体* | 核心金句、可摘抄的洞见 |
| 「」 | 特殊概念或反讽表达 |
| —— | 解释或补充说明 |
| > 引用块 | 名人名言、核心框架 |

#### 语气要求

要做到：
- 像朋友聊天，不像老师讲课
- 敢说大多数人不愿意说的真话
- 承认自己的局限和失败
- 用具体例子支撑抽象观点
- 尊重读者的智商

要避免：
- 居高临下的说教感
- 空洞的励志口号（"加油！你可以的！"）
- 堆砌概念不解释
- 过度正能量
- 长篇大论不分段

### 标题公式库

| 类型 | 模板 | 示例 |
|------|------|------|
| 时间反差型 | 如何用{短时间}，{巨大成果} | "花3小时做完这件事，顶别人努力3年" |
| 身份锁定型 | 如果你{困境}，接下来{时间}别再{行动} | "给那些'想得太多，做得太少'的人" |
| 反常识型 | {常见概念}是个{否定词} | "自律是个谎言（真正厉害的人根本不需要它）" |
| 技能价值型 | 未来{时间}最{形容词}的能力 | "普通人最容易忽略的底层能力" |
| 问题揭露型 | 你为什么{现象}？答案可能让你{感受} | "为什么你学了那么多，生活却没有任何改变" |

---

## Step 3：AI 去痕（可选）

当文章由 AI 生成或辅助生成时，去除 AI 写作痕迹，使文章更自然。

### 检测的 24 种 AI 痕迹

**内容模式**：
- 过度强调意义、遗产和更广泛的趋势
- 宣传和广告式语言
- 模糊归因和含糊措辞
- 公式化的"挑战与未来展望"部分

**语言和语法模式**：
- AI 常用词汇（此外、至关重要、深入探讨、彰显、不仅…而且…）
- 三段式法则过度使用
- 刻意换词（同义词循环）
- 否定式排比

**风格模式**：
- 破折号过度使用
- 粗体过度使用
- 表情符号装饰过多

**填充词**：
- 填充短语（"为了实现这一目标"、"在当今时代"）
- 过度限定
- 通用积极结论（"未来一片光明"）

**交流痕迹**：
- 协作交流（"希望这对您有帮助"、"当然！"）
- 知识截止日期免责声明
- 谄媚/卑躬屈膝的语气

### 处理强度

| 强度 | 说明 | 适用场景 |
|------|------|---------|
| gentle | 温和处理，只修改明显问题 | 已经比较自然的文本 |
| medium | 平衡处理（默认） | 大多数场景 |
| aggressive | 深度去除 AI 痕迹 | AI 味很重的文本 |

### 质量评分（满分 50）

处理后对文章进行 5 维度评分：

| 维度 | 说明 |
|------|------|
| 直接性（/10） | 直截了当 vs 充满铺垫 |
| 节奏（/10） | 长短交错 vs 机械重复 |
| 信任度（/10） | 简洁明了 vs 过度解释 |
| 真实性（/10） | 自然流畅 vs 机械生硬 |
| 精炼度（/10） | 无冗余 vs 大量废话 |

评级：45-50 优秀 / 35-44 良好 / <35 需重新修订

### 执行方式

直接用 Claude 对文章进行去痕处理：
1. 分析原文，识别 AI 痕迹类型
2. 按指定强度改写
3. 输出修改对比和质量评分
4. 如果与写作风格组合使用，遵循**风格优先原则**——保留风格刻意为之的特征

---

## Step 4：选择主题

让用户选择 HTML 排版主题。默认按文章分类自动推荐。

### 主题列表

| 主题 | 色调 | 适合内容 | 配色方案 |
|------|------|---------|---------|
| **ocean-calm** (默认) | 蓝色调 | 技术文章、商业分析 | 背景 #f0f4f8，文字 #3a4150，强调 #4a7c9b |
| **autumn-warm** | 橙色调 | 情感故事、生活随笔 | 背景 #faf9f5，文字 #4a413d，强调 #d97758 |
| **spring-fresh** | 绿色调 | 旅行日记、自然主题 | 背景 #f5f8f5，文字 #3d4a3d，强调 #6b9b7a |
| **wechat-green** | 微信绿 | 通用内容 | 背景 #fff，文字 #333，强调 #07c160 |

### 自动推荐规则

| 文章分类 | 推荐主题 |
|----------|---------|
| 技术、AI | ocean-calm |
| 生活、摄影 | autumn-warm |
| 旅行、自然 | spring-fresh |
| 其他 | wechat-green |

### 主题详细规范

#### ocean-calm（深海静谧）

```
主容器：background-color #f0f4f8; padding 40px 10px; letter-spacing 0.5px
卡片：max-width 800px; background #fff; border-radius 14px; box-shadow 0 10px 30px rgba(0,0,0,0.04); padding 25px
标题符号：◆  颜色 #4a7c9b; text-shadow 0 0 12px rgba(74,124,155,0.5)
h2：color #4a7c9b; 左侧 4px solid #4a7c9b; padding-left 12px
引用块：border-left 4px solid #4a7c9b; background #e8f0f8; padding 12px 16px
```

#### autumn-warm（秋日暖光）

```
主容器：background-color #faf9f5; padding 40px 10px; letter-spacing 0.5px
卡片：max-width 800px; background #fff; border-radius 18px; box-shadow 0 10px 30px rgba(0,0,0,0.04); padding 25px
标题符号：▶  颜色 #d97758; text-shadow 0 0 12px rgba(217,119,88,0.5)
h2：color #d97758; 左侧 4px solid #d97758; padding-left 12px
引用块：border-left 4px solid #d97758; background #fef4e7; padding 12px 16px
```

#### spring-fresh（春日清新）

```
主容器：background-color #f5f8f5; padding 40px 10px; letter-spacing 0.5px
卡片：max-width 800px; background #fff; border-radius 16px; box-shadow 0 10px 30px rgba(0,0,0,0.04); padding 25px
标题符号：❀  颜色 #6b9b7a; text-shadow 0 0 12px rgba(107,155,122,0.5)
h2：color #6b9b7a; 左侧 4px solid #6b9b7a; padding-left 12px
引用块：border-left 4px solid #6b9b7a; background #e8f0e8; padding 12px 16px
```

#### wechat-green（微信绿 — 经典简约）

```
主容器：background-color #fff; padding 20px 16px
无卡片布局，平铺
h1：居中，底部 3px solid #07c160 装饰线
h2：color #1a1a1a; 左侧 4px solid #07c160; padding-left 12px
引用块：border-left 4px solid #07c160; background #f9f9f9; padding 12px 16px
```

---

## Step 5：转换 HTML

将 Markdown 转换为微信公众号兼容的 HTML 文件。

### 微信 HTML 严格规范

#### 安全标签

```
section, p, span, strong, em, u, a, h1-h6, ul, ol, li,
blockquote, pre, code, table, thead, tbody, tr, th, td,
img, br, hr
```

#### 禁止标签

```
script, style, link, meta, iframe, form, input, button,
textarea, select, object, embed, video, audio, noscript
```

#### 允许的 CSS 属性

```
文字：color, font-size, font-weight, font-style, font-family, line-height,
     letter-spacing, text-align, text-decoration, text-indent
背景：background-color
边框：border, border-left/right/top/bottom, border-radius
间距：margin(-top/bottom/left/right), padding(-top/bottom/left/right)
尺寸：width, max-width, min-width, height, max-height, min-height
布局：display(仅 block/inline-block/none), float(仅 left/right/none), overflow
阴影：box-shadow, text-shadow
```

#### 禁止的 CSS

```
position: absolute/fixed/sticky, flexbox, grid, transform,
transition, animation, @keyframes, filter, clip-path
```

### 关键规则

1. **所有样式必须内联**（`style=""` 属性），微信会过滤 `<style>` 标签和 `class` 属性
2. **每个 `<p>` 必须显式指定 color**，微信会强制重置 `<p>` 颜色为黑色
3. **主容器用 `<div>` 包裹**，不要依赖 `<body>` 样式（微信会剥离）
4. **不使用任何 JS**
5. **图片 src 必须是微信 CDN 域名**（`mmbiz.qpic.cn`），外部图片不显示
6. **链接只支持 https**，且外部链接可能被过滤
7. **代码块特殊字符转义**：`<` → `&lt;`，`>` → `&gt;`

### 通用排版规范

| 元素 | 样式 |
|------|------|
| 正文 | font-size 16px; line-height 1.8; margin-bottom 20px |
| h1 | font-size 24px; font-weight bold; 居中 |
| h2 | font-size 20px; font-weight bold |
| h3 | font-size 18px; font-weight bold |
| 行内代码 | background #f6f8fa; color #e83e8c; padding 2px 6px; border-radius 3px; font-size 14px |
| 代码块 | background #2d2d2d; color #f8f8f2; padding 16px; border-radius 8px; font-size 13px; line-height 1.6; overflow-x auto |
| 代码语言标识 | 代码块右上方; font-size 12px; color #999 |
| 表格 | width 100%; border-collapse collapse; border 1px solid #e8e8e8 |
| 表头 | background #f6f8fa; font-weight bold; padding 10px 16px |
| 表格行 | 偶数行 background #fafbfc; padding 10px 16px |
| 列表项 | margin-bottom 8px |
| 分隔线 | border-top 1px dashed #ddd; margin 30px 0 |
| 图片 | display block; max-width 100%; margin 20px auto |
| 图片说明 | text-align center; font-size 14px; color #999 |

### 外链处理

微信公众号对外链限制严格。处理方式：
- 已认证公众号：保留 `<a href="https://...">` 链接
- 未认证/不确定：将链接转为文字，在括号中附上 URL
  - 示例：`Google（https://google.com）`
- 默认采用**保留链接**方式，用户可要求改为纯文本

### HTML 输出结构

```html
<!-- 微信公众号文章：{title} -->
<!-- 生成时间：{date} -->
<!-- 主题：{theme} -->
<!-- 使用方式：用浏览器打开 → 全选 → 复制 → 粘贴到微信公众号编辑器 -->

<div style="{主容器样式}">
  <section style="{卡片样式，如有}">

    <!-- 文章标题 -->
    <h1 style="...">{title}</h1>

    <!-- 文章描述（可选） -->
    <p style="...">{description}</p>

    <!-- 正文内容 -->
    ...

  </section>
</div>
```

### 输出文件

- 路径：`_wechat_html/{原文件名去掉.md}.html`
- 示例：`_wechat_html/2026-02-12-我的文章.html`

### 输出后提示用户

1. 文件路径
2. 使用方式：浏览器打开 HTML → Ctrl/Cmd+A 全选 → 复制 → 粘贴到微信公众号编辑器
3. 图片提醒：文中图片需要在公众号编辑器中重新上传
4. 询问是否需要发布到草稿箱（Step 6）

---

## Step 6：发布草稿（可选）

将转换好的 HTML 直接发布到微信公众号草稿箱。需要配置微信 API 凭据。

### 前置条件

需要以下环境变量：
```bash
export WECHAT_APPID="你的公众号 AppID"
export WECHAT_SECRET="你的公众号 AppSecret"
```

如果未配置，提示用户设置后再使用此功能。

### 发布流程

1. **检查配置**：确认 `WECHAT_APPID` 和 `WECHAT_SECRET` 已设置
2. **处理图片**（如有）：
   - 本地图片（`/files/images/` 等）：读取 → 压缩（宽度 > 1920px 时）→ 上传到微信素材库
   - 在线图片（https://...）：下载 → 压缩 → 上传
   - R2 CDN 图片：同在线图片处理
   - 替换 HTML 中的 img src 为微信 CDN URL（`mmbiz.qpic.cn`）
3. **上传封面图**：文章第一张图片或用户指定的图片作为封面，上传获取 `thumb_media_id`
4. **创建草稿**：调用微信 API 创建草稿
5. **返回结果**：告诉用户草稿已创建，可在公众号后台编辑发布

### 微信 API 调用

使用 `curl` 调用微信 API：

```bash
# 1. 获取 access_token
curl -s "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}"

# 2. 上传图片素材
curl -s -F "media=@image.jpg" "https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${TOKEN}&type=image"

# 3. 创建草稿
curl -s -X POST "https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "articles": [{
      "title": "文章标题",
      "author": "作者",
      "digest": "摘要",
      "content": "<p>HTML 正文</p>",
      "thumb_media_id": "封面图 media_id",
      "need_open_comment": 1,
      "only_fans_can_comment": 0
    }]
  }'
```

### 内容限制

| 限制项 | 限制值 |
|--------|--------|
| 标题长度 | 32 字符 |
| 摘要长度 | 128 字符 |
| 正文长度 | < 2 万字符或 1MB |
| 单张图片大小 | < 5MB |
| 图片总数量 | < 100 张 |
| 上传素材/天 | 100 次 |
| 创建草稿/天 | 100 次 |

### 图片压缩规则

| 条件 | 处理方式 |
|------|---------|
| 宽度 > 1920px | 等比缩放至 1920px |
| 文件大小 > 2MB | 压缩质量 |
| 格式不支持 | 转换为 JPG |

---

## 快捷用法

用户可以用自然语言触发各种组合：

| 说法 | 执行步骤 |
|------|---------|
| "把最新的博客转成公众号格式" | Step 1 → 4 → 5 |
| "用秋日暖光主题转换这篇文章" | Step 1 → 4(autumn-warm) → 5 |
| "帮我润色一下这篇文章再转" | Step 1 → 2 → 4 → 5 |
| "去掉 AI 味再转成公众号" | Step 1 → 3 → 4 → 5 |
| "全套流程走一遍" | Step 1 → 2 → 3 → 4 → 5 → 6 |
| "转好后直接发到草稿箱" | Step 1 → 4 → 5 → 6 |

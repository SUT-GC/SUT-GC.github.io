---
name: add-tool
description: 在 SutGC's Blog 的工具页面添加一个新工具。当用户想要添加、新增一个工具链接到工具页时使用此技能。
---

# 添加工具

编辑 `_data/tools.yml` 文件添加新工具。

## 配置格式

```yaml
- name: 工具名称
  description: 工具的简短描述
  icon: "emoji图标"
  url: https://工具链接
  category: 分类
```

## 字段说明

| 字段 | 说明 |
|------|------|
| `name` | 工具名称，简洁明了 |
| `description` | 一句话说明工具用途 |
| `icon` | emoji 图标，用引号包裹 |
| `url` | 工具访问链接 |
| `category` | 分类：`ai`、`dev`、`design`、`other` |

## 分类说明

- `ai` - AI 相关工具
- `dev` - 开发工具
- `design` - 设计工具
- `other` - 其他工具

## 常用 Emoji

| 类型 | 推荐 |
|------|------|
| AI 工具 | 🤖 🧠 ✨ 💡 |
| 开发工具 | 🔧 ⚙️ 🛠️ 💻 |
| 设计工具 | 🎨 🖼️ ✏️ |
| 连接/集成 | 🔌 🔗 🌐 |
| 效率工具 | ⚡ 🚀 🎯 |

## 预览

```bash
bundle exec jekyll serve
```

访问 http://localhost:4000/tools/

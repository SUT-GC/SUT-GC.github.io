---
layout: post
title: "MCP自动推送功能测试"
description: "测试MCP博客管理器的自动推送功能"
categories: [技术, 测试]
tags: [MCP, Claude, 自动推送, GitHub]
---

* Kramdown table of contents
{:toc .toc}

# MCP博客管理器自动推送功能

这是测试自动推送功能的文章。

## 新增功能

### 1. 自动推送选项
- 在创建博客文章时，可以设置 `auto_push: true`
- 文章创建后会自动执行 git add, commit, push

### 2. 独立的发布工具
- 新增 `publish_blog_post` 工具
- 可以单独发布已存在的博客文章
- 支持自定义提交信息

### 3. Git操作集成
- 自动生成标准的提交信息
- 包含Claude Code标识
- 错误处理和状态反馈

## 使用方式

### 创建并自动推送
```json
{
  "title": "文章标题",
  "content": "文章内容",
  "auto_push": true
}
```

### 单独发布文章
```json
{
  "filepath": "/path/to/post.md",
  "commit_message": "自定义提交信息"
}
```

现在你可以直接从Claude创建文章并自动发布到GitHub了！
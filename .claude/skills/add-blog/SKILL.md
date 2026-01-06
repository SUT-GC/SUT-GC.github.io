---
name: add-blog
description: 在 SutGC's Blog 中添加一篇新的博客文章。当用户想要创建、添加、写一篇新博客时使用此技能。
---

# 添加博客文章

在 `_posts/` 目录下创建新的 Markdown 博客文章。

## 文件命名

文件名格式：`YYYY-MM-DD-文章标题.md`

示例：`2026-01-06-我的新文章.md`

## Front Matter 模板

```yaml
---
layout: post
title: "文章标题"
description: "文章描述，用于文章列表和 SEO"
categories: ["分类1", "分类2"]
tags: ["标签1", "标签2", "标签3"]
---
```

### 字段说明

- `layout`: 固定为 `post`
- `title`: 文章标题
- `description`: 文章简短描述
- `categories`: 常用分类有：技术、AI、生活、摄影
- `tags`: 文章标签，可多个

## 添加目录（可选）

在 front matter 后添加：

```markdown
* Kramdown table of contents
{:toc .toc}
```

## 图片存放

- 本地图片：`/files/images/`
- 推荐使用 R2 图床存放大图片

## 预览命令

```bash
bundle exec jekyll serve
```

访问 http://localhost:4000 预览

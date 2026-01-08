# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll-based blog (Chinese) with custom layouts for home, blog, photography, and tools pages.

## Development Commands

```bash
bundle install              # Install dependencies
bundle exec jekyll serve    # Local dev server at localhost:4000
bundle exec jekyll build    # Build site to _site/
```

## Architecture

### Jekyll Structure

- **_config.yml**: Site config, plugins, paths (permalink: `/blog/:year/:month/:day/:title/`)
- **_layouts/**: `home.html`, `blog.html`, `post.html`, `page.html`, `photography.html`, `tools.html`
- **_data/**: `tools.yml` (tools page), `photos.yml` (photography), `i18n.yml` (translations)
- **_posts/**: Blog posts as `YYYY-MM-DD-title.md`
- **_src/**: React+Vite HTML slide projects (built to `files/powerpoint/`)

### Data-Driven Pages

- **Tools page** (`/tools/`): Edit `_data/tools.yml` to add tools
- **Photography** (`/photography/`): Edit `_data/photos.yml`, images from R2 CDN

## Content Creation

### Blog Post Front Matter

```yaml
---
layout: post
title: "文章标题"
description: "文章描述"
categories: ["技术"]  # 常用: 技术、AI、生活、摄影
tags: ["tag1", "tag2"]
---
```

Add TOC after front matter: `{:toc .toc}`

### HTML Slides (PPT)

Source in `_src/<name>/`, output to `files/powerpoint/<name>/`:

```bash
cd _src/<name> && npm install && npm run build
```

Template at `_src/agent-skills/`. Add link to `_posts/2017-09-16-ppt.md`.

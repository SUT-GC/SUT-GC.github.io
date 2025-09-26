---
layout: post
title: "Claude Code + GLM-4.5 配置指南（macOS简化版）"
description: "详细介绍如何在macOS上安装Claude Code，并配置智谱GLM-4.5模型作为后端，实现低成本高效率的AI编程助手。包含完整的安装、配置、MCP集成和使用指南。"
categories: ["技术", "AI工具", "开发指南"]
tags: ["Claude Code", "GLM-4.5", "智谱AI", "macOS", "编程助手", "MCP", "别名配置", "低成本AI"]
---

* Kramdown table of contents
{:toc .toc}

# Claude Code + GLM-4.5 配置指南（macOS简化版）

## 目录

1. [概述](#概述)
2. [安装 Claude Code](#安装-claude-code)
3. [获取智谱API密钥](#获取智谱api密钥)
4. [配置别名切换模型](#配置别名切换模型)
5. [使用方法](#使用方法)
6. [Claude Code 常用命令](#claude-code-常用命令)
7. [MCP 集成配置](#mcp-集成配置)
8. [官方文档链接](#官方文档链接)
9. [常见问题](#常见问题)

---

## 概述

本指南专门针对 macOS 用户，教您如何：
- 安装 Claude Code
- 配置智谱GLM-4.5模型（成本比Claude低80%）
- 使用alias别名快速切换不同AI模型
- 享受Claude Code的强大功能，但使用更便宜的模型后端

**为什么选择GLM-4.5？**
- 💰 **成本低**：比Claude便宜80%以上
- 🚀 **速度快**：生成速度超过100 tokens/秒
- 🔧 **完全兼容**：无需修改Claude Code，只需替换API地址
- 📈 **性能强**：在编程任务上达到顶级水平

---

## 安装 Claude Code

### 前置要求
- macOS系统
- Node.js 18+ （如未安装，先安装Node.js）

### 一键安装（推荐）
```bash
# 官方安装脚本
curl -fsSL https://claude.ai/install.sh | bash
```

### 验证安装
```bash
# 检查版本
claude --version

# 运行诊断
claude doctor
```

如果看到版本号和诊断通过，说明安装成功！

---

## 获取智谱API密钥

### 1. 注册账户
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn)
2. 使用邮箱注册并完成实名认证

### 2. 获取免费API密钥
1. 登录后点击：**用户中心** → **项目管理** → **API Keys**
2. 点击"新建API Key"
3. 复制生成的API密钥（格式类似：`1234567890abcdef.xxxxxxxxxx`）

### 3. 查看免费额度
- 新用户通常有免费试用额度
- 后续使用：输入 0.8元/百万tokens，输出 2元/百万tokens

---

## 配置别名切换模型

### 编辑Shell配置文件

根据您使用的终端选择对应文件：
```bash
# 查看当前使用的shell
echo $SHELL

# 编辑对应配置文件
# 如果使用zsh (默认)：
nano ~/.zshrc

# 如果使用bash：
nano ~/.bash_profile
```

### 添加别名配置

在配置文件末尾添加以下内容：

```bash
# ==========================================
# Claude Code 多模型配置
# ==========================================

# 智谱GLM-4.5 - 主要使用
alias claude-glm='(
  export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
  export ANTHROPIC_AUTH_TOKEN=你的智谱API密钥
  export ANTHROPIC_MODEL=GLM-4.5
  export ANTHROPIC_SMALL_FAST_MODEL=GLM-4.5-Air
  claude
)'

# 智谱GLM-4.5 - 快速模式（跳过权限检查）
alias claude-glm-yolo='(
  export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
  export ANTHROPIC_AUTH_TOKEN=你的智谱API密钥
  export ANTHROPIC_MODEL=GLM-4.5
  export ANTHROPIC_SMALL_FAST_MODEL=GLM-4.5-Air
  claude --dangerously-skip-permissions
)'

# DeepSeek模型（备选方案）
alias claude-deepseek='(
  export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
  export ANTHROPIC_AUTH_TOKEN=你的DeepSeek密钥
  export ANTHROPIC_MODEL=deepseek-chat
  export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
  claude
)'

# 原版Claude（如果有订阅）
alias claude-original='claude'
```

**重要**：将 `你的智谱API密钥` 替换为第2步获取的真实API密钥！

### 重新加载配置

```bash
# 重新加载配置文件
source ~/.zshrc    # 如果使用zsh
# 或
source ~/.bash_profile    # 如果使用bash
```

---

## 使用方法

### 启动不同模型

```bash
# 使用智谱GLM-4.5（推荐）
claude-glm

# 使用快速模式（适合简单任务）
claude-glm-yolo

# 使用DeepSeek（如果配置了）
claude-deepseek
```

### 基本使用流程

1. **进入项目目录**：
   ```bash
   cd /path/to/your/project
   claude-glm
   ```

2. **开始对话**：
   ```
   > 分析这个项目的结构
   > 帮我修复src/main.js中的bug
   > 为这个函数添加单元测试
   > 重构代码以提高性能
   ```

3. **常用内置命令**：
   ```
   /help      # 查看帮助
   /model     # 查看当前使用的模型
   /clear     # 清除对话历史
   /quit      # 退出
   ```

### 实际使用示例

```bash
# 启动
$ claude-glm

# 看到启动界面后开始对话
> 我有一个React项目，帮我分析项目结构并提出优化建议

> 实现一个用户登录功能，包含表单验证

> 为这个组件添加TypeScript类型定义

> 创建单元测试并确保覆盖率达到80%

> 提交代码并创建PR
```

---

## Claude Code 常用命令

### 系统命令（以 / 开头）

```
/help              # 显示所有可用命令
/model             # 查看或切换当前模型
/clear             # 清除当前对话历史
/compact           # 压缩对话历史以节省context
/config            # 打开配置界面
/logout            # 登出当前账户
/login             # 登录账户
/quit              # 退出Claude Code
/bug               # 报告bug（会收集相关信息）
/reset             # 重置所有设置到默认值
/update            # 检查并安装更新
```

### Git 相关命令（自然语言）

```
> 查看当前分支状态
> 创建新分支 feature/user-auth
> 提交所有更改并添加描述性信息
> 创建PR并添加详细描述
> 合并当前分支到main
> 解决合并冲突
> 查看最近5次提交历史
> 回滚到上一个提交
> 创建tag v1.0.0
```

### 文件操作命令（自然语言）

```
> 创建新文件 src/components/Login.tsx
> 修改 package.json 添加新依赖
> 删除 old-file.js
> 重命名 utils.js 为 helpers.js
> 复制 template.html 为 index.html
> 查看文件 src/main.js 的内容
> 搜索项目中包含 "TODO" 的文件
> 列出所有 .js 文件
```

### 代码分析和重构

```
> 分析整个项目结构
> 解释这个函数的作用：functionName
> 重构这个组件以提高性能
> 添加类型定义到这个JavaScript文件
> 优化这个SQL查询
> 检查代码中的潜在安全问题
> 统计项目代码行数和文件数量
> 找出未使用的依赖包
```

### 测试相关

```
> 为这个函数创建单元测试
> 运行所有测试并显示结果
> 创建集成测试用例
> 生成测试覆盖率报告
> 修复失败的测试
> 添加端到端测试
```

### 部署和配置

```
> 创建Dockerfile
> 配置GitHub Actions CI/CD
> 生成production构建
> 创建环境变量配置文件
> 设置ESLint和Prettier配置
> 创建部署脚本
```

### 命令行选项

```bash
# 启动时的命令行选项
claude --help                    # 显示帮助
claude --version                 # 显示版本
claude --model claude-opus-4     # 指定模型启动
claude --dangerously-skip-permissions  # 跳过权限检查
claude --no-auto-update          # 禁用自动更新
claude --config-path /path       # 指定配置文件路径
```

---

## MCP 集成配置

### 什么是 MCP

MCP (Model Context Protocol) 是Claude Code的扩展系统，允许AI模型与外部工具和服务安全交互。通过MCP，Claude可以：
- 访问数据库
- 调用外部API
- 操作云服务
- 与开发工具集成

### 配置 MCP 服务器

#### 1. 在项目中创建 MCP 配置

创建 `.claude/mcp.json` 配置文件：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/path/to/project"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    "git": {
      "command": "npx", 
      "args": ["@modelcontextprotocol/server-git", "--repository", "."]
    },
    "sqlite": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-sqlite", "--db-path", "./data.db"]
    },
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/dbname"
      }
    }
  }
}
```

#### 2. 安装 MCP 服务器

```bash
# 文件系统服务器
npm install -g @modelcontextprotocol/server-filesystem

# Git服务器
npm install -g @modelcontextprotocol/server-git

# 数据库服务器
npm install -g @modelcontextprotocol/server-sqlite
npm install -g @modelcontextprotocol/server-postgres

# Web搜索服务器
npm install -g @modelcontextprotocol/server-brave-search
```

#### 3. 启用 MCP 功能

在别名配置中添加MCP支持：

```bash
# 更新您的别名配置
alias claude-glm='(
  export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
  export ANTHROPIC_AUTH_TOKEN=你的智谱API密钥
  export ANTHROPIC_MODEL=GLM-4.5
  export ANTHROPIC_SMALL_FAST_MODEL=GLM-4.5-Air
  export CLAUDE_MCP_CONFIG=.claude/mcp.json
  claude
)'
```

### 常用 MCP 服务器

| 服务器名称 | 功能 | 安装命令 |
|------------|------|----------|
| filesystem | 文件系统操作 | `npm i -g @modelcontextprotocol/server-filesystem` |
| git | Git操作 | `npm i -g @modelcontextprotocol/server-git` |
| sqlite | SQLite数据库 | `npm i -g @modelcontextprotocol/server-sqlite` |
| postgres | PostgreSQL数据库 | `npm i -g @modelcontextprotocol/server-postgres` |
| brave-search | 网络搜索 | `npm i -g @modelcontextprotocol/server-brave-search` |
| github | GitHub集成 | `npm i -g @modelcontextprotocol/server-github` |

### MCP 使用示例

```
> 查询数据库中的用户表并显示前10条记录
> 搜索网络上关于React 18新特性的最新信息
> 创建新的Git分支并推送到远程仓库
> 读取config.yaml文件并解析其中的配置项
> 调用GitHub API创建新的issue
```

### 自定义 MCP 服务器

创建自己的MCP服务器：

```javascript
// custom-mcp-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'custom-server',
  version: '1.0.0'
});

// 定义工具
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'custom_tool',
    description: '自定义工具描述',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' }
      }
    }
  }]
}));

// 处理工具调用
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'custom_tool') {
    // 执行自定义逻辑
    return { content: [{ type: 'text', text: '处理结果' }] };
  }
});
```

---

## 官方文档链接

### Claude Code 核心文档

- **官方主页**: https://www.anthropic.com/claude-code
- **安装指南**: https://docs.claude.com/en/docs/claude-code/setup
- **使用文档**: https://docs.claude.com/en/docs/claude-code
- **最佳实践**: https://www.anthropic.com/engineering/claude-code-best-practices
- **GitHub仓库**: https://github.com/anthropics/claude-code
- **NPM包**: https://www.npmjs.com/package/@anthropic-ai/claude-code

### MCP 相关文档

- **MCP 规范**: https://modelcontextprotocol.io/
- **MCP SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **官方服务器**: https://github.com/modelcontextprotocol/servers
- **MCP 教程**: https://modelcontextprotocol.io/quickstart

### Anthropic API 文档

- **API 文档**: https://docs.claude.com/
- **开发者平台**: https://console.anthropic.com/
- **API 快速开始**: https://docs.claude.com/en/docs/quickstart
- **Cookbook**: https://github.com/anthropics/anthropic-cookbook

### 智谱 AI 文档

- **智谱开放平台**: https://open.bigmodel.cn/
- **API 文档**: https://docs.bigmodel.cn/
- **GLM-4.5 介绍**: https://docs.bigmodel.cn/cn/guide/models/text/glm-4.5
- **Claude 兼容接口**: https://docs.bigmodel.cn/cn/guide/develop/claude

### 社区资源

- **Claude 开发者 Discord**: https://discord.gg/claude-developers
- **GitHub Discussions**: https://github.com/anthropics/claude-code/discussions
- **Stack Overflow**: 搜索 "claude-code" 标签
- **Reddit社区**: r/ClaudeAI

### 帮助和支持

- **官方支持**: https://support.claude.com
- **报告问题**: 使用 Claude Code 中的 `/bug` 命令
- **功能请求**: https://github.com/anthropics/claude-code/issues
- **安全问题**: security@anthropic.com

### 视频教程和博客

- **Anthropic 官方博客**: https://www.anthropic.com/news
- **YouTube 频道**: 搜索 "Claude Code tutorial"
- **开发者文档**: https://docs.claude.com/en/docs/build-with-claude

### 快速参考

```bash
# 快速帮助命令
claude --help              # 命令行帮助
claude doctor              # 诊断问题
/help                      # 交互式帮助（在Claude Code内）

# 官方资源获取
curl -s https://claude.ai/install.sh  # 获取最新安装脚本
```

**提示**: 建议将这些链接加入浏览器书签，方便快速查阅！

---

## 常见问题

### Q: 命令找不到 `claude-glm: command not found`
**解决方法**：
```bash
# 1. 确认配置文件已保存
cat ~/.zshrc | grep claude-glm

# 2. 重新加载配置
source ~/.zshrc

# 3. 重启终端
```

### Q: API密钥错误
**解决方法**：
- 检查API密钥是否正确复制
- 确认智谱账户有余额或免费额度
- 测试API连接：
```bash
curl -H "Authorization: Bearer 你的API密钥" \
     https://open.bigmodel.cn/api/anthropic/v1/messages
```

### Q: 响应很慢或超时
**解决方法**：
- 使用 `claude-glm-yolo` 快速模式
- 检查网络连接
- 尝试使用 `GLM-4.5-Air` 模型（更快）

### Q: 权限相关错误
**解决方法**：
- 使用 `claude-glm-yolo` 跳过权限检查
- 或者在对话中选择允许文件操作

### Q: 想切换回原版Claude
**解决方法**：
```bash
# 如果有Claude订阅，直接使用
claude-original

# 或者临时使用
claude
```

### Q: MCP服务器连接失败
**解决方法**：
```bash
# 1. 检查MCP配置文件
cat .claude/mcp.json

# 2. 验证服务器安装
npx @modelcontextprotocol/server-filesystem --version

# 3. 测试服务器连接
claude --debug  # 启用调试模式查看MCP连接状态
```

### Q: 怎么查看Claude Code版本和更新
**解决方法**：
```bash
# 查看当前版本
claude --version

# 检查更新
claude --update
# 或在对话中使用
/update
```

---

## 最佳使用技巧

### 1. 根据任务选择模式
- **复杂编程任务**：使用 `claude-glm`
- **简单快速任务**：使用 `claude-glm-yolo`
- **成本考虑**：GLM-4.5-Air更便宜，适合简单任务

### 2. 充分利用系统命令
```bash
# 会话管理
/clear        # 清除历史，开始新话题
/compact      # 压缩历史，保留context但节省token
/model        # 查看当前模型，确认配置正确

# 配置管理
/config       # 快速访问配置选项
/logout && /login  # 重新认证解决权限问题
```

### 3. 项目配置最佳实践
在项目根目录创建 `.claude/` 文件夹：

```bash
mkdir -p .claude
```

**创建项目指导文件** (`CLAUDE.md`)：
```markdown
# 项目规范
- 语言：TypeScript + React
- 测试：Jest + React Testing Library  
- 风格：Prettier + ESLint
- Git：使用conventional commits格式
- 部署：Docker + GitHub Actions

# 重要文件
- src/components/ - React组件
- src/utils/ - 工具函数
- tests/ - 测试文件
- docs/ - 文档

# 开发规则
- 所有函数需要TypeScript类型
- 组件需要Props接口定义
- 新功能需要对应测试用例
- 提交前运行 npm run lint
```

**MCP配置** (`.claude/mcp.json`)：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "."],
      "env": {}
    }
  }
}
```

### 4. 高效对话技巧

**✅ 结构化请求**：
```
> 我需要实现用户认证功能：
> 1. 注册页面（包含表单验证）
> 2. 登录页面（JWT token处理）
> 3. 密码重置功能
> 4. 路由保护
> 请先制定实现计划，确认后开始编码
```

**✅ 分步骤执行**：
```
> 第一步：创建用户注册组件的基本结构
> （等Claude完成后）
> 第二步：添加表单验证逻辑
> （等Claude完成后）
> 第三步：集成API调用
```

**✅ 利用Claude的分析能力**：
```
> 分析这个项目的技术栈和架构模式
> 识别代码中的性能瓶颈并提供优化方案
> 检查安全漏洞并给出修复建议
```

### 5. Git工作流集成
```
> 创建feature分支 feature/user-auth
> 实现功能后，创建有意义的提交信息
> 推送到远程并创建PR
> 在PR描述中包含变更说明和测试步骤
```

### 6. MCP工具有效使用
```
> 使用数据库工具查询用户表结构
> 通过网络搜索最新的React最佳实践
> 用文件系统工具批量重命名测试文件
> GitHub工具自动创建issue标记待办事项
```

### 7. 性能和成本优化
- **选择合适模型**：简单任务用GLM-4.5-Air，复杂任务用GLM-4.5
- **使用/compact命令**：定期压缩对话历史节省token
- **分解大任务**：避免单次请求过于复杂
- **利用项目配置**：让Claude更好理解项目减少解释成本

---

## 成本对比

| 模型 | 输入成本 | 输出成本 | 相对Claude成本 |
|------|----------|----------|----------------|
| Claude Sonnet | 较高 | 较高 | 100% |
| GLM-4.5 | 0.8元/百万tokens | 2元/百万tokens | ~20% |
| GLM-4.5-Air | 更低 | 更低 | ~10% |

**实际使用成本示例**：
- 一般编程任务：每次对话约0.01-0.05元
- 复杂项目分析：每次约0.1-0.3元
- 日常开发：每月约5-20元

---

## 总结

通过这个配置，您可以：

✅ **享受Claude Code的强大功能**  
✅ **大幅降低使用成本（节省80%+）**  
✅ **快速切换不同模型**  
✅ **保持完整的开发体验**  

现在您可以用极低的成本享受顶级AI编程助手服务！开始愉快地编程吧！

---

**快速开始命令**：
```bash
# 1. 安装Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# 2. 配置别名（替换API密钥）
echo 'alias claude-glm="(export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic; export ANTHROPIC_AUTH_TOKEN=你的密钥; export ANTHROPIC_MODEL=GLM-4.5; claude)"' >> ~/.zshrc

# 3. 重新加载并使用
source ~/.zshrc && cd your-project && claude-glm
```
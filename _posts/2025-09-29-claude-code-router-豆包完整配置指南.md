---
layout: post
title: "Claude Code Router + 豆包完整配置指南"
description: "完整的 Claude Code Router + 豆包配置指南，从安装到使用的全流程教程。成本仅为 Claude 订阅的 20-30%！"
categories: ["技术", "AI工具", "开发指南"]
tags: ["Claude Code Router", "豆包", "Doubao", "火山引擎", "AI编程助手", "低成本AI"]
---

* Kramdown table of contents
{:toc .toc}

# Claude Code Router + 豆包完整配置指南

> 使用 Claude Code Router 配合豆包，享受强大的 AI 编程助手功能，成本仅为 Claude 的 20-30%！

## 目录

1. [什么是 Claude Code Router](#什么是-claude-code-router)
2. [安装步骤](#安装步骤)
3. [豆包配置](#豆包配置)
4. [使用方法](#使用方法)
5. [最佳实践](#最佳实践)
6. [常见问题](#常见问题)
7. [总结](#总结)

---

## 什么是 Claude Code Router

### Claude Code Router 简介

Claude Code Router 是一个强大的路由工具，让您能够：

- ✅ **使用 Claude Code 界面但不需要 Anthropic 账户**
- ✅ **接入多个 AI 提供商**（豆包、智谱、DeepSeek 等）
- ✅ **动态切换模型**（在对话中实时切换）
- ✅ **自动路由**（根据任务类型自动选择最合适的模型）
- ✅ **成本大幅降低**（使用豆包等低成本模型）

### 为什么选择豆包？

**豆包（Doubao）** 是字节跳动推出的 AI 大模型服务，具有以下优势：

- 💰 **超低价格**：比 Claude 便宜 60-80%
- 🎁 **免费额度**：每个模型 50 万 tokens（不过期）
- 🎉 **活动赠送**：额外 5 亿 tokens 免费额度
- 🇨🇳 **中文优化**：字节出品，中文支持优秀
- 📊 **多种规格**：6 个不同配置的模型可选

### 豆包模型系列

| 模型名称 | 上下文长度 | 输入价格 | 输出价格 | 适用场景 |
|----------|------------|----------|----------|----------|
| doubao-lite-32k | 32K | 0.3元/百万 | 0.6元/百万 | 日常开发 |
| doubao-pro-32k | 32K | 0.8元/百万 | 2元/百万 | 推荐使用 |
| doubao-pro-256k | 256K | 5元/百万 | 9元/百万 | 超大代码库 |

---

## 安装步骤

### 前置要求

- macOS 系统
- Node.js 18 或更高版本
- 已安装 Claude Code

### 第一步：安装 Claude Code

```bash
# 检查是否已安装
claude --version

# 如果未安装，执行安装
curl -fsSL https://claude.ai/install.sh | bash
```

### 第二步：安装 Claude Code Router

```bash
# 全局安装
npm install -g @musistudio/claude-code-router

# 验证安装
claude-code-router --version
```

### 第三步：创建配置目录

```bash
mkdir -p ~/.claude-code-router
```

---

## 豆包配置

### 获取豆包 API 凭证

#### 步骤 1：注册火山引擎账号

1. 访问 [火山引擎官网](https://www.volcengine.com/)
2. 使用手机号或企业邮箱注册
3. 完成实名认证

#### 步骤 2：进入火山方舟平台

1. 登录后，顶部菜单点击 **"大模型"**
2. 选择 **"火山方舟"**
3. 或直接访问：https://console.volcengine.com/ark

#### 步骤 3：开通豆包模型服务

1. 点击左侧 **"开通管理"**
2. 勾选需要的模型（建议全选）
3. 点击 **"立即开通"**

#### 步骤 4：创建 API Key

1. 点击 **"API Key 管理"**
2. 点击 **"创建 API Key"**
3. 复制并保存生成的 API Key

格式示例：`7daf0c27-963a-4a11-xxxx-xxxxxxxxxxxx`

#### 步骤 5：创建模型接入点

⚠️ **关键步骤**：豆包需要先创建接入点才能使用！

1. 点击 **"在线推理"** → **"模型推理"**
2. 点击 **"创建推理接入点"**
3. 填写信息：
   - 名称：如 `Doubao-pro-32k-250128`
   - 模型：选择 `Doubao-pro-32k`
   - 版本：选择不带前缀的版本（如 `250128`）
4. 复制接入点 ID（格式：`ep-xxxxxxxxxx-xxxxx`）

### 配置 Claude Code Router

创建配置文件 `~/.claude-code-router/config.json`：

#### 基础配置

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "providers": {
    "doubao": {
      "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
      "apiKey": "你的豆包API密钥",
      "models": {
        "default": "ep-20250128123456-abcde",
        "background": "ep-20250128123456-abcde",
        "reasoning": "ep-20250128123456-abcde",
        "long_context": "ep-20250128123456-abcde"
      }
    }
  }
}
```

#### 分层配置（推荐）

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "providers": {
    "doubao": {
      "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
      "apiKey": "你的豆包API密钥",
      "models": {
        "default": "ep-20250128123456-pro32k",
        "background": "ep-20250128123457-lite32k",
        "reasoning": "ep-20250128123456-pro32k",
        "long_context": "ep-20250128123458-pro256k"
      }
    }
  }
}
```

---

## 使用方法

### 启动方式

#### 方式 1：分开启动

```bash
# 终端 1：启动 Router
claude-code-router

# 终端 2：启动 Claude Code
claude
```

#### 方式 2：一键启动（推荐）

在 `~/.zshrc` 中添加：

```bash
alias claude-doubao='(
  nohup claude-code-router > /dev/null 2>&1 &
  sleep 2
  echo "✅ Claude Code Router 已启动"
  claude
)'

alias ccr-stop='pkill -f claude-code-router'
```

使用：
```bash
claude-doubao  # 启动
ccr-stop       # 停止
```

### 基本命令

```
/model                              # 查看当前模型
/model doubao,ep-xxx                # 切换模型
/clear                              # 清除历史
/quit                               # 退出
```

### 使用示例

```bash
$ claude-doubao

> 分析这个 React 项目的结构
> 实现一个用户登录组件

# 简单任务切换到便宜模型
/model doubao,ep-lite32k
> 解释这个函数

# 复杂任务切回 pro 模型
/model doubao,ep-pro32k
> 重构系统架构
```

---

## 最佳实践

### 1. 成本优化

| 任务类型 | 推荐模型 | 成本 |
|----------|----------|------|
| 简单查询 | lite-32k | 0.3元/百万 |
| 日常开发 | pro-32k | 0.8元/百万 |
| 大型项目 | pro-256k | 5元/百万 |

**实际成本**：
- 每天约 1 元
- 每月约 30 元
- vs Claude 订阅：140-1400 元/月
- **节省：78-98%**

### 2. 免费额度利用

- 每个模型 50 万 tokens 免费
- 6 个模型共 300 万 tokens
- 活动期间额外 5 亿 tokens

### 3. 项目配置

创建 `CLAUDE.md`：

```markdown
# 项目规范

## 技术栈
- TypeScript + React
- Jest 测试
- ESLint + Prettier

## 开发规则
- 所有函数需要类型定义
- 新功能需要测试用例
- 提交前运行 lint

## 推荐模型
- 日常开发：doubao-pro-32k
- 简单任务：doubao-lite-32k
```

---

## 常见问题

### Q1: Router 无法连接

```bash
# 检查进程
ps aux | grep claude-code-router

# 重启
pkill -f claude-code-router
claude-code-router
```

### Q2: 配置文件错误

```bash
# 验证 JSON
cat ~/.claude-code-router/config.json | python -m json.tool
```

### Q3: API Key 格式

正确格式：`7daf0c27-963a-4a11-xxxx-xxxxxxxxxxxx`

不是：
- ❌ AK/SK 格式
- ❌ `sk-` 开头
- ❌ 接入点 ID

### Q4: 接入点 ID 无效

1. 确认接入点已创建
2. 状态为"运行中"
3. 使用正确的 ID 格式：`ep-xxxxxxxxxx-xxxxx`

### Q5: 查看免费额度

访问：https://console.volcengine.com/ark → 开通管理 → 免费推理额度

### Q6: 模型切换不生效

```bash
# 正确格式
/model doubao,ep-20250128123456-abcde

# 错误格式
/model ep-20250128123456-abcde          # 缺少提供商
/model doubao,doubao-pro-32k            # 不能用模型名
```

---

## 总结

### 核心优势

✅ **零订阅费**：无需 Anthropic 订阅  
✅ **超低成本**：比 Claude 便宜 60-80%  
✅ **免费额度**：300 万 + 5 亿 tokens  
✅ **中文优化**：字节出品  
✅ **完整体验**：保持 Claude Code 所有功能  

### 成本对比

| 方案 | 月成本 | 节省 |
|------|--------|------|
| Claude Pro | $20 (140元) | - |
| Claude Max | $200 (1400元) | - |
| 豆包 | 5-30元 | 78-98% |

### 快速开始

```bash
# 1. 安装
npm install -g @musistudio/claude-code-router

# 2. 配置
nano ~/.claude-code-router/config.json

# 3. 启动
claude-doubao
```

---

## 相关资源

- **Claude Code Router**：https://github.com/musistudio/claude-code-router
- **火山引擎**：https://www.volcengine.com/
- **火山方舟**：https://console.volcengine.com/ark
- **Claude Code 文档**：https://docs.claude.com/en/docs/claude-code

---

**最后更新**：2025年9月  
**文档版本**：v1.1（修复版）

祝您使用愉快！🚀



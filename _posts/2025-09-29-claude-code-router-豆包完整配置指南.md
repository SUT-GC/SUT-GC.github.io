---
layout: post
title: "Claude Code Router + 豆包完整配置指南"
description: "完整的 Claude Code Router + 豆包配置指南，包含安装、配置、使用方法和故障排查。成本仅为 Claude 订阅的 20-30%，享受同样强大的 AI 编程助手功能。"
categories: ["技术", "AI工具", "开发指南"]
tags: ["Claude Code Router", "豆包", "Doubao", "火山引擎", "AI编程", "低成本", "字节跳动"]
---

* Kramdown table of contents
{:toc .toc}

### Q1: Router 启动后 Claude Code 无法连接

**症状**：
- Claude Code 显示连接错误
- 无法与 AI 对话

**解决方法**：

```bash
# 1. 检查 Router 是否运行
ps aux | grep claude-code-router

# 2. 如果没有运行，启动它
claude-code-router

# 3. 查看错误日志
tail -f ~/.claude-code-router/logs/router.log

# 4. 如果有问题，重启 Router
pkill -f claude-code-router
sleep 2
claude-code-router
```

### Q2: 找不到配置文件

**症状**：
- Router 提示配置文件不存在
- 无法启动 Router

**解决方法**：

```bash
# 1. 检查配置文件是否存在
ls -la ~/.claude-code-router/config.json

# 2. 如果不存在，创建目录
mkdir -p ~/.claude-code-router

# 3. 创建配置文件
nano ~/.claude-code-router/config.json

# 4. 验证 JSON 格式
cat ~/.claude-code-router/config.json | python -m json.tool
```

### Q3: 豆包 API Key 格式错误

**正确格式**：
```
7daf0c27-963a-4a11-xxxx-xxxxxxxxxxxx
```

**不是以下格式**：
- ❌ Access Key ID (AK) 格式
- ❌ Secret Access Key (SK) 格式
- ❌ 以 `sk-` 开头的格式
- ❌ 接入点 ID（`ep-` 开头）

**获取位置**：
- 火山方舟控制台 → API Key 管理 → 创建 API Key

### Q4: 接入点 ID 无效或不存在

**症状**：
- 提示模型不可用
- API 调用失败

**解决方法**：

```bash
# 1. 确认接入点已创建
# 访问：https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint

# 2. 检查接入点状态为"运行中"

# 3. 确认接入点 ID 格式正确
# 正确：ep-20250128123456-abcde
# 错误：doubao-pro-32k（这是模型名，不是接入点 ID）

# 4. 测试 API 连接
curl -X POST https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer 你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "你的接入点ID",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### Q5: 如何查看剩余免费额度

**方法 1：通过控制台**

1. 访问 https://console.volcengine.com/ark
2. 点击左侧 **"开通管理"**
3. 查看 **"免费推理额度"** 部分

**方法 2：通过别名**

```bash
# 添加到 ~/.zshrc
alias doubao-quota='open https://console.volcengine.com/ark/region:ark+cn-beijing/openManage'

# 使用
doubao-quota
```

### Q6: 模型切换不生效

**症状**：
- 使用 `/model` 命令后仍然是旧模型
- 切换后没有反应

**解决方法**：

```bash
# 1. 确认命令格式正确
/model doubao,ep-20250128123456-abcde  # ✅ 正确
/model ep-20250128123456-abcde         # ❌ 错误（缺少提供商名）
/model doubao,doubao-pro-32k           # ❌ 错误（不能用模型名）

# 2. 确认接入点 ID 在配置文件中
cat ~/.claude-code-router/config.json | grep ep-20250128123456-abcde

# 3. 重启 Router
pkill -f claude-code-router
claude-code-router
```

---

## 完整配置示例

### 场景 1：单一模型（最简单）

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "providers": {
    "doubao": {
      "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
      "apiKey": "7daf0c27-963a-4a11-xxxx-xxxxxxxxxxxx",
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

**适合**：刚开始使用，只创建了一个接入点  
**成本**：~0.8-2元/百万 tokens

### 场景 2：分层配置（推荐）

```json
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "providers": {
    "doubao": {
      "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
      "apiKey": "7daf0c27-963a-4a11-xxxx-xxxxxxxxxxxx",
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

**适合**：日常开发，需要成本优化  
**成本**：混合使用，平均 ~0.5-1元/百万 tokens

---

## 快速开始指南

### 一键安装脚本

```bash
#!/bin/bash

echo "🚀 开始安装 Claude Code Router + 豆包配置"

# 1. 安装 Claude Code Router
echo "📦 安装 Claude Code Router..."
npm install -g @musistudio/claude-code-router

# 2. 创建配置目录
echo "📁 创建配置目录..."
mkdir -p ~/.claude-code-router

# 3. 创建配置文件模板
echo "📝 创建配置文件模板..."
cat > ~/.claude-code-router/config.json << 'EOF'
{
  "LOG": true,
  "LOG_LEVEL": "info",
  "providers": {
    "doubao": {
      "baseURL": "https://ark.cn-beijing.volces.com/api/v3",
      "apiKey": "在这里填写你的豆包API密钥",
      "models": {
        "default": "在这里填写你的接入点ID",
        "background": "在这里填写你的接入点ID",
        "reasoning": "在这里填写你的接入点ID",
        "long_context": "在这里填写你的接入点ID"
      }
    }
  }
}
EOF

# 4. 添加别名到 shell 配置
echo "⚙️  添加别名..."
if [ -f ~/.zshrc ]; then
  cat >> ~/.zshrc << 'EOF'

# Claude Code Router 别名
alias claude-doubao='(nohup claude-code-router > /dev/null 2>&1 & sleep 2 && echo "✅ Claude Code Router 已启动" && claude)'
alias ccr-stop='pkill -f claude-code-router && echo "⛔ Claude Code Router 已停止"'
alias doubao-console='open https://console.volcengine.com/ark'
alias doubao-config='code ~/.claude-code-router/config.json'
EOF
  source ~/.zshrc
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "📋 下一步操作："
echo "1. 访问火山方舟获取 API 密钥和接入点 ID："
echo "   https://console.volcengine.com/ark"
echo ""
echo "2. 编辑配置文件："
echo "   doubao-config"
echo ""
echo "3. 启动使用："
echo "   claude-doubao"
echo ""
```

---

## 总结

### 核心优势

通过 Claude Code Router + 豆包，您可以：

✅ **零订阅费**：无需 Anthropic 订阅，按需付费  
✅ **超低成本**：比 Claude 便宜 60-80%  
✅ **免费额度**：每个模型 50 万 tokens + 活动 5 亿  
✅ **中文优化**：字节跳动出品，中文支持优秀  
✅ **灵活切换**：随时切换不同规格的模型  
✅ **完整体验**：保持 Claude Code 的所有强大功能  

### 成本对比

| 方案 | 月成本 | 适用人群 |
|------|--------|----------|
| Claude Pro 订阅 | $20 (140元) | 高频重度用户 |
| Claude Max 订阅 | $100-200 (700-1400元) | 企业专业用户 |
| 豆包（本方案） | 5-30元 | 个人/团队开发者 |

**节省比例**：78-98%

### 下一步行动

1. **获取凭证**：
   - 注册火山引擎账号
   - 开通豆包模型
   - 创建 API Key
   - 创建接入点

2. **安装配置**：
   - 安装 Claude Code Router
   - 创建配置文件
   - 测试连接

3. **开始使用**：
   - 启动 Router
   - 运行 Claude Code
   - 享受 AI 编程助手

---

## 相关资源

### 官方文档

- **Claude Code Router GitHub**：https://github.com/musistudio/claude-code-router
- **火山引擎官网**：https://www.volcengine.com/
- **火山方舟控制台**：https://console.volcengine.com/ark
- **火山方舟文档**：https://www.volcengine.com/docs/82379
- **Claude Code 文档**：https://docs.claude.com/en/docs/claude-code

### 快速链接

- **获取 API Key**：https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey
- **创建接入点**：https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint
- **查看额度**：https://console.volcengine.com/ark/region:ark+cn-beijing/openManage

### 常用命令速查

```bash
# 安装
npm install -g @musistudio/claude-code-router

# 启动
claude-doubao

# 停止
ccr-stop

# 查看配置
cat ~/.claude-code-router/config.json

# 编辑配置
code ~/.claude-code-router/config.json

# 查看日志
tail -f ~/.claude-code-router/logs/router.log
```

---

感谢您使用 Claude Code Router + 豆包方案！祝您开发愉快！🚀

**最后更新**：2025年9月  
**文档版本**：v1.0
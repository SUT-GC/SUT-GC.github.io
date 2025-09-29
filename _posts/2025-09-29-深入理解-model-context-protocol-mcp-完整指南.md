---
layout: post
title: "深入理解 Model Context Protocol (MCP)：完整指南"
description: "从概念、架构、实战到最佳实践，全面掌握 MCP 协议"
categories: ["技术"]
tags: ["Claude"]
---

* Kramdown table of contents
{:toc .toc}

# 深入理解 Model Context Protocol (MCP)：完整指南

> 本文全面介绍 MCP 协议：从基础概念、架构设计、通信机制，到 Python/Go 实战代码和生产环境最佳实践。

## 目录

1. [MCP 是什么](#一mcp-是什么)
2. [架构与机制](#二架构与机制)
3. [MCP vs Function Calling](#三mcp-vs-function-calling)
4. [Hello World 实战](#四hello-world-实战)
5. [调试与故障排查](#五调试与故障排查)
6. [进阶主题](#六进阶主题)
7. [最佳实践](#七最佳实践)
8. [生态系统](#八生态系统)

---

## 一、MCP 是什么？

### 1.1 核心概念

2024 年 11 月，Anthropic 发布了 **Model Context Protocol (MCP)**，这是一个开放标准协议，用于在 AI 应用和外部数据源之间建立安全的双向连接。

**形象比喻**：Anthropic 将 MCP 比作 **"AI 的 USB-C 接口"**
- USB-C 提供了连接设备与外设的标准方式
- MCP 提供了连接 AI 模型与数据源的标准方式

### 1.2 解决的核心问题

**M × N 问题**：
```
传统方式：
- M 个 AI 应用
- N 个数据源
- 需要 M × N 个自定义集成 ❌

MCP 方式：
- M 个应用实现 MCP 客户端
- N 个数据源实现 MCP 服务器
- 任意组合无缝工作 ✅
```

### 1.3 应用场景

- 🗂️ **业务工具集成**：Google Drive、Slack、GitHub
- 🗄️ **数据库访问**：PostgreSQL、MongoDB、MySQL
- 🌐 **API 服务**：天气、地图、支付
- 📁 **文件系统**：本地文件读写
- 💻 **开发工具**：IDE、代码编辑器

---

## 二、架构与机制

### 2.1 三层架构

```
┌─────────────────────────────────────────┐
│         Host (主机应用)                 │
│   (Claude Desktop, Cursor IDE)          │
│  ┌───────────────────────────────────┐  │
│  │   MCP Client (客户端)             │  │
│  │   - 管理连接                      │  │
│  │   - 处理协议                      │  │
│  │   - 路由请求                      │  │
│  └──────────────┬────────────────────┘  │
└─────────────────┼──────────────────────┘
                  │ JSON-RPC 2.0
                  │ (stdio/HTTP/SSE)
                  ▼
┌─────────────────────────────────────────┐
│       MCP Server (服务器)               │
│  ┌──────────┐ ┌──────────┐             │
│  │Resources │ │  Tools   │             │
│  │  (资源)  │ │ (工具)   │             │
│  └──────────┘ └──────────┘             │
│  ┌──────────┐                          │
│  │ Prompts  │                          │
│  │(提示词)  │                          │
│  └──────────┘                          │
└─────────────────────────────────────────┘
```

### 2.2 三大核心能力

#### 📚 Resources (资源)
- **类比**：REST API 的 GET 端点
- **用途**：提供上下文数据
- **特点**：只读、静态或动态
- **示例**：
  ```
  resource://files/report.pdf
  resource://database/users/{id}
  resource://api/weather/current
  ```

#### 🔧 Tools (工具)
- **类比**：REST API 的 POST 端点
- **用途**：执行操作、产生副作用
- **特点**：可执行、需用户批准
- **示例**：发送邮件、创建文件、查询数据库

#### 💬 Prompts (提示词)
- **用途**：预定义的交互模板
- **特点**：可重用、支持参数化
- **作用**：引导 AI 对话

### 2.3 通信协议

#### JSON-RPC 2.0 消息格式

**Request (请求)**：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {"location": "Singapore"}
  }
}
```

**Response (响应)**：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {"type": "text", "text": "Temperature: 28°C"}
    ]
  }
}
```

#### 传输层

| 传输方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **stdio** | 本地工具 | 简单、安全、低延迟 | 仅本地、单客户端 |
| **HTTP+SSE** | 远程服务 | 跨网络、多客户端 | 需配置、较复杂 |

---

## 三、MCP vs Function Calling

### 对比表格

| 维度 | Function Calling | MCP |
|------|------------------|-----|
| **标准化** | 供应商特定 | 开放标准 |
| **重用性** | 应用特定 | 跨应用重用 |
| **连接** | 无状态 | 有状态持久连接 |
| **能力** | 仅函数 | 工具+资源+提示词 |
| **发现** | 编译时 | 运行时 |
| **场景** | 简单临时 | 企业级可重用 |

### 形象类比

- **Function Calling**：把工具箱焊在车上（每辆车都要单独配）
- **MCP**：USB 接口（一个工具插入所有设备）

---

## 四、Hello World 实战

### 4.1 Python 实现

#### 安装
```bash
uv init mcp-hello-python
cd mcp-hello-python
uv add mcp
```

#### 完整代码 (server.py)
```python
from mcp.server.fastmcp import FastMCP
import sys
import logging

# 配置日志（重要：输出到 stderr）
logging.basicConfig(
    level=logging.INFO,
    handlers=[logging.StreamHandler(sys.stderr)]
)

mcp = FastMCP("Hello MCP Server")

@mcp.tool()
def greet(name: str = "World") -> str:
    """向指定的人打招呼"""
    return f"Hello, {name}! Welcome to MCP!"

@mcp.tool()
def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b

@mcp.resource("greeting://static")
def get_greeting() -> str:
    """静态问候语"""
    return "This is a static greeting!"

@mcp.resource("greeting://dynamic/{name}")
def get_dynamic_greeting(name: str) -> str:
    """动态问候语"""
    return f"Hello {name}, personalized greeting!"

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

#### Claude Desktop 配置
```json
{
  "mcpServers": {
    "hello-python": {
      "command": "uv",
      "args": ["run", "/path/to/server.py"]
    }
  }
}
```

### 4.2 Go 实现

#### 安装
```bash
mkdir mcp-hello-go && cd mcp-hello-go
go mod init mcp-hello-go
go get github.com/mark3labs/mcp-go
```

#### 完整代码 (main.go)
```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

func main() {
	// 重要：日志输出到 stderr
	log.SetOutput(os.Stderr)
	
	s := server.NewMCPServer(
		"Hello MCP Server (Go)",
		"1.0.0",
		server.WithToolCapabilities(false),
	)

	// 工具：打招呼
	greetTool := mcp.NewTool(
		"greet",
		mcp.WithDescription("向指定的人打招呼"),
		mcp.WithString("name", mcp.Required()),
	)
	s.AddTool(greetTool, greetHandler)

	// 工具：加法
	addTool := mcp.NewTool(
		"add",
		mcp.WithDescription("两数相加"),
		mcp.WithNumber("a", mcp.Required()),
		mcp.WithNumber("b", mcp.Required()),
	)
	s.AddTool(addTool, addHandler)

	// 资源：静态
	staticResource := mcp.NewResource(
		"greeting://static",
		"Static Greeting",
	)
	s.AddResource(staticResource, staticHandler)

	log.Println("Starting MCP Server...")
	if err := server.ServeStdio(s); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func greetHandler(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	name, _ := req.RequireString("name")
	return mcp.NewToolResultText(fmt.Sprintf("Hello, %s!", name)), nil
}

func addHandler(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	a, _ := req.RequireNumber("a")
	b, _ := req.RequireNumber("b")
	return mcp.NewToolResultText(fmt.Sprintf("%.0f", a+b)), nil
}

func staticHandler(ctx context.Context, req mcp.ReadResourceRequest) (string, error) {
	return "Static greeting from Go!", nil
}
```

#### 编译运行
```bash
go build -o mcp-hello-go
./mcp-hello-go  # 测试
```

### ⚠️ 关键注意事项

**stdio 服务器日志规则**：
```python
# ❌ 错误：会破坏 JSON-RPC 消息
print("Starting server...")

# ✅ 正确：输出到 stderr
import logging, sys
logging.basicConfig(handlers=[logging.StreamHandler(sys.stderr)])
logging.info("Starting server...")
```

**Go 版本**：
```go
log.SetOutput(os.Stderr)  // 必须设置
log.Println("Starting...")
```

---

## 五、调试与故障排查

### 5.1 常见问题

#### 问题 1：服务器无法启动

**排查步骤**：
```bash
# 1. 检查配置路径
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 2. 查看日志
tail -f ~/Library/Logs/Claude/mcp*.log

# 3. 手动测试
uv run server.py  # 应该等待输入，不立即退出
```

#### 问题 2：工具调用失败

**原因 A：参数类型不匹配**
```python
@mcp.tool()
def divide(a: int, b: int) -> float:  # 明确类型
    """除法运算"""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

**原因 B：stdout 污染**
```python
# ❌ 错误
@mcp.tool()
def fetch(url: str) -> str:
    print(f"Fetching {url}")  # 破坏协议！
    return requests.get(url).text

# ✅ 正确
import logging
@mcp.tool()
def fetch(url: str) -> str:
    logging.info(f"Fetching {url}")  # 使用 logging
    return requests.get(url).text
```

### 5.2 调试技巧

#### 结构化日志
```python
import json
from datetime import datetime

def log_tool_call(tool_name, params, result=None, error=None):
    entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'tool': tool_name,
        'params': params,
        'success': error is None
    }
    if result: entry['result'] = str(result)
    if error: entry['error'] = error
    logging.info(json.dumps(entry))

@mcp.tool()
def calculate(op: str, a: float, b: float) -> float:
    log_tool_call('calculate', {'op': op, 'a': a, 'b': b})
    try:
        result = a + b if op == 'add' else a - b
        log_tool_call('calculate', {'op': op}, result=result)
        return result
    except Exception as e:
        log_tool_call('calculate', {'op': op}, error=str(e))
        raise
```

---

## 六、进阶主题

### 6.1 HTTP 服务器（支持多客户端）

#### Python + FastAPI
```python
from mcp.server.fastmcp import FastMCP
from fastapi import FastAPI
import uvicorn

mcp = FastMCP("HTTP MCP Server")
app = FastAPI()

@mcp.tool()
def greet(name: str) -> str:
    return f"Hello, {name}!"

app.mount("/mcp", mcp.get_asgi_app())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 6.2 实战案例：系统监控服务器

```python
from mcp.server.fastmcp import FastMCP
import psutil
import json

mcp = FastMCP("System Monitor")

@mcp.tool()
def get_cpu_info() -> str:
    """获取 CPU 使用率"""
    cpu_percent = psutil.cpu_percent(interval=1)
    cpu_count = psutil.cpu_count()
    return f"CPU: {cpu_percent}% ({cpu_count} cores)"

@mcp.tool()
def get_memory_info() -> str:
    """获取内存信息"""
    mem = psutil.virtual_memory()
    return f"Memory: {mem.used/(1024**3):.2f}GB / {mem.total/(1024**3):.2f}GB ({mem.percent}%)"

@mcp.resource("system://status")
def get_status() -> str:
    """系统状态"""
    return json.dumps({
        'cpu': psutil.cpu_percent(),
        'memory': psutil.virtual_memory().percent,
        'disk': psutil.disk_usage('/').percent
    })

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

---

## 七、最佳实践

### 7.1 安全考虑

```python
import os
from pathlib import Path

def validate_path(file_path: str, allowed_dirs: list) -> bool:
    """验证文件路径安全"""
    normalized = os.path.abspath(file_path)
    
    # 防止路径遍历
    if '..' in file_path:
        return False
    
    # 检查是否在允许目录中
    return any(
        normalized.startswith(os.path.abspath(d)) 
        for d in allowed_dirs
    )

@mcp.tool()
def read_file(path: str) -> str:
    """安全读取文件"""
    ALLOWED = ["/Users/username/Documents"]
    
    if not validate_path(path, ALLOWED):
        return "Error: Access denied"
    
    if os.path.getsize(path) > 10 * 1024 * 1024:
        return "Error: File too large (max 10MB)"
    
    try:
        with open(path, 'r') as f:
            return f.read()
    except Exception:
        return "Error: Failed to read file"
```

### 7.2 性能优化

```python
from functools import lru_cache
import asyncio

# 1. 使用缓存
@lru_cache(maxsize=128)
def expensive_calc(data: str) -> str:
    # 耗时计算
    return process(data)

# 2. 异步批量处理
@mcp.tool()
async def batch_process(files: list) -> str:
    async def process_one(f):
        return {"file": f, "status": "done"}
    
    results = await asyncio.gather(
        *[process_one(f) for f in files]
    )
    return json.dumps(results)

# 3. 超时控制
from contextlib import contextmanager
import signal

@contextmanager
def timeout(seconds):
    def handler(signum, frame):
        raise TimeoutError()
    signal.signal(signal.SIGALRM, handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

@mcp.tool()
def long_task(data: str) -> str:
    try:
        with timeout(30):
            return process(data)
    except TimeoutError:
        return "Error: Timeout"
```

### 7.3 测试策略

```python
import pytest

@pytest.fixture
def mcp_server():
    mcp = FastMCP("Test")
    
    @mcp.tool()
    def add(a: int, b: int) -> int:
        return a + b
    
    return mcp

@pytest.mark.asyncio
async def test_add_tool(mcp_server):
    result = await mcp_server.call_tool("add", {"a": 2, "b": 3})
    assert result == 5
```

---

## 八、生态系统

### 8.1 官方资源

- **文档**：https://docs.claude.com/en/docs/mcp
- **规范**：https://modelcontextprotocol.io
- **Python SDK**：https://github.com/modelcontextprotocol/python-sdk
- **Go SDK**：https://github.com/modelcontextprotocol/go-sdk

### 8.2 社区资源

**第三方 SDK**：
- mark3labs/mcp-go
- metoro-io/mcp-golang
- FastMCP (Python 高级框架)

**支持 MCP 的应用**：
- Claude Desktop
- Cursor IDE
- Zed Editor
- Codeium
- Sourcegraph Cody

### 8.3 官方服务器示例

- **filesystem**：文件系统访问
- **github**：GitHub 集成
- **google-drive**：Google Drive
- **slack**：Slack 集成
- **postgres**：PostgreSQL 数据库
- **puppeteer**：浏览器自动化

---

## 九、常见问题

**Q1: MCP 和 RAG 有什么关系？**
> MCP 提供标准化的数据访问接口，RAG 利用这些接口检索知识。MCP 是基础设施，RAG 是应用模式。

**Q2: 一个服务器能同时服务多个客户端吗？**
> stdio：不能（1对1）  
> HTTP/SSE：可以（1对多）

**Q3: MCP 适合生产环境吗？**
> 是的，但需要：
> - 完善错误处理
> - 添加监控日志
> - 安全加固
> - 性能测试

**Q4: 如何调试连接问题？**
> 1. 查看日志文件
> 2. 手动测试服务器
> 3. 使用 `mcp dev` 工具
> 4. 检查 JSON-RPC 格式
> 5. 验证配置路径

---

## 十、总结

### 核心要点

1. **MCP 是什么**：AI 的 USB-C 接口，标准化的连接协议
2. **三大能力**：Resources（数据）、Tools（操作）、Prompts（模板）
3. **vs Function Calling**：标准化、可重用、生态系统
4. **实现要点**：注意 stdio 日志规则，重视安全和错误处理

### 开始你的 MCP 之旅

1. **从简单开始**：实现 Hello World
2. **解决实际问题**：构建针对性服务器
3. **贡献社区**：开源你的实现
4. **持续学习**：关注规范更新

---

## 参考资源

- [MCP 官方文档](https://docs.claude.com/en/docs/mcp)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Go SDK](https://github.com/modelcontextprotocol/go-sdk)
- [服务器目录](https://mcp.so)

希望这篇指南能帮助你全面掌握 MCP！🚀
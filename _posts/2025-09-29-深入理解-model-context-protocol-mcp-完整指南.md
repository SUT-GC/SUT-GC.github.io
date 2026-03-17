---
layout: post
title: "深入理解 Model Context Protocol (MCP)：完整指南"
description: "从概念、架构、协议格式到裸协议实现，彻底搞懂 MCP 的本质"
categories: ["技术"]
tags: ["MCP", "Claude", "AI", "协议"]
---

* Kramdown table of contents
{:toc .toc}

# 深入理解 Model Context Protocol (MCP)：完整指南

> 本文不只是告诉你 MCP 怎么用，而是带你从底层理解它到底是什么、为什么这么设计。我们会先搞清楚架构和协议格式，然后用最原始的 HTTP 代码手写一个 MCP Server 和 Client，看清协议的本质，最后再回到 SDK 的便捷写法。

---

## 一、MCP 是什么？

2024 年 11 月，Anthropic 发布了 **Model Context Protocol (MCP)**，一个开放标准协议，用于在 AI 应用和外部工具、数据源之间建立标准化的连接。

**一句话概括**：MCP 定义了一套统一的接口规范，让 AI 模型能以标准化的方式**发现**并**调用**外部能力。

### 为什么需要 MCP？

在 MCP 出现之前，每个 AI 应用要接入外部工具，都得写一套自定义的集成代码：

![为什么需要 MCP](https://int32-blog.oss-cn-beijing.aliyuncs.com/01-mxn-compare-task1-1.jpg)

Anthropic 把它比作 **"AI 的 USB-C 接口"** —— USB-C 让所有设备用同一种接口连接外设，MCP 让所有 AI 应用用同一种协议连接工具。

---

## 二、MCP 的架构

### 三个角色

![MCP 三层架构](https://int32-blog.oss-cn-beijing.aliyuncs.com/02-architecture-task1-1.jpg)

重点理解：**AI 模型本身不直接连 MCP Server**。中间的 Client 是桥梁——它从 Server 发现工具，告诉 AI 有什么可用，AI 决定要调什么，Client 再去 Server 执行。

### 三大核心能力

MCP Server 可以提供三种能力，按需声明：

| 能力 | 类比 | 用途 | 示例 |
| ------ | ------ | ------ | ------ |
| **Tools（工具）** | POST 端点 | 执行操作，有副作用 | 发邮件、查天气、写文件 |
| **Resources（资源）** | GET 端点 | 提供数据，只读 | 读取文件、查询数据库记录 |
| **Prompts（提示词）** | 模板 | 预定义的交互模板 | 代码审查模板、翻译模板 |

其中 **Tools 是最常用的**，大多数 MCP Server 只实现 Tools 就够了。

---

## 三、客户端与服务端是怎么交互的？

这是理解 MCP 最关键的部分。整个交互分为三个阶段：

### 第一阶段：握手

Client 和 Server 先"认识一下"，交换各自的能力：

```text
Client → Server:  initialize（我是谁，我支持什么）
Server → Client:  返回（我是谁，我支持 tools / resources / prompts 中的哪些）
Client → Server:  notifications/initialized（好的，握手完成）
```

Server 在握手响应中**声明**自己支持哪些能力：

```json
{
  "capabilities": {
    "tools": {}
  }
}
```

注意 `"tools": {}` 是空对象——这里不是说没有工具，而是**声明"我支持 tools 这个能力"**。具体有哪些工具，下一步才去问。

### 第二阶段：发现

Client 根据握手结果，去查询具体有哪些工具可用：

```text
Client → Server:  tools/list（你有哪些工具？）
Server → Client:  返回工具列表（名称、描述、参数定义）
```

Client 拿到工具列表后，转换成 AI 模型能理解的格式，塞进对话上下文。

### 第三阶段：调用

用户提问，AI 分析后决定调用某个工具，Client 转发执行：

```text
用户: "北京天气怎么样？"
      ↓
AI 模型看到可用工具列表，决定调用 get_weather(city="北京")
      ↓
Client → Server:  tools/call（调用 get_weather，参数 city=北京）
Server → Client:  返回结果（晴天 25°C）
      ↓
AI 模型拿到结果，生成最终回复: "北京今天晴天 25°C，适合出门。"
```

完整流程图：

![MCP 交互全流程](https://int32-blog.oss-cn-beijing.aliyuncs.com/03-interaction-flow-task1-1.jpg)

---

## 四、协议格式：一个端点 + JSON-RPC

上面说的所有交互，底层都是**往同一个端点发 JSON**。MCP 基于 JSON-RPC 2.0 协议（一个早已存在的开放标准，后面会详细介绍），不靠 URL 路径区分操作，而是靠消息体里的 `method` 字段路由：

```text
所有请求都发到同一个地方：
POST /mcp  →  { "method": "initialize", ... }
POST /mcp  →  { "method": "tools/list", ... }
POST /mcp  →  { "method": "tools/call", ... }
```

每个方法的入参和出参格式都是协议预定义好的——这也是 SDK 能帮你收掉的部分。下面列出最核心的几个：

### initialize（握手）

```json
// 请求
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
  "protocolVersion": "2025-03-26",
  "capabilities": {},
  "clientInfo": {"name": "my-client", "version": "1.0"}
}}

// 响应
{"jsonrpc": "2.0", "id": 1, "result": {
  "protocolVersion": "2025-03-26",
  "capabilities": {"tools": {}},
  "serverInfo": {"name": "my-server", "version": "1.0"}
}}
```

### tools/list（发现工具）

```json
// 请求
{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}

// 响应——返回工具名称、描述、参数的 JSON Schema
{"jsonrpc": "2.0", "id": 2, "result": {
  "tools": [{
    "name": "get_weather",
    "description": "获取指定城市的天气",
    "inputSchema": {
      "type": "object",
      "properties": {
        "city": {"type": "string", "description": "城市名称"}
      },
      "required": ["city"]
    }
  }]
}}
```

### tools/call（调用工具）

```json
// 请求
{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {
  "name": "get_weather",
  "arguments": {"city": "北京"}
}}

// 响应
{"jsonrpc": "2.0", "id": 3, "result": {
  "content": [{"type": "text", "text": "晴天 25°C"}]
}}
```

可以看到，所有消息都遵循同一个信封格式：`jsonrpc` + `id` + `method` + `params`/`result`。**MCP 协议定义的就是每个 method 该传什么 params、返回什么 result**——这就是它作为"标准协议"的核心价值，任何语言的 SDK 只要按这个格式实现，就能互通。

---

## 五、用最原始的代码实现 MCP

理解协议最好的方式就是自己手写一遍。下面我们**不用任何 MCP SDK**，只用 Flask 和 requests，手撸一个完整的 MCP Server 和 Client。

### 5.1 手写 MCP Server

整个 Server 就一个 HTTP 端点 `/mcp`，所有请求都是 POST，靠请求体里的 `method` 字段区分操作：

```python
"""
MCP Server - 纯 HTTP 实现，不依赖 MCP SDK
pip install flask
"""

from flask import Flask, request, jsonify

app = Flask(__name__)

# ========== 定义工具 ==========

TOOLS = [
    {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "inputSchema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名称"}
            },
            "required": ["city"],
        },
    },
    {
        "name": "add",
        "description": "两个数字相加",
        "inputSchema": {
            "type": "object",
            "properties": {
                "a": {"type": "number", "description": "第一个数"},
                "b": {"type": "number", "description": "第二个数"},
            },
            "required": ["a", "b"],
        },
    },
]

# ========== 工具实现 ==========

def handle_get_weather(args):
    city = args.get("city", "未知")
    fake_weather = {"北京": "晴天 25°C", "上海": "多云 22°C", "深圳": "小雨 28°C"}
    return [{"type": "text", "text": fake_weather.get(city, f"{city} 天气数据暂无")}]


def handle_add(args):
    return [{"type": "text", "text": str(args["a"] + args["b"])}]


TOOL_HANDLERS = {
    "get_weather": handle_get_weather,
    "add": handle_add,
}

# ========== MCP 协议处理（JSON-RPC method → handler）==========

def handle_initialize(params):
    """握手：告诉 Client 我支持什么能力"""
    return {
        "protocolVersion": "2025-03-26",
        "capabilities": {
            "tools": {},  # 声明"我支持 tools"，不是说没有工具
        },
        "serverInfo": {"name": "raw-mcp-server", "version": "1.0.0"},
    }


def handle_tools_list(params):
    """返回所有工具的定义"""
    return {"tools": TOOLS}


def handle_tools_call(params):
    """执行工具调用"""
    tool_name = params.get("name")
    arguments = params.get("arguments", {})

    handler = TOOL_HANDLERS.get(tool_name)
    if not handler:
        raise ValueError(f"Unknown tool: {tool_name}")

    return {"content": handler(arguments)}


METHOD_HANDLERS = {
    "initialize": handle_initialize,
    "tools/list": handle_tools_list,
    "tools/call": handle_tools_call,
}

# ========== 唯一的 HTTP 端点 ==========

@app.route("/mcp", methods=["POST"])
def mcp_endpoint():
    """所有 MCP 请求都走这一个端点，靠 body 里的 method 字段路由"""
    body = request.get_json()
    method = body.get("method")
    params = body.get("params", {})
    req_id = body.get("id")

    # 通知消息（无 id），如 notifications/initialized
    if req_id is None:
        return "", 204

    handler = METHOD_HANDLERS.get(method)
    if not handler:
        return jsonify({
            "jsonrpc": "2.0", "id": req_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"},
        }), 400

    try:
        result = handler(params)
        return jsonify({"jsonrpc": "2.0", "id": req_id, "result": result})
    except Exception as e:
        return jsonify({
            "jsonrpc": "2.0", "id": req_id,
            "error": {"code": -32000, "message": str(e)},
        }), 500


if __name__ == "__main__":
    print("MCP Server running at http://localhost:8000/mcp")
    app.run(host="0.0.0.0", port=8000)
```

看到了吗？**整个 Server 就是一个 `/mcp` 端点**，根据 `method` 字段分发到不同的处理函数。没有什么黑魔法。

### 5.2 手写 MCP Client

Client 的职责是：连接 Server → 发现工具 → 翻译给 AI → 转发调用。

```python
"""
MCP Client - 纯 HTTP 实现，不依赖 MCP SDK
pip install requests
"""

import requests
import json

MCP_ENDPOINT = "http://localhost:8000/mcp"
_request_id = 0


def jsonrpc_request(method, params=None):
    """发送一个 JSON-RPC 请求，返回 result"""
    global _request_id
    _request_id += 1

    resp = requests.post(MCP_ENDPOINT, json={
        "jsonrpc": "2.0",
        "id": _request_id,
        "method": method,
        "params": params or {},
    })
    data = resp.json()

    if "error" in data:
        raise Exception(f"RPC Error: {data['error']}")
    return data["result"]


def jsonrpc_notify(method, params=None):
    """发送一个 JSON-RPC 通知（无 id，不期望响应）"""
    requests.post(MCP_ENDPOINT, json={
        "jsonrpc": "2.0",
        "method": method,
        "params": params or {},
    })


def main():
    # ===== 第一步：握手 =====
    print("1️⃣  Initialize 握手")
    result = jsonrpc_request("initialize", {
        "protocolVersion": "2025-03-26",
        "capabilities": {},
        "clientInfo": {"name": "raw-mcp-client", "version": "1.0.0"},
    })
    jsonrpc_notify("notifications/initialized")

    server_caps = result["capabilities"]
    print(f"   Server 支持的能力: {list(server_caps.keys())}")

    # ===== 第二步：发现工具 =====
    print("\n2️⃣  tools/list 发现工具")
    result = jsonrpc_request("tools/list")
    tools = result["tools"]
    for t in tools:
        print(f"   - {t['name']}: {t['description']}")

    # ===== 第三步：转换为 AI 模型的 tools 格式 =====
    # 这一步是 MCP Client 的核心价值——桥接 MCP 和 AI
    print("\n3️⃣  转换为 AI 模型格式")
    ai_tools = []
    for t in tools:
        ai_tools.append({
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["inputSchema"],
            },
        })
    print(f"   转换完成，{len(ai_tools)} 个工具已准备好传给 AI")

    # ===== 第四步：模拟 AI 决策 =====
    # 实际场景：把用户问题 + ai_tools 一起发给 AI，AI 返回 tool_calls
    # 这里直接模拟 AI 的决策结果
    print("\n4️⃣  用户问: '北京天气怎么样？'")
    print("   AI 决定调用: get_weather(city='北京')")

    # ===== 第五步：通过 MCP 调用工具 =====
    print("\n5️⃣  tools/call 执行工具")
    result = jsonrpc_request("tools/call", {
        "name": "get_weather",
        "arguments": {"city": "北京"},
    })
    tool_output = result["content"][0]["text"]
    print(f"   工具返回: {tool_output}")

    # ===== 第六步：AI 生成最终回复 =====
    # 实际场景：把 tool_output 作为 tool message 喂回 AI
    print(f"\n6️⃣  AI 最终回复: 北京今天{tool_output}，适合出门活动。")


if __name__ == "__main__":
    main()
```

运行方式：

```bash
# 终端 1
python server.py

# 终端 2
python client.py
```

输出：

```text
1️⃣  Initialize 握手
   Server 支持的能力: ['tools']

2️⃣  tools/list 发现工具
   - get_weather: 获取指定城市的天气信息
   - add: 两个数字相加

3️⃣  转换为 AI 模型格式
   转换完成，2 个工具已准备好传给 AI

4️⃣  用户问: '北京天气怎么样？'
   AI 决定调用: get_weather(city='北京')

5️⃣  tools/call 执行工具
   工具返回: 晴天 25°C

6️⃣  AI 最终回复: 北京今天晴天 25°C，适合出门活动。
```

---

## 六、用 SDK 实现 MCP

理解了底层原理后，再看 SDK 的写法就很清晰了——SDK 帮你封装了 JSON-RPC 通信、协议握手、工具注册这些重复工作。

### 6.1 Server 端（使用 Python SDK）

```bash
uv init mcp-hello && cd mcp-hello
uv add mcp
```

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Hello MCP Server")

@mcp.tool()
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    fake_weather = {"北京": "晴天 25°C", "上海": "多云 22°C", "深圳": "小雨 28°C"}
    return fake_weather.get(city, f"{city} 天气数据暂无")

@mcp.tool()
def add(a: int, b: int) -> int:
    """两个数字相加"""
    return a + b

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

对比手写版本，SDK 帮你做了什么：

| 你手写的 | SDK 帮你封装的 |
| --------- | -------------- |
| `handle_initialize()` 函数 | 自动处理握手 |
| `TOOLS` 列表 + `inputSchema` | 从函数签名和类型注解自动生成 |
| `METHOD_HANDLERS` 路由 | 自动根据 `@mcp.tool()` 注册 |
| Flask 端点 + JSON-RPC 解析 | 内置传输层（stdio / HTTP） |

**本质上 SDK 做的事情和我们手写的完全一样**，只是把模板代码藏起来了。

### 6.2 配置到 Claude Desktop

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "hello": {
      "command": "uv",
      "args": ["run", "/path/to/server.py"]
    }
  }
}
```

Claude Desktop 启动后，内置的 MCP Client 会自动：

1. 用 stdio 启动你的 Server 进程
2. 发送 `initialize` 握手
3. 调用 `tools/list` 拿到工具列表
4. 把工具展示给用户，AI 需要时自动调用

### 6.3 HTTP 模式（支持远程/多客户端）

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("HTTP MCP Server")

@mcp.tool()
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    fake_weather = {"北京": "晴天 25°C", "上海": "多云 22°C"}
    return fake_weather.get(city, f"{city} 天气数据暂无")

if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

客户端配置改为：

```json
{
  "mcpServers": {
    "remote": {
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

### 6.4 stdio 模式的关键注意事项

stdio 传输下，stdout 是 JSON-RPC 通信通道。如果你往 stdout 打日志，会破坏协议：

```python
# ❌ 错误：print 输出到 stdout，污染 JSON-RPC 通信
@mcp.tool()
def fetch(url: str) -> str:
    print(f"Fetching {url}")  # 这行会破坏协议！
    return requests.get(url).text

# ✅ 正确：日志输出到 stderr
import logging, sys
logging.basicConfig(handlers=[logging.StreamHandler(sys.stderr)])

@mcp.tool()
def fetch(url: str) -> str:
    logging.info(f"Fetching {url}")  # 不影响 stdout
    return requests.get(url).text
```

---

## 七、补充知识：JSON-RPC 是什么？

前面反复提到 JSON-RPC，这里专门解释一下。

### JSON-RPC 2.0 是一个已有的开放标准

它和 MCP 无关，是一个独立的、早已存在的远程过程调用协议。整个规范极其简单，只定义了三种消息格式：

```json
// 1. Request（请求）—— 有 id，期望响应
{"jsonrpc": "2.0", "id": 1, "method": "xxx", "params": {...}}

// 2. Response（响应）—— 对应某个 request
{"jsonrpc": "2.0", "id": 1, "result": {...}}
{"jsonrpc": "2.0", "id": 1, "error": {"code": -32600, "message": "xxx"}}

// 3. Notification（通知）—— 没有 id，不期望响应
{"jsonrpc": "2.0", "method": "xxx", "params": {...}}
```

就这么多。它只规定了**消息信封的格式**，不关心传输方式（HTTP、WebSocket、stdio 都行），也不关心 `method` 叫什么。

### 为什么 MCP 选择 JSON-RPC 而不是 REST？

```text
REST 思路：不同操作 = 不同 URL 路径
POST /api/tools/list         → 列出工具
POST /api/tools/call         → 调用工具
POST /api/resources/list     → 列出资源

JSON-RPC 思路：一个端点，靠 method 字段区分
POST /mcp  → {"method": "tools/list", ...}
POST /mcp  → {"method": "tools/call", ...}
POST /mcp  → {"method": "resources/list", ...}
```

JSON-RPC 的好处是**协议逻辑完全在消息体里，不依赖 URL 路径**。这让 MCP 可以无缝支持多种传输：

- **HTTP**：POST 到一个端点
- **stdio**：直接往 stdin/stdout 写 JSON

如果用 REST，stdio 模式就没法玩了——没有 URL 的概念。

### MCP 在 JSON-RPC 之上定义了什么？

JSON-RPC 是信封格式，MCP 填写了信封里的内容：

| JSON-RPC 提供的框架 | MCP 填入的具体内容 |
| ------------------- | ----------------- |
| `method` 字段 | `initialize`、`tools/list`、`tools/call` 等固定方法名 |
| `params` 字段 | 每个方法的参数 Schema |
| `result` 字段 | 每个方法的返回 Schema |
| 传输无关 | 定义了 stdio 和 Streamable HTTP 两种传输 |

---

## 八、传输方式

MCP 支持三种传输方式，Server 提供方决定支持哪种，Client 配置时选对应方式即可：

| 传输方式 | 适用场景 | 特点 |
| --------- | --------- | ------ |
| **stdio** | 本地工具 | 最简单，Host 直接启动 Server 进程，通过 stdin/stdout 通信 |
| **Streamable HTTP** | 远程服务（推荐） | 单个 HTTP 端点，支持断线重连，可升级为 SSE 流式推送 |
| **HTTP+SSE** | 远程服务（旧版） | 逐步被 Streamable HTTP 取代 |

**协议消息完全一样**，区别只是搬运方式不同：

```text
stdio 模式：
  Client 写 stdin  →  {"jsonrpc":"2.0","method":"tools/list",...}
  Server 写 stdout →  {"jsonrpc":"2.0","result":{...}}

HTTP 模式：
  Client POST /mcp →  {"jsonrpc":"2.0","method":"tools/list",...}
  Server 响应 200  →  {"jsonrpc":"2.0","result":{...}}
```

从配置上也能看出两种模式的区别：

```json
// stdio 模式——配置的是启动命令
{"mcpServers": {"local": {"command": "uv", "args": ["run", "server.py"]}}}

// HTTP 模式——配置的是 URL
{"mcpServers": {"remote": {"url": "http://localhost:8000/mcp"}}}
```

选择建议：

- 本地工具（IDE 插件、本地脚本）→ **stdio**
- 远程服务、需要多客户端访问 → **Streamable HTTP**

---

## 九、总结

### MCP 的本质

MCP 本质上就是一套 **JSON-RPC 消息契约**：

1. **规定了有哪些方法**：`initialize`、`tools/list`、`tools/call` 等
2. **规定了每个方法的入参和返回格式**：JSON Schema 定义
3. **规定了交互流程**：先握手，再发现，最后调用
4. **传输层只是搬运工**：stdio 或 HTTP，协议消息不变

### 一张图看懂全貌

![MCP 协议全貌](https://int32-blog.oss-cn-beijing.aliyuncs.com/04-protocol-overview-task1-1.jpg)

### 关键理解

- **MCP Server 只有一个端点**，所有操作靠 `method` 字段区分，不靠 URL 路径
- **AI 不直接连 Server**，MCP Client 是中间桥梁，负责发现工具、翻译格式、转发调用
- **capabilities 是能力声明**，`"tools": {}` 表示"我支持 tools"而不是"我没有工具"
- **SDK 只是封装**，底层做的事情和手写的完全一样——理解了协议，用什么语言实现都不难

---

## 参考资源

- [MCP 官方规范与文档](https://modelcontextprotocol.io)
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP 服务器目录](https://mcp.so)

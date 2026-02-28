---
layout: post
title: "OAuth 2.0 完全指南：从「用 GitHub 登录」到自己实现一个授权服务器"
description: "从概念到实现，把 OAuth 2.0 的完整知识体系过一遍：它解决什么问题、流程怎么跑、作为接入方怎么用、作为提供方怎么实现，以及 JWT、分布式、安全这些相关话题，附完整 Go 代码。"
categories: ["技术"]
tags: ["OAuth", "安全", "Go", "后端", "认证授权"]
---

* Kramdown table of contents
{:toc .toc}

# OAuth 2.0 完全指南：从「用 GitHub 登录」到自己实现一个授权服务器

你一定见过这类按钮——「用 Google 登录」、「用 GitHub 登录」、「微信授权登录」。点进去跳一个页面，同意一下，就登录成功了，全程没有输过密码。

这背后用的就是 OAuth 2.0。

这篇文章从概念出发，把 OAuth 的完整知识体系过一遍：它解决什么问题、流程是怎么跑的、作为接入方怎么用、作为提供方怎么实现，以及 JWT、分布式、安全这些相关话题。

---

## 一、OAuth 解决什么问题

在 OAuth 出现之前，如果一个第三方应用想访问你在某平台的数据，通常的做法是把账号密码直接交给它。

这很危险：

- 第三方拿到密码就等于拥有你账号的全部权限
- 你没办法只授权「读」而不授权「写」
- 想撤销授权只能改密码，影响所有地方

OAuth 的核心思路是：**不交密码，交一张有限权限的「通行证」（token）**。

这张通行证：
- 只能访问你指定范围的资源
- 有有效期，过期自动失效
- 可以随时撤销，不影响密码

---

## 二、四个核心角色

OAuth 2.0 里有四个角色，理解它们是理解整个流程的基础：

| 角色 | 说明 | 例子 |
|------|------|------|
| 资源拥有者（Resource Owner） | 就是用户，数据的主人 | 你 |
| 客户端（Client） | 想访问你数据的第三方应用 | 某健身 App |
| 授权服务器（Authorization Server） | 负责验证身份、颁发 token | Google 的登录服务 |
| 资源服务器（Resource Server） | 真正存放数据的地方 | Google Calendar API |

实际场景里，授权服务器和资源服务器往往是同一家公司的不同服务，甚至同一个服务。

---

## 三、OAuth 不是认证，是授权

这是很多人容易混淆的一点。

**授权（Authorization）**：你能做什么  
**认证（Authentication）**：你是谁

OAuth 2.0 本身只解决授权问题，它告诉第三方「这个用户允许你访问他的 xx 数据」，但不直接告诉你「这个用户是谁」。

要做登录认证，需要在 OAuth 上面加一层 **OpenID Connect（OIDC）**，它扩展了 OAuth，额外返回一个 `id_token`，里面包含用户的身份信息。

我们平时说的「用 GitHub 登录」，其实是 OAuth + OIDC 一起在工作，只是大家习惯统称为 OAuth 登录。

---

## 四、四种授权模式

OAuth 2.0 规范定义了四种授权模式，适用于不同场景：

**授权码模式（Authorization Code）**  
最常用、最安全的模式。有后端服务器的 Web 应用都用这个，token 在服务器之间交换，不暴露给浏览器。下文重点讲这个。

**客户端模式（Client Credentials）**  
没有用户参与，是服务之间直接调用用的。比如订单服务调库存服务，不代表任何用户，直接用 client_id + client_secret 换 token。微服务架构里用得很多。

**简化模式（Implicit）**  
专门给纯前端应用设计，直接把 token 放在 URL 里返回。因为 token 直接暴露在 URL 中不安全，现在已基本废弃。

**密码模式（Resource Owner Password）**  
用户直接把账号密码给第三方应用，第三方再去换 token。违背了 OAuth 的设计初衷，现在也基本废弃，只在非常可信的内部系统偶尔使用。

实际开发中，**有用户的场景用授权码模式，服务间调用用客户端模式**，其他两种基本不用考虑。

---

## 五、授权码模式完整流程

<div style="font-family:-apple-system,sans-serif;background:#f8f9fa;border-radius:12px;padding:24px;margin:24px 0;">
<style>
.ofd-actors{display:flex;justify-content:space-between;margin-bottom:16px}
.ofd-actor{width:160px;text-align:center;padding:10px;background:#fff;border-radius:8px;font-weight:bold;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.08)}
.ofd-actor.user{border-top:3px solid #4CAF50;color:#2e7d32}
.ofd-actor.client{border-top:3px solid #2196F3;color:#1565c0}
.ofd-actor.server{border-top:3px solid #9C27B0;color:#6a1b9a}
.ofd-section-title{font-size:11px;font-weight:bold;color:#999;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;padding-left:4px}
.ofd-row{display:flex;align-items:center;margin:6px 0;min-height:48px}
.ofd-box{width:160px;min-height:36px;padding:6px 10px;border-radius:6px;font-size:12px;text-align:center;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;line-height:1.4}
.ofd-box.user{background:#E8F5E9;border:1.5px solid #4CAF50;color:#2e7d32}
.ofd-box.client{background:#E3F2FD;border:1.5px solid #2196F3;color:#1565c0}
.ofd-box.server{background:#F3E5F5;border:1.5px solid #9C27B0;color:#6a1b9a}
.ofd-box.empty{background:transparent;border:none;width:160px}
.ofd-arrow{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 8px}
.ofd-arrow-line{width:100%;height:2px;background:#bbb;position:relative;margin-bottom:4px}
.ofd-arrow-line.right::after{content:'▶';position:absolute;right:-6px;top:-8px;color:#bbb;font-size:11px}
.ofd-arrow-line.left::before{content:'◀';position:absolute;left:-6px;top:-8px;color:#bbb;font-size:11px}
.ofd-arrow-label{font-size:11px;color:#888;white-space:nowrap;text-align:center}
.ofd-divider{border:none;border-top:1px dashed #ddd;margin:10px 0}
.ofd-note{background:#fff8e1;border-left:3px solid #FFC107;border-radius:4px;padding:8px 12px;font-size:12px;color:#666;margin-top:12px}
</style>

<div class="ofd-actors">
  <div class="ofd-actor user">👤 用户<br><small>资源拥有者</small></div>
  <div class="ofd-actor client">🖥️ B系统<br><small>接入方</small></div>
  <div class="ofd-actor server">🐙 GitHub<br><small>授权方</small></div>
</div>

<div><div class="ofd-section-title">① 发起登录</div>
<div class="ofd-row">
  <div class="ofd-box user">点击「用 GitHub 登录」</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line right"></div><div class="ofd-arrow-label">GET /login</div></div>
  <div class="ofd-box client">生成随机 state<br>存入 session</div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box empty"></div>
</div>
<div class="ofd-row">
  <div class="ofd-box user">浏览器跳转到<br>GitHub 授权页</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line left"></div><div class="ofd-arrow-label">302 重定向（带 state）</div></div>
  <div class="ofd-box client">生成授权 URL</div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box empty"></div>
</div></div>

<hr class="ofd-divider">

<div><div class="ofd-section-title">② 用户在 GitHub 授权</div>
<div class="ofd-row">
  <div class="ofd-box user">输入密码<br>点击「授权」</div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box empty"></div>
  <div class="ofd-arrow"><div class="ofd-arrow-line right"></div><div class="ofd-arrow-label">用户授权操作</div></div>
  <div class="ofd-box server">验证身份<br>记录授权范围</div>
</div>
<div class="ofd-row">
  <div class="ofd-box user">浏览器被重定向<br>回 B系统</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line right"></div><div class="ofd-arrow-label">带着 code + state</div></div>
  <div class="ofd-box client">GET /callback<br>验证 state ✅</div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box empty"></div>
</div></div>

<hr class="ofd-divider">

<div><div class="ofd-section-title">③ 后端换取 Token（用户不可见）</div>
<div class="ofd-row">
  <div class="ofd-box empty"></div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box client">用 code 换 token</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line right"></div><div class="ofd-arrow-label">POST /oauth/token</div></div>
  <div class="ofd-box server">验证 code<br>生成 token</div>
</div>
<div class="ofd-row">
  <div class="ofd-box empty"></div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box client">存储 AccessToken<br>+ RefreshToken</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line left"></div><div class="ofd-arrow-label">返回 token 数据</div></div>
  <div class="ofd-box server">返回 AccessToken<br>+ RefreshToken</div>
</div></div>

<hr class="ofd-divider">

<div><div class="ofd-section-title">④ 获取用户信息，完成登录</div>
<div class="ofd-row">
  <div class="ofd-box empty"></div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box client">带 token<br>请求用户信息</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line right"></div><div class="ofd-arrow-label">GET /user（Bearer token）</div></div>
  <div class="ofd-box server">验证 token<br>返回用户数据</div>
</div>
<div class="ofd-row">
  <div class="ofd-box user">登录成功 🎉</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line left"></div><div class="ofd-arrow-label">设置 Session/Cookie</div></div>
  <div class="ofd-box client">新用户→自动注册<br>老用户→直接登录</div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box empty"></div>
</div></div>

<hr class="ofd-divider">

<div><div class="ofd-section-title">⑤ Token 过期后自动刷新（静默）</div>
<div class="ofd-row">
  <div class="ofd-box empty"></div>
  <div class="ofd-arrow" style="flex:0;width:20px"></div>
  <div class="ofd-box client">AccessToken 过期<br>用 RefreshToken 换新的</div>
  <div class="ofd-arrow"><div class="ofd-arrow-line right"></div><div class="ofd-arrow-label">POST /oauth/token（refresh）</div></div>
  <div class="ofd-box server">返回新 AccessToken</div>
</div></div>

<div class="ofd-note">💡 <strong>关键点：</strong>用户的密码只在用户和 GitHub 之间流转，B系统永远看不到。code 是一次性的，用完立刻失效。</div>
</div>

### state 防 CSRF 攻击

流程里有个容易被忽略但很重要的细节：`state` 参数。

**攻击场景：** 攻击者用自己的 GitHub 账号走到一半，拿到回调链接（带着他自己的 code），停下来把这个链接发给你。你点了之后，你的浏览器拿着攻击者的 code 去换 token，结果你的 B系统账号绑定了攻击者的 GitHub 账号，攻击者之后用自己的 GitHub 就能登进你的账号。

**state 怎么防：** 你发起登录时，B系统生成随机字符串 state，存在你的 session 里，同时带到跳转链接里。GitHub 回调时原样带回 state，B系统对比 session 里存的，对不上就拒绝。攻击者的链接里带的是他自己 session 的 state，跟你的对不上，攻击失败。

本质是一个 `sessionID -> state` 的 map，确保回调是本次登录发起的，不是别人伪造的。

---

## 六、Token 详解

### AccessToken 和 RefreshToken

换 token 接口会同时返回两个 token：

- **AccessToken**：真正用来访问资源的，有效期短，一般几十分钟到几小时
- **RefreshToken**：用来在 AccessToken 过期后换新的，有效期长，一般几天到几个月

有效期由授权方决定，接入方控制不了。不同平台策略差异很大，GitHub 默认 AccessToken 永不过期，Google 则是一小时过期。

### JWT Token

token 有两种实现方式：

**随机字符串 token**（传统方式）：token 本身不携带信息，服务器每次验证都要去数据库或 Redis 查「这个 token 对应哪个用户」。

**JWT（JSON Web Token）**：token 本身携带信息，服务器不需要查存储，直接解码验证。在分布式系统里优势明显，每台服务器只需要有密钥就能验证。

JWT 由三段组成，用 `.` 分隔：

```
Header.Payload.Signature
```

解码后：

```json
// Header：算法信息
{ "alg": "HS256", "typ": "JWT" }

// Payload：实际数据
{
  "userId": "user001",
  "scope": "user:email",
  "exp": 1709280000
}

// Signature：用密钥对前两段做签名，防篡改
```

**重要：Header 和 Payload 只是 Base64URL 编码，不是加密，任何人都能解码看到内容。** JWT 保证的是「不可篡改」，不是「内容保密」。所以 JWT 里绝对不能放密码、手机号这类敏感信息。

JWT 最大的缺点是无法主动失效，只能等过期。想撤销需要维护黑名单，但这样又引入了存储查询，优势就小了。

---

## 七、作为接入方：用 Go 接入 GitHub OAuth

Go 官方维护了 `golang.org/x/oauth2` 这个扩展库，封装了 OAuth 流程里所有繁琐的部分：生成授权链接、用 code 换 token、自动刷新 token、构造带认证的 HTTP 请求。

```go
package main

import (
    "context"
    "crypto/rand"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"

    "golang.org/x/oauth2"
    "golang.org/x/oauth2/github"
)

var oauthConfig = &oauth2.Config{
    ClientID:     "你的_GITHUB_CLIENT_ID",
    ClientSecret: "你的_GITHUB_CLIENT_SECRET",
    RedirectURL:  "http://localhost:8080/callback",
    Scopes:       []string{"user:email"}, // 查 GitHub 文档获取
    Endpoint:     github.Endpoint,        // SDK 内置，不用自己填 URL
}

var stateStore = struct {
    sync.Mutex
    m map[string]bool
}{m: make(map[string]bool)}

var tokenStore = struct {
    sync.Mutex
    m map[string]*oauth2.Token
}{m: make(map[string]*oauth2.Token)}

type User struct {
    ID     string `json:"id"`
    Login  string `json:"login"`
    Email  string `json:"email"`
    Avatar string `json:"avatar_url"`
}

var userStore = struct {
    sync.Mutex
    m map[string]*User
}{m: make(map[string]*User)}

func main() {
    http.HandleFunc("/login", handleLogin)
    http.HandleFunc("/callback", handleCallback)
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
    state := generateState()
    stateStore.Lock()
    stateStore.m[state] = true
    stateStore.Unlock()
    url := oauthConfig.AuthCodeURL(state)
    http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func handleCallback(w http.ResponseWriter, r *http.Request) {
    state := r.URL.Query().Get("state")
    stateStore.Lock()
    valid := stateStore.m[state]
    delete(stateStore.m, state)
    stateStore.Unlock()
    if !valid {
        http.Error(w, "invalid state", http.StatusBadRequest)
        return
    }

    code := r.URL.Query().Get("code")
    token, err := oauthConfig.Exchange(context.Background(), code)
    if err != nil {
        http.Error(w, "换取 token 失败", http.StatusInternalServerError)
        return
    }

    // SDK 创建自动带 token 的 HTTP client
    client := oauthConfig.Client(context.Background(), token)
    resp, _ := client.Get("https://api.github.com/user")
    defer resp.Body.Close()

    var user User
    json.NewDecoder(resp.Body).Decode(&user)

    userStore.Lock()
    if _, exists := userStore.m[user.ID]; !exists {
        fmt.Printf("新用户注册: %s\n", user.Login)
    }
    userStore.m[user.ID] = &user
    userStore.Unlock()

    tokenStore.Lock()
    tokenStore.m[user.ID] = token // token 结构体里含 AccessToken、RefreshToken、Expiry
    tokenStore.Unlock()
}

func generateState() string {
    b := make([]byte, 16)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)
}
```

### Endpoint 和 Scopes 从哪来

`Endpoint` 里是两个固定 URL，SDK 对主流平台都内置好了：`github.Endpoint`、`google.Endpoint` 直接用。如果是小众平台没有内置，自己查文档填：

```go
var myEndpoint = oauth2.Endpoint{
    AuthURL:  "https://xxx.com/oauth/authorize",
    TokenURL: "https://xxx.com/oauth/token",
}
```

`Scopes` 是权限范围，每个平台的字符串定义不一样，必须查对方文档。没有统一标准。

### Token 自动刷新

`oauthConfig.Client()` 返回的 HTTP client 每次发请求前会自动检查 AccessToken 是否过期，过期了自动用 RefreshToken 换新的。但刷新完 SDK 不会帮你存回数据库，需要自己实现 `TokenSource` 接口：

```go
type myTokenSource struct {
    userID      string
    tokenSource oauth2.TokenSource
}

func (s *myTokenSource) Token() (*oauth2.Token, error) {
    token, err := s.tokenSource.Token()
    if err != nil {
        return nil, err
    }
    // 刷新后存回数据库
    tokenStore.Lock()
    tokenStore.m[s.userID] = token
    tokenStore.Unlock()
    return token, nil
}
```

---

## 八、OAuth 规范接口标准

如果你要自己实现授权服务器，必须遵循 OAuth 2.0 规范（RFC 6749）。规范规定了接口的参数名和返回格式，SDK 按照这个标准实现，所以只要你符合规范，任何语言的 SDK 都能对接你。

### 授权接口

```
GET /oauth/authorize
  ?response_type=code     # 固定值
  &client_id=xxx
  &redirect_uri=xxx
  &scope=user:email
  &state=abc123
```

用户同意后跳转回去：

```
302 -> redirect_uri?code=一次性授权码&state=abc123
```

### 换 Token 接口

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=一次性授权码
&client_id=xxx
&client_secret=xxx
&redirect_uri=xxx
```

返回格式规范规定必须是：

```json
{
  "access_token": "xxxxxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "xxxxxxx",
  "scope": "user:email"
}
```

### 刷新 Token 接口

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=xxxxxxx
&client_id=xxx
&client_secret=xxx
```

### 用户信息接口

这个接口规范没有强制规定，由你自己定义：

```
GET /api/user
Authorization: Bearer access_token
```

**规范固定的：** 参数名（`grant_type`、`code`、`client_id` 等）、返回字段名（`access_token`、`expires_in` 等）。  
**你自己定的：** 接口地址、token 有效期、权限范围的名称、用户信息接口的返回结构。

---

## 九、作为提供方：用 Go 实现授权服务器

提供方没有像接入方那样开箱即用的通用 SDK，因为涉及太多业务逻辑。但有框架级别的库帮你省掉规范层的工作，Go 里常用的是 `go-oauth2/oauth2`。

### 整体架构

```
接入方（B系统）
    ↓ ↑
━━━━━━━━━━━━━━━━━━━━━━━━━━━
          对外接口层
  授权页 | 换token | 刷新token | 用户信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━
          内部核心模块
  应用管理 | 授权管理 | token管理 | code管理
━━━━━━━━━━━━━━━━━━━━━━━━━━━
          基础设施
  用户系统 | MySQL | Redis
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 实现代码

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"

    "github.com/go-oauth2/oauth2/v4/errors"
    "github.com/go-oauth2/oauth2/v4/generates"
    "github.com/go-oauth2/oauth2/v4/manage"
    "github.com/go-oauth2/oauth2/v4/models"
    "github.com/go-oauth2/oauth2/v4/server"
    "github.com/go-oauth2/oauth2/v4/store"
)

var users = map[string]*User{
    "user001": {ID: "user001", Name: "张三", Email: "zhangsan@example.com", Password: "123456"},
}

type User struct{ ID, Name, Email, Password string }

var sessions = map[string]string{} // sessionID -> userID

func main() {
    manager := manage.NewDefaultManager()
    manager.SetAuthorizeCodeTokenCfg(&manage.Config{
        AccessTokenExp:    2 * time.Hour,
        RefreshTokenExp:   7 * 24 * time.Hour,
        IsGenerateRefresh: true,
    })

    // token 存储，换成 Redis 即支持分布式
    manager.MustTokenStorage(store.NewMemoryTokenStore())
    manager.MapAccessGenerate(generates.NewAccessGenerate())

    clientStore := store.NewClientStore()
    clientStore.Set("my_client_id", &models.Client{
        ID:     "my_client_id",
        Secret: "my_client_secret",
        Domain: "http://localhost:9090",
    })
    manager.MapClientStorage(clientStore)

    srv := server.NewDefaultServer(manager)

    // 关键钩子：框架来问你「这个用户登录了吗」，你来决定怎么判断
    srv.SetUserAuthorizationHandler(func(w http.ResponseWriter, r *http.Request) (string, error) {
        cookie, err := r.Cookie("session_id")
        if err != nil {
            http.Redirect(w, r, "/login?redirect="+r.URL.String(), http.StatusFound)
            return "", errors.ErrAccessDenied
        }
        userID, ok := sessions[cookie.Value]
        if !ok {
            http.Redirect(w, r, "/login?redirect="+r.URL.String(), http.StatusFound)
            return "", errors.ErrAccessDenied
        }
        return userID, nil
    })

    http.HandleFunc("/login", handleLogin)

    // 框架帮你处理参数解析、code 生成、跳转
    http.HandleFunc("/oauth/authorize", func(w http.ResponseWriter, r *http.Request) {
        srv.HandleAuthorizeRequest(w, r)
    })

    // 框架帮你验证 code、生成 token、返回规范格式
    http.HandleFunc("/oauth/token", func(w http.ResponseWriter, r *http.Request) {
        srv.HandleTokenRequest(w, r)
    })

    // 用户信息接口，自己定义
    http.HandleFunc("/api/user", func(w http.ResponseWriter, r *http.Request) {
        tokenInfo, err := srv.ValidationBearerToken(r)
        if err != nil {
            http.Error(w, "token 无效", http.StatusUnauthorized)
            return
        }
        user := users[tokenInfo.GetUserID()]
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "id": user.ID, "name": user.Name, "email": user.Email,
        })
    })

    log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
    redirect := r.URL.Query().Get("redirect")
    if r.Method == http.MethodGet {
        fmt.Fprintf(w, `<form method="POST" action="/login?redirect=%s">
            <input name="username" placeholder="user001">
            <input name="password" type="password">
            <button>登录</button></form>`, redirect)
        return
    }
    user, ok := users[r.FormValue("username")]
    if !ok || user.Password != r.FormValue("password") {
        http.Error(w, "用户名或密码错误", http.StatusUnauthorized)
        return
    }
    sessionID := fmt.Sprintf("sess_%s_%d", user.ID, time.Now().UnixNano())
    sessions[sessionID] = user.ID
    http.SetCookie(w, &http.Cookie{Name: "session_id", Value: sessionID, Path: "/"})
    if redirect != "" {
        http.Redirect(w, r, redirect, http.StatusFound)
        return
    }
    fmt.Fprintf(w, "登录成功！欢迎 %s", user.Name)
}
```

**框架帮你做的：** 规范接口的参数解析、code 生成、token 生成、返回规范 JSON 格式。

**你自己要做的：** 用户登录逻辑（`SetUserAuthorizationHandler` 钩子）、用户信息接口、应用注册管理后台、存储层适配。

### HTTP 框架兼容性

`go-oauth2/oauth2` 基于标准库 `net/http`，Gin、Echo、Chi 这些框架底层都是标准库封装，可以直接传：

```go
// Gin 示例
r.GET("/oauth/authorize", func(c *gin.Context) {
    srv.HandleAuthorizeRequest(c.Writer, c.Request)
})
```

**Fiber 不行**，它用的是 `fasthttp` 而非标准库，类型不兼容，避免在这个场景下使用。

---

## 十、分布式环境下的注意事项

demo 里用的是内存存储，分布式环境下会出问题：用户在服务器 A 完成授权，token 存在 A 的内存里，下次请求打到服务器 B，验证失败。

解决方案是把存储换成 Redis：

```go
import oredis "github.com/go-oauth2/redis/v4"

manager.MustTokenStorage(
    oredis.NewRedisStore(&redis.Options{
        Addr: "localhost:6379",
    }),
)
```

同样，session 也要换成 Redis 存储。框架逻辑本身没问题，只需要把所有内存存储替换成集中式存储，分布式就完全支持了。

---

## 小结

| | 接入方（B系统） | 提供方（A系统） |
|--|--|--|
| 主要工作 | 配置 + 处理回调 + 存 token | 实现规范接口 + 用户系统集成 |
| Go 库 | `golang.org/x/oauth2`（官方） | `go-oauth2/oauth2`（社区） |
| SDK 覆盖度 | ~90%，基本开箱即用 | ~40%，规范层封装，业务自己来 |
| 分布式支持 | 存储换 Redis 即可 | 存储换 Redis 即可 |

OAuth 2.0 的设计哲学是：**密码永远只在用户和授权方之间，第三方只拿有限权限的 token**。这个核心思路理解了，其他的都是实现细节。
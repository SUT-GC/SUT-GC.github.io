---
layout: post
title: "Go 学习笔记 - gin"
description: "Go gin 相关的知识都整理在这里面"
categories: [学习]
tags: [golang]
---

* Kramdown table of contents
{:toc .toc}

# Go 学习笔记 - gin
## 1 介绍
Gin 是 golang 的一个微框架，对于golang而言，web框架的依赖，远比java，python 等小，自身的 `net/http`  已经足够简单，性能也非常不错。而借助 gin 可以节省很多时间，因为做了很多常用的封装。

## 2 安装
1. 需要 go 版本 1.10+, 通过 `go get -u github.com/gin-gonic/gin` 安装gin。            
2. 将gin导入代码 `import “github.com/gin-gonic/gin”`           
3. 导入 net/http 包 `import net/http` ，因为需要里面的常量 如 `http.StatusOK`             

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

func main() {
  r := gin.Default()
  r.GET("/helloworld", func(context *gin.Context) {
    context.String(http.StatusOK, "hello %s", "gc")
  })

  r.Run(":8081")
}
```

## 3. 路由
1. Gin 的路由可以是最基本的输出字符串 `context.String(code, str, value)`             
2. 可以获取API参数            

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

func main() {
  r := gin.Default()
  r.GET("/helloworld/:name/*action", func(context *gin.Context) {
    name := context.Param("name")
    action := context.Param("action")
    context.String(http.StatusOK, "hello %s, action:%s", name, action)
  })

  r.Run(":8081")
}

// URL: http://localhost:8081/helloworld/gc/hello/world
// TEXT: hello gc, action:/hello/world
```

3. 可以使用 QueryString            

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

func main() {
  r := gin.Default()
  r.GET("/helloworld", func(context *gin.Context) {
    name := context.DefaultQuery("name", "gc")
    context.String(http.StatusOK, "hello %s", name)
  })

  r.Run(":8081")
}

// URL: http://localhost:8081/helloworld?name=%E5%93%88%E5%93%88
// TEXT: hello 哈哈
```

4. 可以使用form表单            

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <form action="http://localhost:8081/form" method="post" action="application/x-www-form-urlencoded">
        用户名：<input type="text" name="username" placeholder="请输入你的用户名">  <br>
        密&nbsp;&nbsp;&nbsp;码：<input type="password" name="userpassword" placeholder="请输入你的密码">  <br>
        <input type="submit" value="提交">
    </form>
</body>
</html>
```

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

func main() {
  r := gin.Default()
  r.POST("/form", func(context *gin.Context) {
    username := context.PostForm("username")
    password := context.PostForm("userpassword")

    context.String(http.StatusOK, "username:%s, password:%s", username, password)
  })

  r.Run(":8081")
}
```

5. 可以上传单个文件            

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <form action="http://localhost:8080/upload" method="post" enctype="multipart/form-data">
          上传文件:<input type="file" name="file" >
          <input type="submit" value="提交">
    </form>
</body>
</html>
```

```go
package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    //限制上传最大尺寸
    r.MaxMultipartMemory = 8 << 20
    r.POST("/upload", func(c *gin.Context) {
        file, err := c.FormFile("file")
        if err != nil {
            c.String(500, "上传图片出错")
        }
        // c.JSON(200, gin.H{"message": file.Header.Context})
        c.SaveUploadedFile(file, file.Filename)
        c.String(http.StatusOK, file.Filename)
    })
    r.Run()
}
```

限制文件大小的demo            

```go
package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.POST("/upload", func(c *gin.Context) {
        _, headers, err := c.Request.FormFile("file")
        if err != nil {
            log.Printf("Error when try to get file: %v", err)
        }
        //headers.Size 获取文件大小
        if headers.Size > 1024*1024*2 {
            fmt.Println("文件太大了")
            return
        }
        //headers.Header.Get("Content-Type")获取上传文件的类型
        if headers.Header.Get("Content-Type") != "image/png" {
            fmt.Println("只允许上传png图片")
            return
        }
        c.SaveUploadedFile(headers, "./video/"+headers.Filename)
        c.String(http.StatusOK, headers.Filename)
    })
    r.Run()
}
```

6. 可以上传多个文件            

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <form action="http://localhost:8000/upload" method="post" enctype="multipart/form-data">
          上传文件:<input type="file" name="files" multiple>
          <input type="submit" value="提交">
    </form>
</body>
</html>
```

```go
package main

import (
   "github.com/gin-gonic/gin"
   "net/http"
   "fmt"
)

// gin的helloWorld

func main() {
   // 1.创建路由
   // 默认使用了2个中间件Logger(), Recovery()
   r := gin.Default()
   // 限制表单上传大小 8MB，默认为32MB
   r.MaxMultipartMemory = 8 << 20
   r.POST("/upload", func(c *gin.Context) {
      form, err := c.MultipartForm()
      if err != nil {
         c.String(http.StatusBadRequest, fmt.Sprintf("get err %s", err.Error()))
      }
      // 获取所有图片
      files := form.File["files"]
      // 遍历所有图片
      for _, file := range files {
         // 逐个存
         if err := c.SaveUploadedFile(file, file.Filename); err != nil {
            c.String(http.StatusBadRequest, fmt.Sprintf("upload err %s", err.Error()))
            return
         }
      }
      c.String(200, fmt.Sprintf("upload ok %d files", len(files)))
   })
   //默认端口号是8080
   r.Run(":8000")
}

```

7. Router Group 使用            

为了方便管理一些相同的url，可以将router打包            

```go
package main

import (
   "github.com/gin-gonic/gin"
   "fmt"
)

// gin的helloWorld

func main() {
   // 1.创建路由
   // 默认使用了2个中间件Logger(), Recovery()
   r := gin.Default()
   // 路由组1 ，处理GET请求
   v1 := r.Group("/v1")
   // {} 是书写规范
   {
      v1.GET("/login", login)
      v1.GET("submit", submit)
   }
   v2 := r.Group("/v2")
   {
      v2.POST("/login", login)
      v2.POST("/submit", submit)
   }
   r.Run(":8000")
}

func login(c *gin.Context) {
   name := c.DefaultQuery("name", "jack")
   c.String(200, fmt.Sprintf("hello %s\n", name))
}

func submit(c *gin.Context) {
   name := c.DefaultQuery("name", "lily")
   c.String(200, fmt.Sprintf("hello %s\n", name))
}
```

8. 路由拆分单独文件或包            

当项目的规模增大后就不太适合继续在项目的main.go文件中去实现路由注册相关逻辑了，我们会倾向于把路由部分的代码都拆分出来，形成一个单独的文件或包。            

我们在routers.go文件中定义并注册路由信息：            

```go
package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func helloHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "message": "Hello www.topgoer.com!",
    })
}

func setupRouter() *gin.Engine {
    r := gin.Default()
    r.GET("/topgoer", helloHandler)
    return r
}
```

在 `main` 中调用：            

```go
func main() {
    r := setupRouter()
    if err := r.Run(); err != nil {
        fmt.Println("startup service failed, err:%v\n", err)
    }
}
```

此时的目录结构:            

```text
gin_demo
├── go.mod
├── go.sum
├── main.go
└── routers.go
```

路由单独成包也可以:            

```text
gin_demo
├── go.mod
├── go.sum
├── main.go
└── routers
    └── routers.go
```

```go
package routers

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func helloHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "message": "Hello www.topgoer.com",
    })
}

// SetupRouter 配置路由信息
func SetupRouter() *gin.Engine {
    r := gin.Default()
    r.GET("/topgoer", helloHandler)
    return r
}
```

```go
package main

import (
    "fmt"
    "gin_demo/routers"
)

func main() {
    r := routers.SetupRouter()
    if err := r.Run(); err != nil {
        fmt.Println("startup service failed, err:%v\n", err)
    }
}
```

Main 函数也可以这样写：            

```go
func main() {
    r := gin.Default()
    routers.LoadBlog(r)
    routers.LoadShop(r)
    if err := r.Run(); err != nil {
        fmt.Println("startup service failed, err:%v\n", err)
    }
}
```

有时候项目规模实在太大，那么我们就更倾向于把业务拆分的更详细一些，例如把不同的业务代码拆分成不同的APP。            
因此我们在项目目录下单独定义一个app目录，用来存放我们不同业务线的代码文件，这样就很容易进行横向扩展。大致目录结构如下：            

```
gin_demo
├── app
│   ├── blog
│   │   ├── handler.go
│   │   └── router.go
│   └── shop
│       ├── handler.go
│       └── router.go
├── go.mod
├── go.sum
├── main.go
└── routers
    └── routers.go
```

## 4. gin 数据解析和绑定            
1. 客户端传入，后端接受并解析到结构体。            

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

type Login struct {
  // binding:"required"修饰的字段，若接收为空值，则报错，是必须字段
  Username string `json:"username" form:"username" xml:"username" bson:"username" binding:"required"`
  Password string `json:"password" form:"password" xml:"password" bson:"password" binding:"required"`
}

func main() {
  r := gin.Default()
  r.POST("/login", func(context *gin.Context) {
    var login Login

    err := context.ShouldBindJSON(&login)

    if err != nil {
      context.JSON(http.StatusBadRequest, gin.H{"msg": err.Error()})
      return
    }

    if login.Username != "root" || login.Password != "root" {
      context.JSON(http.StatusBadRequest, gin.H{"msg": "账号或者密码错误"})
      return
    }

    context.JSON(http.StatusOK, gin.H{"msg": "登陆成功"})
  })

  r.Run(":8081")
}
```

`1. BindJSON` 和 `2. ShouldBindJSON` 和 `3. ShouldBindWith` 的区别：1会在header中写入400状态码，2是不会写入400状态码，3 根据另一个参数绑定json            

使用Form绑定            

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

type Login struct {
  // binding:"required"修饰的字段，若接收为空值，则报错，是必须字段
  Username string `json:"username" form:"username" uri:"username" xml:"username" bson:"username" binding:"required"`
  Password string `json:"password" form:"password" uri:"password" xml:"password" bson:"password" binding:"required"`
}

func main() {
  r := gin.Default()
  r.POST("/login", func(context *gin.Context) {
    var login Login

    err := context.ShouldBind(&login)

    if err != nil {
      context.JSON(http.StatusBadRequest, gin.H{"msg": err.Error()})
      return
    }

    if login.Username != "root" || login.Password != "root" {
      context.JSON(http.StatusBadRequest, gin.H{"msg": "账号或者密码错误"})
      return
    }

    context.JSON(http.StatusOK, gin.H{"msg": "登陆成功"})
  })

  r.Run(":8081")
}
```

使用Uri            

```go
package main

import (
  "github.com/gin-gonic/gin"
  "net/http"
)

type Login struct {
  // binding:"required"修饰的字段，若接收为空值，则报错，是必须字段
  Username string `json:"username" form:"username" uri:"username" xml:"username" bson:"username" binding:"required"`
  Password string `json:"password" form:"password" uri:"password" xml:"password" bson:"password" binding:"required"`
}

func main() {
  r := gin.Default()
  r.POST("/login/:username/:password", func(context *gin.Context) {
    var login Login

    err := context.ShouldBindUri(&login)

    if err != nil {
      context.JSON(http.StatusBadRequest, gin.H{"msg": err.Error()})
      return
    }

    if login.Username != "root" || login.Password != "root" {
      context.JSON(http.StatusBadRequest, gin.H{"msg": "账号或者密码错误"})
      return
    }

    context.JSON(http.StatusOK, gin.H{"msg": "登陆成功"})
  })

  r.Run(":8081")
}
```

## 5. gin 渲染            
1. 各种数据格式的响应，支持：json、结构体、XML、YAML类似于java的properties、ProtoBuf            

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gin-gonic/gin/testdata/protoexample"
)

// 多种响应方式
func main() {
    // 1.创建路由
    // 默认使用了2个中间件Logger(), Recovery()
    r := gin.Default()
    // 1.json
    r.GET("/someJSON", func(c *gin.Context) {
        c.JSON(200, gin.H{"message": "someJSON", "status": 200})
    })
    // 2. 结构体响应
    r.GET("/someStruct", func(c *gin.Context) {
        var msg struct {
            Name    string
            Message string
            Number  int
        }
        msg.Name = "root"
        msg.Message = "message"
        msg.Number = 123
        c.JSON(200, msg)
    })
    // 3.XML
    r.GET("/someXML", func(c *gin.Context) {
        c.XML(200, gin.H{"message": "abc"})
    })
    // 4.YAML响应
    r.GET("/someYAML", func(c *gin.Context) {
        c.YAML(200, gin.H{"name": "zhangsan"})
    })
    // 5.protobuf格式,谷歌开发的高效存储读取的工具
    // 数组？切片？如果自己构建一个传输格式，应该是什么格式？
    r.GET("/someProtoBuf", func(c *gin.Context) {
        reps := []int64{int64(1), int64(2)}
        // 定义数据
        label := "label"
        // 传protobuf格式数据
        data := &protoexample.Test{
            Label: &label,
            Reps:  reps,
        }
        c.ProtoBuf(200, data)
    })

    r.Run(":8000")
}
```

2. HTML 模版渲染            

* gin支持加载HTML模板, 然后根据模板参数进行配置并返回相应的数据，本质上就是字符串替换            
* LoadHTMLGlob()方法可以加载模板文件            

后端代码：            

```go
package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.LoadHTMLGlob("tem/*")
    r.GET("/index", func(c *gin.Context) {
        c.HTML(http.StatusOK, "index.html", gin.H{"title": "我是测试", "ce": "123456"})
    })
    r.Run()
}
```

Html 模版代码：            

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{.title}}</title>
</head>
    <body>
        fgkjdskjdsh{{.ce}}
    </body>
</html>
```

目录结构：            

```
gin_demo
├── main.go
├── go.sum
└── tem
    └── index.html
```

如果想要进行头尾分离，就是下面的写法：            

```
gin_demo
├── main.go
├── go.sum
└── tem
    └── public
        └── footer.html
        └── header.html
    └── user
        └── index.html
```

* `user/index.html` 文件代码：            

```html
\{\{ define "user/index.html" }}

\{\{template "public/header" .}}
        fgkjdskjdsh{{.address}}
\{\{template "public/footer" .}}

\{\{ end }}
```

* `public/header.html` 文件代码            

```html
\{\{define "public/header"}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{.title}}</title>
</head>
    <body>

\{\{end}}
```

* `public/footer.html` 文件代码            
            
```html
\{\{define "public/footer"}}
</body>
</html>
\{\{ end }}
```

如果你需要引入静态文件需要定义一个静态文件目录            

```
r.Static("/assets", "./assets")
```

3. 重定向            

```go
package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.GET("/index", func(c *gin.Context) {
        c.Redirect(http.StatusMovedPermanently, "http://www.5lmh.com")
    })
    r.Run()
}
```

4. 同步/异步            

* goroutine机制可以方便地实现异步处理            
* 另外，在启动新的goroutine时，不应该使用原始上下文，必须使用它的只读副本            

```go
package main

import (
    "log"
    "time"

    "github.com/gin-gonic/gin"
)

func main() {
    // 1.创建路由
    // 默认使用了2个中间件Logger(), Recovery()
    r := gin.Default()
    // 1.异步
    r.GET("/long_async", func(c *gin.Context) {
        // 需要搞一个副本
        copyContext := c.Copy()
        // 异步处理
        go func() {
            time.Sleep(3 * time.Second)
            log.Println("异步执行：" + copyContext.Request.URL.Path)
        }()
    })
    // 2.同步
    r.GET("/long_sync", func(c *gin.Context) {
        time.Sleep(3 * time.Second)
        log.Println("同步执行：" + c.Request.URL.Path)
    })

    r.Run(":8000")
}
```

## 6. 中间件            
1. 全局中间件              

```go
package main

import (
  "fmt"
  "github.com/gin-gonic/gin"
  "net/http"
  "time"
)

func MiddleWare() gin.HandlerFunc {
  return func(context *gin.Context) {
    start := time.Now()
    fmt.Printf("request start time %s\n", start.String())
  }
}

func main() {
  // // 默认使用了2个中间件Logger(), Recovery()
  r := gin.Default()
  r.Use(MiddleWare())

  r.GET("/helloworld", func(context *gin.Context) {
    context.String(http.StatusOK, "hello world")
  })

  r.Run(":8081")
}
```

2. 当前所有中间件运行，只是在函数执行前运行，如果想要在函数执行后运行，需要在中间件中手动调用`Next()` 函数。       

```go
package main

import (
  "fmt"
  "github.com/gin-gonic/gin"
  "net/http"
  "time"
)

func MiddleWare() gin.HandlerFunc {
  return func(context *gin.Context) {
    start := time.Now()
    fmt.Printf("request start time %s\n", start.String())
    context.Next()
    end := time.Now()
    fmt.Printf("request end time %s, delay %d ms \n", end.String(), end.Sub(start).Milliseconds())
  }
}

func main() {
  r := gin.Default()
  r.Use(MiddleWare())

  r.GET("/helloworld", func(context *gin.Context) {
    context.String(http.StatusOK, "hello world")
    time.Sleep(1 * time.Second)
  })

  r.Run(":8081")
}
```

3. 局部中间件。     

```go
package main

import (
  "fmt"
  "github.com/gin-gonic/gin"
  "net/http"
  "time"
)

func MiddleWare() gin.HandlerFunc {
  return func(context *gin.Context) {
    start := time.Now()
    fmt.Printf("request start time %s\n", start.String())
    context.Next()
    end := time.Now()
    fmt.Printf("request end time %s, delay %d ms \n", end.String(), end.Sub(start).Milliseconds())
  }
}

func main() {
  r := gin.Default()

  r.GET("/helloworld", MiddleWare(), func(context *gin.Context) {
    context.String(http.StatusOK, "hello world")
    time.Sleep(1 * time.Second)
  })

  r.Run(":8081")
}
```

> 可以看出，gin的handlerFunc 是链式函数，执行完前面的，然后调用c.Next 执行后面的，之后再回来执行前面的。         

4. 中间件推荐: [Github](https://github.com/gin-gonic/contrib/blob/master/README.md) 。        

## 6. 会话控制
http是无状态的协议，本身http请求是无法识别请求之间的关联性，而cookie 和 session 就是帮助解决这种无状态协议的关联性展示。        

状态由服务器产生，cookie是将状态保留在客户端，session 是将状态保留在服务端。       

服务端设置cookie的例子：        

```go
package main

import (
  "fmt"
  "github.com/gin-gonic/gin"
  "net/http"
)

func main() {
  r := gin.Default()

  r.GET("/helloworld", func(context *gin.Context) {
    cookie, err := context.Cookie("golang_test_cookie_v2")
    if err != nil {
      // 说明暂时还没有cookie
      cookie = "Cookie Not Set"
      fmt.Println(err)
      context.SetCookie("golang_test_cookie_v2", "hello i am gc", 60, "/", "localhost", false, true)
    }
    context.String(http.StatusOK, "cookie is :%s", cookie)
  })

  r.Run(":8081")
}
```

cookie本身有一些缺点：不安全，明文，增加贷款，可以被禁用，长度有上限。        

Go可使用`gorilla/sessions`  为自定义session后端提供cookie和文件系统session以及基础结构。主要功能是：         

* 简单的API：将其用作设置签名（以及可选的加密）cookie的简便方法。
* 内置的后端可将session存储在cookie或文件系统中。
* Flash消息：一直持续读取的session值。
* 切换session持久性（又称“记住我”）和设置其他属性的便捷方法。
* 旋转身份验证和加密密钥的机制。
* 每个请求有多个session，即使使用不同的后端也是如此。
* 自定义session后端的接口和基础结构：可以使用通用API检索并批量保存来自不同商店的session。

```go
package main

import (
    "fmt"
    "net/http"

    "github.com/gorilla/sessions"
)

// 初始化一个cookie存储对象
// something-very-secret应该是一个你自己的密匙，只要不被别人知道就行
var store = sessions.NewCookieStore([]byte("something-very-secret"))

func main() {
    http.HandleFunc("/save", SaveSession)
    http.HandleFunc("/get", GetSession)
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("HTTP server failed,err:", err)
        return
    }
}

func SaveSession(w http.ResponseWriter, r *http.Request) {
    // Get a session. We're ignoring the error resulted from decoding an
    // existing session: Get() always returns a session, even if empty.

    //　获取一个session对象，session-name是session的名字
    session, err := store.Get(r, "session-name")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // 在session中存储值
    session.Values["foo"] = "bar"
    session.Values[42] = 43
    // 保存更改
    session.Save(r, w)
}
func GetSession(w http.ResponseWriter, r *http.Request) {
    session, err := store.Get(r, "session-name")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    foo := session.Values["foo"]
    fmt.Println(foo)
}
```

## 7. 参数验证 
使用gin可以方便的进行参数验证，不用解析数据，简介很多。       

```go
package main

import (
    "fmt"
    "time"

    "github.com/gin-gonic/gin"
)

//Person ..
type Person struct {
    //不能为空并且大于10
    Age      int       `form:"age" binding:"required,gt=10"`
    Name     string    `form:"name" binding:"required"`
    Birthday time.Time `form:"birthday" time_format:"2006-01-02" time_utc:"1"`
}

func main() {
    r := gin.Default()
    r.GET("/5lmh", func(c *gin.Context) {
        var person Person
        if err := c.ShouldBind(&person); err != nil {
            c.String(500, fmt.Sprint(err))
            return
        }
        c.String(200, fmt.Sprintf("%#v", person))
    })
    r.Run()
}
```

当然，也可以自定义验证逻辑：        

```go
package main

import (
  "github.com/go-playground/validator/v10"
  "net/http"
  "time"

  "github.com/gin-gonic/gin"
  "github.com/gin-gonic/gin/binding"
)

// Booking 包含绑定和验证的数据。
type Booking struct {
  CheckIn  time.Time `json:"check_in" form:"check_in" binding:"required,bookabledate" time_format:"2006-01-02"`
  CheckOut time.Time `json:"check_out" form:"check_out" binding:"required,gtfield=CheckIn" time_format:"2006-01-02"`
}

var bookableDate validator.Func = func(fl validator.FieldLevel) bool {
  if date, ok := fl.Field().Interface().(time.Time); ok {
    today := time.Now()
    if today.Year() > date.Year() || today.YearDay() > date.YearDay() {
      return false
    }
  }
  return true
}

func main() {
  route := gin.Default()

  if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
    v.RegisterValidation("bookabledate", bookableDate)
  }

  route.GET("/bookable", getBookable)
  route.Run(":8081")
}

func getBookable(c *gin.Context) {
  var b Booking
  if err := c.ShouldBindWith(&b, binding.Query); err == nil {
    c.JSON(http.StatusOK, gin.H{"message": "Booking dates are valid!"})
  } else {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
  }
}
```

## 8. 其他
1. 日志文件。      

```go
package main

import (
    "io"
    "os"

    "github.com/gin-gonic/gin"
)

func main() {
    gin.DisableConsoleColor()

    // Logging to a file.
    f, _ := os.Create("gin.log")
    gin.DefaultWriter = io.MultiWriter(f)

    // 如果需要同时将日志写入文件和控制台，请使用以下代码。
    // gin.DefaultWriter = io.MultiWriter(f, os.Stdout)
    r := gin.Default()
    r.GET("/ping", func(c *gin.Context) {
        c.String(200, "pong")
    })
    r.Run()
}
```

2. Air 实时加载：Air能够实时监听项目项目的代码文件，在代码发生变更后自动重新编译并且执行，提高开发效率。                 

Air支持如下特性：
* 彩色日志输出
* 自定义构建
* 自定义忽略子目录
* 启动后支持监听新目录
* 更好的构建过程

安装方式` go get -u github.com/cosmtrek/air`          

使用Air：`cd /path/to/your_project`，`air -c .air.conf`.         

Air配置文件：         

```
# [Air](https://github.com/cosmtrek/air) TOML 格式的配置文件

# 工作目录
# 使用 . 或绝对路径，请注意 `tmp_dir` 目录必须在 `root` 目录下
root = "."
tmp_dir = "tmp"

[build]
# 只需要写你平常编译使用的shell命令。你也可以使用 `make`
cmd = "go build -o ./tmp/main ."
# 由`cmd`命令得到的二进制文件名
bin = "tmp/main"
# 自定义的二进制，可以添加额外的编译标识例如添加 GIN_MODE=release
full_bin = "APP_ENV=dev APP_USER=air ./tmp/main"
# 监听以下文件扩展名的文件.
include_ext = ["go", "tpl", "tmpl", "html"]
# 忽略这些文件扩展名或目录
exclude_dir = ["assets", "tmp", "vendor", "frontend/node_modules"]
# 监听以下指定目录的文件
include_dir = []
# 排除以下文件
exclude_file = []
# 如果文件更改过于频繁，则没有必要在每次更改时都触发构建。可以设置触发构建的延迟时间
delay = 1000 # ms
# 发生构建错误时，停止运行旧的二进制文件。
stop_on_error = true
# air的日志文件名，该日志文件放置在你的`tmp_dir`中
log = "air_errors.log"

[log]
# 显示日志时间
time = true

[color]
# 自定义每个部分显示的颜色。如果找不到颜色，使用原始的应用程序日志。
main = "magenta"
watcher = "cyan"
build = "yellow"
runner = "green"

[misc]
# 退出时删除tmp目录
clean_on_exit = true

```

3. 验证码：后端提供路由，在session里面写入键值对（k->v），把值写在图片上返回给浏览器；前端输入图片的值和后端记录的v进行比较，看是否通过。        

```go
package main

import (
  "bytes"
  "github.com/dchest/captcha"
  "github.com/gin-contrib/sessions"
  "github.com/gin-contrib/sessions/cookie"
  "github.com/gin-gonic/gin"
  "net/http"
  "time"
)

// 中间件，处理session
func Session(keyPairs string) gin.HandlerFunc {
  store := SessionConfig()
  return sessions.Sessions(keyPairs, store)
}
func SessionConfig() sessions.Store {
  sessionMaxAge := 3600
  sessionSecret := "topgoer"
  var store sessions.Store
  store = cookie.NewStore([]byte(sessionSecret))
  store.Options(sessions.Options{
    MaxAge: sessionMaxAge, //seconds
    Path:   "/",
  })
  return store
}

func Captcha(c *gin.Context, length ...int) {
  l := captcha.DefaultLen
  w, h := 107, 36
  if len(length) == 1 {
    l = length[0]
  }
  if len(length) == 2 {
    w = length[1]
  }
  if len(length) == 3 {
    h = length[2]
  }
  captchaId := captcha.NewLen(l)
  session := sessions.Default(c)
  session.Set("captcha", captchaId)
  _ = session.Save()
  _ = Serve(c.Writer, c.Request, captchaId, ".png", "zh", false, w, h)
}
func CaptchaVerify(c *gin.Context, code string) bool {
  session := sessions.Default(c)
  if captchaId := session.Get("captcha"); captchaId != nil {
    session.Delete("captcha")
    _ = session.Save()
    if captcha.VerifyString(captchaId.(string), code) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
func Serve(w http.ResponseWriter, r *http.Request, id, ext, lang string, download bool, width, height int) error {
  w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
  w.Header().Set("Pragma", "no-cache")
  w.Header().Set("Expires", "0")

  var content bytes.Buffer
  switch ext {
  case ".png":
    w.Header().Set("Content-Type", "image/png")
    _ = captcha.WriteImage(&content, id, width, height)
  case ".wav":
    w.Header().Set("Content-Type", "audio/x-wav")
    _ = captcha.WriteAudio(&content, id, lang)
  default:
    return captcha.ErrNotFound
  }

  if download {
    w.Header().Set("Content-Type", "application/octet-stream")
  }
  http.ServeContent(w, r, id+ext, time.Time{}, bytes.NewReader(content.Bytes()))
  return nil
}

func main() {
  router := gin.Default()
  router.LoadHTMLGlob("./*.html")
  router.Use(Session("topgoer"))
  router.GET("/captcha", func(c *gin.Context) {
    Captcha(c, 4)
  })
  router.GET("/", func(c *gin.Context) {
    c.HTML(http.StatusOK, "index.html", nil)
  })
  router.GET("/captcha/verify/:value", func(c *gin.Context) {
    value := c.Param("value")
    if CaptchaVerify(c, value) {
      c.JSON(http.StatusOK, gin.H{"status": 0, "msg": "success"})
    } else {
      c.JSON(http.StatusOK, gin.H{"status": 1, "msg": "failed"})
    }
  })
  router.Run(":8080")
}
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>www.topgoer.com验证码</title>
</head>
<body>
<img src="/captcha" onclick="this.src='/captcha?v='+Math.random()">
</body>
</html>
```

4. JWT: 如今有很多将身份验证内置到API中的方法，json web token 是其中一种，jwt不是每次请求时候发送验证码和用户名。要使用JWT，主要两部分：提供用户名和密码获取令牌，根据请求检查该令牌。          

```go
package main

import (
  "fmt"
  "net/http"
  "time"

  "github.com/dgrijalva/jwt-go"
  "github.com/gin-gonic/gin"
)

//自定义一个字符串
var jwtkey = []byte("www.topgoer.com")
var str string

type Claims struct {
  UserId uint
  jwt.StandardClaims
}

func main() {
  r := gin.Default()
  r.GET("/set", setting)
  r.GET("/get", getting)
  //监听端口默认为8080
  r.Run(":8080")
}

//颁发token
func setting(ctx *gin.Context) {
  expireTime := time.Now().Add(7 * 24 * time.Hour)
  claims := &Claims{
    UserId: 2,
    StandardClaims: jwt.StandardClaims{
      ExpiresAt: expireTime.Unix(), //过期时间
      IssuedAt:  time.Now().Unix(),
      Issuer:    "127.0.0.1",  // 签名颁发者
      Subject:   "user token", //签名主题
    },
  }
  token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
  // fmt.Println(token)
  tokenString, err := token.SignedString(jwtkey)
  if err != nil {
    fmt.Println(err)
  }
  str = tokenString
  ctx.JSON(200, gin.H{"token": tokenString})
}

//解析token
func getting(ctx *gin.Context) {
  tokenString := ctx.GetHeader("Authorization")
  //vcalidate token formate
  if tokenString == "" {
    ctx.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "权限不足"})
    ctx.Abort()
    return
  }

  token, claims, err := ParseToken(tokenString)
  if err != nil || !token.Valid {
    ctx.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "权限不足"})
    ctx.Abort()
    return
  }
  fmt.Println(111)
  fmt.Println(claims.UserId)
}

func ParseToken(tokenString string) (*jwt.Token, *Claims, error) {
  Claims := &Claims{}
  token, err := jwt.ParseWithClaims(tokenString, Claims, func(token *jwt.Token) (i interface{}, err error) {
    return jwtkey, nil
  })
  return token, Claims, err
}
```

5. Casbin是用于Golang项目的功能强大且高效的开源访问控制库。        

Casbin的作用：
* 以经典{subject, object, action}形式或您定义的自定义形式实施策略，同时支持允许和拒绝授权。
* 处理访问控制模型及其策略的存储。
* 管理角色用户映射和角色角色映射（RBAC中的角色层次结构）。
* 支持内置的超级用户，例如root或administrator。超级用户可以在没有显式权限的情况下执行任何操作。
* 多个内置运算符支持规则匹配。例如，keyMatch可以将资源键映射/foo/bar到模式/foo。     

Casbin不执行的操作：
* 身份验证（又名验证username以及password用户登录时）
* 管理用户或角色列表。我相信项目本身管理这些实体会更方便。用户通常具有其密码，而Casbin并非设计为密码容器。但是，Casbin存储RBAC方案的用户角色映射。

 在Casbin中，基于PERM元模型（策略，效果，请求，匹配器）将访问控制模型抽象为CONF文件。因此，切换或升级项目的授权机制就像修改配置一样简单。您可以通过组合可用的模型来定制自己的访问控制模型。例如，您可以在一个模型中同时获得RBAC角色和ABAC属性，并共享一组策略规则。            

Casbin中最基本，最简单的模型是ACL。ACL的CONF模型为：

```
＃请求定义
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act

```

ACL模型的示例策略如下：         

```
p, alice, data1, read
p, bob, data2, write
```


安装 ` go get -u github.com/casbin/casbin`.        

示例代码：          

```go
package main

import (
    "fmt"
    "log"

    "github.com/casbin/casbin"
    xormadapter "github.com/casbin/xorm-adapter"
    "github.com/gin-gonic/gin"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    // 要使用自己定义的数据库rbac_db,最后的true很重要.默认为false,使用缺省的数据库名casbin,不存在则创建
    a, err := xormadapter.NewAdapter("mysql", "root:root@tcp(127.0.0.1:3306)/goblog?charset=utf8", true)
    if err != nil {
        log.Printf("连接数据库错误: %v", err)
        return
    }
    e, err := casbin.NewEnforcer("./rbac_models.conf", a)
    if err != nil {
        log.Printf("初始化casbin错误: %v", err)
        return
    }
    //从DB加载策略
    e.LoadPolicy()

    //获取router路由对象
    r := gin.New()

    r.POST("/api/v1/add", func(c *gin.Context) {
        fmt.Println("增加Policy")
        if ok, _ := e.AddPolicy("admin", "/api/v1/hello", "GET"); !ok {
            fmt.Println("Policy已经存在")
        } else {
            fmt.Println("增加成功")
        }
    })
    //删除policy
    r.DELETE("/api/v1/delete", func(c *gin.Context) {
        fmt.Println("删除Policy")
        if ok, _ := e.RemovePolicy("admin", "/api/v1/hello", "GET"); !ok {
            fmt.Println("Policy不存在")
        } else {
            fmt.Println("删除成功")
        }
    })
    //获取policy
    r.GET("/api/v1/get", func(c *gin.Context) {
        fmt.Println("查看policy")
        list := e.GetPolicy()
        for _, vlist := range list {
            for _, v := range vlist {
                fmt.Printf("value: %s, ", v)
            }
        }
    })
    //使用自定义拦截器中间件
    r.Use(Authorize(e))
    //创建请求
    r.GET("/api/v1/hello", func(c *gin.Context) {
        fmt.Println("Hello 接收到GET请求..")
    })

    r.Run(":9000") //参数为空 默认监听8080端口
}

//拦截器
func Authorize(e *casbin.Enforcer) gin.HandlerFunc {

    return func(c *gin.Context) {

        //获取请求的URI
        obj := c.Request.URL.RequestURI()
        //获取请求方法
        act := c.Request.Method
        //获取用户的角色
        sub := "admin"

        //判断策略中是否存在
        if ok, _ := e.Enforce(sub, obj, act); ok {
            fmt.Println("恭喜您,权限验证通过")
            c.Next()
        } else {
            fmt.Println("很遗憾,权限验证没有通过")
            c.Abort()
        }
    }
}
```

rbac_models.conf里面的内容如下：         

```
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
```

配置链接数据库不需要手动创建数据库，系统自动创建casbin_rule表.      

## X. 参考文档            
[Gitbook](https://www.topgoer.com/)


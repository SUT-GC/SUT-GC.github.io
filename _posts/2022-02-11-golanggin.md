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
1. 需要 go 版本 1.10+, 通过 `go get -u github.com/gin-gonic/gin` 安装gin
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
{{ define "user/index.html" }}

{{template "public/header" .}}
        fgkjdskjdsh{{.address}}
{{template "public/footer" .}}

{{ end }}
```
* `public/header.html` 文件代码
```html
{{define "public/header"}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{.title}}</title>
</head>
    <body>

{{end}}
```
* `public/footer.html` 文件代码
```html
{{define "public/footer"}}
</body>
</html>
{{ end }}
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



## X. 参考文档
[Gitbook](https://www.topgoer.com/)


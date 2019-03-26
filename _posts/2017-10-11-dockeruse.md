---
layout: post
title: "Docker 基础"
description: "初次接触Docker， 记下一些学习中，使用中总结出来的东西"
categories: [学习]
tags: [docker]
---

* Kramdown table of contents
{:toc .toc}


# 什么是Docker     

👇网址能告诉你关于Docker的一切     

👉 [国内用户请点](https://www.baidu.com/)     
👉 [国外用户请点](https://www.google.com.hk/?gws_rd=cr,ssl)     

## 基本概念    

### Docker 镜像   

Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。      

镜像构建时，会一层层构建，前一层是后一层的基础。每一层构建完就不会再发生改变, 因此，在构建镜像的时候，需要额外小心，每一层尽量只包含该层需要添加的东西，任何额外的东西应该在该层构建结束前清理掉。     

### Docker 容器     

镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的类和实例一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。     

**注意，是容器可以被创建，启动，停止，删除，暂停**     

容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的 命名空间。因此容器可以拥有自己的 root 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间。容器内的进程是运行在一个隔离的环境里，使用起来，就好像是在一个独立于宿主的系统下操作一样。这种特性使得容器封装的应用比直接在宿主运行更加安全。    

前面讲过镜像使用的是分层存储，容器也是如此。每一个容器运行时，是以镜像为基础层，在其上创建一个当前容器的存储层，我们可以称这个为容器运行时读写而准备的存储层为容器存储层。容器存储层的生存周期和容器一样，容器消亡时，容器存储层也随之消亡。因此，任何保存于容器存储层的信息都会随容器删除而丢失。      

**⚠️ 容器删除或者退出，存储层也会丢失**

数据卷的生存周期独立于容器，容器消亡，数据卷不会消亡。因此，使用数据卷后，容器可以随意删除、重新 run，数据却不会丢失。    

### Docker 仓库    

镜像构建完成后，可以很容易的在当前宿主上运行，但是，如果需要在其它服务器上使用这个镜像，我们就需要一个集中的存储、分发镜像的服务, Docker 仓库就是这个用途， 就像Git仓库     

一个 Docker 仓库 中可以包含多个小仓库（Repository）；每个仓库可以包含多个标签（Tag）；每个标签对应一个镜像。就像gitlab是一个大仓库， 下面又有好多项目Project， 每个Project又有好多branch（分支）     

通常，一个仓库会包含同一个软件不同版本的镜像，而标签就常用于对应该软件的各个版本。我们可以通过 <仓库名>:<标签> 的格式来指定具体是这个软件哪个版本的镜像。如果不给出标签，将以 latest 作为默认标签。     

#### 加速器    

* [阿里云加速器](https://cr.console.aliyun.com/#/accelerator)
* [DaoCloud加速器](https://www.daocloud.io/mirror#accelerator-doc)

### 镜像仓库    

* [DockerHub](https://hub.docker.com/)
* [阿里云镜像库](https://cr.console.aliyun.com)
* [DaoCloud镜像库](https://hub.daocloud.io/)
* [网易云镜像库](https://c.163.com/hub#/m/library/)

## Docker 安装   

[这里提供一个PDF， 里面安装写的很全](http://7xoguv.com1.z0.glb.clouddn.com/docker_practice.pdf)    
[这里提供文档的git地址，里面会更新](https://github.com/yeasy/docker_practice/)    

# Docker 基本使用   

`docker run -d -p 80:80 --name webserver nginx` 本地没有下载镜像，为什么这个命令能跑的起来呢？ 因为 docker在本地找不到，就回去仓库中下载     

## Docker 获取镜像    

`docker pull [选项] [Docker Registry地址]<仓库名>:<标签>`    

* Docker Registry地址: `<域名/IP>[:端口号]` 
* 仓库名: `<用户名>/<软件名>` 如果省略用户名，则默认library， 官方镜像    
* 标签: 多为版本号  

`docker pull --help`
```
Usage:	docker pull [OPTIONS] NAME[:TAG|@DIGEST]

Pull an image or a repository from a registry

Options:
  -a, --all-tags                Download all tagged images in the repository
      --disable-content-trust   Skip image verification (default true)
      --help                    Print usage
```

## Docker 列出镜像    

`docker images`  列出仓库名、标签、镜像 ID、创建时间以及所占用的空间     

* 列出的体积会比仓库中的体积大， 因为仓库中是供下载用的，压缩过     
* 列出的体积总和比实际占用磁盘空间大，Docker 镜像是多层存储结构，并且可以继承、复用，因此不同镜像可能会因为使用相同的基础镜像，从而拥有共同的层， 相同的层只需要保存一份即可    

这个镜像既没有仓库名，也没有标签，均为 <none> ？ 

这个镜像原本是有镜像名和标签的，原来为 mongo:3.2，随着官方镜像维护，发布了新版本后，重新 docker pull mongo:3.2 时，mongo:3.2 这个镜像名被转移到了新下载的镜像身上，而旧的镜像上的这个名称则被取消，从而成为了 <none>     

docker build 也同样可以导致这种现象。由于新旧镜像同名，旧镜像名称被取消，从而出现仓库名、标签均为 <none> 的镜像。这类无标签镜像也被称为 虚悬镜像(dangling image)     

`docker images -f dangling=true` 显示虚悬镜像    

`docker images -a`  列出中间层镜像， 默认显示顶级镜像    

`docker images name[:tag]` 根据name[:tag] 筛选镜像    

`docker images --help`     

```
Usage:	docker images [OPTIONS] [REPOSITORY[:TAG]]

List images

Options:
  -a, --all             Show all images (default hides intermediate images)
      --digests         Show digests
  -f, --filter filter   Filter output based on conditions provided
      --format string   Pretty-print images using a Go template
      --help            Print usage
      --no-trunc        Don't truncate output
  -q, --quiet           Only show numeric IDs
```

## Docker 定制镜像    

**镜像是容器的基础，每次执行 docker run 的时候都会指定哪个镜像作为容器运行的基础。**

`docker diff` 显示某个容器做了什么变动   

```
Usage:	docker diff CONTAINER

Inspect changes to files or directories on a container's filesystem

Options:
      --help   Print usage
```

`docker commit` 提交对某个容器的修改， 打包成镜像    

```
Usage:	docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]

Create a new image from a container's changes

Options:
  -a, --author string    Author (e.g., "John Hannibal Smith <hannibal@a-team.com>")
  -c, --change list      Apply Dockerfile instruction to the created image
      --help             Print usage
  -m, --message string   Commit message
  -p, --pause            Pause container during commit (default true)
```

`docker history` 具体查看镜像内的历史记录

```
Usage:	docker history [OPTIONS] IMAGE

Show the history of an image

Options:
      --format string   Pretty-print images using a Go template
      --help            Print usage
  -H, --human           Print sizes and dates in human readable format (default true)
      --no-trunc        Don't truncate output
  -q, --quiet           Only show numeric IDs
```

**使用 docker commit 命令虽然可以比较直观的帮助理解镜像分层存储的概念，但是实际环境中并不会这样使用。因为他会提交很多我们没有做的操作但是已经改变的文件，如果是安装软件包、编译构建，那会有大量的无关内容被添加进来，如果不小心清理，将会导致镜像极为臃肿。而且除了制作镜像的人知道执行过什么命令、怎么生成的镜像，别人根本无从得知。**       

**定制行为应该使用 Dockerfile 来完成**     

# Dockerfile    

我们可以把每一层修改、安装、构建、操作的命令都写入一个脚本，用这个脚本来构建、定制镜像，那么之前提及的无法重复的问题、镜像构建透明性的问题、体积的问题就都会解决。这个脚本就是 Dockerfile。    

Dockerfile 是一个文本文件，里面一行指令会构建一层Docker镜像    

## FROM 命令

* `FROM <镜像名:镜像版本>`  

> 指定基础镜像， 即后面所有的操作都是在基础镜像上进行的。**在一个Dockerfile中有且只能有一个基础镜像,并且必须是第一条指令。**    

除了选择现有镜像为基础镜像外，Docker 还存在一个特殊的镜像，名为 `scratch` 。这个镜像是虚拟的概念，并不实际存在，它表示一个空白的镜像, 如果你以 scratch 为基础镜像的话，意味着你不以任何镜像为基础，接下来所写 的指令将作为镜像第一层开始存在。    

## RUN 命令   

* `RUN <命令>`    
* `RUN ["可执行文件", "参数1", "参数2"]`      

> RUN 指令是用来执行命令行命令的。由于命令行的强大能力， RUN 指令在定制 镜像时是最常用的指令之一。

但要注意的是， Dockerfile 中每一个指令都会建立一层，  RUN 也不例外。每一个RUN 的行为，就和刚才我们手工建立镜像的过程一样:新建立一层，在其上执行这些命令，执行结束后， commit 这一层的修改，构成新的镜像。 如果每执行一个命令都要构建一层， 那么将会非常臃肿。    

### 错误的Demo





## COPY 命令    

* `COPY <源路径>... <目标路径>`
* `COPY ["<源路径1>",... "<目标路径>"]`

## ADD 命令    

ADD命令与COPY命令格式和性质基本一致    

ADD 指令将会自动解压缩gzip, bzip2 以及 xz后缀的压缩文件到 `<目标路径>` 去。    

因此在 COPY 和 ADD 指令中选择的时候，可以遵循这样的原则，所有的文件复制均使用 COPY 指令，仅在需要自动解压缩的场合使用 ADD。    

## CMD 命令    

* CMD <命令>
* CMD ["可执行文件", "参数1", "参数2"...]
* 参数列表格式：CMD ["参数1", "参数2"...]。在指定了 ENTRYPOINT 指令后，用 CMD 指定具体的参数。

CMD 指令就是用于指定默认的容器主进程的启动命令的, 比如，ubuntu 镜像默认的 CMD 是 /bin/bash, `docker run -it ubuntu` == `docker run -it ubuntu /bin/bash`, 即可以用 `docker run -it ubuntu cat /etc/os-release`    
一般推荐使用 exec 格式, 如果使用 shell, 实际的命令会被包装为 sh -c 的参数的形式进行执行, 比如: `CMD echo $HOME`, 在实际执行中，会将其变更为：`CMD [ "sh", "-c", "echo $HOME" ]`    

**⚠️docker运行容器中的应用，都应该以前台的形式执行，容器中的程序对docker来说没有后台的概念，也不能后台执行，而容器的运行可以相对操作者进行前后台执行，如-d使容器后台运行**    

## ENTRYPOINT 命令    

ENTRYPOINT 的格式和 RUN 指令格式一样，分为 exec 格式和 shell 格式。     
当指定了 ENTRYPOINT 后，CMD 的内容作为参数传给 ENTRYPOINT 指令： `<ENTRYPOINT> "<CMD>"`     

例子：
```
FROM ubuntu:16.04
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
ENTRYPOINT [ "curl", "-s", "http://ip.cn" ]
```

`docker run myip -i`     

## ENV 命令    

* `ENV <key> <value>` 
* `ENV <key1>=<value1> <key2>=<value2>...`

设置操作系统的环境变量    

## ARG 命令    

* `ARG <参数名>[=<默认值>`

ARG和 ENV 的效果一样，都是设置环境变量。所不同的是，ARG 所设置的构建环境的环境变量，在将来容器运行时是不会存在这些环境变量的。     

## EXPOSE 命令    

* `EXPOSE <端口1> [<端口2>...]`

EXPOSE 指令是声明运行时容器提供服务端口，这只是一个声明

一个是帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；另一个用处则是在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口一个是帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；另一个用处则是在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口。 

## WORKDIR 命令    

* `WORKDIR <工作目录路径>`

WORKDIR指令用于设置Dockerfile中的RUN、CMD和ENTRYPOINT指令执行命令的工作目录(默认为/目录)，该指令在Dockerfile文件中可以出现多次，如果使用相对路径则为相对于WORKDIR上一次的值，例如WORKDIR /a，WORKDIR b，RUN pwd最终输出的当前目录是/a/b。（RUN cd /a/b，RUN pwd是得不到/a/b的）     




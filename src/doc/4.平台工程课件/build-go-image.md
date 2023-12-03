---
title: 构建go镜像
icon: circle-info
---


## 概述

在本教程中，你将生成一个容器映像。该映像包括运行应用程序所需的一切：编译的应用程序二进制文件、运行时、库以及应用程序所需的所有其他资源。

## 前置条件

若要完成本教程，需要满足以下条件：

- golang 1.19+
- 本地安装了docker
- Git 客户端

## 程序

该应用程序提供两个 HTTP endpoint：

- / 返回符号<3
- /health 返回{ "Status" : "OK"}

应用程序侦听由环境变量 PORT 定义的 TCP 端口。缺省值为 8080

该应用程序的完整源代码位于 GitHub 上：github.com/docker/docker-gs-ping。我们鼓励您fork 它并随心所欲地尝试它。

要继续，请将应用程序存储库克隆到本地计算机：

```shell
git clone https://github.com/docker/docker-gs-ping
```

如果您熟悉 Go，该应用程序 main.go 的文件非常简单

```go
package main

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/", func(c echo.Context) error {
		return c.HTML(http.StatusOK, "Hello, Docker! <3")
	})

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, struct{ Status string }{Status: "OK"})
	})

	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8080"
	}

	e.Logger.Fatal(e.Start(":" + httpPort))
}

// Simple implementation of an integer minimum
// Adapted from: https://gobyexample.com/testing-and-benchmarking
func IntMin(a, b int) int {
	if a < b {
		return a
	}
	return b
}
```

## 冒烟测试应用程序

启动应用程序并确保它正在运行。打开终端并导航到将项目存储库克隆到的目录。从现在开始，本指南将此目录称为项目目录

```shell
go run main.go
```
这应该将服务器编译并启动为前台应用程序，输出横幅，如下图所示。

```shell
   ____    __
  / __/___/ /  ___
 / _// __/ _ \/ _ \
/___/\__/_//_/\___/ v4.10.2
High performance, minimalist Go web framework
https://echo.labstack.com
____________________________________O/_______
                                    O\
â¨ http server started on [::]:8080
```

通过访问 上的 http://localhost:8080 应用程序来运行快速冒烟测试。您可以使用自己喜欢的 Web 浏览器，甚至可以在终端中使用 curl 命令：

```shell
curl http://localhost:8080/
Hello, Docker! <3
```

现在，您可以将其容器化了。

## 为应用程序创建 Dockerfile

告诉 Docker 要为应用程序使用哪个基础映像：
```yaml
# syntax=docker/dockerfile:1

FROM golang:1.19
```

Docker 镜像可以从其他镜像继承。因此，您可以使用已经具有所有必要工具和库的官方 Go 映像来编译和运行 Go 应用程序，而不是从头开始创建自己的基础映像。

现在，您已经为即将推出的容器映像定义了基础映像，可以开始在它之上进行构建

若要在运行其余命令时简化操作，请在要生成的映像中创建一个目录。这也指示 Docker 使用此目录作为所有后续命令的默认目标。这样你就不必在 中键入完整的文件路径 Dockerfile ，相对路径将基于此目录

```yaml
WORKDIR /app
```

通常，一旦你下载了一个用 Go 编写的项目，你要做的第一件事就是安装编译它所需的模块。请注意，基础映像已包含工具链，但源代码尚未包含在其中。

因此，在运行映像 go mod download 之前，需要将 go.mod 和 go.sum 文件复制到其中。使用命令 COPY 执行此操作。

在最简单的形式中，该 COPY 命令采用两个参数。第一个参数告诉 Docker 要将哪些文件复制到映像中。最后一个参数告诉 Docker 您希望将该文件复制到何处。

将 go.mod and go.sum 文件复制到您的项目目录中，由于您使用了 WORKDIR ，该目录是映像中的当前目录 /app （ ./ ）。与一些现代 shell 似乎对尾部斜杠的使用漠不关心 （ ），并且可以弄清楚用户的意思（大多数时候 / ），Docker COPY 的命令在解释尾部斜杠时非常敏感。

```yaml
COPY go.mod go.sum ./
```

现在，您已经在要构建的 Docker 映像中拥有模块文件，也可以使用该命令在该命令中运行该 RUN 命令 go mod download 。这与在计算机上本地运行 go 的工作方式完全相同，但这次这些 Go 模块将安装到映像中的目录中。

```yaml
RUN go mod download
```

接下来需要做的是将源代码复制到映像中。您将像之前使用模块文件一样使用该 COPY 命令。

COPY *.go ./

此 COPY 命令使用通配符将主机上当前目录（所在的 Dockerfile 目录）中扩展 .go 名的所有文件复制到映像内的当前目录中。

```shell
RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping
```

该命令将代码编译成一个二进制文件，该二进制文件被命名 docker-gs-ping 并位于您正在构建的映像的文件系统的根目录中。您可以将二进制文件放入该映像中您想要的任何其他位置。

现在，剩下要做的就是告诉 Docker 在使用镜像启动容器时要运行什么命令。您可以使用以下 CMD 命令执行此操作：

```shell
CMD ["/docker-gs-ping"]
```

以下是完整的 Dockerfile ：

```yaml
# syntax=docker/dockerfile:1

FROM golang:1.19

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/engine/reference/builder/#copy
COPY *.go ./

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# Run
CMD ["/docker-gs-ping"]
```

## 生成映像

现在，您已经创建了 Dockerfile ，让我们来生成镜像。 build context 是位于指定路径或 URL 中的一组文件。Docker 构建过程可以访问context中的任何文件,在这里我们用 . 来标识当前 context 为同级目录。

build 命令可以选择采用标志 --tag 。此标志用于使用字符串值标记图像，如果不传递 ， --tag Docker 将用作 latest 默认值

构建您的第一个 Docker 映像。

```shell
docker build --tag docker-gs-ping .
```


## 查看本地镜像

```shell
docker image ls

REPOSITORY                       TAG       IMAGE ID       CREATED         SIZE
docker-gs-ping                   latest    7f153fbcc0a8   2 minutes ago   1.11GB
...
```

## 给镜像打 tag

镜像名称由以斜杠分隔的名称组件组成。名称组件可以包含小写字母、数字和分隔符。分隔符定义为句点、一个或两个下划线或一个或多个破折号。名称组件不能以分隔符开头或结尾。

您可以为图像设置多个 tag，事实上，大多数图像都有多个标签。为您构建的镜像打第二个 tag 。使用 docker image tag （或 docker tag 速记）命令为镜像创建新标签。此命令采用两个参数;第一个参数是源图像，第二个参数是要创建的新标记。以下命令为您构建的 docker-gs-ping:latest 创建一个新 docker-gs-ping:v1.0 标签：

```shell
docker image tag docker-gs-ping:latest docker-gs-ping:v1.0
```

现在再次运行查看本地镜像命令，你会看到 tag = v1.0 的镜像。

```shell
docker image ls

REPOSITORY                       TAG       IMAGE ID       CREATED         SIZE
docker-gs-ping                   latest    7f153fbcc0a8   6 minutes ago   1.11GB
docker-gs-ping                   v1.0      7f153fbcc0a8   6 minutes ago   1.11GB
...
```



<br>

---

![扫码加小助手微信，拉你进技术交流群🔥](https://raw.githubusercontent.com/mouuii/picture/master/weichat.jpg#pic_center =40%x)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

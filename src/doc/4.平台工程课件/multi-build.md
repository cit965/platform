---
title: 上下文多阶段跨平台构建【docker构建进阶】
icon: circle-info
---

Docker Build 是 Docker Engine 最常用的功能之一。每当您创建镜像时，您都在使用 Docker Build。构建是软件开发生命周期的关键部分，允许您打包和捆绑代码并将其运送到任何地方。

Docker Build 不仅仅是一个构建镜像的命令，也不仅仅是打包代码。它是一个完整的工具和功能生态系统，不仅支持常见的工作流任务，还为更复杂和高级的场景提供支持。

# 你能从本文学到什么

- 如何打包你的软件
- 上下文
- 多阶段构建
- 多阶段构建


# 如何打包你的软件


一切始于 Dockerfile。Docker 通过读取 Dockerfile 中的指令来构建镜像。 Dockerfile 是一个包含构建源代码的指令的文本文件 。Dockerfile 指令语法由 Dockerfile 参考中的规范参考定义。

  
以下是最常见的指令类型：

|  操作说明 |  描述 |
| --- | --- |
| [`FROM <image>`](https://docs.docker.com/engine/reference/builder/#from) |   
定义镜像的基础。 |
| [`RUN <command>`](https://docs.docker.com/engine/reference/builder/#run) |   
在当前镜像之上的新层中执行任何命令并提交结果。 `RUN` 还有一个用于运行命令的 shell 形式。 |
| [`WORKDIR <directory>`](https://docs.docker.com/engine/reference/builder/#workdir) |   
设置其后面的任何 `RUN` 、 `CMD` 、 `ENTRYPOINT` 、 `COPY` 和 `ADD` 指令的工作目录在 Dockerfile 中。 |
| [`COPY <src> <dest>`](https://docs.docker.com/engine/reference/builder/#copy) |   
从 `<src>` 复制新文件或目录，并将它们添加到容器文件系统的路径 `<dest>` 中。 |
| [`CMD <command>`](https://docs.docker.com/engine/reference/builder/#cmd) |   
允许您定义基于此镜像启动容器后运行的默认程序。每个 Dockerfile 只有一个 `CMD` ，当存在多个时，仅考虑最后一个 `CMD` 实例。 |

  
Dockerfile 是镜像构建的重要输入，可以根据您的独特配置促进自动化的多层镜像构建。 Dockerfile 可以从简单开始，然后根据您的需求进行扩展，以支持更复杂的场景。

###   [文件名](https://docs.docker.com/build/building/packaging/#filename)

  
Dockerfile 使用的默认文件名是 `Dockerfile` ，没有文件扩展名。使用默认名称允许您运行 `docker build` 命令，而无需指定其他命令标志。

  
某些项目可能需要不同的 Dockerfile 来实现特定目的。常见的约定是将它们命名为 `<something>.Dockerfile` 。您可以使用 `docker build` 命令的 `--file` 标志指定 Dockerfile 文件名。请参阅 `docker build` CLI 参考以了解 `--file` 标志。

>  **笔记**
> 
>   
> 我们建议您的项目的主 Dockerfile 使用默认值 ( `Dockerfile` )。

  
Docker 镜像由层组成。每一层都是 Dockerfile 中构建指令的结果。层按顺序堆叠，每个层都是一个增量，表示应用于前一层的更改。

###   [例子](https://docs.docker.com/build/building/packaging/#example)

  
以下是使用 Docker 构建应用程序的典型工作流程。

  
以下示例代码显示了一个使用 Flask 框架用 Python 编写的小型“Hello World”应用程序。

```
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"
```

  
为了在不使用 Docker Build 的情况下发布和部署此应用程序，您需要确保：

-     
    所需的运行时依赖项已安装在服务器上
-     
    Python 代码被上传到服务器的文件系统
-     
    服务器使用必要的参数启动您的应用程序

  
以下 Dockerfile 创建一个容器镜像，其中安装了所有依赖项并自动启动您的应用程序。

```
# syntax=docker/dockerfile:1
FROM ubuntu:22.04

# install app dependencies
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip install flask==2.1.*

# install app
COPY hello.py /

# final configuration
ENV FLASK_APP=hello
EXPOSE 8000
CMD flask run --host 0.0.0.0 --port 8000
```

  
以下是该 Dockerfile 的详细信息：

-     [Dockerfile 语法](https://docs.docker.com/build/building/packaging/#dockerfile-syntax)
-     [基础镜像](https://docs.docker.com/build/building/packaging/#base-image)
-     [环境设置](https://docs.docker.com/build/building/packaging/#environment-setup)
-     [评论](https://docs.docker.com/build/building/packaging/#comments)
-     [安装依赖项](https://docs.docker.com/build/building/packaging/#installing-dependencies)
-     [复制文件](https://docs.docker.com/build/building/packaging/#copying-files)
-   [  
    设置环境变量](https://docs.docker.com/build/building/packaging/#setting-environment-variables)
-     [暴露端口](https://docs.docker.com/build/building/packaging/#exposed-ports)
-   [  
    启动应用程序](https://docs.docker.com/build/building/packaging/#starting-the-application)

### [Dockerfile 语法](https://docs.docker.com/build/building/packaging/#dockerfile-syntax)

  
添加到 Dockerfile 的第一行是 `# syntax` 解析器指令。虽然可选，但该指令指示 Docker 构建器在解析 Dockerfile 时使用什么语法，并允许启用 BuildKit 的较旧 Docker 版本在开始构建之前使用特定的 Dockerfile 前端。解析器指令必须出现在 Dockerfile 中的任何其他注释、空格或 Dockerfile 指令之前，并且应该位于 Dockerfile 中的第一行。

```
# syntax=docker/dockerfile:1
```

> **Tip**
> 
>   
> 我们建议使用 `docker/dockerfile:1` ，它始终指向版本 1 语法的最新版本。 BuildKit 在构建之前自动检查语法更新，确保您使用的是最新版本。

###   [基础镜像](https://docs.docker.com/build/building/packaging/#base-image)

  
语法指令后面的行定义要使用的基本镜像：

  
`FROM` 指令将您的基础镜像设置为 Ubuntu 22.04 版本。以下所有指令均在此基础镜像中执行：Ubuntu 环境。符号 `ubuntu:22.04` 遵循命名 Docker 镜像的 `name:tag` 标准。当您构建图像时，您可以使用此符号来命名您的图像。您可以在项目中利用许多公共镜像，方法是使用 Dockerfile `FROM` 指令将它们导入到构建步骤中。

  
Docker Hu 包含大量可用于此目的的官方镜像。

###   [环境设置](https://docs.docker.com/build/building/packaging/#environment-setup)

  
以下行在基础镜像内执行构建命令。

```
# install app dependencies
RUN apt-get update && apt-get install -y python3 python3-pip
```

  
此 `RUN` 指令在 Ubuntu 中执行 shell，更新 APT package 并在容器中安装 Python 工具。

###   [评论](https://docs.docker.com/build/building/packaging/#comments)

  
请注意 `# install app dependencies` 行。这是一条评论。 Dockerfile 中的注释以 `#` 符号开头。随着您的 Dockerfile 的发展，注释可以帮助记录您的 Dockerfile 如何为该文件的任何未来读者和编辑者（包括未来的您）工作！

>  **笔记**
> 
>   
> 您可能已经注意到，注释使用与文件第一行的语法指令相同的符号来表示。仅当模式与指令匹配并且出现在 Dockerfile 的开头时，该符号才被解释为指令。否则，它将被视为评论。

###   [安装依赖项](https://docs.docker.com/build/building/packaging/#installing-dependencies)

  
第二个 `RUN` 指令安装 Python 应用程序所需的 `flask` 依赖项。

```
RUN pip install flask==2.1.*
```

  
此指令的先决条件是 `pip` 已安装到构建容器中。第一个 `RUN` 命令安装 `pip` ，这确保我们可以使用该命令安装 Flask Web 框架。

### [复制文件](https://docs.docker.com/build/building/packaging/#copying-files)

  
下一条指令使用 `COPY` 指令将 `hello.py` 文件从本地构建上下文复制到图像的根目录中。

  
构建上下文是您可以在 Dockerfile 指令中访问的一组文件，例如 `COPY` 和 `ADD` 。

  
在 `COPY` 指令之后， `hello.py` 文件被添加到构建容器的文件系统中。

### [设置环境变量](https://docs.docker.com/build/building/packaging/#setting-environment-variables)

  
如果您的应用程序使用环境变量，您可以使用 `ENV` 指令在 Docker 构建中设置环境变量。

  
这设置了我们稍后需要的 Linux 环境变量。本示例中使用的框架 Flask 使用此变量来启动应用程序。如果没有这个，Flask 将不知道在哪里可以找到我们的应用程序来运行它。

###  [暴露端口](https://docs.docker.com/build/building/packaging/#exposed-ports)

  
`EXPOSE` 指令标记我们的最终镜像有一个服务正在侦听端口 `8000` 。

  
此说明不是必需的，但它是一个很好的实践，可以帮助工具和团队成员了解此应用程序正在做什么。

### [启动应用程序](https://docs.docker.com/build/building/packaging/#starting-the-application)

  
最后， `CMD` 指令设置当用户启动基于该镜像的容器时运行的命令。

```
CMD flask run --host 0.0.0.0 --port 8000
```

  
在本例中，我们将启动 Flask 开发服务器侦听端口 `8000` 上的所有地址。

  
要使用上一节中的 Dockerfile 示例构建容器镜像，请使用 `docker build` 命令：

```
$ docker build -t test:latest .
```

  
`-t test:latest` 选项指定图像的名称和标签。

  
命令末尾的单点 ( `.` ) 将构建上下文设置为当前目录。这意味着构建期望在调用命令的目录中找到 Dockerfile 和 `hello.py` 文件。如果这些文件不存在，则构建失败。

  
构建镜像后，您可以使用 `docker run` 将应用程序作为容器运行，并指定镜像名称：

```
$ docker run -p 127.0.0.1:8000:8000 test:latest
```

  
这会将容器的端口 8000 发布到 Docker 主机上的 `http://localhost:8000` 。


# 构建上下文（build context）

  
`docker build` 和 `docker buildx build` 命令从 Dockerfile 和上下文构建 Docker 镜像。

### [什么是构建上下文？](https://docs.docker.com/build/building/context/#what-is-a-build-context)

  
构建上下文是您的构建可以访问的文件集。传递给构建命令的位置参数指定要用于构建的上下文：

```
$ docker build [OPTIONS] PATH | URL | -
                         ^^^^^^^^^^^^^^
```

  
您可以传递以下任何输入作为构建的上下文：

-     
    本地目录的相对或绝对路径
-     
    Git 存储库、tarball 或纯文本文件的远程 URL
-     
    通过标准输入传送到 `docker build` 命令的纯文本文件或 tarball

### [文件系统上下文](https://docs.docker.com/build/building/context/#filesystem-contexts)

  
当您的构建上下文是本地目录、远程 Git 存储库或 tar 文件时，它将成为构建器在构建期间可以访问的文件集。 `COPY` 和 `ADD` 等构建指令可以引用上下文中的任何文件和目录。

  
文件系统构建上下文是递归处理的：

-     
    当您指定本地目录或 tarball 时，将包含所有子目录
-     
    当您指定远程 Git 存储库时，将包含该存储库和所有子模块

  
有关可在构建中使用的不同类型的文件系统上下文的更多信息，请参阅：

-     [本地文件](https://docs.docker.com/build/building/context/#local-context)
-     [Git 存储库](https://docs.docker.com/build/building/context/#git-repositories)
-     [远程 tarball](https://docs.docker.com/build/building/context/#remote-tarballs)

###   [文本文件上下文](https://docs.docker.com/build/building/context/#text-file-contexts)

  
当您的构建上下文是纯文本文件时，构建器会将该文件解释为 Dockerfile。通过这种方法，构建不使用文件系统上下文。

  
有关更多信息，请参阅空构建上下文。

##  [本地构建](https://docs.docker.com/build/building/context/#local-context)

  
要使用本地构建上下文，您可以为 `docker build` 命令指定相对或绝对文件路径。以下示例显示了使用当前目录 ( `.` ) 作为构建上下文的构建命令：

```
$ docker build .
...
#16 [internal] load build context
#16 sha256:23ca2f94460dcbaf5b3c3edbaaa933281a4e0ea3d92fe295193e4df44dc68f85
#16 transferring context: 13.16MB 2.2s done
...
```

  
这使得当前工作目录中的文件和目录可供构建器使用。构建器在需要时从构建上下文加载所需的文件。

  
您还可以通过将 tarball 内容通过管道传输到 `docker build` 命令来使用本地 tarball 作为构建上下文。请参阅压缩包。

### [本地目录](https://docs.docker.com/build/building/context/#local-directories)

  
考虑以下目录结构：

```
.
├── index.ts
├── src/
├── Dockerfile
├── package.json
└── package-lock.json
```

  
如果您将此目录作为上下文传递，则 Dockerfile 指令可以在构建中引用并包含这些文件。

```
# syntax=docker/dockerfile:1
FROM node:latest
WORKDIR /src
COPY package.json package-lock.json .
RUN npm ci
COPY index.ts src .
```

### [来自标准输入的 Dockerfile 的本地上下文](https://docs.docker.com/build/building/context/#local-context-with-dockerfile-from-stdin)

  
使用以下语法使用本地文件系统上的文件构建镜像，同时使用标准输入中的 Dockerfile。

  
该语法使用 -f（或 --file）选项指定要使用的 Dockerfile，并使用连字符 (-) 作为文件名来指示 Docker 从 stdin 读取 Dockerfile。

  
以下示例使用当前目录 (.) 作为构建上下文，并使用通过 stdin 使用此处文档传递的 Dockerfile 来构建镜像。

```
# create a directory to work in
mkdir example
cd example

# create an example file
touch somefile.txt

# build an image using the current directory as context
# and a Dockerfile passed through stdin
docker build -t myimage:latest -f- . <<EOF
FROM busybox
COPY somefile.txt ./
RUN cat /somefile.txt
EOF
```

### [本地 tarball](https://docs.docker.com/build/building/context/#local-tarballs)

  
当您通过管道将 tarball 传输到构建命令时，构建会使用 tarball 的内容作为文件系统上下文。

  
例如，给定以下项目目录：

```
.
├── Dockerfile
├── Makefile
├── README.md
├── main.c
├── scripts
├── src
└── test.Dockerfile
```

  
您可以创建目录的 tarball 并将其通过管道传输到构建以用作上下文：

```
$ tar czf foo.tar.gz *
$ docker build - < foo.tar.gz
```

  
构建从 tarball 上下文中解析 Dockerfile。您可以使用 `--file` 标志来指定 Dockerfile 相对于 tarball 根目录的名称和位置。以下命令使用 tarball 中的 `test.Dockerfile` 进行构建：

```
$ docker build --file test.Dockerfile - < foo.tar.gz
```

## [远程上下文](https://docs.docker.com/build/building/context/#remote-context)

  
您可以指定远程 Git 存储库、tarball 或纯文本文件的地址作为构建上下文。

-     
    对于 Git 存储库，构建器会自动克隆存储库。请参阅 Git 存储库。
-     
    对于 tarball，构建器会下载并提取 tarball 的内容。请参阅压缩包。

  
如果远程 tarball 是文本文件，则构建器不会接收文件系统上下文，而是假设远程文件是 Dockerfile。请参阅清空构建上下文。

### [Git 存储库](https://docs.docker.com/build/building/context/#git-repositories)

  
当您将指向 Git 存储库位置的 URL 作为参数传递给 `docker build` 时，构建器会使用该存储库作为构建上下文。

  
构建器执行存储库的浅层克隆，仅下载 HEAD 提交，而不是整个历史记录。

  
构建器递归地克隆存储库及其包含的任何子模块。

```
$ docker build https://github.com/user/myrepo.git
```

  
默认情况下，构建器会克隆您指定的存储库的默认分支上的最新提交。

#### [网址片段](https://docs.docker.com/build/building/context/#url-fragments)

  
您可以将 URL 片段附加到 Git 存储库地址，以使构建器克隆存储库的特定分支、标签和子目录。

  
URL 片段的格式为 `#ref:dir` ，其中：

-     
    `ref` 是分支、标记或远程引用的名称
-     
    `dir` 是存储库内的子目录

  
例如，以下命令使用 `container` 分支以及该分支中的 `docker` 子目录作为构建上下文：

```
$ docker build https://github.com/user/myrepo.git#container:docker
```

  
下表列出了所有有效的后缀及其构建上下文：

|  构建语法后缀 |  提交已使用 |  构建使用的上下文 |
| --- | --- | --- |
| `myrepo.git` | `refs/heads/<default branch>` | `/` |
| `myrepo.git#mytag` | `refs/tags/mytag` | `/` |
| `myrepo.git#mybranch` | `refs/heads/mybranch` | `/` |
| `myrepo.git#pull/42/head` | `refs/pull/42/head` | `/` |
| `myrepo.git#:myfolder` | `refs/heads/<default branch>` | `/myfolder` |
| `myrepo.git#master:myfolder` | `refs/heads/master` | `/myfolder` |
| `myrepo.git#mytag:myfolder` | `refs/tags/mytag` | `/myfolder` |
| `myrepo.git#mybranch:myfolder` | `refs/heads/mybranch` | `/myfolder` |

#### [保留 .git 目录](https://docs.docker.com/build/building/context/#keep-git-directory)

  
默认情况下，BuildKit 在使用 Git 上下文时不会保留 `.git` 目录。您可以通过设置 `BUILDKIT_CONTEXT_KEEP_GIT_DIR` 构建参数来配置 BuildKit 以保留该目录。如果您想在构建期间检索 Git 信息，这可能很有用：

```
# syntax=docker/dockerfile:1
FROM alpine
WORKDIR /src
RUN --mount=target=. \
  make REVISION=$(git rev-parse HEAD) build
```

```
$ docker build \
  --build-arg BUILDKIT_CONTEXT_KEEP_GIT_DIR=1
  https://github.com/user/myrepo.git#main
```

#### [私有存储库](https://docs.docker.com/build/building/context/#private-repositories)

  
当您指定同时也是私有存储库的 Git 上下文时，构建器需要您提供必要的身份验证凭据。您可以使用 SSH 或基于令牌的身份验证。

  
如果您指定的 Git 上下文是 SSH 或 Git 地址，Buildx 会自动检测并使用 SSH 凭据。默认情况下，这使用 `$SSH_AUTH_SOCK` 。您可以配置 SSH 凭据以与 `--ssh` 标志一起使用。

```
$ docker buildx build --ssh default git@github.com:user/private.git
```

  
如果您想使用基于令牌的身份验证，则可以使用 `--secret` 标志传递令牌。

```
$ GIT_AUTH_TOKEN=<token> docker buildx build \
  --secret id=GIT_AUTH_TOKEN \
  https://github.com/user/private.git
```

>  **笔记**
> 
>   
> 不要将 `--build-arg` 用于机密。

### [来自标准输入的 Dockerfile 的远程上下文](https://docs.docker.com/build/building/context/#remote-context-with-dockerfile-from-stdin)

  
使用以下语法使用本地文件系统上的文件构建镜像，同时使用标准输入中的 Dockerfile。

  
该语法使用 -f（或 --file）选项指定要使用的 Dockerfile，并使用连字符 (-) 作为文件名来指示 Docker 从 stdin 读取 Dockerfile。

  
当您想要从不包含 Dockerfile 的存储库构建镜像的情况下，这可能很有用。或者，如果您想使用自定义 Dockerfile 进行构建，而不需要维护自己的存储库分支。

  
以下示例使用来自 stdin 的 Dockerfile 构建镜像，并添加来自 GitHub 上的 hello-worldopen\_in\_new 存储库的 `hello.c` 文件。

```
docker build -t myimage:latest -f- https://github.com/docker-library/hello-world.git <<EOF
FROM busybox
COPY hello.c ./
EOF
```

### [远程 tarball](https://docs.docker.com/build/building/context/#remote-tarballs)

  
如果将 URL 传递到远程 tarball，则 URL 本身将发送到构建器。

```
$ docker build http://server/context.tar.gz
#1 [internal] load remote build context
#1 DONE 0.2s

#2 copy /context /
#2 DONE 0.1s
...
```

  
下载操作将在运行 BuildKit 守护进程的主机上执行。请注意，如果您使用远程 Docker 上下文或远程构建器，则它不一定与您发出构建命令的计算机相同。 BuildKit 获取 `context.tar.gz` 并将其用作构建上下文。 Tarball 上下文必须是符合标准 `tar` Unix 格式的 tar 存档，并且可以使用 `xz` 、 `bzip2` 、 `gzip` 或 `identity` （无压缩）格式。


# 多阶段构建
  
多阶段构建对于那些努力优化 Dockerfile 同时保持其易于阅读和维护的人来说非常有用。

## 使用多阶段构建
通过多阶段构建，您可以在 Dockerfile 中使用多个 `FROM` 语句。每个 `FROM` 指令可以使用不同的基础，并且每个指令都开始构建的新阶段。您可以有选择地将制品从一个阶段复制到另一个阶段，从而在最终图像中留下您不想要的所有内容。

  
以下 Dockerfile 有两个独立的阶段：一个用于构建二进制文件，另一个阶段用于将二进制文件复制到其中。

```
# syntax=docker/dockerfile:1
FROM golang:1.21
WORKDIR /src
COPY <<EOF ./main.go
package main

import "fmt"

func main() {
  fmt.Println("hello, world")
}
EOF
RUN go build -o /bin/hello ./main.go

FROM scratch
COPY --from=0 /bin/hello /bin/hello
CMD ["/bin/hello"]
```

  
您只需要单个 Dockerfile。不需要单独的构建脚本。只需运行 `docker build` 。

```
$ docker build -t hello .
```

  
最终结果是一个很小的生产图像，里面除了二进制文件之外什么也没有。生成的镜像中不包含构建应用程序所需的任何构建工具。

  
它是如何工作的？第二条 `FROM` 指令以 `scratch` 镜像作为基础启动新的构建阶段。 `COPY --from=0` 行仅将前一阶段中构建的制品复制到新阶段中。 Go SDK 和任何中间制品都会被留下，并且不会保存在最终镜像中。

  
## 命名您的构建阶段

默认情况下，阶段没有命名，您可以通过它们的整数来引用它们，第一个 `FROM` 指令从 0 开始。但是，您可以通过将 `AS <NAME>` 添加到 `FROM` 指令来命名阶段。此示例通过命名阶段并在 `COPY` 指令中使用名称来改进前一个示例。这意味着即使 Dockerfile 中的指令稍后重新排序， `COPY` 也不会中断。

```
# syntax=docker/dockerfile:1
FROM golang:1.21 as build
WORKDIR /src
COPY <<EOF /src/main.go
package main

import "fmt"

func main() {
  fmt.Println("hello, world")
}
EOF
RUN go build -o /bin/hello ./main.go

FROM scratch
COPY --from=build /bin/hello /bin/hello
CMD ["/bin/hello"]
```

## 停止在特定的构建阶段
  
当您构建镜像时，您不一定需要构建整个 Dockerfile（包括每个阶段）。您可以指定目标构建阶段。以下命令假设您正在使用之前的 `Dockerfile` 但在名为 `build` 的阶段停止：

```
$ docker build --target build -t hello .
```

  
这可能有用的一些场景是：

-     
    调试特定构建阶段
-     
    使用启用了所有调试符号或工具的 `debug` 阶段以及精简的 `production` 阶段
-     
    使用 `testing` 阶段，您的应用程序将在其中填充测试数据，但使用使用真实数据的不同阶段进行生产构建


## 使用外部图像作为舞台
使用多阶段构建时，您不仅限于从之前在 Dockerfile 中创建的阶段进行复制。您可以使用 `COPY --from` 指令从单独的镜像进行复制，可以使用本地镜像名称、本地或 Docker 注册表上可用的标签或标签 ID。如果需要，Docker 客户端会拉取镜像并从那里复制制品。语法是：

```
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```

# 跨平台构建


  
Docker 镜像可以支持多个平台，这意味着单个镜像可能包含针对不同架构的变体，有时还包含针对不同操作系统（例如 Windows）的变体。

  
当您运行支持多平台的镜像时，Docker 会自动选择与您的操作系统和架构相匹配的镜像。

  
Docker Hub 上的大多数 Docker 官方镜像都提供了多种架构 例如， `busybox` 图像支持 `amd64` 、 `arm32v5` 、 `arm32v6` 、 `arm32v7` 、 `arm64v8` 、 `ppc64le` 和 `s390x` 。在 `x86_64` / `amd64` 计算机上运行此镜像时， `amd64` 变体将被拉取并运行。

  
当您调用构建时，您可以设置 `--platform` 标志来指定构建输出的目标平台。例如， `linux/amd64` 、 `linux/arm64` 或 `darwin/amd64` 。

  
默认情况下，您一次只能针对一个平台进行构建。如果您想同时针对多个平台进行构建，您可以：

-     
    创建一个使用 `docker-container` 驱动程序的新构建器
-     
    打开containerd快照存储

  
您可以根据您的用例使用三种不同的策略构建多平台镜像：

1.    
    使用内核中的 QEMU 仿真支持
2.    
    使用相同的构建器实例在多个本机节点上构建 【推荐】
3.    
    使用 Dockerfile 中的阶段交叉编译到不同的架构

### [QEMU](https://docs.docker.com/build/building/multi-platform/#qemu)

  
如果您的构建器已经支持，那么使用 QEMU 模拟构建多平台镜像是最简单的入门方法。 Docker Desktop 开箱即用地支持它。它不需要更改 Dockerfile，并且 BuildKit 会自动检测可用的辅助架构。当 BuildKit 需要运行不同架构的二进制文件时，它会通过 `binfmt_misc` 处理程序中注册的二进制文件自动加载它。



###   [多个本机节点](https://docs.docker.com/build/building/multi-platform/#multiple-native-nodes)

  
使用多个本机节点可以为 QEMU 无法处理的更复杂的情况提供更好的支持，并且通常具有更好的性能。您可以使用 `--append` 标志向构建器实例添加其他节点。

  
假设上下文 `node-amd64` 和 `node-arm64` 存在于 `docker context ls` 中；

```
$ docker buildx create --use --name mybuild node-amd64
mybuild
$ docker buildx create --append --name mybuild node-arm64
$ docker buildx build --platform linux/amd64,linux/arm64 .
```

  
有关在 CI 中通过 GitHub Actions 使用多个本机节点的信息，请参阅配置 GitHub Actions 构建器。

###   [交叉编译](https://docs.docker.com/build/building/multi-platform/#cross-compilation)

  
根据您的项目，如果您使用的编程语言对交叉编译具有良好的支持，则可以有效地使用 Dockerfile 中的多阶段构建，使用构建节点的本机架构为目标平台构建二进制文件。诸如 `BUILDPLATFORM` 和 `TARGETPLATFORM` 之类的构建参数会自动在 Dockerfile 中使用，并且可以被作为构建的一部分运行的进程利用。

```
# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM golang:alpine AS build
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM" > /log
FROM alpine
COPY --from=build /log /log
```

## 入门
  
运行 `docker buildx ls` 命令列出现有的构建器：

```
$ docker buildx ls
NAME/NODE  DRIVER/ENDPOINT  STATUS   BUILDKIT PLATFORMS
default *  docker
  default  default          running  v0.11.6  linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6
```

  
这将显示默认的内置驱动程序，该驱动程序使用直接内置于 docker 引擎中的 BuildKit 服务器组件，也称为 `docker` 驱动程序。

  
使用 `docker-container` 驱动程序创建一个新的构建器，它使您可以访问更复杂的功能，例如多平台构建和更高级的缓存导出器，这些功能目前在默认 `docker` 驱动程序中不受支持：

```
$ docker buildx create --name mybuilder --bootstrap --use
```

  
现在再次列出现有的构建器，我们可以看到我们的新构建器已注册：

```
$ docker buildx ls
NAME/NODE     DRIVER/ENDPOINT              STATUS   BUILDKIT PLATFORMS
mybuilder *   docker-container
  mybuilder0  unix:///var/run/docker.sock  running  v0.12.1  linux/amd64, linux/amd64/v2, linux/amd64/v3, linux/arm64, linux/riscv64, linux/ppc64le, linux/s390x, linux/386, linux/mips64le, linux/mips64, linux/arm/v7, linux/arm/v6
default       docker
  default     default                      running  v0.12.3  linux/amd64, linux/arm64, linux/arm/v7, linux/arm/v6
```

## 例子
  
测试工作流程以确保您可以构建、推送和运行多平台镜像。创建一个简单的示例 Dockerfile，构建几个镜像变体，并将它们推送到 Docker Hub。

  
以下示例使用单个 `Dockerfile` 构建一个 Alpine 镜像，并为多个架构安装了 cURL：

```
# syntax=docker/dockerfile:1
FROM alpine:3.16
RUN apk add curl
```

  
使用 buildx 构建 Dockerfile，传递要构建的架构列表：

```
$ docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t <username>/<image>:latest --push .
...
#16 exporting to image
#16 exporting layers
#16 exporting layers 0.5s done
#16 exporting manifest sha256:71d7ecf3cd12d9a99e73ef448bf63ae12751fe3a436a007cb0969f0dc4184c8c 0.0s done
#16 exporting config sha256:a26f329a501da9e07dd9cffd9623e49229c3bb67939775f936a0eb3059a3d045 0.0s done
#16 exporting manifest sha256:5ba4ceea65579fdd1181dfa103cc437d8e19d87239683cf5040e633211387ccf 0.0s done
#16 exporting config sha256:9fcc6de03066ac1482b830d5dd7395da781bb69fe8f9873e7f9b456d29a9517c 0.0s done
#16 exporting manifest sha256:29666fb23261b1f77ca284b69f9212d69fe5b517392dbdd4870391b7defcc116 0.0s done
#16 exporting config sha256:92cbd688027227473d76e705c32f2abc18569c5cfabd00addd2071e91473b2e4 0.0s done
#16 exporting manifest list sha256:f3b552e65508d9203b46db507bb121f1b644e53a22f851185d8e53d873417c48 0.0s done
#16 ...

#17 [auth] <username>/<image>:pull,push token for registry-1.docker.io
#17 DONE 0.0s

#16 exporting to image
#16 pushing layers
#16 pushing layers 3.6s done
#16 pushing manifest for docker.io/<username>/<image>:latest@sha256:f3b552e65508d9203b46db507bb121f1b644e53a22f851185d8e53d873417c48
#16 pushing manifest for docker.io/<username>/<image>:latest@sha256:f3b552e65508d9203b46db507bb121f1b644e53a22f851185d8e53d873417c48 1.4s done
#16 DONE 5.6s
```

>  **笔记**
> 
> -     
>     `<username>` 必须是有效的 Docker ID， `<image>` 必须是 Docker Hub 上的有效存储库。
> -     
>     `--platform` 标志通知 buildx 为 AMD 64 位、Arm 64 位和 Armv7 架构创建 Linux 镜像。
> -     
>     `--push` 标志生成多架构清单并将所有镜像推送到 Docker Hub。

  
使用 `docker buildx imagetools` 命令检查图像：

```
$ docker buildx imagetools inspect <username>/<image>:latest
Name:      docker.io/<username>/<image>:latest
MediaType: application/vnd.docker.distribution.manifest.list.v2+json
Digest:    sha256:f3b552e65508d9203b46db507bb121f1b644e53a22f851185d8e53d873417c48

Manifests:
  Name:      docker.io/<username>/<image>:latest@sha256:71d7ecf3cd12d9a99e73ef448bf63ae12751fe3a436a007cb0969f0dc4184c8c
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/amd64

  Name:      docker.io/<username>/<image>:latest@sha256:5ba4ceea65579fdd1181dfa103cc437d8e19d87239683cf5040e633211387ccf
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/arm64

  Name:      docker.io/<username>/<image>:latest@sha256:29666fb23261b1f77ca284b69f9212d69fe5b517392dbdd4870391b7defcc116
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/arm/v7
```

  
该镜像现已在 Docker Hub 上提供，标签为 `<username>/<image>:latest` 。您可以使用此镜像在 Intel 笔记本电脑、Amazon EC2 Graviton 实例、Raspberry Pi 和其他架构上运行容器。 Docker 为当前架构提取正确的镜像，因此 Raspberry PI 运行 32 位 Arm 版本，EC2 Graviton 实例运行 64 位 Arm。

  
摘要识别出完全合格的图像变体。您还可以在 Docker Desktop 上运行针对不同架构的镜像。例如，当您在 macOS 上运行以下命令时：

```
$ docker run --rm docker.io/<username>/<image>:latest@sha256:2b77acdfea5dc5baa489ffab2a0b4a387666d1d526490e31845eb64e3e73ed20 uname -m
aarch64
```

```
$ docker run --rm docker.io/<username>/<image>:latest@sha256:723c22f366ae44e419d12706453a544ae92711ae52f510e226f6467d8228d191 uname -m
armv7l
```

  
在上面的示例中， `uname -m` 按预期返回 `aarch64` 和 `armv7l` ，即使在本机 macOS 或 Windows 开发人员计算机上运行命令也是如此。


<br>

---

![扫码加小助手微信，拉你进技术交流群🔥](https://raw.githubusercontent.com/mouuii/picture/master/weichat.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

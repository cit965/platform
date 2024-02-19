---
title: helm教程-02-使用
icon: circle-info
---
##  1. 概述

Helm 是 Kubernetes 应用程序的包管理器。在本教程中，我们将了解 Helm 的基础知识以及使用 helm 开发一个chart应用。

在过去的几年里，Kubernetes 取得了巨大的发展，支持它的生态系统也是如此。最近，Helm 获得了云原生计算基金会（CNCF）的毕业资格，这表明它在 Kubernetes 用户中越来越受欢迎。

##  2. helm 发展

Helm 2 主要采用客户端-服务器架构，由客户端和集群内服务器组成：

![Helm 2 Architecture](https://www.baeldung.com/wp-content/uploads/sites/6/2023/03/Helm-2-Architecture-300x112.webp)

-   Tiller Server：Helm 通过安装在 Kubernetes 集群中的 Tiller Server 管理 Kubernetes 应用程序。 Tiller 与 Kubernetes API 服务器交互以安装、升级、查询和删除 Kubernetes 资源。
-   Helm 客户端：Helm 为用户提供了使用 Helm Charts 的命令行界面。它负责与 Tiller 服务器交互以执行安装、升级和回滚chart等各种操作。

Helm 3 已转向完全仅客户端的架构，其中集群内服务器已被删除：

![Helm 3 Architecture](https://www.baeldung.com/wp-content/uploads/sites/6/2023/03/Helm-3-Architecture-300x112.webp)

正如我们所看到的，Helm 3 中的客户端工作方式几乎相同，但直接与 Kubernetes API 服务器而不是 Tiller 服务器交互。这一举措简化了 Helm 的架构，并使其能够利用 Kubernetes 用户集群的安全性。



## 3.开发我们的第一个chart

现在我们准备开发我们的第一个带有模板和值的 Helm Chart。我们将使用之前安装的 Helm CLI 来执行一些与chart相关的常见活动。


当然，第一步是创建一个具有给定名称的新chart：

```shell
helm create hello-world
```

请注意，此处提供的chart名称将是创建和存储chart的目录名称。

让我们快速看看为我们创建的目录结构：

```shell
hello-world /
  Chart.yaml
  values.yaml
  templates /
  charts /
  .helmignore
```

让我们了解为我们创建的这些文件和文件夹的作用：

-   Chart.yaml：这是包含chart描述的主文件
-   value.yaml：这是包含chart默认值的文件
-   templates：这是 Kubernetes 资源定义为模板的目录
-   chart：这是一个可选目录，可能包含子chart
-   .helmignore：这是我们可以定义打包时要忽略的模式的地方（概念上与 .gitignore 类似）

###  4.创建模板

如果我们查看模板目录，我们会注意到已经为我们创建了一些常见 Kubernetes 资源的模板：

```shell
hello-world /
  templates /
    deployment.yaml
    service.yaml
    ingress.yaml
    ......
```

我们的应用程序中可能需要其中一些资源，也可能需要其他资源，我们必须自己创建这些资源作为模板。

在本教程中，我们将创建一个部署和服务来公开该部署。请注意，这里的重点不是详细了解 Kubernetes。因此，我们将使这些资源尽可能简单。

让我们编辑 templates 目录中的部署.yaml 文件，如下所示：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "hello-world.fullname" . }}
  labels:
    app.kubernetes.io/name: {{ include "hello-world.name" . }}
    helm.sh/chart: {{ include "hello-world.chart" . }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/managed-by: {{ .Release.Service }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ include "hello-world.name" . }}
      app.kubernetes.io/instance: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app.kubernetes.io/name: {{ include "hello-world.name" . }}
        app.kubernetes.io/instance: {{ .Release.Name }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
```

同样，我们将文件 service.yaml 编辑为如下所示：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "hello-world.fullname" . }}
  labels:
    app.kubernetes.io/name: {{ include "hello-world.name" . }}
    helm.sh/chart: {{ include "hello-world.chart" . }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/managed-by: {{ .Release.Service }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: {{ include "hello-world.name" . }}
    app.kubernetes.io/instance: {{ .Release.Name }}
```

现在，根据我们对 Kubernetes 的了解，除了一些奇怪的地方之外，这些模板文件看起来非常熟悉。请注意双括号 {{}} 内文本的自由使用。这就是所谓的模板指令。

Helm 使用 Go 模板语言并将其扩展为 Helm 模板语言。在评估过程中，模板目录中的每个文件都会提交给模板渲染引擎。这是模板指令将实际值注入模板的地方。

###  5. 提供values

在上一小节中，我们了解了如何在模板中使用模板指令。现在，让我们了解如何将值传递给模板渲染引擎。我们通常通过 Helm 中的内置对象传递值。

Helm 中有许多此类对象，例如 Release、Values、Chart 和 Files。

我们可以使用chart中的文件values.yaml，通过内置对象值将值传递给模板渲染引擎。让我们将 value.yaml 修改为如下所示：

```yaml
replicaCount: 1
image:
  repository: "hello-world"
  tag: "1.0"
  pullPolicy: IfNotPresent
service:
  type: NodePort
  port: 80
```

但是，请注意如何使用分隔命名空间的点在模板中访问这些值。我们使用了镜像存储库和标签作为“hello-world”和“1.0”，这必须与我们为 Spring Boot 应用程序创建的 docker 镜像标签匹配。

##  6. 管理chart

到目前为止一切都完成了，我们现在准备好使用我们的chart了。让我们看看 Helm CLI 中有哪些不同的命令可以让这个变得有趣！请注意，我们只会介绍 Helm 中可用的一些命令。

###  7. helm lint
首先，这是一个简单的命令，它获取chart的路径并运行一系列测试以确保chart格式良好：

```shell
helm lint ./hello-world
==> Linting ./hello-world
1 chart(s) linted, no failures
```

输出显示了 linting 的结果及其识别的问题。

###  8.helm template

此外，我们还使用此命令在本地渲染模板以获取快速反馈：

```shell
helm template ./hello-world
---
# Source: hello-world/templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: release-name-hello-world
  labels:
    app.kubernetes.io/name: hello-world
    helm.sh/chart: hello-world-0.1.0
    app.kubernetes.io/instance: release-name
    app.kubernetes.io/managed-by: Tiller
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: hello-world
    app.kubernetes.io/instance: release-name

---
# Source: hello-world/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: release-name-hello-world
  labels:
    app.kubernetes.io/name: hello-world
    helm.sh/chart: hello-world-0.1.0
    app.kubernetes.io/instance: release-name
    app.kubernetes.io/managed-by: Tiller
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: hello-world
      app.kubernetes.io/instance: release-name
  template:
    metadata:
      labels:
        app.kubernetes.io/name: hello-world
        app.kubernetes.io/instance: release-name
    spec:
      containers:
        - name: hello-world
          image: "hello-world:1.0"
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
```

请注意，此命令会伪造预期在集群中检索的值。

###  9 helm install

一旦我们验证了chart没有问题，最后我们就可以运行以下命令将chart安装到 Kubernetes 集群中：

```shell
helm install --name hello-world ./hello-world
NAME:   hello-world
LAST DEPLOYED: Mon Feb 25 15:29:59 2019
NAMESPACE: default
STATUS: DEPLOYED

RESOURCES:
==> v1/Service
NAME         TYPE      CLUSTER-IP     EXTERNAL-IP  PORT(S)       AGE
hello-world  NodePort  10.110.63.169  <none>       80:30439/TCP  1s

==> v1/Deployment
NAME         DESIRED  CURRENT  UP-TO-DATE  AVAILABLE  AGE
hello-world  1        0        0           0          1s

==> v1/Pod(related)
NAME                          READY  STATUS   RESTARTS  AGE
hello-world-7758b9cdf8-cs798  0/1    Pending  0         0s
```

此命令还提供了多个选项来覆盖chart中的值。请注意，我们已使用标志 -name 命名此chart的发布。该命令会返回在此过程中创建的 Kubernetes 资源的摘要。

###  10 helm ls

现在，我们想查看哪些chart安装为哪个版本。此命令让我们查询指定的版本：

```shell
helm ls --all
NAME            REVISION        UPDATED                         STATUS          CHART               APP VERSION NAMESPACE
hello-world     1               Mon Feb 25 15:29:59 2019        DEPLOYED        hello-world-0.1.0   1.0         default
```

该命令有多个子命令可用于获取扩展信息。其中包括全部、挂钩、清单、注释和值。

###  11 helm upgrade

如果我们修改了chart并需要安装更新版本怎么办？此命令帮助我们将版本升级到chart或配置的指定或当前版本：

```shell
helm upgrade hello-world ./hello-world
Release "hello-world" has been upgraded. Happy Helming!
LAST DEPLOYED: Mon Feb 25 15:36:04 2019
NAMESPACE: default
STATUS: DEPLOYED

RESOURCES:
==> v1/Service
NAME         TYPE      CLUSTER-IP     EXTERNAL-IP  PORT(S)       AGE
hello-world  NodePort  10.110.63.169  <none>       80:30439/TCP  6m5s

==> v1/Deployment
NAME         DESIRED  CURRENT  UP-TO-DATE  AVAILABLE  AGE
hello-world  1        1        1           1          6m5s

==> v1/Pod(related)
NAME                          READY  STATUS   RESTARTS  AGE
hello-world-7758b9cdf8-cs798  1/1    Running  0         6m4s
```



###  12.Helm Rollback

发布出错并需要收回的情况总是可能发生。这是将版本回滚到以前版本的命令：

```shell
helm rollback hello-world 1
Rollback was a success! Happy Helming!
```

我们可以指定要回滚到的特定版本，或者将此参数保留为黑色，在这种情况下它会回滚到以前的版本。

###  13 Helm Uninstall
尽管不太可能，但我们可能希望完全卸载某个版本。我们可以使用此命令从 Kubernetes 卸载版本：

```shell
helm uninstall hello-world
release "hello-world" deleted
```

它会删除与chart的上次版本和发布历史记录相关的所有资源。

### 14 Helm Package

首先，我们需要打包我们创建的chart以便能够分发它们。这是创建chart的版本化存档文件的命令：

```shell
helm package ./hello-world
Successfully packaged chart and saved it to: \hello-world\hello-world-0.1.0.tgz
```

请注意，它会在我们的计算机上生成一个存档，我们可以手动或通过公共或私人chart存储库分发该存档。我们还可以选择签署chart存档。

###  15 Helm Repo

最后，我们需要一种与共享存储库进行协作的机制。此命令中有几个可用的子命令，我们可以使用它们来添加、删除、更新、列出或索引chart存储库。让我们看看如何使用它们。

我们可以创建一个 git 存储库并将其用作我们的chart存储库。唯一的要求是它应该有一个index.yaml 文件。

我们可以为我们的chart存储库创建index.yaml：

```shell
helm repo index my-repo/ --url https://<username>.github.io/my-repo
```

这会生成 index.yaml 文件，我们应该将其与chart存档一起推送到存储库。

成功创建chart存储库后，随后我们可以远程添加此存储库：

```powershell
helm repo add my-repo https://my-pages.github.io/my-repo
```

现在，我们应该能够直接从我们的存储库安装chart：

```shell
helm install my-repo/hello-world --name=hello-world
```

有很多命令可用于处理chart存储库。

###  9.3.头盔搜索[](https://www.baeldung.com/ops/kubernetes-helm#3-helm-search)

最后，我们应该在chart中搜索可以出现在任何公共或私人chart存储库中的关键字。

```shell
helm search repo <KEYWORD>
```

此命令有可用的子命令，允许我们搜索不同位置的chart。例如，我们可以在 Artifact Hub 或我们自己的存储库中搜索chart。此外，我们可以在我们配置的所有存储库中可用的chart中搜索关键字。

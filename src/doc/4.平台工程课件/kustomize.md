---
title: kustomize
icon: circle-info
---


## 引言
在本 Kustomize 教程中，您将学习所有 Kustomize 概念并在 Kubernetes 集群上使用 Kustomize 部署应用程序。

## 介绍

在深入研究 Kustomize 之前，我们先了解一下使用 Kubernetes 清单部署应用程序

假设您想要将应用程序部署到 Kubernetes，并且您有多个环境，即 dev、uat、prod 等。在每个环境中，您可能有不同的部署配置。

例如，在 dev 和 uat 中您可能不需要滚动更新，但在 prod 中您可能需要它。此外，您可能需要在每个环境中使用不同的副本数、不同的 CPU 和内存资源、注释等。

因此，您需要自定义部署以满足相应环境的要求。

解决此问题的简单方法是创建三个单独的目录，每个环境一个目录，并将所有 Kubernetes 清单添加到各自的文件夹中。

但这不是一个可扩展的解决方案。因为当新应用程序上线或添加新配置文件时，手动管理文件夹中的所有 YAML 文件将变得很困难。这也可能导致配置漂移问题。

您可以创建脚本来替换 YAML 中的配置，但当您有许多服务时，这不是一个好方法。

所有这些问题都可以使用 Kustomize 来解决。此外，它与其他配置工具的区别之一是它与 kubectl（用于管理 Kubernetes 集群的命令行界面）紧密集成。

我们将详细介绍 Kustomize 概念及其优势。我们还将查看使用 Nginx 部署的 Kustomize 实际示例，向您展示它如何简化 Kubernetes 部署。

## 什么是 kustomize


Kustomize 是 Kubernetes 的开源配置管理工具。

它允许您以声明方式为多个环境定义和管理 Kubernetes 对象，例如部署、Daemonsets、服务、configMap 等，而无需修改原始 YAML 文件。简而言之，您拥有 YAML 的单一事实来源，并且可以根据环境要求在基本 YAML 之上修补所需的配置。


这是官方文档所说的

>kustomize lets you customize raw, template-free YAML files for multiple purposes, leaving the original YAML untouched and usable as is.

Kustomize 有两个关键概念：Base 和 Overlays。借助 Kustomize，我们可以在所有环境中重用基础文件（通用 YAML），并为每个环境覆盖（补丁）差异。


创建清单文件的自定义版本的过程(base manifest + overlay manifest = customized manifest file).

所有自定义规范都包含在 kustomization.yaml 文件中。

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.47.23.png)

## Kustomize 功能

以下是 Kustomize 的主要功能

- 充当配置工具，具有与 Kubernetes YAML 相同的声明式配置。
- 它可以修改资源而不改变原始文件。
- 它可以为所有资源添加通​​用标签和注释。
- 它可以根据部署的环境修改容器镜像。
- Kustomize 还附带 secretGenerator 和 configMapGenerator ，它们使用环境文件或键值对来创建机密和 configMap。

所有这些概念和功能在我实际向您展示如何通过 nginx 部署来使用 Kustomize 的部分中将更有意义。

## 理解 Kustomize

首先，您需要了解以下关键 Kustomize 概念

- kustomization.yamlfile  
- Base and Overlays 
- Transformers 
- Patches 

kustomization.yaml 文件是 Kustomize 工具使用的主文件。

当您执行 Kustomize 时，它​​会查找名为 kustomization.yaml 的文件。此文件包含应由 Kustomize 管理的所有 Kubernetes 资源（YAML 文件）的列表。它还包含我们想要应用以生成自定义清单的所有自定义内容。

这是一个示例 kustomization.yaml 文件。不用担心所有配置。我们将在以下部分中了解所有字段。

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.48.29.png)

## Base and Overlays

Base 文件夹代表在所有环境中都相同的配置。我们将所有 Kubernetes 清单放在 Base 中。它有一个我们可以覆盖的默认值。

另一方面，Overlays 文件夹允许我们根据每个环境自定义行为。我们可以为每个环境创建一个叠加层。我们指定要覆盖和更改的所有属性和参数。

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.48.56.png)

基本上，Kustomize 使用 patch 指令在现有的 Base 标准 k8s 配置文件上引入特定于环境的更改，而不会干扰它们。我们稍后会查看补丁。


## Transformers

顾名思义，Transformers 是将一种配置转换为另一种配置的东西。使用 Transformer，我们可以转换基本 Kubernetes YAML 配置。 Kustomize 有几个内置变压器。我们来看看一些常见的 transformers ：

- commonLabel – 为所有 Kubernetes 资源添加标签
- namePrefix – 它为所有资源添加一个公共前缀
- nameSuffix – 为所有资源添加通​​用后缀
- Namespace – 为所有资源添加一个公共命名空间
- commonAnnotations – 为所有资源添加注释

让我们看一个例子。在下图中，我们在 kustomization.yaml 中使用了 commonLabels ，其中标签 env: dev 添加到自定义的 deployment.yaml.

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.49.13.png)


## Patches (Overlays)

Patches或 overlays 提供了另一种修改 Kubernetes 配置的方法。它提供了更具体的配置部分以进行更改。我们需要提供3个参数：

1. Operation Type ：添加或删除或替换
2. Target: 我们要修改的资源名称
3. Value: 将添加或替换的值名称。对于删除操作类型，不会有任何值。

定义补丁有两种方法：

1. JSON 6902
2. Stragetic Merge Patching

这样，我们必须提供两个详细信息，目标和补丁详细信息，即操作、路径和新值。

```yaml
patches:
  - target:
      kind: Deployment
      name: web-deployment
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 5
```

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.49.34.png)


## Stragetic Merge Patching

这样，所有补丁细节都类似于标准 k8s 配置。这将是原始清单文件，我们只需添加需要修改的字段。

这是内联战略合并修补的示例。

```yaml 

patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: web-deployment
      spec:
        replicas: 5
```

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.49.54.png)


## Patch From File 

对于这两种类型的修补，我们可以使用单独的文件方法，而不是内联配置。在 YAML 文件中指定所有补丁详细信息，并将其引用到 patch 指令下的 kustomization.yaml 文件。


例如，在 kustomization.yaml 中，您需要提及补丁文件，如下所示。您需要指定 YAML 文件的相对路径。

```shell
patches:
- path: replicas.yaml
```

我们可以将更改放入 replicas.yaml 中，如下所示。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 5
```

现在我们已经很好地理解了 Kustomize 的所有基本概念，接下来让我们将学到的知识付诸实践。

## 使用 Kustomize 部署应用程序

让我们看看 Kustomize 如何使用涉及不同环境的真实部署场景来工作。

注意：为了演示目的，我们给出了一个只有两个环境的简单 YAML 文件。在实际项目中，YAML 可能会更复杂，涉及不同的对象和更多的部署环境。

让我们假设以下场景。

1. dev和prod中需要部署Nginx Web服务器
2. 在开发中，我们只需要一个具有 2 个副本的部署、一个 Nodeport 服务以及更少的内存和 CPU 资源。
3. 在产品中，我们需要一个具有 4 个副本、不同的 CPU 和内存限制、滚动更新策略以及没有 NodePort 的服务的部署。
让我们看看如何使用 Kustomize 实现这一目标。


Github 存储库：本指南中使用的所有清单均托管在 [Kustomize Github 存储库中](https://github.com/techiescamp/kustomize)。

以下是使用 Kustomize 的目录结构。

```yaml
├── kustomize
  ├── base
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── kustomization.yaml
    └ overlays
        ├── dev
        │   ├── deployment-dev.yaml
        |   ├── service-dev.yaml
        │   └── kustomization.yaml
        └── prod
            ├── deployment-prod.yaml
            ├── service-prod.yaml
            └── kustomization.yaml
```


您可以使用 GitHub 存储库文件作为参考，也可以使用以下命令创建相应的文件夹和文件：

```shell
mkdir -p kustomize/base && 
    touch kustomize/base/deployment.yaml \
         kustomize/base/service.yaml \
         kustomize/base/kustomization.yaml && 
    mkdir -p kustomize/overlays/dev && 
    touch kustomize/overlays/dev/deployment-dev.yaml \
         kustomize/overlays/dev/service-dev.yaml \
         kustomize/overlays/dev/kustomization.yaml && 
    mkdir -p kustomize/overlays/prod && 
    touch kustomize/overlays/prod/deployment-prod.yaml \
         kustomize/overlays/prod/service-prod.yaml \
         kustomize/overlays/prod/kustomization.yaml
```

## Base Folder 基本文件夹

基本文件夹包含deployment, service, 和 kustomization files。在此基本文件夹中，我们添加部署和服务 YAML 以及所有环境通用的所有配置。


```yaml
//base/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80

# base/service.yaml

apiVersion: v1
  kind: Service
  metadata:
    name: web-service
  spec:
    selector:
      app: web
    ports:
    - name: http
      port: 80
# base/kustomization.yaml

apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
  
resources:
- deployment.yaml
- service.yaml
```        

## Dev Overlay Folder 

让我们定义 Dev  overlays 文件。我们只想在 deployment.yaml 中进行更改，因此我们只定义它。

```yaml
# deployment-dev.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 3 # Update the replica count to 3
  template:
    spec:
      containers:
      - name: nginx
        resources:
          limits:
            cpu: "200" # Lower CPU limit to 200m (0.2 CPU cores)
            memory: "256Mi" # Lower memory limit to 256 MiB
          requests:
            cpu: "100" # Lower CPU request to 100m (0.1 CPU cores)
            memory: "128Mi"
```

在开发部署中，我们只想将副本从 1 个增加到 2 个。您可以看到我们只定义了更改，而不定义其他内容。 Kustomize 将检查基础部署文件并进行比较，并相应地修补更改。这就是 Kustomize 的魅力所在。

```yaml
# 在开发中，我们需要带有节点端口的服务。因此，我们将创建一个类型为 Nodeport 的覆盖层。
# service-dev.yaml

apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: NodePort
```

kustomization.yaml


正如我们在博客前面讨论的那样，我们正在使用单独文件方法进行战略合并修补。您还可以注意到我们在这里也定义了资源，这就是为什么 Kustomize 需要知道基本文件的路径。

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- ../../base

patches:
- path: deployment-dev.yaml
- path: service-dev.yaml
```

让我们回顾一下补丁。我们可以使用以下命令来查看补丁并检查一切是否正确。

```shell
kustomize build overlays/dev
```

它将呈现以下 Kubernetes 清单，如下所示。

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-01-17%20%E4%B8%8B%E5%8D%882.50.21.png)

可以看到，部署中的副本数量增加到2个，不同的CPU和内存资源以及服务类型更改为NodePort。现在这是开发环境所需的配置。

我们可以使用以下命令部署自定义清单。

```shell
kustomize build overlays/dev | kubectl apply -f -

kubectl apply -k overlays/dev
```

## Prod Overlay Folder

deployment-prod.yaml

在生产环境部署中，我们添加了 RollingUpdate 策略，其中包含 4 个部署副本以及不同的内存和 CPU 资源。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  template:
    replicas: 4 # Update the replica count to 3
    spec:
      containers:
      - name: nginx
        resources:
          limits:
            cpu: "1" # Lower CPU limit to 200m (0.2 CPU cores)
            memory: "1Gi" # Lower memory limit to 256 MiB
          requests:
            cpu: "500" # Lower CPU request to 100m (0.1 CPU cores)
            memory: "512Mi" # Lower memory request to 128 MiB
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
# service-prod.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: NodePort      
```     

kustomization.yaml

在 kustomization.yaml 中，我添加了两个文件的绝对路径以进行修补，因为我们想要在 prod 中进行一些更改。

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- ../../base

patches:
- path: deployment-prod.yaml
- path: service-prod.yaml
```

![扫码加小助手微信，拉你进技术交流群🔥](https://raw.githubusercontent.com/mouuii/picture/master/weichat.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

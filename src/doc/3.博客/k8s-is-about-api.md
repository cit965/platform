---
title: k8s-is-about-api
icon: circle-info
---
![](https://arthurchiao.art/assets/img/k8s-is-about-apis/k8s-is-about-apis.jpeg)

本文最初串联了以下几篇文章的核心部分，

1.  [Kubernetes isn’t about containers](https://blog.joshgav.com/2021/12/16/kubernetes-isnt-about-containers.html)，2021
2.  [Kubernetes is a Database](https://github.com/gotopple/k8s-for-users-intro/blob/master/database.md), 2019
3.  [CRD is just a table in Kubernetes](https://itnext.io/crd-is-just-a-table-in-kubernetes-13e15367bbe4), 2020

论述了 K8s 的核心价值是其通用、跨厂商和平台、可灵活扩展的声明式 API 框架， 而不是容器（虽然容器是它成功的基础）；然后手动创建一个 API extension（CRD）， 通过测试和类比来对这一论述有一个更直观的理解。

例子及测试基于 K8s `v1.21.0`，感谢原作者们的精彩文章。

-   [K8s 的核心是 API 而非容器（一）：从理论到 CRD 实践（2022）](https://arthurchiao.art/blog/k8s-is-about-apis-zh/)
-   [K8s 的核心是 API 而非容器（二）：从开源项目看 k8s 的几种 API 扩展机制（2023）](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/)

___

-   [1 K8s 的核心是其 API 框架而非容器](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#1-k8s-%E7%9A%84%E6%A0%B8%E5%BF%83%E6%98%AF%E5%85%B6-api-%E6%A1%86%E6%9E%B6%E8%80%8C%E9%9D%9E%E5%AE%B9%E5%99%A8)
    -   [1.1 容器是基础](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#11-%E5%AE%B9%E5%99%A8%E6%98%AF%E5%9F%BA%E7%A1%80)
    -   [1.2 API 才是核心](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#12-api-%E6%89%8D%E6%98%AF%E6%A0%B8%E5%BF%83)
        -   [1.2.1 K8s 之前：各自造轮子，封装厂商 API 差异](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#121-k8s-%E4%B9%8B%E5%89%8D%E5%90%84%E8%87%AA%E9%80%A0%E8%BD%AE%E5%AD%90%E5%B0%81%E8%A3%85%E5%8E%82%E5%95%86-api-%E5%B7%AE%E5%BC%82)
        -   [1.2.2 K8s 面世：标准化、跨厂商的 API、结构和语义](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#122-k8s-%E9%9D%A2%E4%B8%96%E6%A0%87%E5%87%86%E5%8C%96%E8%B7%A8%E5%8E%82%E5%95%86%E7%9A%84-api%E7%BB%93%E6%9E%84%E5%92%8C%E8%AF%AD%E4%B9%89)
        -   [1.2.3 K8s API 扩展：CRD](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#123-k8s-api-%E6%89%A9%E5%B1%95crd)
    -   [1.3 小结](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#13-%E5%B0%8F%E7%BB%93)
-   [2 K8s 的 API 类型](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#2-k8s-%E7%9A%84-api-%E7%B1%BB%E5%9E%8B)
    -   [2.1 标准 API（针对内置资源类型）](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#21-%E6%A0%87%E5%87%86-api%E9%92%88%E5%AF%B9%E5%86%85%E7%BD%AE%E8%B5%84%E6%BA%90%E7%B1%BB%E5%9E%8B)
        -   [2.1.1 Namespaced 类型](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#211-namespaced-%E7%B1%BB%E5%9E%8B)
        -   [2.1.2 Un-namespaced 类型](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#212-un-namespaced-%E7%B1%BB%E5%9E%8B)
    -   [2.2 扩展 API（`apiextension`）](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#22-%E6%89%A9%E5%B1%95-apiapiextension)
        -   [2.2.1 Namespaced 类型](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#221-namespaced-%E7%B1%BB%E5%9E%8B)
        -   [2.2.2 Un-namespaced 类型](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#222-un-namespaced-%E7%B1%BB%E5%9E%8B)
    -   [2.3 CRD](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#23-crd)
-   [3 直观类比：K8s 是个数据库，CRD 是一张表，API 是 SQL](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#3-%E7%9B%B4%E8%A7%82%E7%B1%BB%E6%AF%94k8s-%E6%98%AF%E4%B8%AA%E6%95%B0%E6%8D%AE%E5%BA%93crd-%E6%98%AF%E4%B8%80%E5%BC%A0%E8%A1%A8api-%E6%98%AF-sql)
    -   [3.1 K8s 是个数据库](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#31-k8s-%E6%98%AF%E4%B8%AA%E6%95%B0%E6%8D%AE%E5%BA%93)
    -   [3.2 CRD 是一张表](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#32-crd-%E6%98%AF%E4%B8%80%E5%BC%A0%E8%A1%A8)
        -   [3.2.1 定义表结构（CRD spec）](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#321-%E5%AE%9A%E4%B9%89%E8%A1%A8%E7%BB%93%E6%9E%84crd-spec)
        -   [3.2.2 测试：CR 增删查改 vs. 数据库 SQL](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#322-%E6%B5%8B%E8%AF%95cr-%E5%A2%9E%E5%88%A0%E6%9F%A5%E6%94%B9-vs-%E6%95%B0%E6%8D%AE%E5%BA%93-sql)
    -   [3.3 API 是 SQL](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#33-api-%E6%98%AF-sql)
-   [4 其他](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#4-%E5%85%B6%E4%BB%96)
    -   [4.1 给 CR 打标签（label），根据 label 过滤](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#41-%E7%BB%99-cr-%E6%89%93%E6%A0%87%E7%AD%BElabel%E6%A0%B9%E6%8D%AE-label-%E8%BF%87%E6%BB%A4)
    -   [4.2 K8s API 与鉴权控制（RBAC）](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#42-k8s-api-%E4%B8%8E%E9%89%B4%E6%9D%83%E6%8E%A7%E5%88%B6rbac)
-   [参考资料](https://arthurchiao.art/blog/k8s-is-about-apis-zh/#%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99)

___

## 1 K8s 的核心是其 API 框架而非容器

## 1.1 容器是基础

时间回到 2013 年。当一条简单的 `docker run postgre` 命令就能运行起 postgre 这样 复杂的传统服务时，开发者在震惊之余犹如受到天启；以 docker 为代表的实用容器技术的 横空出世，也预示着一扇通往敏捷基础设施的大门即将打开。此后，一切都在往好的方向迅速发展：

-   越来越多的开发者开始采用**容器作为一种标准构建和运行方式**，
-   业界也意识到，很容易将这种封装方式引入计算集群，通过 Kubernetes 或 Mesos 这样的编排器来调度计算任务 —— 自此，**容器便成为这些调度器最重要的 workload 类型**。

但本文将要说明，容器并非 Kubernetes 最重要、最有价值的地方，Kubernetes 也并非 仅仅是一个更广泛意义上的 workload 调度器 —— 高效地调度不同类型的 workload 只是 Kubernetes 提供的一种重要价值，但并不是它成功的原因。

## 1.2 API 才是核心

![](https://arthurchiao.art/assets/img/k8s-is-about-apis/k8s-is-about-apis.jpeg)

> “等等 —— **K8s 只是一堆 API？**”
> 
> “不好意思，一直都是！”

K8s 的成功和价值在于，提供了一种标准的编程接口（API），可以用来编写和使用 **软件定义的基础设施服务**（本文所说的“基础设施”，**范围要大于 IAAS**）：

-   Specification + Implementation 构成一个完整的 API 框架 —— 用于设计、实现和使用**各种类型和规模的基础设施服务**；
-   这些 API 都基于相同的核心结构和语义：**typed resources watched and reconciled by controllers** （资源按类型划分，控制器监听相应类型的资源，并将其实际 status 校准到 spec 里期望的状态）。

为了进一步解释这一点，考虑下 Kubernetes 出现之前的场景。

### 1.2.1 K8s 之前：各自造轮子，封装厂商 API 差异

K8s 之前，基础设施基本上是各种不同 API、格式和语义的“云”服务组成的大杂烩：

1.  云厂商只提供了计算实例、块存储、虚拟网络和对象存储等基础构建模块，开发者需要像拼图一样将它们拼出一个相对完整的基础设施方案；
2.  对于其他云厂商，重复过程 1，因为各家的 API、结构和语义并不相同，甚至差异很大。

虽然 Terraform 等工具的出现，提供了一种跨厂商的通用格式，但原始的结构和语义仍然 是五花八门的，—— 针对 AWS 编写的 Terraform descriptor 是无法用到 Azure 的。

### 1.2.2 K8s 面世：标准化、跨厂商的 API、结构和语义

现在再来看 Kubernetes 从一开始就提供的东西：描述各种资源需求的标准 API。例如，

-   描述 pod、container 等**计算需求** 的 API；
-   描述 service、ingress 等**虚拟网络功能** 的 API；
-   描述 volumes 之类的**持久存储** 的 API；
-   甚至还包括 service account 之类的**服务身份** 的 API 等等。

这些 API 是跨公有云/私有云和各家云厂商的，各云厂商会将 Kubernetes 结构和语义 对接到它们各自的原生 API。 因此我们可以说，Kubernetes 提供了一种**管理软件定义基础设施（也就是云）的标准接口**。 或者说，Kubernetes 是一个针对云服务（cloud services）的标准 API 框架。

### 1.2.3 K8s API 扩展：CRD

提供一套跨厂商的标准结构和语义来声明核心基础设施（pod/service/volume/serviceaccount/…）， 是 Kubernetes 成功的基础。在此基础上，它又通过 CRD（Custom Resource Definition）， 将这个结构**扩展到任何/所有基础设施资源**。

-   CRD 在 1.7 引入，允许云厂商和开发者自己的服务复用 K8s 的 spec/impl 编程框架。
    
    有了 CRD，用户不仅能声明 Kubernetes API 预定义的计算、存储、网络服务， 还能声明数据库、task runner、消息总线、数字证书 … 任何云厂商能想到的东西！
    
-   [Operator Framework](https://operatorframework.io/) 以及 [SIG API Machinery](https://github.com/kubernetes/community/tree/master/sig-api-machinery) 等项目的出现，提供了方便地创建和管理这些 CRD 的工具，最小化用户工作量，最大程度实现标准化。
    

例如，Crossplane 之类的项目，将厂商资源 RDS 数据库、SQS queue 资源映射到 Kubernetes API，就像核心 K8s controller 一样用自己的 controller 来管理网卡、磁盘等自定义资源。 Google、RedHat 等 Kubernetes 发行商也在它们的基础 Kubernetes 发行版中包含越来越多的自定义资源类型。

## 1.3 小结

我们说 Kubernetes 的核心是其 API 框架，但**并不是说这套 API 框架就是完美的**。 事实上，后一点并不是（非常）重要，因为 Kubernetes 模型已经成为一个事实标准： 开发者理解它、大量工具主动与它对接、主流厂商也都已经原生支持它。用户认可度、互操作性 经常比其他方面更能决定一个产品能否成功。

随着 Kubernetes 资源模型越来越广泛的传播，现在已经能够 用一组 Kubernetes 资源来描述一整个**软件定义计算环境**。 就像用 `docker run` 可以启动单个程序一样，用 `kubectl apply -f` 就能部署和运行一个分布式应用， 而无需关心是在私有云还是公有云以及具体哪家云厂商上，Kubernetes 的 API 框架已经屏蔽了这些细节。

因此，Kubernetes 并不是关于容器的，而是关于 API。

## 2 K8s 的 API 类型

可以通过 `GET/LIST/PUT/POST/DELETE` 等 API 操作，来创建、查询、修改或删除集群中的资源。 各 controller 监听到资源变化时，就会执行相应的 reconcile 逻辑，来使 status 与 spec 描述相符。

## 2.1 标准 API（针对内置资源类型）

### 2.1.1 Namespaced 类型

这种类型的资源是区分 namespace，也就是可以用 namespace 来隔离。 大部分内置资源都是这种类型，包括：

-   pods
-   services
-   networkpolicies

API 格式：

-   格式：**`/api/{version}/namespaces/{namespace}/{resource}`**
-   举例：`/api/v1/namespaces/default/pods`

### 2.1.2 Un-namespaced 类型

这种类型的资源是全局的，**不能用 namespace 隔离**，例如：

-   nodes
-   clusterroles (`clusterxxx` 一般都是，表示它是 cluster-scoped 的资源）

API 格式：

-   格式：**`/api/{version}/{resource}`**
-   举例：`/api/v1/nodes`

## 2.2 扩展 API（`apiextension`）

### 2.2.1 Namespaced 类型

API 格式：

-   格式：**`/apis/{apiGroup}/{apiVersion}/namespaces/{namespace}/{resource}`**
-   举例：`/apis/cilium.io/v2/namespaces/kube-system/ciliumnetworkpolicies`

### 2.2.2 Un-namespaced 类型

略。

## 2.3 CRD

用户发现了 k8s 的强大之后，希望将越来越多的东西（数据）放到 k8s 里面， 像内置的 Pod、Service、NetworkPolicy 一样来管理，因此出现了两个东西：

1.  CRD：用来声明用户的自定义资源，例如它是 namespace-scope 还是 cluster-scope 的资源、有哪些字段等等，**K8s 会自动根据这个定义生成相应的 API**；
    
    官方文档的[例子](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#create-a-customresourcedefinition)， 后文也将给出一个更简单和具体的例子。
    
    CRD 是资源类型定义，具体的资源叫 CR。
    
2.  Operator 框架：“operator” 在这里的字面意思是**“承担运维任务的程序”**， 它们的基本逻辑都是一样的：时刻盯着资源状态，一有变化马上作出反应（也就是 reconcile 逻辑）。
    

这就是扩展 API 的（最主要）声明和使用方式。

至此，我们讨论的都是一些比较抽象的东西，接下来通过一些例子和类比来更直观地理解一下。

## 3 直观类比：K8s 是个数据库，CRD 是一张表，API 是 SQL

在本节中，我们将创建一个名为 `fruit` 的 CRD，它有 `name/sweet/weight` 三个字段， 完整 CRD 如下，

```
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: fruits.example.org        # CRD 名字
spec:
  conversion:
    strategy: None
  group: example.org              # REST API: /apis/<group>/<version>
  names:
    kind: Fruit
    listKind: FruitList
    plural: fruits
    singular: fruit
  scope: Namespaced               # Fruit 资源是区分 namespace 的
  versions:
  - name: v1                      # REST API: /apis/<group>/<version>
    schema:
      openAPIV3Schema:
        properties:
          spec:
            properties:
              comment:            # 字段 1，表示备注
                type: string
              sweet:              # 字段 2，表示甜否
                type: boolean
              weight:             # 字段 3，表示重量
                type: integer
            type: object
        type: object
    served: true                  # 启用这个版本的 API（v1）
    storage: true
    additionalPrinterColumns:     # 可选项，配置了这些 printer columns 之后，
    - jsonPath: .spec.sweet       # 命令行 k get <crd> <cr> 时，能够打印出下面这些字段，
      name: sweet                 # 否则，k8s 默认只打印 CRD 的 NAME 和 AGE
      type: boolean
    - jsonPath: .spec.weight
      name: weight
      type: integer
    - jsonPath: .spec.comment
      name: comment
      type: string
```

后面会解释每个 section 都是什么意思。在此之前，先来做几个（直观而粗糙的）类比。

## 3.1 K8s 是个数据库

像其他数据库技术一样，它有自己的持久存储引擎（etcd），以及构建在存储引擎之上的 一套 API 和语义。这些语义允许用户创建、读取、更新和删除（CURD）数据库中的数据。 下面是一些**概念对应关系**：

| 关系型数据库 | Kubernetes (as a database) | 说明 |
| --- | --- | --- |
| `DATABASE` | cluster | 一套 K8s 集群就是一个 database 【注 1】 |
| `TABLE` | `Kind` | 每种资源类型对应一个表；分为内置类型和扩展类型 【注 2】 |
| `COLUMN` | property | 表里面的列，可以是 string、boolean 等类型 |
| rows | resources | 表中的一个具体 record |

> 【注 1】 如果只考虑 namespaced 资源的话，也可以说一个 namespace 对应一个 database。
> 
> 【注 2】 前面已经介绍过，
> 
> -   内置 `Kind`：Job、Service、Deployment、Event、NetworkPolicy、Secret、ConfigMap 等等；
> -   扩展 `Kind`：各种 CRD，例如 CiliumNetworkPolicy。

所以，和其他数据库一样，本质上 Kubernetes 所做的不过是以 schema 规定的格式来处理 records。

另外，Kubernetes 的表都有**自带文档**：

```
$ k explain fruits
KIND:     Fruit
VERSION:  example.org/v1

DESCRIPTION:
     <empty>

FIELDS:
   apiVersion   <string>
     APIVersion defines the versioned schema of this representation of an
     object. Servers should convert recognized schemas to the latest internal
     value, and may reject unrecognized values. More info:
     https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources

   kind <string>
     Kind is a string value representing the REST resource this object
     represents. Servers may infer this from the endpoint the client submits
     requests to. Cannot be updated. In CamelCase. More info:
     https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds

   metadata     <Object>
     Standard object's metadata. More info:
     https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata

   spec <Object>
```

另外，Kubernetes API 还有**两大特色**：

1.  极其可扩展：声明 CRD 就会自动创建 API；
2.  支持事件驱动。

## 3.2 CRD 是一张表

CRD 和内置的 Pod、Service、NetworkPolicy 一样，不过是数据库的一张表。 例如，前面给出的 `fruit` CRD，有 `name/sweet/weight` 列，以及 “apple”, “banana” 等 entry，

![](https://arthurchiao.art/assets/img/k8s-is-about-apis/table-vs-crd.png)

用户发现了 k8s 的强大，希望将越来越多的东西（数据）放到 k8s 里面来管理。数据类 型显然多种多样的，不可能全部内置到 k8s 里。因此，一种方式就是允许用户创建自己的 “表”，设置自己的“列” —— 这正是 CRD 的由来。

### 3.2.1 定义表结构（CRD spec）

CRD（及 CR）描述格式可以是 YAML 或 JSON。CRD 的内容可以简单分为三部分：

1.  **常规 k8s metadata**：每种 K8s 资源都需要声明的字段，包括 `apiVersion`、`kind`、`metadata.name` 等。
```
 apiVersion: apiextensions.k8s.io/v1
 kind: CustomResourceDefinition
 metadata:
   name: fruits.example.org        # CRD 名字
```
    
2.  **Table-level 信息**：例如表的名字，最好用小写，方便以后命令行操作；
    
```
 spec:
   conversion:
     strategy: None
   group: example.org              # REST API: /apis/<group>/<version>
   names:
     kind: Fruit
     listKind: FruitList
     plural: fruits
     singular: fruit
   scope: Namespaced               # Fruit 资源是区分 namespace 的
```
    
3.  **Column-level 信息**：列名及类型等等，遵循 OpenAPISpecification v3 规范。
    
```
   versions:
   - name: v1                      # REST API: /apis/<group>/<version>
     schema:
       openAPIV3Schema:
         properties:
           spec:
             properties:
               comment:            # 字段 1，表示备注
                 type: string
               sweet:              # 字段 2，表示甜否
                 type: boolean
               weight:             # 字段 3，表示重量
                 type: integer
             type: object
         type: object
     served: true                  # 启用这个版本的 API（v1）
     storage: true
     additionalPrinterColumns:     # 可选项，配置了这些 printer columns 之后，
     - jsonPath: .spec.sweet       # 命令行 k get <crd> <cr> 时，能够打印出下面这些字段，
       name: sweet                 # 否则，k8s 默认只打印 CRD 的 NAME 和 AGE
       type: boolean
     - jsonPath: .spec.weight
       name: weight
       type: integer
     - jsonPath: .spec.comment
       name: comment
       type: string
```
    

### 3.2.2 测试：CR 增删查改 vs. 数据库 SQL

1.  创建 CRD：这一步相当于 **`CREATE TABLE fruits ...;`**，
    
```
 $ kubectl create -f fruits-crd.yaml
 customresourcedefinition.apiextensions.k8s.io/fruits.example.org created
```
    
2.  创建 CR：相当于 **`INSERT INTO fruits values(...);`**，
    
    `apple-cr.yaml`：
    
```
 apiVersion: example.org/v1
 kind: Fruit
 metadata:
   name: apple
 spec:
   sweet: false
   weight: 100
   comment: little bit rotten
```
    
    `banana-cr.yaml`：
    
```
 apiVersion: example.org/v1
 kind: Fruit
 metadata:
   name: banana
 spec:
   sweet: true
   weight: 80
   comment: just bought
```
    
    创建：
    
```
 $ kubectl create -f apple-cr.yaml
 fruit.example.org/apple created
 $ kubectl create -f banana-cr.yaml
 fruit.example.org/banana created
 ```
    
1.  查询 CR：相当于 **`SELECT * FROM fruits ... ;`** 或 **`SELECT * FROM fruits WHERE name='apple';`**。
    
```
 $ k get fruits.example.org # or kubectl get fruits
 NAME     SWEET   WEIGHT   COMMENT
 apple    false   100      little bit rotten
 banana   true    80       just bought

 $ kubectl get fruits apple
 NAME    SWEET   WEIGHT   COMMENT
 apple   false   100      little bit rotten
```
    
4.  删除 CR：相当于 **`DELETE FROM fruits WHERE name='apple';`**，
    
```
      $ kubectl delete fruit apple
```
    

可以看到，CRD/CR 的操作都能对应到常规的数据库操作。

## 3.3 API 是 SQL

上一节我们是通过 `kubectl` 命令行来执行 CR 的增删查改，它其实只是一个外壳，内部 调用的是 **Kubernetes 为这个 CRD 自动生成的 API** —— 所以 又回到了本文第一节论述的内容：**K8s 的核心是其 API 框架**。

只要在执行 `kubectl` 命令时**指定一个足够大的 loglevel**，就能看到 背后的具体 API 请求。例如，

```
$ kubectl create -v 10 -f apple-cr.yaml
  ...
  Request Body: {"apiVersion":"example.org/v1","kind":"Fruit",\"spec\":{\"comment\":\"little bit rotten\",\"sweet\":false,\"weight\":100}}\n"},"name":"apple","namespace":"default"},"spec":{"comment":"little bit rotten","sweet":false,"weight":100}}
  curl -k -v -XPOST 'https://127.0.0.1:6443/apis/example.org/v1/namespaces/default/fruits?fieldManager=kubectl-client-side-apply'
  POST https://127.0.0.1:6443/apis/example.org/v1/namespaces/default/fruits?fieldManager=kubectl-client-side-apply 201 Created in 25 milliseconds
  ...
</span>
```

## 4 其他

## 4.1 给 CR 打标签（label），根据 label 过滤

和内置资源类型一样，K8s 支持对 CR 打标签，然后根据标签做过滤：

```
# 查看所有 frutis
$ k get fruits
NAME     SWEET   WEIGHT   COMMENT
apple    false   100      little bit rotten
banana   true    80       just bought

# 给 banana 打上一个特殊新标签
$ k label fruits banana tastes-good=true
fruit.example.org/banana labeled

# 按标签筛选 CR
$ k get fruits -l tastes-good=true
NAME     SWEET   WEIGHT   COMMENT
banana   true    80       just bought

# 删除 label
$ k label fruits banana tastes-good-
fruit.example.org/banana labeled
```

## 4.2 K8s API 与鉴权控制（RBAC）

不管是内置 API，还是扩展 API，都能用 K8s 强大的 RBAC 来做鉴权控制。

关于如何使用 RBAC 网上已经有大量文档；但如果想了解其设计，可参考 [Cracking Kubernetes RBAC Authorization Model](https://arthurchiao.art/blog/cracking-k8s-authz-rbac/)， 它展示了如何从零开始设计出一个 RBAC 鉴权模型（假设 K8s 里还没有）。

## 参考资料

1.  [Kubernetes isn’t about containers](https://blog.joshgav.com/2021/12/16/kubernetes-isnt-about-containers.html)，2021
2.  [Kubernetes is a Database](https://github.com/gotopple/k8s-for-users-intro/blob/master/database.md), 2019
3.  [CRD is just a table in Kubernetes](https://itnext.io/crd-is-just-a-table-in-kubernetes-13e15367bbe4), 2020
4.  [Cracking Kubernetes RBAC Authorization Model](https://arthurchiao.art/blog/cracking-k8s-authz-rbac/), 2022
5.  

--- 
![扫码加小助手微信，拉你进技术交流群🔥](https://cdn.jsdelivr.net/gh/mouuii/picture/WechatIMG306.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

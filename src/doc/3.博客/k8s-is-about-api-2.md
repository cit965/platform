---
title: k8s-is-about-api-2
icon: circle-info
---
![](https://arthurchiao.art/assets/img/k8s-is-about-apis/kube-apiserver-internal.png)

Fig. kube-apiserver internal flows when processing a request. Image source [Programming Kubernetes, O'Reilly](https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/ch04.html)

第一篇介绍了 k8s 的 API 设计。本文作为第二篇，通过具体开源项目来了解 k8s API 的几种扩展机制。

-   [K8s 的核心是 API 而非容器（一）：从理论到 CRD 实践（2022）](https://arthurchiao.art/blog/k8s-is-about-apis-zh/)
-   [K8s 的核心是 API 而非容器（二）：从开源项目看 k8s 的几种 API 扩展机制（2023）](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/)

___

-   [1 引言](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#1-%E5%BC%95%E8%A8%80)
    -   [1.1 扩展 API 的需求](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#11-%E6%89%A9%E5%B1%95-api-%E7%9A%84%E9%9C%80%E6%B1%82)
    -   [1.2 K8s Resource & API 回顾](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#12-k8s-resource--api-%E5%9B%9E%E9%A1%BE)
        -   [1.2.1 API Resources](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#121-api-resources)
        -   [1.2.2 API 使用方式](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#122-api-%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F)
    -   [1.3 小结](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#13-%E5%B0%8F%E7%BB%93)
-   [2 扩展机制一：CRD](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#2-%E6%89%A9%E5%B1%95%E6%9C%BA%E5%88%B6%E4%B8%80crd)
    -   [2.1 案例需求：用 k8s 管理虚拟机](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#21-%E6%A1%88%E4%BE%8B%E9%9C%80%E6%B1%82%E7%94%A8-k8s-%E7%AE%A1%E7%90%86%E8%99%9A%E6%8B%9F%E6%9C%BA)
    -   [2.2 引入 `VirtualMachine` CRD](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#22-%E5%BC%95%E5%85%A5-virtualmachine-crd)
    -   [2.3 使用 `kubectl` 增删查改 `VirtualMachine`](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#23-%E4%BD%BF%E7%94%A8-kubectl-%E5%A2%9E%E5%88%A0%E6%9F%A5%E6%94%B9-virtualmachine)
    -   [2.4 背后的 `VirtualMachine` API](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#24-%E8%83%8C%E5%90%8E%E7%9A%84-virtualmachine-api)
    -   [2.5 小结](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#25-%E5%B0%8F%E7%BB%93)
-   [3 扩展机制二：Aggregated API Server (`APIService`)](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#3-%E6%89%A9%E5%B1%95%E6%9C%BA%E5%88%B6%E4%BA%8Caggregated-api-server-apiservice)
    -   [3.1 用户需求](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#31-%E7%94%A8%E6%88%B7%E9%9C%80%E6%B1%82)
    -   [3.2 方案设计](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#32-%E6%96%B9%E6%A1%88%E8%AE%BE%E8%AE%A1)
        -   [3.2.1 引入 kube-aggregator 模块和 `APIService` 抽象](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#321-%E5%BC%95%E5%85%A5-kube-aggregator-%E6%A8%A1%E5%9D%97%E5%92%8C-apiservice-%E6%8A%BD%E8%B1%A1)
        -   [3.2.2 kube-apiserver 内部工作流（delegate）](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#322-kube-apiserver-%E5%86%85%E9%83%A8%E5%B7%A5%E4%BD%9C%E6%B5%81delegate)
    -   [3.3 案例一：k8s 官方 `metrics-server`](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#33-%E6%A1%88%E4%BE%8B%E4%B8%80k8s-%E5%AE%98%E6%96%B9-metrics-server)
        -   [3.3.1 注册 `APIService`](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#331-%E6%B3%A8%E5%86%8C-apiservice)
        -   [3.3.2 验证注册的扩展 API](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#332-%E9%AA%8C%E8%AF%81%E6%B3%A8%E5%86%8C%E7%9A%84%E6%89%A9%E5%B1%95-api)
        -   [3.3.3 命令行支持：`k top node/pod`](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#333-%E5%91%BD%E4%BB%A4%E8%A1%8C%E6%94%AF%E6%8C%81k-top-nodepod)
    -   [3.4 案例二：kubevirt](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#34-%E6%A1%88%E4%BE%8B%E4%BA%8Ckubevirt)
        -   [3.4.1 `APIService` 注册](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#341-apiservice-%E6%B3%A8%E5%86%8C)
        -   [3.4.2 Sub-url handler 注册（`virt-api`）](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#342-sub-url-handler-%E6%B3%A8%E5%86%8Cvirt-api)
        -   [3.4.3 测试](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#343-%E6%B5%8B%E8%AF%95)
    -   [3.5 其他案例](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#35-%E5%85%B6%E4%BB%96%E6%A1%88%E4%BE%8B)
    -   [3.6 `APIService` 分类：`Local/external`](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#36-apiservice-%E5%88%86%E7%B1%BBlocalexternal)
-   [4 两种机制的对比：`CRD` vs. `APIService`](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#4-%E4%B8%A4%E7%A7%8D%E6%9C%BA%E5%88%B6%E7%9A%84%E5%AF%B9%E6%AF%94crd-vs-apiservice)
    -   [4.1 所在的资源组不同](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#41-%E6%89%80%E5%9C%A8%E7%9A%84%E8%B5%84%E6%BA%90%E7%BB%84%E4%B8%8D%E5%90%8C)
    -   [4.2 目的和场景不同](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#42-%E7%9B%AE%E7%9A%84%E5%92%8C%E5%9C%BA%E6%99%AF%E4%B8%8D%E5%90%8C)
    -   [4.3 使用建议](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#43-%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE)
-   [5 Webhook 机制](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#5-webhook-%E6%9C%BA%E5%88%B6)
    -   [5.1 Webhook 位置及原理](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#51-webhook-%E4%BD%8D%E7%BD%AE%E5%8F%8A%E5%8E%9F%E7%90%86)
    -   [5.2 Mutating 案例：过滤所有 create/update `virtualmachine` 请求](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#52-mutating-%E6%A1%88%E4%BE%8B%E8%BF%87%E6%BB%A4%E6%89%80%E6%9C%89-createupdate-virtualmachine-%E8%AF%B7%E6%B1%82)
    -   [5.3 Validating 案例：拦截驱逐 virtualmachines 请求](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#53-validating-%E6%A1%88%E4%BE%8B%E6%8B%A6%E6%88%AA%E9%A9%B1%E9%80%90-virtualmachines-%E8%AF%B7%E6%B1%82)
-   [6 结束语](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#6-%E7%BB%93%E6%9D%9F%E8%AF%AD)
-   [参考资料](https://arthurchiao.art/blog/k8s-is-about-apis-2-zh/#%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99)

___

## 1 引言

## 1.1 扩展 API 的需求

上一篇已经看到，k8s 所有资源都通过 kube-apiserver 以 API 的形式暴露给各组件和用户， 例如通过 `/api/v1/pods/...` 可以对 pod 执行增删查改操作。 但如果用户有特殊需求，无法基于现有 API 实现某些目的，该怎么办呢？

有特殊需求的场景很多，举一个更**具体的例子**： 假设我们想加一个类似于 `/api/v1/pods/namespaces/{ns}/{pod}/hotspots` 的 API， 用于查询指定 pod 的某些热点指标（用户自己采集和维护）。针对这个需求有两种常见的解决思路：

1.  **直接改 k8s 代码**，增加用户需要的 API 和一些处理逻辑；
2.  为 k8s 引入某种**通用的扩展机制**，能让用户在**不修改 k8s 代码**的情况下， 也能实现新增 API 的功能。

显然，第二种方式更为通用，而且能更快落地，因为修改 k8s 代码并合并到上游通常是一个漫长的过程。 实际上，k8s 不仅提供了这样的机制，而且还**提供了不止一种**。 本文就这一主题展开介绍。

## 1.2 K8s Resource & API 回顾

在深入理解 API 扩展机制之前，先简单回顾下 k8s 的 API 设计。更多信息可参考前一篇。

### 1.2.1 API Resources

K8s 有很多内置的**对象类型**，包括 pod、node、role、rolebinding、networkpolicy 等等， 在 k8s 术语中，它们统称为**“Resource”**（资源）。 资源通过 kube-apiserver 的 API 暴露出来，可以对它们执行增删查改操作（前提是有权限）。 用 kubectl 命令可以获取这个 resource API 列表：

```
$ k api-resources
# 名称         # 命令行简写  # API 版本   # 是否区分 ns   # 资源类型
NAME           SHORTNAMES    APIVERSION   NAMESPACED      KIND
configmaps     cm            v1           true            ConfigMap
events         ev            v1           true            Event
namespaces     ns            v1           false           Namespace
nodes          no            v1           false           Node
pods           po            v1           true            Pod
...
```

组合以上几个字段值，就可以拼出 API。例如针对内置资源类型，以及是否区分 ns，

1.  Namespaced resource
    
    -   格式：`/api/{version}/namespaces/{namespace}/{resource}`
    -   举例：`/api/v1/namespaces/default/pods`
2.  Unnamespaced resource
    
    -   格式：`/api/{version}/{resource}`
    -   举例：`/api/v1/nodes`

### 1.2.2 API 使用方式

有两种常见的使用方式：

1.  通过 SDK（例如 `client-go`）或裸代码，直接向 API 发起请求。适合**程序**使用， 例如各种自己实现的 controller、operator、apiserver 等等。
    
2.  通过 kubectl 命令行方式，它会将各种 CLI 参数拼接成对应的 API。适合**人**使用，例如问题排查；
    
```
 # 直接增删查改指定资源（或资源类型）
 $ k get pods -n kube-system -o wide

 # 向指定 API 发起请求
 $ kubectl get --raw "/apis/metrics.k8s.io/v1beta1/nodes/" | jq . | head -n 20
```
    

## 1.3 小结

有了以上铺垫，接下来我们将深入分析 k8s 提供的**两种 API 扩展机制**：

1.  CRD (Custom Reosurce Definition)，**自定义资源**
2.  Kubernetes API Aggregation Layer (APIRegistration)，直译为 **API 聚合层**

## 2 扩展机制一：CRD

扩展 k8s API 的第一种机制称为 CRD (Custom Resource Definition)， 在第一篇中已经有了比较详细的介绍。

简单来说，这种机制要求用户将自己的**自定义资源类型**描述注册到 k8s 中， 这种自定义资源类型称为 CRD，这种类型的对象称为 CR，后面会看到具体例子。 从名字 Custom **`Resource`** 就可以看出，它们**本质上也是资源**， 只不过是**用户自定义资源**，以区别于 pods/nodes/services 等**内置资源**。

## 2.1 案例需求：用 k8s 管理虚拟机

第一篇中已经有关于 CRD 创建和使用的简单例子。这里再举一个**真实例子**： k8s 只能管理容器，现在我们想让它连虚拟机也一起管理起来，也就是通过引入 **`"VirtualMachine"`** 这样一个抽象 （并实现对应的 apiserver/controller/agent 等核心组件）， 实现**通过 k8s 来创建、删除和管理虚拟机**等目的。

实际上已经有这样一个开源项目，叫 [kubevirt](https://github.com/kubevirt/kubevirt)， 已经做到生产 ready。本文接下来就拿它作为例子。

> 实际上 kubevirt 引入了多个 CRD，但本文不是关于 kubevirt 的专门介绍，因此简单起见这里只看最核心的“虚拟机”抽象。

## 2.2 引入 `VirtualMachine` CRD

我们自定义的虚拟机资源最终要对应到 **`k8s object`**， 因此要符合后者的格式要求。从最高层来看，它非常简单：

```
// https://github.com/kubevirt/kubevirt/blob/v1.0.0/staging/src/kubevirt.io/api/core/v1/types.go#L1327-L1343

// The VirtualMachine contains the template to create the VirtualMachineInstance.
type VirtualMachine struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec VirtualMachineSpec `json:"spec" valid:"required"`
	Status VirtualMachineStatus `json:"status,omitempty"`
}
```

这就是一个标准 k8s object 结构，

-   type/object metadata 字段是每个 k8s object 都要带的，
-   Spec 描述这个“虚拟机”对象长什么样（期望的状态），
    
    里面包括了 **CPU 架构（x86/arm/..）、PCIe 设备、磁盘、网卡**等等关于虚拟机的描述信息； 这里就不展开了，有兴趣可以移步相应代码链接；
    
-   Status 描述这个“虚拟机”对象现在是什么状态。

将以上结构体用 OpenAPI schema 描述，就变成 [k8s 能认的格式](https://github.com/kubevirt/kubevirt/blob/v1.0.0/pkg/virt-operator/resource/generate/components/validations_generated.go#L3524-L7729)， 然后将其注册到 k8s，相当于

```
$ k apply -f virtualmachine-cr.yaml
```

`VirtualMachine` 这个 CRD 就注册完成了。用第一篇中的类比，这就相当于**在数据库中创建了一张表**。 可以用 `kubectl explain` 等方式来查看这张“表”的字段描述：

```
$ k explain virtualmachine
GROUP:      kubevirt.io
KIND:       VirtualMachine
VERSION:    v1
...

$ k get crd virtualmachines.kubevirt.io -o yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
...
```

## 2.3 使用 `kubectl` 增删查改 `VirtualMachine`

CRD 创建好之后，就可以创建这种自定义类型的对象了。

比如下面的 [vm-cirros.yaml](https://github.com/kubevirt/kubevirt/blob/v1.0.0/examples/vm-cirros.yaml):

```
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  labels:
    kubevirt.io/vm: vm-cirros
  name: vm-cirros
spec:
  running: false
  template:
    metadata:
      labels:
        kubevirt.io/vm: vm-cirros
    spec:
      domain:
        devices:
          disks:
          - disk:
              bus: virtio
            name: containerdisk
          - disk:
              bus: virtio
            name: cloudinitdisk
        resources:
          requests:
            memory: 128Mi
      terminationGracePeriodSeconds: 0
      volumes:
      - containerDisk:
          image: registry:5000/kubevirt/cirros-container-disk-demo:devel
        name: containerdisk
```

用 kubectl apply 以上 yaml，就创建了一个虚拟机（的描述）。接下来还可以继续用 `kubectl` 对这个虚拟机执行查删改等操作，与对 pods/nodes 等原生资源的操作类似：

```
$ k get virtualmachines.kubevirt.io # or 'k get vm'
NAME                    AGE   STATUS    READY
vm-cirros               1h    Running   True
```

> 要让虚拟机正确运行，还需要实现必要的虚拟机创建和处理逻辑， 这是 kubevirt 的几个控制组件（apiserver/controller/agent）做的事情，但这不是本文重点，所以不展开。

## 2.4 背后的 `VirtualMachine` API

之所以用 `kubectl` 操作 `VirtualMachine`，是因为在创建 CRD 时，k8s 自动帮我们生成了一套对应的 API， 并同样通过 `kube-apiserver` 提供服务。在命令行加上适当的日志级别就能看到这些 API 请求：

```
$ k get vm -v 10 2>&1 | grep -v Response | grep apis
curl -v -XGET ... 'https://xxx:6443/apis?timeout=32s'
GET https://xxx:6443/apis?timeout=32s 200 OK in 2 milliseconds
curl -v -XGET ...  'https://xx:6443/apis/kubevirt.io/v1/namespaces/default/virtualmachines?limit=500'
GET https://xxx:6443/apis/kubevirt.io/v1/namespaces/default/virtualmachines?limit=500 200 OK in 6 milliseconds
```

更具体来说，CRD 的 API 会落到下面这个扩展 API 组里：

-   格式：**`/apis/{apiGroup}/{apiVersion}/namespaces/{namespace}/{resource}`**
-   举例：`/apis/kubevirt.io/v1/namespaces/default/virtualmachines`

**`k api-resources`** 会列出所在 k8s 集群所有的 API，包括内置类型和扩展类型：

```
$ k api-resources
NAME               SHORTNAMES   APIGROUP       NAMESPACED   KIND
virtualmachines    vm,vms       kubevirt.io    true         VirtualMachine
...
```

## 2.5 小结

本节介绍了第一种 API 扩展机制，对于需要引入自定义资源的场景非常有用。 但如果用户**没有要引入的新资源类型**，只是想对现有的（内置或自定义）资源类型加一些新的 API， CRD 机制就不适用了。我们再来看另一种机制。

## 3 扩展机制二：Aggregated API Server (`APIService`)

Aggregated API Server（一些文档中也缩写为 **`AA`**）也提供了一种扩展 API 的机制。 这里，**“聚合”**是为了和处理 pods/nodes/services 等资源的 **“核心”** apiserver 做区分。

> 注意，AA **并不是独立组件**，而是 `kube-apiserver` 中的一个模块， 运行在 `kube-apiserver` 进程中。

什么情况下会用到 AA 提供的扩展机制呢？

## 3.1 用户需求

如果没有要引入的自定义资源，只是想（给已有的资源）加一些新的 API，那 CRD 方式就不适用了。 两个例子，

1.  用户想引入一个服务从所有 node 收集 nodes/pods 数据，聚合之后通过 **`kube-apiserver`** 入口提供服务（而不是自己提供一个 server 入口）；
    
    这样集群内的服务，包括 k8s 自身、用户 pods 等，都可以直接通过 incluster 方式获取这些信息（前提是有权限）。
    
2.  想给上一节引入的虚拟机 API `apis/kubevirt.io/v1/namespaces/{ns}/virtualmachines/{vm}` 增加一层 sub-url，
    
    -   `apis/kubevirt.io/v1/namespaces/{ns}/virtualmachines/{vm}/start`
    -   `apis/kubevirt.io/v1/namespaces/{ns}/virtualmachines/{vm}/stop`
    -   `apis/kubevirt.io/v1/namespaces/{ns}/virtualmachines/{vm}/pause`
    -   `apis/kubevirt.io/v1/namespaces/{ns}/virtualmachines/{vm}/migrate`

## 3.2 方案设计

### 3.2.1 引入 kube-aggregator 模块和 `APIService` 抽象

-   APIService 表示的是一个有特定 GroupVersion 的 server。
-   APIService 一般用于对原有资源（API）加 subresource。

这样一个模块+模型，就能支持用户**注册新 API 到 kube-apiserver**。 举例，

-   用户将 `apis/kubevirt.io/v1/namespaces/{ns}/virtualmachines/{vm}/start` 注册到 kube-apiserver；
-   kube-apiserver 如果收到这样的请求，就将其转发给指定是 service 进行处理，例如 `kubevirt` namespace 内名为 `virt-api` 的 `Service`。

kube-apiserver **`kube-apiserver`** 在这里相当于用户服务（`virt-api`）的**反向代理**。 下面看一下它内部的真实工作流。

### 3.2.2 kube-apiserver 内部工作流（delegate）

kube-apiserver 内部实现了下面这样一个 workflow，

![](https://arthurchiao.art/assets/img/k8s-is-about-apis/kube-apiserver-internal.png)

Fig. kube-apiserver internal flows when processing a request. Image source [Programming Kubernetes, O'Reilly](https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/ch04.html)

进入到 kube-apiserver 的请求会依次经历四个阶段：

1.  **`kube-aggregator`**：处理本节这种反向代理需求，将请求转发给 API 对应的**用户服务**；如果没有命中，转 2；
2.  **`kube resources`**：处理内置的 pods, services 等**内置资源**；如果没有命中，转 3；
3.  **`apiextensions-apiserver`**：处理 **CRD 资源**的请求；如果没有命中，转 4；
4.  返回 404。

下面看两个具体案例。

## 3.3 案例一：k8s 官方 `metrics-server`

AA 机制的一个官方例子是 [github.com/kubernetes-sigs/metrics-server](https://github.com/kubernetes-sigs/metrics-server)。 它启动一个 metrics-server 从所有 kubelet 收集 pods/nodes 的 CPU、Memory 等信息， 然后向 kube-apiserver 注册若干 API，包括

-   `/apis/metrics.k8s.io/v1beta1/nodes`
-   `/apis/metrics.k8s.io/v1beta1/pods`

**`HPA、VPA、scheduler`** 等组件会通过这些 API 获取数据， 供自动扩缩容、动态调度等场景决策使用。

### 3.3.1 注册 `APIService`

```
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    k8s-app: metrics-server
  name: v1beta1.metrics.k8s.io
spec:
  group: metrics.k8s.io       # 所有到 /apis/metrics.k8s.io/v1beta1/ 的请求
  groupPriorityMinimum: 100
  insecureSkipTLSVerify: true # 用 http 转发请求
  service:                    # 请求转发给这个 service
    name: metrics-server
    namespace: kube-system
  version: v1beta1
  versionPriority: 100
```

以上 yaml 表示，如果请求的 URL 能匹配到 API 前缀 **`/apis/metrics.k8s.io/v1beta1/`**，那么 `kube-apiserver` 就用 HTTP（insecure）的方式将请求转发给 `kube-system/metrics-server` 进行处理。

我们能进一步在 api-resource 列表看到 metrics-server 注册了那些 API：

```
$ k api-resources | grep metrics.k8s.io
nodes   metrics.k8s.io     false        NodeMetrics
pods    metrics.k8s.io     true         PodMetrics
...
```

这两个 API 对应的完整 URL 是 **`/apis/metrics.k8s.io/v1beta1/{nodes,pods}`**。

### 3.3.2 验证注册的扩展 API

用 kubectl 访问 metrics-server 注册的 API，这个请求会发送给 kube-apiserver：

```
$ kubectl get --raw "/apis/metrics.k8s.io/v1beta1/nodes/" | jq . | head -n 20
{
  "kind": "NodeMetricsList",
  "apiVersion": "metrics.k8s.io/v1beta1",
  "metadata": {
    "selfLink": "/apis/metrics.k8s.io/v1beta1/nodes/"
  },
  "items": [
    {
      "metadata": {
        "name": "node1",
        "selfLink": "/apis/metrics.k8s.io/v1beta1/nodes/node1",
      },
      "timestamp": "2023-10-14T16:26:56Z",
      "window": "30s",
      "usage": {
        "cpu": "706808951n",
        "memory": "6778764Ki"
      }
    },
...
```

成功拿到了所有 node 的 CPU 和 Memory 使用信息。

> 直接 `curl` API 也可以，不过 kube-apiserver 是 https 服务，所以要加上几个证书才行。
> 
> ```
> $ cat curl-k8s-apiserver.sh
> curl -s --cert /etc/kubernetes/pki/admin.crt --key /etc/kubernetes/pki/admin.key --cacert /etc/kubernetes/pki/ca.crt $@
> 
> $ ./curl-k8s-apiserver.sh https://localhost:6443/apis/metrics.k8s.io/v1beta1/nodes/
> ```

类似地，获取指定 pod 的 CPU/Memory metrics：

```
$ kubectl get --raw "/apis/metrics.k8s.io/v1beta1/namespaces/default/pods/cilium-smoke-0" | jq '.'
{
  "kind": "PodMetrics",
  "apiVersion": "metrics.k8s.io/v1beta1",
  "metadata": {
    "name": "cilium-smoke-0",
    "namespace": "default",
    "selfLink": "/apis/metrics.k8s.io/v1beta1/namespaces/default/pods/cilium-smoke-0",
  },
  "timestamp": "2023-10-14T16:28:37Z",
  "window": "30s",
  "containers": [
    {
      "name": "nginx",
      "usage": {
        "cpu": "7336n",
        "memory": "3492Ki"
      }
    }
  ]
}
```

### 3.3.3 命令行支持：`k top node/pod`

metrics-server 是官方项目，所以它还在 kubectl 里面加了几个子命令来对接这些扩展 API， 方便集群管理和问题排查：

```
$ k top node
NAME     CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
node-1   346m         1%     6551Mi          2%
node-2   743m         1%     8439Mi          3%
node-4   107m         0%     6606Mi          2%
node-3   261m         0%     8759Mi          3%
```

一般的 AA 项目是不会动 kubectl 代码的。

## 3.4 案例二：kubevirt

### 3.4.1 `APIService` 注册

注册一个名为 `v1.subresources.kubevirt.io` 的 APIService 到 k8s 集群：

> 具体到 kubevirt 代码，它是通过 virt-operator 注册的 pkg/virt-operator/resource/generate/components/apiservices.go

```
$ k get apiservices v1.subresources.kubevirt.io -o yaml
```

```
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1.subresources.kubevirt.io
spec:
  group: subresources.kubevirt.io  # 所有到 /apis/subresources.kubevirt.io/v1/ 的请求
  version: v1
  groupPriorityMinimum: 1000
  caBundle: LS0tLS1C...0tLS0K      # https 转发请求，用这个证书
  service:                         # 转发给这个 service
    name: virt-api
    namespace: kubevirt
    port: 443
  versionPriority: 15
status:
  conditions:
    message: all checks passed     # 所有检查都通过了，现在是 ready 状态
    reason: Passed
    status: "True"
    type: Available
```

以上表示，所有到 `/apis/subresources.kubevirt.io/v1/` 的请求，kube-apiserver 应该用 HTTPS 转发给 **`kubevirt/virt-api`** 这个 service 处理。 查看这个 `service`：

```
$ k get svc -n kubevirt virt-api -o wide
NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE   SELECTOR
virt-api   ClusterIP   10.7.10.6    <none>        443/TCP   1d    kubevirt.io=virt-api
```
另外注意，status 里面有个 available 字段， 用来指示后端 service 健康检测是否正常。状态不正常时的表现：

```
$ k get apiservice -o wide | grep kubevirt
v1.kubevirt.io                Local                   True                       5h2m
v1.subresources.kubevirt.io   kubevirt/virt-api       False (MissingEndpoints)   5h1m
```
提示 service 没有 endpoints（pods）。

### 3.4.2 Sub-url handler 注册（`virt-api`）

`virt-api` 这个服务在启动时会[注册几十个 subresource](https://github.com/kubevirt/kubevirt/blob/v1.0.0/pkg/virt-api/api.go#L214)，

-   `/apis/subresources.kubevirt.io/v1/namespaces/default/virtualmachineinstances/{name}/console`
-   `/apis/subresources.kubevirt.io/v1/namespaces/default/virtualmachineinstances/{name}/restart`
-   `/apis/subresources.kubevirt.io/v1/namespaces/default/virtualmachineinstances/{name}/freeze`
-   …

可以看到这些都会命中上面注册的 `APIService`，因此当有这样的请求到达 kube-apiserver 时， 就会通过 https 将请求转发给 `virt-api` 进行处理。

### 3.4.3 测试

在 master node 上用命令 **`virtctl console kubevirt-smoke-fedora`** 登录 VM 时，下面是抓取到的 **kube-apiserver audit log**：

```
* username: system:unsecured
* user_groups: ["system:masters","system:authenticated"]
* request_uri: /apis/subresources.kubevirt.io/v1/namespaces/default/virtualmachineinstances/kubevirt-smoke-fedora/console
```

可以看到确实请求的以上 sub-url。这个请求的大致路径：

```
virtctl (CLI) &lt;-&gt; kube-apiserver &lt;-&gt; kube-aggregator (in kube-apiserver) &lt;-&gt; virt-api service &lt;-&gt; virt-api pods &lt;-&gt; virt-handler (agent)
```

## 3.5 其他案例

1.  **`podexec/podlogs`**，都在 [apiserver-builder](https://github.com/kubernetes-sigs/apiserver-builder-alpha/tree/master/example) 项目内， 分别是 `k exec <pod>` 和 `k logs <pod>` 背后调用的 API：
    
```
 $ k -v 10 exec -it -n kube-system coredns-pod-1 bash 2>&1 | grep -v Response | grep api | grep exec
 curl -v -XPOST ... 'https://xx:6443/api/v1/namespaces/kube-system/pods/coredns-pod-1/exec?command=bash&container=coredns&stdin=true&stdout=true&tty=true'
 POST https://xx:6443/api/v1/namespaces/kube-system/pods/coredns-pod-1/exec?command=bash&container=coredns&stdin=true&stdout=true&tty=true 403 Forbidden in 36 milliseconds
```
    
1.  [**`custom-metrics-server`**](https://github.com/kubernetes-sigs/custom-metrics-apiserver)
    
    这跟前面介绍的 `metrics-server` 并不是同一个项目，这个收集的是其他 metrics。 `metrics-server` 只用到了 `APIService`，这个还用到了 subresource。
    

## 3.6 `APIService` 分类：`Local/external`

查看**集群中所有 apiservice**：

```
$ k get apiservices
NAME                                   SERVICE             AVAILABLE   AGE
v1.                                    Local               True        26d
v1.acme.cert-manager.io                Local               True        4d5h
v1.admissionregistration.k8s.io        Local               True        26d
v1.apiextensions.k8s.io                Local               True        26d
v1.kubevirt.io                         Local               True        2d7h
v1.subresources.kubevirt.io            kubevirt/virt-api   True        2d7h
...
```

第二列有些是 `Local`，有些是具体的 Service `<ns>/<svc name>`。这种 Local 的表示什么意思呢？ 挑一个看看：

```
k get apiservice v1.kubevirt.io <span>-o</span> yaml
```

```
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  labels:
    kube-aggregator.kubernetes.io/automanaged: "true"  # kube-aggregator 自动管理的
                                                       # kube-aggregator 并不是一个独立组件，而是集成在 kube-apiserver 中
  name: v1.kubevirt.io
  selfLink: /apis/apiregistration.k8s.io/v1/apiservices/v1.kubevirt.io
spec:
  group: kubevirt.io
  version: v1
  groupPriorityMinimum: 1000
  versionPriority: 100
status:
  conditions:
    status: "True"
    type: Available                                    # 类型：可用
    reason: Local
    message: Local APIServices are always available    # Local APIService 永远可用
```

-   状态是 `Availabel`，reason 是 **`Local`**；
-   没有 `service` 字段，说明**没有独立的后端服务**；

实际上，这种 Local 类型对应的请求是由 kube-apiserver 直接处理的；这种 APIService 也不是用户注册的，是 kube-aggregator 模块自动创建的。 更多关于 kube-apiserver 的实现细节可参考 \[3\]。

## 4 两种机制的对比：`CRD` vs. `APIService`

## 4.1 所在的资源组不同

```
$ k api-resources
NAME                        SHORTNAMES   APIVERSION                NAMESPACED   KIND
customresourcedefinitions   crd,crds     apiextensions.k8s.io/v1   false        CustomResourceDefinition
apiservices                              apiregistration.k8s.io/v1 false        APIService
...
```

二者位于两个不同的资源组，对应的 API：

-   CRD: `/apis/apiextensions.k8s.io/{version}/...`
-   APIService: `/apis/apiregistration.k8s.io/{version}/...`

## 4.2 目的和场景不同

CRD 主要目的是让 k8s 能处理**新的对象类型**（new kinds of object）， 只要用户按规范提交一个自定义资源的描述（CRD），k8s 就会自动为它生成一套 CRUD API。

聚合层的目的则不同。 从[设计文档](https://github.com/kubernetes/design-proposals-archive/blob/main/api-machinery/aggregated-api-servers.md)可以看出， 当时引入聚合层有几个目的：

1.  提高 API 扩展性：可以方便地定义自己的 API，**以 kube-apiserver 作为入口，而无需修改任何 k8s 核心代码**；
2.  加速新功能迭代：**新的 API** 通过聚合层引入 k8s，如果**有必要再引入 kube-apiserver**，修改后者是一个漫长的过程；
3.  作为 **experimental API 试验场**；
4.  提供一套**标准的 API 扩展规范**：否则用户都按自己的意愿来，最后社区管理将走向混乱。

## 4.3 使用建议

两个官方脚手架项目：

-   [kubebuilder](https://github.com/kubernetes-sigs/kubebuilder)：生成 CRD 及相应 controller；
-   [apiserver-builder](https://github.com/kubernetes-sigs/apiserver-builder-alpha) 生成 AA extension apiservers 及配套的 controllers。

官方建议：用脚手架项目；**优先考虑用 CRD**，实在不能满足需求再考虑 APIService 方式。这样的特殊场景包括：

1.  希望使用其他 storage API，将数据存储到 etcd 之外的其他地方；
2.  希望支持 long-running subresources/endpoints，例如 websocket；
3.  希望对接外部系统；

## 5 Webhook 机制

Webhook 并不是设计用来扩展 API 的，但它提供的注册机制确实也实现了添加 API 的功能， 另外它也在 kube-apiserver 内部，所以本文也简单列一下，参照学习。

## 5.1 Webhook 位置及原理

![](https://arthurchiao.art/assets/img/k8s-is-about-apis/k8s-api-request.jpeg)

Fig. k8s API request. Image source [github.com/krvarma/mutating-webhook](https://github.com/krvarma/mutating-webhook/blob/master/README.md)

两种 webhook：

-   mutating webhook：**拦截指定的资源请求**，判断操作是否允许，或者**动态修改资源**；
    
    -   举例：如果 pod 打了 `sidecar-injector` 相关标签，就会在这一步给它**注入 sidecar**。
-   validating webhook：功能与 mutation webhook 类似，但**随 k8s 一起编译**，前者是插件方式。
    

## 5.2 Mutating 案例：过滤所有 create/update `virtualmachine` 请求

kubevirt 通过注册如下 mutating webhook， 实现对 CREATE/UPDATE **`/apis/kubevirt.io/v1/virtualmachines`** 请求的拦截，并转发到 **`virt-api.kubevirt:443/virtualmachines-mutate`** 进行额外处理：

```
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: virt-api-mutator
webhooks:
- admissionReviewVersions:
  - v1
  clientConfig:
    caBundle: LS0tL...
    service:
      name: virt-api
      namespace: kubevirt
      path: /virtualmachines-mutate
      port: 443
  name: virtualmachines-mutator.kubevirt.io
  rules:
  - apiGroups:
    - kubevirt.io
    apiVersions:
    - v1
    operations:
    - CREATE
    - UPDATE
    resources:
    - virtualmachines
    scope: '*'
...
```

组件 `virt-api` 中实现了这些额外的处理逻辑。

## 5.3 Validating 案例：拦截驱逐 virtualmachines 请求

```
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: virt-api-validator
webhooks:
- admissionReviewVersions:
  - v1
  clientConfig:
    caBundle: LS0t
    service:
      name: virt-api
      namespace: kubevirt
      path: /launcher-eviction-validate
      port: 443
  name: virt-launcher-eviction-interceptor.kubevirt.io
  rules:
  - apiGroups:
    - ""
    apiVersions:
    - v1
    operations:
    - '*'
    resources:
    - pods/eviction
    scope: '*'
...
```

这样可以在虚拟机被驱逐之前做一次额外判断，例如禁止驱逐。

## 6 结束语

本文梳理了几种 k8s API 的扩展机制，并拿几个开源项目做了实际解读，以便加深理解。 两种机制在使用时都有相应的脚手架项目，应避免自己完全从头写代码。

## 参考资料

1.  [Aggregated API Servers 设计文档](https://github.com/kubernetes/design-proposals-archive/blob/main/api-machinery/aggregated-api-servers.md), 2019
2.  [Patterns of Kubernetes API Extensions](https://itnext.io/comparing-kubernetes-api-extension-mechanisms-of-custom-resource-definition-and-aggregated-api-64f4ca6d0966), ITNEXT, 2018
3.  [Kubernetes apiExtensionsServer 源码解析](https://duyanghao.github.io/kubernetes-apiExtensionsServer/), 2020
4.  

--- 
![扫码加小助手微信，拉你进技术交流群🔥](https://cdn.jsdelivr.net/gh/mouuii/picture/WechatIMG306.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

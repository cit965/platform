---
title: 平台工程化标准草案
icon: circle-info
---

## 背景

当工程师开始部署服务时候，因为有k8s这个基础设施存在，可以不用关注底层基础设施的差异；当工程师开始搭建平台工程的时候，一大堆问题接踵而来，我的平台工程底座用什么，我的平台工程采用哪些开源组件，举个简单的例子，我是使用argocd还是fluxcd，有没有一种办法来屏蔽底层组件的差异呢？

## 组件

什么是组件，组件是用来解决业务场景的最小单元，比如我想把代码构建成镜像，我可能需要选用一种构建组件，他可能是dind或者kaniko

## 平台工程底座

用来管理并于组件交互的核心服务，包括组件安装卸载，api交互。

## 构想

### 构建标准化

这里我用构建来举例，我们想把代码构建成镜像我们需要提供什么？

- 代码仓库地址
- 代码仓库秘钥
- 镜像仓库地址
- 镜像仓库秘钥
- Dockerfile 地址

那平台工程可以抽象出来构建标准化api，他可能是如下：

- 接口：/api/build/
- 方法：post
- 请求体：
  - source
  - sourceSecret
  - destination
  - destinationSecret
  - dockerfile

### 工作流标准化

- 创建工作流模版
- 执行工作流任务
- 获取工作流任务列表
- 暂停工作流
- 继续工作流
- 。。。

## 工作

- 梳理平台工程涉及的领域
  - 构建
  - 工作路
  - 部署
  - 监控
  - 配置
  
- 定义领域最小api功能合集
- 定义api输入输出

## 标准化后如何搭建平台工程

1. 安装平台工程核心底座

```shell
helm install playform
```

2. 平台工程初始化
```shell
platform init
```

3. 安装组件
```shell
platform enable portal -t backstage
platform enable build -t dind
platform enable workflow -t argoworkflow
```
4. 测试组件连通性
```
platform portal test
```
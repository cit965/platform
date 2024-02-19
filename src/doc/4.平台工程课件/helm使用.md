---
title: helm教程-01-使用
icon: circle-info
---

## 前言

如今大多数系统都已经部署在 k8s 集群，相比于传统单体应用 shell 脚本部署，k8s 集群中的微服务部署会复杂一些，所以我们需要使用helm来简化部署。

helm 三大概念： 
- Chart 代表着 Helm 包。它包含在 Kubernetes 集群内部运行应用程序，工具或服务所需的所有资源定义。你可以把它看作是 Homebrew formula，Apt dpkg，或 Yum RPM 在Kubernetes 中的等价物。

- Repository（仓库） 是用来存放和共享 charts 的地方。它就像 Perl 的 CPAN 档案库网络 或是 Fedora 的 软件包仓库，只不过它是供 Kubernetes 包所使用的。

- Release 是运行在 Kubernetes 集群中的 chart 的实例。一个 chart 通常可以在同一个集群中安装多次。每一次安装都会创建一个新的 release。以 MySQL chart为例，如果你想在你的集群中运行两个数据库，你可以安装该chart两次。每一个数据库都会拥有它自己的 release 和 release name。

在了解了上述这些概念以后，我们就可以这样来解释 Helm：

Helm 安装 charts 到 Kubernetes 集群中，每次安装都会创建一个新的 release。你可以在 Helm 的 chart repositories 中寻找新的 chart。
本节我们学习使用helm来部署微服务，我们最好要有个k8s集群用来实际操作，没有的话可以使用在线的免费平台类似 killercoda 这种。

## 安装

下载 Helm 客户端的二进制版本。您可以使用 homebrew 等工具，或查看[官方页面](https://github.com/helm/helm/releases)。


## helm search ：查找 Charts
Helm 自带一个强大的搜索命令，可以用来从两种来源中进行搜索：

helm search hub 从 Artifact Hub 中查找并列出 helm charts。 Artifact Hub中存放了大量不同的仓库。
helm search repo 从你添加（使用 helm repo add）到本地 helm 客户端中的仓库中进行查找。该命令基于本地数据进行搜索，无需连接互联网。
你可以通过运行 helm search hub 命令找到公开可用的charts：

```shell
$ helm search hub wordpress
URL                                                 CHART VERSION APP VERSION DESCRIPTION
https://hub.helm.sh/charts/bitnami/wordpress        7.6.7         5.2.4       Web publishing platform for building blogs and ...
https://hub.helm.sh/charts/presslabs/wordpress-...  v0.6.3        v0.6.3      Presslabs WordPress Operator Helm Chart
https://hub.helm.sh/charts/presslabs/wordpress-...  v0.7.1        v0.7.1      A Helm chart for deploying a WordPress site on ...
```

上述命令从 Artifact Hub 中搜索所有的 wordpress charts。

如果不进行过滤，helm search hub 命令会展示所有可用的 charts。

使用 helm search repo 命令，你可以从你所添加的仓库中查找chart的名字。

```shell
$ helm repo add brigade https://brigadecore.github.io/charts
"brigade" has been added to your repositories
$ helm search repo brigade
NAME                          CHART VERSION APP VERSION DESCRIPTION
brigade/brigade               1.3.2         v1.2.1      Brigade provides event-driven scripting of Kube...
brigade/brigade-github-app    0.4.1         v0.2.1      The Brigade GitHub App, an advanced gateway for...
brigade/brigade-github-oauth  0.2.0         v0.20.0     The legacy OAuth GitHub Gateway for Brigade
brigade/brigade-k8s-gateway   0.1.0                     A Helm chart for Kubernetes
brigade/brigade-project       1.0.0         v1.0.0      Create a Brigade project
brigade/kashti                0.4.0         v0.4.0      A Helm chart for Kubernetes
```

Helm 搜索使用模糊字符串匹配算法，所以你可以只输入名字的一部分

```shell
$ helm search repo kash
NAME            CHART VERSION APP VERSION DESCRIPTION
brigade/kashti  0.4.0         v0.4.0      A Helm chart for Kubernetes
```

搜索是用来发现可用包的一个好办法。一旦你找到你想安装的 helm 包，你便可以通过使用 helm install 命令来安装它。


## 初始化 Helm Chart Repository

准备好 Helm 后，您可以添加 Chart Repository 。检查 Artifact Hub 以获得可用的 Helm chart repository。

```shell
helm repo add bitnami https://charts.bitnami.com/bitnami
```

安装后，您将能够列出可以安装的 charts ：

```shell
$ helm search repo bitnami
NAME                             	CHART VERSION	APP VERSION  	DESCRIPTION
bitnami/bitnami-common           	0.0.9        	0.0.9        	DEPRECATED Chart with custom templates used in ...
bitnami/airflow                  	8.0.2        	2.0.0        	Apache Airflow is a platform to programmaticall...
bitnami/apache                   	8.2.3        	2.4.46       	Chart for Apache HTTP Server
bitnami/aspnet-core              	1.2.3        	3.1.9        	ASP.NET Core is an open-source framework create...
# ... and many more
```
## helm install 

使用 helm install 命令来安装一个新的 helm 包。最简单的使用方法只需要传入两个参数：你命名的release名字和你想安装的chart的名称。


```shell
$ helm install happy-panda bitnami/wordpress
NAME: happy-panda
LAST DEPLOYED: Tue Jan 26 10:27:17 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
** Please be patient while the chart is being deployed **

Your WordPress site can be accessed through the following DNS name from within your cluster:

    happy-panda-wordpress.default.svc.cluster.local (port 80)

To access your WordPress site from outside the cluster follow the steps below:

1. Get the WordPress URL by running these commands:

  NOTE: It may take a few minutes for the LoadBalancer IP to be available.
        Watch the status with: 'kubectl get svc --namespace default -w happy-panda-wordpress'

   export SERVICE_IP=$(kubectl get svc --namespace default happy-panda-wordpress --template "{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}")
   echo "WordPress URL: http://$SERVICE_IP/"
   echo "WordPress Admin URL: http://$SERVICE_IP/admin"

```
现在wordpress chart 已经安装。注意安装chart时创建了一个新的 release 对象。上述发布被命名为 happy-panda。 （如果想让Helm生成一个名称，删除发布名称并使用--generate-name。）

在安装过程中，helm 客户端会打印一些有用的信息，其中包括：哪些资源已经被创建，release当前的状态，以及你是否还需要执行额外的配置步骤。

Helm 客户端不会等到所有资源都运行才退出。许多 charts 需要大小超过 600M 的 Docker 镜像，可能需要很长时间才能安装到集群中。

你可以使用 helm status 来追踪 release 的状态，或是重新读取配置信息：

```shell
$ helm status happy-panda
NAME: happy-panda
LAST DEPLOYED: Tue Jan 26 10:27:17 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
```

## 安装前自定义 chart

上述安装方式只会使用 chart 的默认配置选项。很多时候，我们需要自定义 chart 来指定我们想要的配置。

使用 helm show values 可以查看 chart 中的可配置选项：

```shell
$ helm show values bitnami/wordpress
## Global Docker image parameters
## Please, note that this will override the image parameters, including dependencies, configured to use the global value
## Current available global Docker image parameters: imageRegistry and imagePullSecrets
##
# global:
#   imageRegistry: myRegistryName
#   imagePullSecrets:
#     - myRegistryKeySecretName
#   storageClass: myStorageClass

## Bitnami WordPress image version
## ref: https://hub.docker.com/r/bitnami/wordpress/tags/
##
image:
  registry: docker.io
  repository: bitnami/wordpress
  tag: 5.6.0-debian-10-r35
  [..]
``` 

然后，你可以使用 YAML 格式的文件覆盖上述任意配置项，并在安装过程中使用该文件。

```shell
$ echo '{mariadb.auth.database: user0db, mariadb.auth.username: user0}' > values.yaml
$ helm install -f values.yaml bitnami/wordpress --generate-name
```

上述命令将为 MariaDB 创建一个名称为 user0 的默认用户，并且授予该用户访问新建的 user0db 数据库的权限。chart 中的其他默认配置保持不变。

安装过程中有两种方式传递配置数据：

--values (或 -f)：使用 YAML 文件覆盖配置。可以指定多次，优先使用最右边的文件。
--set：通过命令行的方式对指定项进行覆盖。

如果同时使用两种方式，则 --set 中的值会被合并到 --values 中，但是 --set 中的值优先级更高。在--set 中覆盖的内容会被被保存在 ConfigMap 中。可以通过 helm get values [release-name] 来查看指定 release 中 --set 设置的值。也可以通过运行 helm upgrade 并指定 --reset-values 字段来清除 --set 中设置的值。

## 'helm upgrade' 和 'helm rollback'

当你想升级到 chart 的新版本，或是修改 release 的配置，你可以使用 helm upgrade 命令。

一次升级操作会使用已有的 release 并根据你提供的信息对其进行升级。由于 Kubernetes 的 chart 可能会很大而且很复杂，Helm 会尝试执行最小侵入式升级。即它只会更新自上次发布以来发生了更改的内容。

```shell
$ helm upgrade -f panda.yaml happy-panda bitnami/wordpress
```

在上面的例子中，happy-panda 这个 release 使用相同的 chart 进行升级，但是使用了一个新的 YAML 文件：

```shell
mariadb.auth.username: user1
```

我们可以使用 helm get values 命令来看看配置值是否真的生效了：

```shell
$ helm get values happy-panda
mariadb:
  auth:
    username: user1
```

helm get 是一个查看集群中 release 的有用工具。正如我们上面所看到的，panda.yaml 中的新值已经被部署到集群中了。

现在，假如在一次发布过程中，发生了不符合预期的事情，也很容易通过 helm rollback [RELEASE] [REVISION] 命令回滚到之前的发布版本。

```shell
$ helm rollback happy-panda 1
```

上面这条命令将我们的 happy-panda 回滚到了它最初的版本。release 版本其实是一个增量修订（revision）。 每当发生了一次安装、升级或回滚操作，revision 的值就会加1。第一次 revision 的值永远是1。我们可以使用 helm history [RELEASE] 命令来查看一个特定 release 的修订版本号。

## helm list

```shell
$ helm list
NAME            	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART      	APP VERSION
mysql-1612624192	default  	1       	2021-02-06 16:09:56.283059 +0100 CET	deployed	mysql-8.3.0	8.0.23
```

helm list （或 helm ls ）函数将显示所有已部署版本的列表。

## helm uninstall 

要卸载版本，请使用 helm uninstall 命令

```shell
$ helm uninstall mysql-1612624192
release "mysql-1612624192" uninstalled
```

这将从 Kubernetes 中卸载 mysql-1612624192 ，这将删除与版本相关的所有资源以及版本历史记录。
--- 
![扫码加小助手微信，拉你进技术交流群🔥](https://raw.githubusercontent.com/mouuii/picture/master/weichat.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

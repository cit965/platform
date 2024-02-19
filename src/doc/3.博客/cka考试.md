---
title: cka考试
icon: circle-info
---

南哥，CIT云原生社区创始人，CKA考试带过考生3w+，考试通过率90%以上。

## 什么是CKA考试

K8s的专业技术认证主要有以下几种：

- CKA（Kubernetes 管理员认证）
- CKAD（Kubernetes 应用程序开发者认证）
- CKS（Kubernetes 认证安全专家）
  
其中，知名度最高、应用范围最广的是CKA认证，是目前唯一的 Kubernetes 官方认证考试。

## CKA计划的目的

Kubernetes 管理员认证 (CKA) 计划由云原生计算基金会 (CNCF) 与 Linux 基金会合作创建，旨在帮助开发 Kubernetes 生态系统。

Kubernetes 管理员认证 (CKA) 计划的目的是确保 CKA 具备履行 Kubernetes 管理员职责的技能、知识和能力。

## 考试注意点

- 在线考试由一组需要在命令行中解决的实际问题组成，考生有 2 小时的时间来完成任务，费用为 395 美元，包括一次免费重考，大家可以等黑色星期五优惠那天购买。

- 在线监考考试是在 PSI 监考平台“Bridge”上进行的，使用 PSI 安全浏览器，，不是在本机的浏览器上面考试，在启动考试后，会提示下载PSI安全浏览器，下载后安装就会进入到环境检查界面，所以要提前熟悉官方文档

- 选择的考试时间的时区地址要确定是上海还是乌鲁木齐，乌鲁木齐与北京时间有俩个小时的时差
  
- 报名成功后，会有俩次模拟的机会，但是在模拟的时候是不包含环境检测相关内容的
- 约考时会检测系统环境，检测系统版本、摄像头、麦克风、网络等等，必须用谷歌浏览器打开约考，不然检测不过
- 22年6月份后，考试是在虚拟桌面里进行的，所以以前在浏览器做标签的方式就无法使用了
- 一台活动显示器（内置或外置）（注意：不支持双显示器）
- Mac 用户可能需要在麦克风、摄像头、自动化和输入监控的“系统偏好设置：安全和隐私：隐私”设置中允许 PSI 安全浏览器。
- 除显示考试的应用程序或浏览器窗口外，考生不得运行其他应用程序或浏览器窗口。
- 考试环境要安静，桌面整洁，考生后面没有明亮的窗或者灯光
- 空间必须是私密的，没有过多的噪音。不允许出现在咖啡店、商店、开放式办公环境等公共场所。

- 复制黏贴，不用担心考试不能复制黏贴，终端里鼠标右键可以黏贴

- 考试需要梯子，建议考前一周购买一个月

-  核心，多练题，练到滚瓜烂熟，最好在1.5h内完成全部题目，有k8s基础练习两周即可

-  每做一道题之前都要切换集群kebectl config use-context

-  参考链接，详细介绍进去看看 
   - 候选人要求 https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2/candidate-requirements
   - 考试要求  https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2/taking-the-exam
   - 操作系统要求 https://helpdesk.psionline.com/hc/en-gb/articles/4409608794260--PSI-Bridge-FAQ-System-Requirements

## 考点
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8A%E5%8D%8811.17.04.png)

## 界面

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8A%E5%8D%8811.59.12.png)

## 2023年真题讲解

### 1.基于角色的访问控制-RBAC

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%8812.00.06.png)

>为部署流水线创建一个新的 ClusterRole 并将其绑定到范围为特定的 namespace 的特定ServiceAccount。

>创建一个名为 deployment-clusterrole 的 clusterrole，该 clusterrole 只允许对 Deployment、Daemonset、Statefulset 具有 create 权限，在现有的 namespace app-team1 中创建一个名为 cicd-token 的新 ServiceAccount。

>限于 namespace app-team1 中，将新的 ClusterRole deployment-clusterrole 绑定到新的 ServiceAccount cicd-token。

**官方文档：** https://kubernetes.io/zh-cn/docs/reference/access-authn-authz/rbac/#command-line-utilities


**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中练习不需要执行。真实考试环境会提示你切换
root@cka-master1:~# kubectl config use-context k8s

# 题目中说明已存在名称空间 “在现有的 namespace app-team1 ” 则不需要创建该名称空间。因为我们在自己的模拟环境中，则手动创建该名称空间
root@cka-master1:~# kubectl create ns app-team1

# 接下来正式做题
root@cka-master1:~# kubectl create clusterrole deployment-clusterrole --verb=create --resource=Deployment,StatefulSet,DaemonSet

root@cka-master1:~# kubectl create serviceaccount cicd-token -n app-team1

# 题目中写了 “限于 namespace app team1 中”，则创建 rolebinding，没有写的话，则创建clusterrolebinding；rolebinding 后面的名字 rb-cicd-token 随便起的，因为题目中没有要求，如果题目中有要求，就不能随便起了。
root@cka-master1:~# kubectl create rolebinding rb-cicd-token --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token --namespace=app-team1

# 检查验证
root@cka-master1:~# kubectl describe rolebindings rb-cicd-token -n app-team1
Name:         rb-cicd-token
Labels:       <none>
Annotations:  <none>
Role:
 Kind: ClusterRole
 Name: deployment-clusterrole
Subjects:
 Kind           Name       Namespace
 ----           ----       ---------
 ServiceAccount cicd-token app-team1

```


### 2.节点维护-指定 node 节点不可用

**题目：**

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%881.00.37.png)

>切换 k8s 集群环境：kubectl config use-context ek8s

>将 ek8s-node-1 节点设置为不可用，然后重新调度该节点上的所有 Pod。

**官方文档：** https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/safely-drain-node/

**做题解答：**

```shell
# cordon 停止调度，将 node 调为 SchedulingDisabled。新 pod 不会被调度到该 node，但在该node 的旧 pod 不受影响。
# drain 驱逐节点。首先，驱逐该 node 上的 pod，并在其他节点重新创建。接着，将节点调为 SchedulingDisabled。

# 切换到指定集群。真实考试环境会提示你切换，自己练习不需要切换
root@cka-master1:~# kubectl config use-context ek8s

# 设置节点为不可调度。用 “cka-node1” 节点来模拟题目中的 “ek8s-node-1” 节点
root@cka-master1:~# kubectl cordon cka-node1

root@cka-master1:~# kubectl get nodes
NAME          STATUS                     ROLES                 AGE   VERSION
cka-master1   Ready                     control-plane,master   133m   v1.23.1
cka-node1     Ready,SchedulingDisabled   <none>                 128m   v1.23.1

# 驱逐 node1 上的 pod
root@cka-master1:~# kubectl drain cka-node1 --delete-emptydir-data --ignore-daemonsets --force
node/cka-node1 already cordoned
WARNING: ignoring DaemonSet-managed Pods: kube-system/calico-node-tjhfk, kube-system/kube-proxy-x4ztg
evicting pod kube-system/calico-kube-controllers-677cd97c8d-f5p6c
pod/calico-kube-controllers-677cd97c8d-f5p6c evicted
node/cka-node1 drained

# pod calico-kube-controllers-677cd97c8d-f5p6c 被驱逐到 master1 了
root@cka-master1:~# kubectl get pods -n kube-system -o wide
NAME                                       READY   STATUS   RESTARTS   AGE   IP               NODE         NOMINATED NODE   READINESS GATES
calico-kube-controllers-677cd97c8d-2st2s   1/1     Running   0          32s   10.244.110.67   cka-master1   <none>           <none>
calico-node-cx49g                          1/1     Running   0          133m   192.168.78.140   cka-master1   <none>           <none>
calico-node-tjhfk                          1/1     Running   0          133m   192.168.78.141   cka-node1     <none>           <none>
coredns-65c54cc984-dx7pr                   1/1     Running   0          137m   10.244.110.66   cka-master1   <none>           <none>
coredns-65c54cc984-nfwgv                   1/1     Running   0          137m   10.244.110.65   cka-master1   <none>           <none>
etcd-cka-master1                           1/1     Running   0          137m   192.168.78.140   cka-master1   <none>           <none>
kube-apiserver-cka-master1                 1/1     Running   0          137m   192.168.78.140   cka-master1   <none>           <none>
kube-controller-manager-cka-master1        1/1     Running   4          137m   192.168.78.140   cka-master1   <none>           <none>
kube-proxy-262nx                           1/1     Running   0          137m   192.168.78.140   cka-master1   <none>           <none>
kube-proxy-x4ztg                           1/1     Running   0          133m   192.168.78.141   cka-node1     <none>           <none>
kube-scheduler-cka-master1                 1/1     Running   4          137m   192.168.78.140   cka-master1   <none>           <none>
```


### 3.K8s 版本升级

**题目：**


>现有的 Kubernetes 集群正在运行版本 1.23.1。仅将 master 节点上的所有 Kubernetes 控制平面和节点组件升级到版本 1.23.2。（注意，考试时的集群可能为 1.23.0，会让你从 1.23.0 升级为 1.23.1。甚至是 1.22.1 升级为 1.22.2。所以敲命令时，具体要升级的版本，根据题目要求更改。）

>确保在升级之前 drain master 节点，并在升级后 uncordon master 节点。

>可以使用以下命令，通过 ssh 连接到 master 节点：ssh master01

>可以使用以下命令，在该 master 节点上获取更高权限：sudo -i

>另外，在主节点上升级 kubelet 和 kubectl。请不要升级工作节点，etcd，container 管理器，CNI 插件， DNS 服务或任何其他插件。

**官方文档：** https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/

**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行。
root@cka-master1:~# kubectl config use-context mk8s

# 查看节点信息
root@cka-master1:~# kubectl get nodes
NAME          STATUS   ROLES                 AGE   VERSION
cka-master1   Ready   control-plane,master   3h     v1.23.1
cka-node1     Ready    <none>                 175m   v1.23.1

# 将节点标记为不可调度并驱逐所有负载，准备节点的维护：
root@cka-master1:~# kubectl cordon cka-master1

root@cka-master1:~# kubectl drain cka-master1 --delete-emptydir-data --ignore-daemonsets --force

# 在考试环境中 ssh 到 master 节点，并切换到 root 下
ssh master01
sudo -i

# 升级控制平面节点
# 升级 kubeadm
root@cka-master1:~# apt-get update

# 找到题目要求升级到的指定版本
root@cka-master1:~# apt-cache madison kubeadm | grep 1.23.2
  kubeadm |  1.23.2-00 | http://mirrors.ustc.edu.cn/kubernetes/apt kubernetes-xenial/main amd64 Packages

root@cka-master1:~# apt-get install kubeadm=1.23.2-00

# 验证下载操作正常，并且 kubeadm 版本正确：
root@cka-master1:~# kubeadm version
kubeadm version: &version.Info{Major:"1", Minor:"23", GitVersion:"v1.23.2", GitCommit:"9d142434e3af351a628bffee3939e64c681afa4d", GitTreeState:"clean", BuildDate:"2022-01-19T17:34:34Z", GoVersion:"go1.17.5", Compiler:"gc", Platform:"linux/amd64"}

# 验证升级计划：此命令检查你的集群是否可被升级，并取回你要升级的目标版本。命令也会显示一个包含组件配置版本状态的表格。
root@cka-master1:~# kubeadm upgrade plan

# 排除 etcd，升级其他的
root@cka-master1:~# kubeadm upgrade apply v1.23.2 --etcd-upgrade=false

# 升级 kubelet 和 kubectl
root@cka-master1:~# apt-get install kubelet=1.23.2-00 kubectl=1.23.2-00

# 考试环境中退出 root，退回到 student@master01
[root @master 01 ] # exit

# 考试环境中退出 master01，退回到 student@node-1
[student @master 01 ] $ exit

# 不要输入 exit 多了，否则会退出考试环境的。

# 解除节点的保护
root@cka-master1:~# kubectl uncordon cka-master1

# 检查 master1 是否为 Ready
root@cka-master1:~# kubectl get nodes
NAME          STATUS   ROLES                 AGE     VERSION
cka-master1   Ready   control-plane,master   3h40m   v1.23.2
cka-node1     Ready    <none>                 3h36m   v1.23.1
```


### 4.备份etcd

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%881.34.36.png)

>此项目无需更改配置环境，但是，在执行此项目之前，请确保您已返回初始节点。etcd 这道题真实考试为第 4 题，用的集群是真实考试时的上一题的集群，即真题第 3 题 mk8s，所以无需再切换集群了。

>首先，为运行在 https://127.0.0.1:2379 上的现有 etcd 实例创建快照并将快照保存到 /srv/data/etcd-snapshot.db 文件。

>为给定实例创建快照预计能在几秒钟内完成。如果该操作似乎挂起，则命令可能有问题。用 CTRL + C 来取消操作然后重试。

>然后还原位于 /var/lib/backup/etcd-snapshot-previous.db 的现有先前快照。

>提供了以下 TLS 证书和密钥，以通过 etcdctl 连接到服务器：

>CA证书: /opt/KUIN00601/ca.crt

>客户端证书: /opt/KUIN00601/etcd-client.crt

>客户端密钥: /opt/KUIN00601/etcd-client.key

**官方文档：** https://kubernetes.io/zh-cn/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster

**做题解答：**

```shell
# 先安装 etcdctl 命令，考试环境无需安装
# 把 etcd-v3.4.13-linux-amd64.tar.gz 文件上传到服务器
root@cka-master1:~# tar -zxvf etcd-v3.4.13-linux-amd64.tar.gz
root@cka-master1:~# cp etcd-v3.4.13-linux-amd64/etcdctl /usr/bin/
root@cka-master1:~# etcdctl

# 解题：考试时确认一下 ssh 终端，是在 [student@node-1] $ 下

# 备份：
# 如果不使用 export ETCDCTL_API=3，而使用 ETCDCTL_API=3，则下面每条 etcdctl 命令前都要加ETCDCTL_API=3
# 如果执行时，提示 permission denied，则是权限不够，命令最前面加 sudo 即可。

root@cka-master1:~# export ETCDCTL_API=3

# 先检查考试环境有没有题目说的目录 /srv/data/，没有的话则需要自己创建
root@cka-master1:~# mkdir -pv /srv/data/

# 下面的证书是模拟环境中的位置，考试时用题目给的三个证书
root@cka-master1:~# sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key snapshot save /srv/data/etcd-snapshot.db

# 还原题目指定的 /var/lib/backup/etcd-snapshot-previous.db 文件
root@cka-master1:~# sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key snapshot restore /var/lib/backup/etcd-snapshot-previous.db
```


### 5.网络策略 NetworkPolicy

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%881.45.54.png)

>切换 k8s 集群环境：kubectl config use-context hk8s

>在现有的 namespace my-app 中创建一个名为 allow-port-from-namespace 的新 NetworkPolicy。

>确保新的 NetworkPolicy 允许 namespace echo 中的 Pods 连接到 namespace my-app 中的Pods 的 9000 端口。

>进一步确保新的NetworkPolicy:

>不允许对没有在监听端口 9000 的 Pods 的访问

>不允许非来自 namespace echo 中的 Pods 的访问

**官方文档：** https://kubernetes.io/zh-cn/docs/concepts/services-networking/network-policies/

**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context hk8s

# 模拟环境中创建题目中的名称空间，考试环境不需要创建
root@cka-master1:~# kubectl create ns my-app
root@cka-master1:~# kubectl create ns echo

# 参考官方文档，拷贝 yaml 文件内容，并修改。
# 开始解题:

# 查看所有 ns 的标签 label
root@cka-master1:~# kubectl get ns --show-labels

# 如果访问者的 namespace 没有标签 label，则需要手动打一个。如果有一个独特的标签 label，则也可以直接使用。
root@cka-master1:~# kubectl label ns echo project=echo

# 编写一个 yaml 文件，注意先输入 ":set paste"，防止复制时 yaml 文件空格错序。
root@cka-master1:~# vim networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
 name: allow-port-from-namespace
 namespace: my-app               # 被访问着的名称空间
spec:
 podSelector:                     # 这两行必须要写，或者也可以写成一行为 podSelector: {}  
   matchLabels: {}
 policyTypes:
   - Ingress                     # 策略影响入栈流量
 ingress:
   - from:                       # 允许流量的来源
       - namespaceSelector:
          matchLabels:
            project: echo       # 访问者的命名空间的标签 label
    ports:
       - protocol: TCP
        port: 9000               # 被访问者公开的端口

# 创建网络策略资源
root@cka-master1:~# kubectl apply -f networkpolicy.yaml

# 检查
root@cka-master1:~# kubectl get networkpolicy -n my-app
NAME                       POD-SELECTOR   AGE
allow-port-from-namespace   <none>         4m37s

root@cka-master1:~# kubectl describe networkpolicy allow-port-from-namespace -n my-app
Name:         allow-port-from-namespace
Namespace:   my-app
Created on:   2023-01-03 19:44:38 -0800 PST
Labels:       <none>
Annotations:  <none>
Spec:
 PodSelector:     <none> (Allowing the specific traffic to all pods in this namespace)
 Allowing ingress traffic:
   To Port: 9000/TCP
   From:
    NamespaceSelector: project=echo
 Not affecting egress traffic
 Policy Types: Ingress
```

### 6.service

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%882.01.45.png)

>重新配置一个已经存在的 front-end 的 deployment，在名字为 nginx 的容器里面添加一个端口配置，名字为 http，暴露端口号为 80，然后创建一个 service，名字为 front-end-svc，暴露该deployment 的 http 端，并且 service 的类型为 NodePort。

**官方文档：** 

- https://kubernetes.io/zh-cn/docs/concepts/services-networking/network-policies/
- https://kubernetes.io/zh-cn/docs/tutorials/stateless-application/expose-external-ip-address/

**做题解答：**

```shell
# 创建 deployment front-end 资源，考试时有不需要创建
root@cka-master1:~# vim deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
 name: front-end
 labels:
   app: nginx
spec:
 replicas: 3
 selector:
   matchLabels:
    app: nginx
 template:
   metadata:
    labels:
      app: nginx
   spec:
    containers:
     - name: nginx
      image: nginx:latest

root@cka-master1:~# kubectl apply -f deployment.yaml
root@cka-master1:~# kubectl get deployments
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
front-end   3/3     3            3           63s

# 开始解题：
# 检查 deployment 信息
root@cka-master1:~# kubectl get deployments front-end
NAME        READY   UP-TO-DATE   AVAILABLE   AGE
front-end   3/3     3            3           6m40s

# 参考官方文档，按照需要 edit deployment，添加端口信息
root@cka-master1:~# kubectl edit deployments front-end
······
   imagePullPolicy: Always
   name: nginx
   ports:
   - containerPort: 80
    name: http
······

# 创建 service，以下两种方法二选一即可
# 命令行形式
root@cka-master1:~# kubectl expose deployment front-end --name=front-end-svc --port=80 --target-port=http --type=NodePort

# 编写 yaml 文件形式，复制官方文档的内容进行修改
root@cka-master1:~# vim service.yaml
apiVersion: v1
kind: Service
metadata:
 name: front-end-svc   # 题目指定的名称
spec:
 type: NodePort         # 题目指定的 service 类型
 selector:
   app: nginx           # deployment 中 pod 的标签
 ports:
   - port: 80           # 题目指定暴露的端口
    targetPort: http   # 题目指定暴露的 http 端

root@cka-master1:~# kubectl apply -f service.yaml

# 查看 service 资源
root@cka-master1:~# kubectl get svc front-end-svc
NAME            TYPE       CLUSTER-IP   EXTERNAL-IP   PORT(S)       AGE
front-end-svc   NodePort   10.98.31.4   <none>        80:30737/TCP   16s
```

### 7.ingress

**题目：**


> 如下创建一个新的 nginx lngress资源：

> 名称：pong

> Namespace：ing-internal

> 使用服务端口 5678 在路径 /hello 上公开服务 hello

> 可以使用以下命令检查服务 hello 的可用性，该命令应返回 hello:curl -kL<INTERNAL_IP>/hello

**官方文档：** https://kubernetes.io/zh-cn/docs/concepts/services-networking/ingress/

**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

# 模拟环境中创建题目给的名称空间，考试时不需要，已经存在
root@cka-master1:~# kubectl create ns ing-internal

# 开始解题：
# 拷贝官文的 yaml 案例，修改相关参数即可
# 创建 ingress 资源。先输入 ":set paste"，防止 yaml 文件空格错序
root@cka-master1:~# vim ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
 name: pong                    # 题目指定名称
 namespace: ing-internal       # 题目指定的名称空间
 annotations:
   nginx.ingress.kubernetes.io/rewrite-target: /
spec:
 ingressClassName: nginx
 rules:
- http:
     paths:
    - path: /hello            # 题目指定的 url
       pathType: Prefix
       backend:
         service:
           name: test
           port:
             number: 5678      # 题目指定的端口

root@cka-master1:~# kubectl apply -f ingress.yaml

root@cka-master1:~# kubectl get ingress -n ing-internal
NAME   CLASS   HOSTS   ADDRESS   PORTS   AGE
pong   nginx   *                 80      10s
```


### 8.deployment

**题目：**

> 将 loadbalancer 的 deployment 管理的 Pod 的副本数扩容成 6 个。

**官方文档：** https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/

**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

# 扩容 deployment 副本数
root@cka-master1:~# kubectl scale deployment loadbalancer --replicas=6
```


### 9.pod 指定节点

**题目：**

> 创建一个 Pod，名字为 nginx-kusc00401，镜像地址是 nginx，调度到具有 disk=spinning 标签的节点上。

**官方文档：** https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/assign-pods-nodes/

**做题解答：**

```shell
# 在模拟环境中给 node1 打上标签，考试时不需要，已存在
root@cka-master1:~# kubectl label nodes cka-node1 disk=spinning

root@cka-master1:~# kubectl get nodes --show-labels

# 开始解题：
# 创建 pod
root@cka-master1:~# vim nodeselector.yaml
apiVersion: v1
kind: Pod
metadata:
name: nginx-kusc00401            # 题目指定的 pod 名称
spec:
containers:
- name: nginx                    # 题目指定的镜像
  image: nginx
  imagePullPolicy: IfNotPresent
nodeSelector:
  disk: spinning                 # 题目指定的被分配的节点标签

root@cka-master1:~# kubectl apply -f nodeselector.yaml

root@cka-master1:~# kubectl get pods -o wide nginx-kusc00401
NAME             READY   STATUS   RESTARTS   AGE   IP             NODE       NOMINATED NODE   READINESS GATES
nginx-kusc00401   1/1     Running   0         13s   10.244.115.73   cka-node1   <none>           <none>
```
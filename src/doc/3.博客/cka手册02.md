---
title: cka考试
icon: circle-info
---

南哥，CIT云原生社区创始人，CKA考试带过考生3w+，考试通过率90%以上。

## 什么是cka证书

CKA认证考试是由Linux基金会和云原生计算基金会(CNCF)创建的，以促进Kubernetes生态系统的持续发展。该考试是一种远程在线、有监考、基于实操的认证考试，需要在运行Kubernetes的命令行中解决多个任务。CKA认证考试是专为Kubernetes管理员、云管理员和其他管理Kubernetes实例的IT专业人员而设的。


## 第一人称考试过程

考试前需要检查身份信息。虽然我报名的是CKA-CN，但是因为我报名的名字用的拼音名，所以需要拍一下护照。

监考官挺严格的，会让摄像头拍一下整个房间，拍一下键盘下面有没有东西，鼠标垫下面有没有东西。最后还要把手机当面放到一个碰不到的地方。水杯也需要是透明的，我装的茶都不行，必须是纯净水。

考试过程中我起身去开灯被警告了，说是需要征得同意；后面自言自语了几句又被警告考试过程中不能说话。

中间掉线了一次，不过很快又重连上了。

考试2小时，一共17道题。我花了1小时做完了15道，留下etcd备份和k8s升级的2道题慢慢做，最后做完还剩20分钟，检查了2遍就提前结束考试了。

## 考试技巧

1.复制粘贴。

```bash
终端：ctrl+shift+c/v 除终端外的其他地方：ctrl+c/v
```

2.alias设置别名。

```bash
alias k=kubectl
```

3.kubectl 自动补全（已经不需要手动设置了，默认已有）。

```bash
echo "source <(kubectl completion bash)" >> ~/.bashrc source ~/.bashrc
```

4.善用 `--dry-run=client -o yaml` 生成yaml文件模板，更简洁的办法是直接将这一串字符设为环境变量，直接引用环境变量。

```lua
k run --dry-run=client -o yaml > *.yaml export do="--dry-run=client -o yaml" k create deploy nginx --image=nginx $do
```

5.善用 `kubectl explain [resource[.field]]`。

6.善用强制停止pod，避免默认优雅停止占用太多时间。

```bash
export now="--force --grace-period 0" k delete pod x $now
```

7.善用一切 `--help`，避免搜索文档浪费时间。

```lua
k create clusterrole --help k create rolebinding --help k scale --help k top pods --help k logs --help k drain --help
```

8.可以打开一个mousepad记事本，yaml粘完修改后再复制到vim中。

## 真题讲解 2023
### 10.检查可用节点数量

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.09.47.png)

>检查集群中有多少节点为 Ready 状态(不包括被打上 Taint: NoSchedule 的节点)，之后将数量写到 /opt/KUSCO0402/kusc00402.txt。


**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

# 模拟环境中创建题目指定的目录，考试时不需要，已存在
root@cka-master1:~# mkdir -pv /opt/KUSCO0402

# 开始解题：
# 查看集群中状态为 Ready 的节点
root@cka-master1:~# kubectl get nodes | grep -w "Ready"
cka-master1   Ready   control-plane,master   26h   v1.23.1
cka-node1     Ready    <none>                 26h   v1.23.1

# 统计 Ready 数量
root@cka-master1:~# kubectl get nodes | grep -w "Ready" | wc -l

# 统计具有污点 NoSchedule 的数量
root@cka-master1:~# kubectl describe nodes cka-master1 cka-node1 | grep "Taint" | grep "NoSchedule" | wc -l

# 把结果（2-1=1）写入题目中指定的文件
root@cka-master1:~# echo "1" > /opt/KUSCO0402/kusc00402.txt
root@cka-master1:~# cat /opt/KUSCO0402/kusc00402.txt
```


### 11.检Pod 封装多个容器

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.12.38.png)

>创建一个 Pod，名字为 kucc1，这个 Pod 包含 4 个容器，为 nginx、redis、memcached、consul。


**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

# 编写 yaml 文件
root@cka-master1:~# vim kucc1.yaml
apiVersion: v1
kind: Pod
metadata:
 name: kucc1
spec:
 containers:
- name: nginx
   image: nginx
   imagePullPolicy: IfNotPresent
 - name: redis
   image: redis
   imagePullPolicy: IfNotPresent
 - name: memcached
   image: memcached
   imagePullPolicy: IfNotPresent
 - name: consul
   image: consul
   imagePullPolicy: IfNotPresent

root@cka-master1:~# kubectl apply -f kucc1.yaml

root@cka-master1:~# kubectl get pods kucc1
NAME    READY   STATUS    RESTARTS   AGE
kucc1   4/4     Running   0          3s

```


### 12.持久卷 PersistentVolume

**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.15.06.png)

>创建一个 pv，名字为 app-config，大小为 2Gi， 访问权限为 ReadWriteMany。Volume 的类型为 hostPath，路径为 /srv/app-config。


**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context hk8s

# 创建题目中的目录，考试是不需要，已存在
root@cka-master1:~# mkdir -pv /srv/app-config

# 开始解题：
# 创建 pv
root@cka-master1:~# vim pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
 name: app-config            # 题目中指定的 pv 名称
spec:
 capacity:
   storage: 2Gi              # 题目指定的 pv 大小  
 accessModes:
   - ReadWriteMany           # 题目指定的访问模式
 hostPath:
   path: "/srv/app-config"   # 题目指定的 url

root@cka-master1:~# kubectl apply -f pv.yaml
persistentvolume/app-config created

root@cka-master1:~# kubectl get pv
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
app-config   2Gi        RWX            Retain           Available                                   6s
```


### 13.PersistentVolumeClaims


**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.15.58.png)

>创建一个名字为 pv-volume 的 pvc，指定 storageClass 为 csi-hostpath-sc，大小为 10Mi。然后创建一个 Pod，名字为 web-server，镜像为 nginx，并且挂载该 PVC 至 /usr/share/nginx/html，挂载的权限为 RedWriteOnce。之后通过 kubectl edit 或者 kubectl path 将 pvc 改成 70Mi，并且记录修改记录。


**做题解答：**
```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context ok8s

# 创建 pvc 和 pod
root@cka-master1:~# vim pvc-pod.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: pv-volume                    # 题目指定的 pvc 名称
spec:
 storageClassName: csi-hostpath-sc  # 题目指定的存储类名称
 accessModes:
  - ReadWriteOnce                  # 题目指定的访问模式
 resources:
   requests:
     storage: 10Mi                  # 题目指定的 pvc 大小  
---
apiVersion: v1
kind: Pod
metadata:
 name: web-server                   # 题目指定的 pod 名称
spec:
 volumes:
  - name: pv-volume                # 与 volumeMounts.name 一致
     persistentVolumeClaim:
       claimName: pv-volume         # 使用的 pvc 名称
 containers:
  - name: nginx
     image: nginx                   # 题目指定的镜像
     volumeMounts:
      - mountPath: "/usr/share/nginx/html" # 题目指定的挂载目录
         name: pv-volume            

root@cka-master1:~# kubectl apply -f pvc-pod.yaml

# 查看是否创建成功。之所以是 pending 状态是模拟环境中没有存储类 storageClassName: csi-hostpath-sc，考试环境中存在，无需担心
root@cka-master1:~# kubectl get pvc pv-volume
NAME        STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS      AGE
pv-volume   Pending                                      csi-hostpath-sc   21s
root@cka-master1:~# kubectl get pods web-server
NAME         READY   STATUS    RESTARTS   AGE
web-server   0/1     Pending   0          31s

# pvc 扩容。将 storage: 10Mi 修改为 70Mi
root@cka-master1:~# kubectl edit pvc pv-volume
······
 resources:
   requests:
     storage: 70Mi
 storageClassName: csi-hostpath-sc
······
```


### 14.查看 Pod 日志


**题目：**

>监控名为 foobar 的 Pod 的日志，并过滤出具有 unable-access-website 信息的行，然后将写入到 /opt/KUTR00101/foobar。


**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

[student@node-1] $ kubectl logs foobar | grep unable-access-website > /opt/KUTR00101/foobar

```



### 15.Sidecar 代理


**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.18.30.png)


> 将一个现有的 Pod 集成到 Kubernetes 的内置日志记录体系结构中 (例如 kubectl logs)。添加 streaming sidecar 容器是实现此要求的一种好方法。

> 使用 busybox lmage 来将名为 sidecar 的 sidecar 容器添加到现有的 Pod legacy-app 上，新的 sidecar 容器必须运行以下命令:/bin/sh -c tail -n+1 -f /var/log/legacy-app.log

> 使用 volume 挂载 /var/log/ 目录，确保 sidecar 能访问 /var/log/legacy-app.log 文件。


**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

# 在模拟环境中创建题目中提到的 pod legacy-app，考试不需要，已存在
root@cka-master1:~# vim legacy-app.yaml
apiVersion: v1
kind: Pod
metadata:
 name: legacy-app
spec:
 containers:
 - name: count
   image: busybox
   args:
   - /bin/sh
   - -c
   - >
    i=0;
    while true;
    do
      echo "$(date) INFO $i" >> /var/log/legacy-app.log;
      i=$((i+1));
      sleep 1;
    done    

root@cka-master1:~# kubectl apply -f legacy-app.yaml
root@cka-master1:~# kubectl get pods legacy-app
NAME         READY   STATUS   RESTARTS   AGE
legacy-app   1/1     Running   0          17s

# 开始解题：
# 首先将题目中现有的 pod legacy-app 的 yaml 导出
root@cka-master1:~# kubectl get pods legacy-app -o yaml > sidecar.yaml

# 删除一些导出的内容，结果如下
root@cka-master1:~# vim sidecar.yaml
apiVersion: v1
kind: Pod
metadata:
 name: legacy-app
 namespace: default
spec:
 containers:
 - args:
   - /bin/sh
   - -c
   - "i=0; while true; do\n echo \"$(date) INFO $i\" >> /var/log/legacy-app.log;\n
     \ i=$((i+1));\n sleep 1;\ndone     \n"
   image: busybox
   imagePullPolicy: Always
   name: count

# 在 sidecar.yaml 中添加 sidecar 容器和 volume
root@cka-master1:~# vim sidecar.yaml
apiVersion: v1
kind: Pod
metadata:
 name: legacy-app
 namespace: default
spec:
 containers:
 - args:
   - /bin/sh
   - -c
   - "i=0; while true; do\n echo \"$(date) INFO $i\" >> /var/log/legacy-app.log;\n
     \ i=$((i+1));\n sleep 1;\ndone     \n"
   image: busybox
   imagePullPolicy: IfNotPresent
   name: count
   volumeMounts:
   - name: logs
    mountPath: /var/log
 - name: sidecar
   image: busybox
   imagePullPolicy: IfNotPresent
   args: [/bin/sh, -c, 'tail -n+1 -f /var/log/legacy-app.log']
   volumeMounts:
   - name: logs
    mountPath: /var/log
 volumes:
 - name: logs
   emptyDir: {}  

# 先删除原有的 pod 才能更新
root@cka-master1:~# kubectl delete -f sidecar.yaml

# 如果删除很慢的话，就强制删除
root@cka-master1:~# kubectl delete -f sidecar.yaml --force --grace-period=0

root@cka-master1:~# kubectl apply -f sidecar.yaml
pod/legacy-app created
root@cka-master1:~# kubectl get pods legacy-app
NAME         READY   STATUS   RESTARTS   AGE
legacy-app   2/2     Running   0          3s

# 查看 sidecar 容器日志
root@cka-master1:~# kubectl logs legacy-app -c sidecar
```


### 16.查看 Pod 的 cpu


**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.21.49.png)


> 找出标签是 name=cpu-user 的 Pod，并过滤出使用 CPU 最高的 Pod，然后把它的名字写在已经存在的 /opt/KUTR00401/KUTR00401.txt 文件里(注意他没有说指定 namespace，所以需要使用 -A 指定所有 namespace)。

**做题解答：**

```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context k8s

# 将 addon.tar.gz、metrics-server-amd64-0-3-6.tar.gz 上传到 node 并解压
root@cka-node1:~# docker load -i addon.tar.gz

root@cka-node1:~# docker load -i metrics-server-amd64-0-3-6.tar.gz

# 将 metrics.yaml 上传到 master 并创建
root@cka-master1:~# kubectl apply -f metrics.yaml

# 给 pod 打上标签
root@cka-master1:~# kubectl label pods -n kube-system metrics-server-875fcb674-snp99 name=cpu-user

# 创建题目给的目录
root@cka-master1:~# mkdir -pv /opt/KUTR00401

# 以上步骤在模拟环境中创建，模拟题目给出的环境，考试时不需要，已存在
# 开始解题：
# 查看标签为 name=cpu-user 并且是 cpu 使用最高的 pod
root@cka-master1:~# kubectl top pods -l name=cpu-user --sort-by=cpu -A
NAMESPACE     NAME                             CPU(cores)   MEMORY(bytes)  
kube-system   metrics-server-875fcb674-snp99   2m           17Mi

# 将查到的 pod 名字写入 /opt/KUTR00401/KUTR00401.txt 文件中
root@cka-master1:~# echo "metrics-server-875fcb674-snp99" > /opt/KUTR00401/KUTR00401.txt
root@cka-master1:~# cat /opt/KUTR00401/KUTR00401.txt
metrics-server-875fcb674-snp99
```


### 17.kubelet 故障


**题目：**
![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2024-02-04%20%E4%B8%8B%E5%8D%884.22.22.png)


> 一个名为 wk8s-node-0 的节点状态为 NotReady，让其他恢复至正常状态，并确认所有的更改开机自动完成。

> 可以使用以下命令，通过 ssh 连接到 wk8s-node-0 节点：ssh wk8s-node-0

> 可以使用以下命令，在该节点上获取更高权限：sudo -i

**做题解答：**
```shell
# 考试时执行，切换集群。模拟环境中不需要执行
[student@node-1] $ kubectl config use-context wk8s

# 开始解题：
[student@node-1] $ ssh wk8s-node-0
[student@node-1] $ sudo -i

[root@wk8s-node-0 ~]# systemctl status kubelet
[root@wk8s-node-0 ~]# systemctl restart kubelet
[root@wk8s-node-0 ~]# systemctl enable kubelet
[root@wk8s-node-0 ~]# systemctl status kubelet

# 退出 root，退回到 student@wk8s-node-0
[root@wk8s-node-0 ~]# exit

# 退出 wk8s-node-0，退回到 student@node-1
[student@wk8s-node-0 ~]# exit

# 不要输入 exit 太多，否则会退出考试环境
```

--- 
![扫码加小助手微信，拉你进技术交流群🔥](https://cdn.jsdelivr.net/gh/mouuii/picture/WechatIMG306.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

---
title: 分享应用程序
icon: circle-info
---

  
现在您已经构建了镜像，您可以共享它。要共享 Docker 镜像，您必须使用 Docker registry。默认registry是 Docker Hub，您使用的所有镜像都来自于此。

>  **Docker ID**
> 
>   
> Docker ID 可让您访问 Docker Hub，这是世界上最大的容器镜像库和社区。如果您没有 Docker ID，请免费创建一个。

### 创建一个 repository
  
要推送镜像，首先需要在 Docker Hub 上创建一个存储库。

1.    
    注册或登录 Docker Hub
    
2.    
    选择创建存储库按钮。
    
3.    
    对于存储库名称，请使用 `getting-started` 。确保可见性是公开的。
    
4.   选择创建。
    

  
在下图中，您可以看到来自 Docker Hub 的示例 Docker 命令。此命令将推送到此存储库。

![Docker command with push example](https://docs.docker.com/get-started/images/push-command.webp)

### push the image 推送
1.    
    在命令行中，运行您在 Docker Hub 上看到的 `docker push` 命令。请注意，您的命令将包含您的 Docker ID，而不是“docker”。
    
    ```
    $ docker push docker/getting-started
    The push refers to repository [docker.io/docker/getting-started]
    An image does not exist locally with the tag: docker/getting-started
    ```
    
      
    为什么失败了？ Push 命令正在寻找名为 `docker/getting-started` 的图像，但没有找到。如果您运行 `docker image ls` ，您也不会看到。
    
      
    要解决此问题，您需要标记已构建的现有镜像并为其指定另一个名称。
    
2.    
    使用命令 `docker login -u YOUR-USER-NAME` 登录 Docker Hub。
    
3.    
    使用 `docker tag` 命令为 `getting-started` 镜像指定新名称。将 `YOUR-USER-NAME` 替换为您的 Docker ID。
    
    ```
    $ docker tag getting-started YOUR-USER-NAME/getting-started
    ```
    
4.    
    现在再次运行 `docker push` 命令。如果您从 Docker Hub 复制该值，则可以删除 `tagname` 部分，因为您没有向映像名称添加标签。如果您不指定标签，Docker 将使用名为 `latest` 的标签。
    
    ```
    $ docker push YOUR-USER-NAME/getting-started
    ```
    

  
### 在新机器上运行镜像

现在您的镜像已构建并推送到镜像仓库中，请尝试在从未见过此容器镜像的全新实例上运行您的应用程序。

>  **笔记**
> 
>   
> Play with Docker 使用 amd64 平台。如果您使用的是带有 Apple Silicon 的基于 ARM 的 Mac，则需要重建映像以与 Play with Docker 兼容，并将新映像推送到您的存储库。
> 
>   
> 要为 amd64 平台构建映像，请使用 `--platform` 标志。
> 
> ```
> $ docker build --platform linux/amd64 -t YOUR-USER-NAME/getting-started .
> ```
> 
>   
> Docker buildx 还支持构建多平台镜像。要了解更多信息，请参阅多平台图像。

1.    
    打开浏览器来玩 [paly with docker](https://labs.play-with-docker.com/)
    
2.    
    选择“登录”，然后从下拉列表中选择“docker”。
    
3.    
    使用您的 Docker Hub 帐户登录，然后选择“开始”。
    
4.    
    选择左侧栏上的“添加新实例”选项。如果您没有看到它，请将您的浏览器设置得更宽一些。几秒钟后，浏览器中将打开一个终端窗口。
    
    ![Play with Docker add new instance](https://docs.docker.com/get-started/images/pwd-add-new-instance.webp)
    
5.    
    在终端中，启动新推送的应用程序。
    
    ```
    $ docker run -dp 0.0.0.0:3000:3000 YOUR-USER-NAME/getting-started
    ```
    
      
    您应该看到镜像被拉下来并最终启动。


  
在本节中，您学习了如何通过将图像推送到镜像仓库来共享镜像。然后，您进入一个全新的实例，并能够运行新推送的映像。这在 CI 管道中很常见，管道将创建映像并将其推送到注册表，然后生产环境可以使用最新版本的映像。

 相关信息：

-     [docker CLI 参考](https://docs.docker.com/engine/reference/commandline/cli/)
-     [多平台图像](https://docs.docker.com/build/building/multi-platform/)
-     [Docker 中心概述](https://docs.docker.com/docker-hub/)

  
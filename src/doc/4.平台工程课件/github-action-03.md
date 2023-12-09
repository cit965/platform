---
title: 构建 docker 镜像
icon: circle-info
---


在这篇文章中，我将讨论 GHCR 是什么，以及我们如何使用 GitHub Actions 将容器镜像推送到它！

## [](https://dev.to/willvelida/pushing-container-images-to-github-container-registry-with-github-actions-1m6b#what-is-github-container-registry)什么是 GitHub Container Registry？

GitHub Container Registry 将容器镜像存储在您的组织或个人帐户中，并允许您将镜像与仓库关联。它目前支持 Docker 镜像清单 V2、架构 2 和开放容器计划 （OCI） 规范。

在 GitHub 中，我们可以在 GitHub Actions 工作流文件中构建 docker 镜像并将其推送到 GHCR，并私下或公开提供这些镜像（我将公开我的镜像作为我的示例）。

假设我有以下 Dockerfile：  

```
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
LABEL org.opencontainers.image.source="https://github.com/willvelida/dapr-store-app"
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["Store/Store.csproj", "Store/"]
RUN dotnet restore "Store/Store.csproj"
COPY . .
WORKDIR "/src/Store"
RUN dotnet build "Store.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Store.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Store.dll"]
```

此 Dockerfile 只是生成一个简单的 Blazor Server 应用程序（它是适用于所有 ASP.NET Core 应用程序的非常通用的 Dockerfile）。

我们将设置 GitHub Actions 工作流文件，将此容器镜像推送到 GHCR，而不是将其推送到 Docker Hub 或 Azure 容器注册表。

让我们来看看如何向 GHCR 进行身份验证。

## [](https://dev.to/willvelida/pushing-container-images-to-github-container-registry-with-github-actions-1m6b#using-the-githubtoken-to-authenticate-to-ghcr)使用 GITHUB\_TOKEN 向 GHCR 进行身份验证

向 GHCR 进行身份验证的推荐方法是使用 `GITHUB_TOKEN` .GitHub 为您提供了一个令牌，您可以使用该令牌代表 GitHub Actions 进行身份验证。在每次工作流运行开始时，GitHub 将自动创建一个唯一的 `GITHUB_TOKEN` 密钥以在工作流中使用，您可以使用该密钥进行身份验证。

当 GHCR 处于测试阶段时，您可以使用个人访问令牌 （PAT） 进行身份验证。您需要注意您授予 PAT 令牌的权限。使用 `GITHUB_TOKEN` ，这提供了将容器镜像推送到 GHCR 所需的足够权限

## [](https://dev.to/willvelida/pushing-container-images-to-github-container-registry-with-github-actions-1m6b#using-a-personal-access-token-to-authenticate-to-ghcr)使用个人访问令牌向 GHCR 进行身份验证

我最初确实在使用时 `GITHUB_TOKEN` 遇到了一些问题，所以首先，我使用了 PAT 令牌。若要创建一个，请转到“设置”/“开发人员设置”，单击“个人访问令牌”/“令牌（经典）”，然后单击“生成新令牌”。要将镜像推送到 GHCR，您只需要以下权限：

-    **阅读：软件包**
-    **写入：包**
-    **删除：包**

创建 PAT 后，可以将其作为存储库机密存储在包含 Dockerfile 的 GitHub 存储库中。

在 GitHub Actions 工作流程文件中，您可以使用以下命令向 GHCR 进行身份验证：  

```
- name: 'Login to GitHub Container Registry'
        run: |
          echo $CR_PAT | docker login ghcr.io -u <Your-GitHub-username> --password-stdin
```

由于建议使用 `GITHUB_TOKEN` 代替 PAT 令牌，因此我们将继续使用它。

## [](https://dev.to/willvelida/pushing-container-images-to-github-container-registry-with-github-actions-1m6b#creating-a-github-actions-workflow)创建 GitHub Actions 工作流程

现在，我们已经有了一种向 GHCR 进行身份验证的方法，我们可以创建一个 GitHub Actions 工作流文件来推送容器镜像。让我们来看看以下内容：  

```
name: Deploy Images to GHCR

env:
  DOTNET_VERSION: '6.0.x'

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
      push-store-image:
        runs-on: ubuntu-latest
        defaults:
          run:
            working-directory: './Store'
        steps:
          - name: 'Checkout GitHub Action'
            uses: actions/checkout@main

          - name: 'Login to GitHub Container Registry'
            uses: docker/login-action@v1
            with:
              registry: ghcr.io
              username: ${{github.actor}}
              password: ${{secrets.GITHUB_TOKEN}}

          - name: 'Build Inventory Image'
            run: |
              docker build . --tag ghcr.io/<your-GitHub-username>/store:latest
              docker push ghcr.io/<your-GitHub-username>/store:latest
```

要突出显示的最重要步骤是向 GHCR 进行身份验证，然后推送容器镜像。

要进行身份验证，我们可以使用 ，目标 ghrc.io 作为注册表 `docker/login-action` ，并使用我们的用户名（作为 传入）和我们的 `GITHUB_TOKEN` 用户名作为 `${{ github.actor }}` 密码。

通过身份验证后，我们可以使用格式 `ghcr.io/<your-github-username>/<image-name>:<image-version>` 标记图像。

## [](https://dev.to/willvelida/pushing-container-images-to-github-container-registry-with-github-actions-1m6b#making-our-image-publicly-accessible)使图像可公开访问

现在，默认情况下，当我们发布包时，可见性将是私有的。如果你愿意，你可以把你的图像保密，但对于我的样本，我希望它们是公开的。

要使它们可用于我们的存储库，我们需要向 Dockerfile 添加一个 `LABEL` 命令。您应该在第一个 `FROM` 命令下执行此操作，如下所示：  

```
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
LABEL org.opencontainers.image.source="https://github.com/<your-github-username>/<your-repo-name>"
```

这将使我们的图像在存储库的主页上可见，如下所示：

[![GitHub repository with the packages section highlighted with a red rectangle](https://res.cloudinary.com/practicaldev/image/fetch/s--HCgzmiYw--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f7kgcolh0al8gdtqg9uq.png)](https://res.cloudinary.com/practicaldev/image/fetch/s--HCgzmiYw--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f7kgcolh0al8gdtqg9uq.png)

单击要公开的包，然后转到“包设置”。在“危险区域”（提示 Kenny Loggins）中，单击“更改可见性”，然后选择“公共”，如下所示：

[![GitHub Package settings for changing package visibility](https://res.cloudinary.com/practicaldev/image/fetch/s--8kLQH1cI--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/429kchs4c4a50wj4c3h3.png)](https://res.cloudinary.com/practicaldev/image/fetch/s--8kLQH1cI--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_800/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/429kchs4c4a50wj4c3h3.png)

现在我们的包是公开的，我们可以像这样使用 docker pull 拉取它：  

```
docker pull ghcr.io/willvelida/store:latest
```

## [](https://dev.to/willvelida/pushing-container-images-to-github-container-registry-with-github-actions-1m6b#conclusion) 结论

在这篇文章中，我们讨论了 GHCR 是什么，我们如何使用 GitHub Actions 对图像进行身份验证并将图像推送到它，然后公开这些图像。

希望这能帮助您将容器镜像发布到 GitHub Container Registry。对于专用容器镜像，我仍将使用 Azure 容器注册表，但出于示例目的，对镜像进行身份验证并将其推送到 GHCR 似乎是可行的方法。



## build and push docker images with buildx 

https://github.com/docker/build-push-action
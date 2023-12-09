---
title: 了解 github actions
icon: circle-info
---

了解 GitHub Actions 的基础知识，包括核心概念和基本术语。

##  [概述](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#overview)

GitHub Actions 是一个持续集成和持续交付 （CI/CD） 平台，可用于自动化构建、测试和部署管道。您可以创建工作流来生成和测试存储库的每个拉取请求，或将合并的拉取请求部署到生产环境。

GitHub Actions 不仅仅是 DevOps，还允许您在仓库中发生其他事件时运行工作流。例如，您可以运行工作流，以便在有人在您的存储库中创建新问题时自动添加相应的标签。

GitHub 提供 Linux、Windows 和 macOS 虚拟机来运行工作流，或者您可以在自己的数据中心或云基础架构中托管自己的自托管运行器。

## [GitHub Actions 的组件](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#the-components-of-github-actions)

您可以将 GitHub Actions 工作流程配置为在仓库中发生事件（例如打开拉取请求或创建问题）时触发。工作流包含一个或多个作业，这些作业可以按顺序运行，也可以并行运行。每个作业都将在其自己的虚拟机运行程序或容器内运行，并具有一个或多个步骤，这些步骤可以运行您定义的脚本或运行操作，该操作是可重复使用的扩展，可以简化工作流。

![Diagram of an event triggering Runner 1 to run Job 1, which triggers Runner 2 to run Job 2. Each of the jobs is broken into multiple steps.](https://docs.github.com/assets/cb-25535/images/help/actions/overview-actions-simple.png)

###  [工作流 workflow](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#workflows)

工作流是一个可配置的自动化过程，它将运行一个或多个作业。工作流由签入存储库的 YAML 文件定义，并在存储库中的事件触发时运行，也可以手动触发或按定义的计划触发。

工作流在存储库的 `.github/workflows` 目录中定义，一个存储库可以有多个工作流，每个工作流可以执行一组不同的任务。例如，您可以使用一个工作流来生成和测试拉取请求，另一个工作流用于在每次创建发布时部署应用程序，以及另一个工作流，用于在每次有人打开新问题时添加标签。

您可以在另一个工作流中引用一个工作流。有关详细信息，请参阅“重用工作流”。

有关工作流的详细信息，请参阅“使用工作流”。

###  [事件 event](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#events)

事件是存储库中触发工作流运行的特定活动。例如，当有人创建拉取请求、打开议题或将提交推送到存储库时，活动可能源自 GitHub。您还可以通过发布到 REST API 或手动触发工作流以按计划运行。

有关可用于触发工作流的事件的完整列表，请参阅触发工作流的事件。

###  [工作 jobs](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#jobs)

作业是在同一运行器上执行的工作流中的一组步骤。每个步骤要么是将要执行的 shell 脚本，要么是将要运行的操作。步骤按顺序执行，并且相互依赖。由于每个步骤都在同一运行器上执行，因此您可以将数据从一个步骤共享到另一个步骤。例如，您可以有一个生成应用程序的步骤，然后是一个测试已生成应用程序的步骤。

您可以配置作业与其他作业的依赖关系;默认情况下，作业没有依赖关系，并且彼此并行运行。当一个作业依赖于另一个作业时，它将等待依赖作业完成，然后才能运行。例如，对于没有依赖项的不同体系结构，您可能有多个生成作业，以及依赖于这些作业的打包作业。生成作业将并行运行，当它们全部成功完成时，打包作业将运行。

有关作业的详细信息，请参阅“使用作业”。

###  [行动 actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#actions)

操作是 GitHub Actions 平台的自定义应用程序，用于执行复杂但经常重复的任务。使用操作来帮助减少在工作流文件中编写的重复代码量。操作可以从 GitHub 拉取 git 存储库，为生成环境设置正确的工具链，或设置对云提供商的身份验证。

您可以编写自己的操作，也可以在 GitHub Marketplace 中查找要在工作流程中使用的操作。

有关详细信息，请参阅“ 创建操作”。

###  [运行器 runners](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#runners)

运行器是在工作流被触发时运行工作流的服务器。每个运行器一次可以运行一个作业。GitHub 提供 Ubuntu Linux、Microsoft Windows 和 macOS 运行器来运行您的工作流;每个工作流运行都在新置备的全新虚拟机中执行。GitHub 还提供更大的运行器，这些运行器具有更大的配置。有关详细信息，请参阅“ 关于较大的运行器”。如果您需要不同的操作系统或需要特定的硬件配置，您可以托管自己的运行器。有关自托管运行器的详细信息，请参阅“托管您自己的运行器”。

## [创建示例工作流](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#create-an-example-workflow)

GitHub Actions 使用 YAML 语法来定义工作流程。每个工作流都作为单独的 YAML 文件存储在代码存储库中名为 `.github/workflows` 的目录中。

您可以在存储库中创建一个示例工作流，该工作流会在推送代码时自动触发一系列命令。在此工作流程中，GitHub Actions 签出推送的代码，安装 bats 测试框架，并运行基本命令以输出 bats 版本： `bats -v` 。

1.  在存储库中 `.github/workflows/` ，创建用于存储工作流文件的目录。
    
2.  在目录中 `.github/workflows/` ，创建一个名为 `learn-github-actions.yml` 并添加以下代码的新文件。
    
     YAML的

```yaml

name: learn-github-actions
run-name: ${{ github.actor }} is learning GitHub Actions
on: [push]
jobs:
  check-bats-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm install -g bats
      - run: bats -v

```
    
3.  提交这些更改并将其推送到 GitHub 存储库。
    

新的 GitHub Actions 工作流程文件现已安装在仓库中，每次有人将更改推送到仓库时都会自动运行。若要查看有关工作流执行历史记录的详细信息，请参阅“查看工作流运行的活动”。

## [了解工作流文件](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#understanding-the-workflow-file)

为了帮助您了解如何使用 YAML 语法创建工作流文件，本部分将介绍简介示例的每一行：

```yaml
name: learn-github-actions
```

可选 - 工作流的名称，它将显示在 GitHub 存储库的“操作”选项卡中。如果省略此字段，则将改用工作流文件的名称。

```yaml
run-name: ${{ github.actor }} is learning GitHub Actions
```

可选 - 从工作流生成的工作流运行的名称，该名称将显示在存储库的“操作”选项卡上的工作流运行列表中。此示例使用带有上下文的表达式来显示触发工作流运行的执行组件的 `github` 用户名。有关详细信息，请参阅“ GitHub Actions 的工作流语法”。

指定此工作流的触发器。此示例使用该 `push` 事件，因此每次有人将更改推送到存储库或合并拉取请求时，都会触发工作流运行。这是由推送到每个分支触发的;有关仅在推送到特定分支、路径或标记时运行的语法示例，请参阅“ GitHub Actions 的工作流程语法”。

将 `learn-github-actions` 工作流中运行的所有作业组合在一起。

定义名为 `check-bats-version` 的作业。子键将定义作业的属性。

将作业配置为在最新版本的 Ubuntu Linux 运行器上运行。这意味着作业将在 GitHub 托管的新虚拟机上执行。有关使用其他运行器的语法示例，请参阅“ GitHub Actions 的工作流语法”

将 `check-bats-version` 作业中运行的所有步骤组合在一起。此部分下嵌套的每个项目都是一个单独的操作或 shell 脚本。

```yaml
- uses: actions/checkout@v4
```

关键字 `uses` 指定此步骤将运行 `v4` 操作 `actions/checkout` 。这是一项将存储库签出到运行器的操作，允许您对代码（例如生成和测试工具）运行脚本或其他操作。每当工作流使用存储库的代码时，您都应使用签出操作。

```yaml
- uses: actions/setup-node@v3 with: node-version: '14'
```

此步骤使用该 `actions/setup-node@v3` 操作来安装指定版本的 Node.js。（此示例使用版本 14。这会将 `node` 和 `npm` 命令放在 `PATH` .

```yaml
- run: npm install -g bats
```

关键字 `run` 告诉作业在运行器上执行命令。在这种情况下，您将使用 `npm` 安装 `bats` 软件测试包。

最后，您将使用输出软件版本的参数运行该 `bats` 命令。

### [可视化工作流文件](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#visualizing-the-workflow-file)

在此图中，您可以看到刚刚创建的工作流文件以及 GitHub Actions 组件在层次结构中的组织方式。每个步骤执行一个操作或 shell 脚本。步骤 1 和 2 运行操作，而步骤 3 和 4 运行 shell 脚本。若要查找工作流的更多预生成操作，请参阅“查找和自定义操作”。

![Diagram showing the trigger, runner, and job of a workflow. The job is broken into 4 steps.](https://docs.github.com/assets/cb-62091/images/help/actions/overview-actions-event.png)

## [查看工作流运行的活动](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions#viewing-the-activity-for-a-workflow-run)

触发工作流时，将创建执行工作流的工作流运行。工作流运行开始后，您可以在 GitHub 上查看运行进度的可视化图，并查看每个步骤的活动。

1.  在 GitHub.com 上，导航到存储库的主页。
    
2.  在您的存储库名称下，单击 Actions。
    
    ![Screenshot of the tabs for the "github/docs" repository. The "Actions" tab is highlighted with an orange outline.](https://docs.github.com/assets/cb-15465/images/help/repository/actions-tab-global-nav-update.png)
    
3.  在左侧边栏中，单击要查看的工作流。
    
    ![Screenshot of the left sidebar of the "Actions" tab. A workflow, "CodeQL," is outlined in dark orange.](https://docs.github.com/assets/cb-40551/images/help/actions/superlinter-workflow-sidebar.png)
    
4.  在工作流运行列表中，单击运行的名称以查看工作流运行摘要。
    
5.  在左侧边栏或可视化图表中，单击要查看的作业。
    
6.  若要查看某个步骤的结果，请单击该步骤。
    
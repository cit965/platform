---
title: 5分钟快速入门github action
icon: circle-info
---


在 5 分钟或更短的时间内试用 GitHub Actions 的功能。

##  [介绍](https://docs.github.com/en/actions/quickstart#introduction)

您只需要一个 GitHub 存储库即可创建和运行 GitHub Actions 工作流程。在本指南中，您将添加一个工作流程，用于演示 GitHub Actions 的一些基本功能。

以下示例显示了如何自动触发 GitHub Actions 作业、它们的运行位置以及它们如何与仓库中的代码交互。

## [创建您的第一个工作流](https://docs.github.com/en/actions/quickstart#creating-your-first-workflow)

1.  如果该 `.github/workflows` 目录尚不存在，请在 GitHub 上的存储库中创建一个目录。
    
2.  在目录中 `.github/workflows` ，创建一个名为 `github-actions-demo.yml` .有关详细信息，请参阅“创建新文件”。
    
3.  将以下 YAML 内容复制到 `github-actions-demo.yml` 文件中：
    
    
```yaml

name: GitHub Actions Demo
run-name: ${{ github.actor }} is testing out GitHub Actions 🚀
on: [push]
jobs:
  Explore-GitHub-Actions:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."
      - name: Check out repository code
        uses: actions/checkout@v4
      - run: echo "💡 The ${{ github.repository }} repository has been cloned to the runner."
      - run: echo "🖥️ The workflow is now ready to test your code on the runner."
      - name: List files in the repository
        run: |
          ls ${{ github.workspace }}
      - run: echo "🍏 This job's status is ${{ job.status }}."

```
    
1.  滚动到页面底部，选择“为此提交创建新分支”并启动拉取请求。然后，若要创建拉取请求，请单击“建议新文件”。
    
    ![Screenshot of the "Commit new file" area of the page.](https://docs.github.com/assets/cb-67313/images/help/repository/actions-quickstart-commit-new-file.png)
    

将工作流文件提交到存储库中的分支会触发事件 `push` 并运行工作流。

## [查看工作流结果](https://docs.github.com/en/actions/quickstart#viewing-your-workflow-results)

1.  在 GitHub.com 上，导航到存储库的主页。
    
2.  在您的存储库名称下，单击 Actions。
    
    ![Screenshot of the tabs for the "github/docs" repository. The "Actions" tab is highlighted with an orange outline.](https://docs.github.com/assets/cb-15465/images/help/repository/actions-tab-global-nav-update.png)
    
3.  在左侧边栏中，单击要显示的工作流，在本例中为“GitHub Actions 演示”。
    
    ![Screenshot of the "Actions" page. The name of the example workflow, "GitHub Actions Demo", is highlighted by a dark orange outline.](https://docs.github.com/assets/cb-64036/images/help/repository/actions-quickstart-workflow-sidebar.png)
    
4.  从工作流运行列表中，单击要查看的运行的名称，在本例中为“USERNAME 正在测试 GitHub Actions”。
    
5.  在工作流运行页面左侧边栏的“作业”下，单击“Explore-GitHub-Actions”作业。
    
    ![Screenshot of the "Workflow run" page. In the left sidebar, the "Explore-GitHub-Actions" job is highlighted with a dark orange outline.](https://docs.github.com/assets/cb-53821/images/help/repository/actions-quickstart-job.png)
    
6.  日志显示每个步骤的处理方式。展开任一步骤以查看其详细信息。
    
    ![Screenshot of steps run by the workflow.](https://docs.github.com/assets/cb-95213/images/help/repository/actions-quickstart-logs.png)
    
    例如，您可以查看存储库中的文件列表：![Screenshot of the "List files in the repository" step expanded to show the log output. The output for the step is highlighted with a dark orange highlight.](https://docs.github.com/assets/cb-53979/images/help/repository/actions-quickstart-log-detail.png)
    

每次将代码推送到分支时，都会触发您刚刚添加的示例工作流程，并向您展示 GitHub Actions 如何处理仓库的内容。有关深入教程，请参阅“了解 GitHub Actions”。

##  [更多入门工作流程](https://docs.github.com/en/actions/quickstart#more-starter-workflows)

GitHub 提供了预配置的入门工作流，您可以自定义这些工作流以创建自己的持续集成工作流。GitHub 会分析您的代码，并向您展示可能对您的仓库有用的 CI 入门工作流程。例如，如果您的存储库包含 Node.js 代码，您将看到有关 Node.js 项目的建议。您可以使用入门工作流作为构建自定义工作流的起点，也可以按原样使用它们。

您可以在 actions/starter-workflows 存储库中浏览入门工作流的完整列表。

##  [后续步骤](https://docs.github.com/en/actions/quickstart#next-steps)

GitHub Actions 可以帮助您自动化应用程序开发流程的几乎每个方面。准备好开始了吗？以下是一些有用的资源，可帮助您使用 GitHub Actions 执行后续步骤：

-   有关创建 GitHub Actions 工作流程的快速方法，请参阅“ 使用初学者工作流程”。
-   有关用于生成和测试代码的持续集成 （CI） 工作流，请参阅“自动执行生成和测试”。
-   有关生成和发布包的信息，请参阅“发布包”。
-   有关部署项目，请参阅“部署”。
-   有关在 GitHub 上自动执行任务和流程的信息，请参阅“管理问题和拉取请求”。
-   有关演示 GitHub Actions 更复杂功能的示例，包括上述许多用例，请参阅“示例”。您可以查看详细示例，这些示例解释了如何在运行器上测试代码、访问 GitHub CLI 以及使用并发和测试矩阵等高级功能。
    
4.  滚动到页面底部，选择“为此提交创建新分支”并启动拉取请求。然后，若要创建拉取请求，请单击“建议新文件”。
    
    ![Screenshot of the "Commit new file" area of the page.](https://docs.github.com/assets/cb-67313/images/help/repository/actions-quickstart-commit-new-file.png)
    

将工作流文件提交到存储库中的分支会触发事件 `push` 并运行工作流。

## [查看工作流结果](https://docs.github.com/en/actions/quickstart#viewing-your-workflow-results)

1.  在 GitHub.com 上，导航到存储库的主页。
    
2.  在您的存储库名称下，单击 Actions。
    
    ![Screenshot of the tabs for the "github/docs" repository. The "Actions" tab is highlighted with an orange outline.](https://docs.github.com/assets/cb-15465/images/help/repository/actions-tab-global-nav-update.png)
    
3.  在左侧边栏中，单击要显示的工作流，在本例中为“GitHub Actions 演示”。
    
    ![Screenshot of the "Actions" page. The name of the example workflow, "GitHub Actions Demo", is highlighted by a dark orange outline.](https://docs.github.com/assets/cb-64036/images/help/repository/actions-quickstart-workflow-sidebar.png)
    
4.  从工作流运行列表中，单击要查看的运行的名称，在本例中为“USERNAME 正在测试 GitHub Actions”。
    
5.  在工作流运行页面左侧边栏的“作业”下，单击“Explore-GitHub-Actions”作业。
    
    ![Screenshot of the "Workflow run" page. In the left sidebar, the "Explore-GitHub-Actions" job is highlighted with a dark orange outline.](https://docs.github.com/assets/cb-53821/images/help/repository/actions-quickstart-job.png)
    
6.  日志显示每个步骤的处理方式。展开任一步骤以查看其详细信息。
    
    ![Screenshot of steps run by the workflow.](https://docs.github.com/assets/cb-95213/images/help/repository/actions-quickstart-logs.png)
    
    例如，您可以查看存储库中的文件列表：![Screenshot of the "List files in the repository" step expanded to show the log output. The output for the step is highlighted with a dark orange highlight.](https://docs.github.com/assets/cb-53979/images/help/repository/actions-quickstart-log-detail.png)
    

每次将代码推送到分支时，都会触发您刚刚添加的示例工作流程，并向您展示 GitHub Actions 如何处理仓库的内容。有关深入教程，请参阅“了解 GitHub Actions”。

##  [更多入门工作流程](https://docs.github.com/en/actions/quickstart#more-starter-workflows)

GitHub 提供了预配置的入门工作流，您可以自定义这些工作流以创建自己的持续集成工作流。GitHub 会分析您的代码，并向您展示可能对您的仓库有用的 CI 入门工作流程。例如，如果您的存储库包含 Node.js 代码，您将看到有关 Node.js 项目的建议。您可以使用入门工作流作为构建自定义工作流的起点，也可以按原样使用它们。


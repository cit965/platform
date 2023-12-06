
---
title: 如何在 Git 中推送空提交？
icon: circle-info
---

# 如何在 Git 中推送空提交？

Git 中的 commit 指的是特定时间点对于仓库的快照。为了将新的提交推送到远程存储库，始终需要在本地存储库中进行代码更改，但是 Git 不允许您在本地没有代码变更的情况下进行提交。在本文中，我们将看到推送 git 空提交的必要性和用法。

## 先决条件


在深入研究将 git 空提交推送到远程存储库的概念之前，您应该了解 Git 中 commit 的概念。commit 是 Git 中最常用的概念之一，也是 Git 工作流程中的基本步骤。它用于创建存储库在特定时间点的状态快照，这可以帮助您跟踪和查看 Git 存储库的历史记录，直到进行特定提交时为止。

commit 可以通过唯一的提交 ID 来标识。您还可以上传 commit 消息，这将显示已提交代码更改的详细信息。除此之外，提交还包含许多附加数据，例如作者姓名和创建提交时的时间戳。

## 介绍

空提交是没有任何更改的提交。但是，请记住，这些提交仍然会出现在您的提交历史记录中。通常，Git 不允许您进行没有消息的提交，并且要将新提交推送到远程存储库，您需要在本地对项目进行代码更改。

带有 -m 选项的常规 Git commit 命令是与 commit 命令一起使用的最常见和最常见的选项。它有助于在命令行本身上编写提交消息，因此每次都不会在文本编辑器中提示您。

```shell
git commit -m "An explanatory and descriptive commit message here"
```

上面的命令将使用指定的 commit 消息执行提交。下一节将展示如何修改此命令以推送空提交。

## 需要推送一个空提交

有时您需要开始新的 workflow ，而不需要在本地更改代码中的任何内容。或者您可能没有选项或访问权限来手动启动 workflow 。在这种情况下，启动 workflow 的唯一方法是使用 Git 推送空提交。

这就是推送 git 空提交的概念发挥作用的地方。如果您无法手动启动 workflow，则从终端推送空提交可能会导致 workflow 开始，而无需在本地更改代码中的任何内容。然而，除非不需要太多，否则我们应该养成编写提交消息的习惯，因为它可以帮助其他团队成员理解提交的上下文以及该提交存在于历史中的原因。

## 如何推送空提交？

```shell
git commit --allow-empty -m "Empty commit"

git push origin main
```

这与更改代码时推送提交非常相似，只不过添加了 --allow-empty 标志。但是，此标志允许您在不进行任何代码更改的情况下推送提交。

## 其他有用的命令


1. **克隆仓库：**

```bash
git clone <repository_url>
```



克隆远程仓库到本地。可以通过 HTTPS 或 SSH 协议进行克隆。 

2. **查看仓库状态：**

```bash
git status
```



查看当前工作目录的状态，包括已修改、已暂存和未跟踪的文件。 

3. **添加和提交更改：**

```bash
git add <file(s)>
git commit -m "Commit message"
```



使用 `git add` 将文件添加到暂存区，然后使用 `git commit` 提交更改。 

4. **同步远程仓库：**

```bash
git pull origin <branch>
git push origin <branch>
```



使用 `git pull` 拉取远程仓库的最新更改，使用 `git push` 推送本地更改到远程仓库。 

5. **创建分支和切换分支：**

```bash
git branch <branch_name>
git checkout <branch_name>
```



使用 `git branch` 创建新分支，然后使用 `git checkout` 切换到该分支。也可以用 `git checkout -b <branch_name>` 一步创建并切换到新分支。 

6. **合并分支：**

```bash
git merge <branch_name>
```



在当前分支中合并指定的分支。可能需要解决合并冲突。 

7. **查看提交历史：**

```bash
git log
```



查看提交历史记录，包括作者、日期和提交消息。 

8. **撤销更改：**

```bash
git checkout -- <file>
```



丢弃工作目录中文件的更改，还可以使用 `git reset` 撤销提交。 

9. **创建标签：**

```bash
git tag -a <tag_name> -m "Tag message"
```



为当前提交创建标签，用于标记版本或重要的里程碑。 

10. **查看远程仓库信息：**

```bash
git remote -v
```



查看配置的远程仓库信息，包括 URL。


11. **使用快捷命令别名：**

在 `~/.gitconfig` 文件中可以设置命令别名，使得命令更简洁。例如：

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```



这样，你就可以使用 `git co` 代替 `git checkout`。 

12. **一次性查看文件差异：**

```bash
git diff <file>
```



查看某个文件的差异，而不是整个工作目录。这对于快速了解特定文件的更改非常有用。 

13. **使用交互式添加：**

```bash
git add -i
```



启动交互式模式，可以逐个选择文件添加到暂存区，或者进行其他与添加相关的操作。 

14. **查看提交历史的简化版：**

```bash
git log --oneline --graph --all
```



查看提交历史的简化版本，包括图形展示和所有分支。 

15. **恢复误删的分支或提交：**

```bash
git reflog
git checkout -b <branch_name> HEAD@{n}
```



`git reflog` 显示操作日志，你可以找到误删除的分支或提交的引用，然后使用 `git checkout -b` 恢复。 

16. **查看远程分支信息：**

```bash
git remote show origin
```



查看远程仓库的详细信息，包括远程分支。 

17. **查看某个文件的提交历史：**

```bash
git log -- <file>
```



查看某个文件的提交历史，以及每次提交对该文件的具体更改。 

18. **保存和恢复工作现场：**

```bash
git stash
git stash apply
```



通过 `git stash` 可以保存当前工作目录的更改，然后在其他分支上工作。之后，可以使用 `git stash apply` 恢复之前保存的更改。 

19. **在版本库中搜索：**

```bash
git grep "search_term"
```



在整个版本库中搜索指定关键词，这比在文件系统中使用系统搜索更灵活。 

20. **进行二分查找：**

```bash
git bisect start
git bisect bad
git bisect good <commit>
```



通过 `git bisect` 可以快速找到引入错误的提交。
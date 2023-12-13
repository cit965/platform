---
title: 用Golang自动追踪GitHub上热门AI项目
icon: circle-info
---

GitHub上涌现了大量与人工智能（AI）相关的开源项目，要跟踪最受欢迎的项目变得愈发困难。为了简化这一任务，我开发了一个工具，能够自动生成GitHub上最热门AI项目的精选列表。本文将深入探讨这个项目的代码和功能。

## 项目地址

 [github](https://github.com/cit965/AI-project-stars) https://github.com/cit965/AI-project-stars

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2023-12-13%20%E4%B8%8B%E5%8D%885.56.31.png)

## 代码解析

该项目的核心是一个使用Golang编写的脚本，利用GitHub的API获取和分析有关AI存储库的数据。我们将分解代码的关键组件。
### 用于数据表示的结构体

`Repo` 和 `HeadCommit` 结构体被定义为表示GitHub存储库和默认分支的头提交的数据结构。

```go
type Repo struct {
    // ...（省略了其他字段）
    LastCommitDate time.Time `json:"-"`
}

type HeadCommit struct {
    Sha    string `json:"sha"`
    Commit struct {
        Committer struct {
            Name  string    `json:"name"`
            Email string    `json:"email"`
            Date  time.Time `json:"date"`
        } `json:"committer"`
    } `json:"commit"`
}
```


### 主函数和并发处理

```go
func main() {
    var wait sync.WaitGroup
    wait.Add(4)
    go func() {
        if err := generate(""); err != nil {
            fmt.Println("err generate main readme", err)
        }
        wait.Done()
    }()
    // ...（省略了其他goroutine的调用）
    wait.Wait()
}
```



主函数通过并发调用 `generate` 函数，以加速对不同类别（如图像、音频、学习）的项目列表的生成。
### 生成项目列表

```go
func generate(category string) error {
    // ...（省略了获取GitHub访问令牌和读取项目列表的部分）
    for _, url := range lines {
        // ...（省略了处理GitHub API的部分）
        if strings.HasPrefix(url, "https://github.com/") {
            // ...（省略了获取仓库和提交数据的部分）
            time.Sleep(3 * time.Second)
        }
    }
    sort.Slice(repos, func(i, j int) bool {
        return repos[i].Stars > repos[j].Stars
    })
    saveRanking(repos, category)
    return nil
}
```



`generate` 函数通过GitHub API获取仓库信息，包括仓库的基本信息和最近提交的信息。然后，它按星数对这些项目进行排序，并调用 `saveRanking` 函数保存生成的排行榜。
### 保存排行榜

```go
func saveRanking(repos []Repo, filesuffix string) {
    // ...（省略了打开和写入README文件的部分）
    for _, repo := range repos {
        if isDeprecated(repo.URL) {
            repo.Description = warning + repo.Description
        }
        readme.WriteString(fmt.Sprintf("| [%s](%s) | %d | %d | %d | %s | %v |\n", repo.Name, repo.URL, repo.Stars, repo.Forks, repo.Issues, repo.Description, repo.LastCommitDate.Format("2006-01-02")))
    }
    readme.WriteString(fmt.Sprintf(tail, time.Now().Format(time.RFC3339)))
    readme.WriteString(`欢迎加入我们的社群 ![](https://raw.githubusercontent.com/mouuii/picture/master/weichat.jpg) `)
}
```



`saveRanking` 函数负责将排名保存到相应的README文件中，其中还包括了一些额外的信息，如最后一次自动更新的时间和社群邀请。
## 结语

通过这个用Golang编写的工具，我们可以更轻松地追踪GitHub上最热门的AI项目。这个项目不仅展示了Golang在Web开发领域的强大应用，还为AI爱好者提供了一个便捷的资源发现工具。如果你对Golang、AI和GitHub感兴趣，不妨尝试使用这个工具，了解一下当前AI领域的潮流。
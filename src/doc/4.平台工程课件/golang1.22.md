---
title: golang1.22
icon: circle-info
description: 20240124
---

## 语言的变化

Go 1.22 对“for”循环进行了两处更改。

- 以前，“for”循环声明的变量只创建一次，并在每次迭代时更新。在 Go 1.22 中，循环的每次迭代都会创建新变量，以避免意外共享错误。提案中描述的过渡支持工具继续以与 Go 1.21 中相同的方式工作。
- “For”循环现在的范围可以是整数。例如：
```go
package main

import "fmt"

func main() {
  for i := range 10 {
    fmt.Println(10 - i)
  }
  fmt.Println("go1.22 has lift-off!")
}
```

## 工具

工作区中的命令现在可以使用包含工作区依赖项的 vendor 目录。该目录由 go work vendor 创建，并在 -mod 标志设置为 vendor 目录时的默认值。

请注意，工作空间的 vendor 目录内容与单个模块的内容不同：如果工作空间根目录也包含工作空间中的模块之一，则其 vendor 目录可以包含工作区或模块的依赖项，但不能同时包含两者。

go get 在旧版 GOPATH 模式下的模块外部不再受支持（即使用 GO111MODULE=off ）。其他构建命令，例如 go build 和 go test ，将继续无限期地用于旧版 GOPATH 程式。

go mod init 不再尝试从其他供应商工具（例如 Gopkg.lock ）的配置文件导入模块需求。

go test -cover 现在打印没有自己的测试文件的覆盖包的覆盖摘要。在 Go 1.22 之前，运行此类包的 go test -cover 会报告

现在，在 Go 1.22 中，包中的函数被视为未覆盖：

vet 工具的行为已更改，以匹配 Go 1.22 中循环变量的新语义（见上文）。当分析需要 Go 1.22 或更高版本的文件时（由于其 go.mod 文件或每个文件的构建约束）， vet code> 不再报告对函数文本中的循环变量的引用，这些引用可能会导致比循环的迭代寿命更长。在 Go 1.22 中，每次迭代都会重新创建循环变量，因此在循环更新变量后，此类引用不再面临使用变量的风险。

vet 工具现在会在 defer 语句中报告对 time.Since(t) 的非延迟调用。这相当于在 defer 语句之前调用 time.Now().Sub(t) ，而不是在调用延迟函数时调用。几乎在所有情况下，正确的代码都需要推迟 time.Since 调用。例如：

```go
t := time.Now()
defer log.Println(time.Since(t)) // non-deferred call to time.Since
tmp := time.Since(t); defer log.Println(tmp) // equivalent to the previous defer

defer func() {
  log.Println(time.Since(t)) // a correctly deferred call to time.Since
}()
```

## Runtime 
现在，运行时使基于类型的垃圾收集元数据更接近每个堆对象，从而将 Go 程序的 CPU 性能（延迟或吞吐量）提高了 1-3%。这一变化还通过重复数据删除冗余元数据，将大多数 Go 程序的内存开销减少了大约 1%。某些程序可能会看到较小的改进，因为此更改调整了内存分配器的大小类别边界，因此某些对象可能会向上移动一个大小类别。

此更改的结果是，以前始终与 16 字节（或更高）边界对齐的某些对象地址现在将仅与 8 字节边界对齐。一些使用汇编指令要求内存地址对齐超过 8 字节并依赖内存分配器先前对齐行为的程序可能会中断，但我们预计此类程序很少见。此类程序可以使用 GOEXPERIMENT=noallocheaders 构建，以恢复到旧的元数据布局并恢复以前的对齐行为，但包所有者应更新其汇编代码以避免对齐假设，因为此解决方法将来将被删除发布。

在 windows/amd64 port 上，链接或加载使用 -buildmode=c-archive 或 -buildmode=c-shared 构建的 Go 库的程序现在可以使用 SetUnhandledExceptionFilter Win32 函数来捕获异常由 Go 运行时处理。请注意， windows/386 端口已支持此功能。

## 核心库

Go 1.22 包含标准库中的第一个“v2”包 math/rand/v2 。与 math/rand 相比的变化在提案 #61716 中有详细说明。最重要的变化是：

- Read 方法在 math/rand 中已弃用，未在 math/rand/v2 中继续使用。 （它在 math/rand 中仍然可用。）对 Read 的绝大多数调用应使用 crypto/rand 的 Read 代替。否则，可以使用 Uint64 方法构造自定义 Read 。
- 顶级函数访问的全局生成器是无条件随机播种的。由于 API 不保证结果的固定序列，因此现在可以进行诸如每线程随机生成器状态之类的优化。
- Source 接口现在有一个 Uint64 方法；没有 Source64 接口。
- 现在许多方法使用更快的算法，而这些算法在 math/rand 中不可能采用，因为它们改变了输出流。
- math/rand 、 Int31 、 Int31n 、 Int63 和 Int64n 顶级函数和方法> 在 math/rand/v2 中拼写得更惯用： IntN 、 Int32 、 Int32N 、 Int64 、和 Int64N 。还有新的顶级函数和方法 Uint32 、 Uint32N 、 Uint64 、 Uint64N 、 Uint 、和 UintN 。
- 新的通用函数 N 类似于 Int64N 或 Uint64N ，但适用于任何整数类型。例如，从 0 到 5 分钟的随机持续时间为 rand.N(5*time.Minute) 。
- math/rand 的 Source 提供的 Mitchell & Reeds LFSR 生成器已被两个更现代的伪随机生成器源取代： ChaCha8 PCG . ChaCha8 是一种新的、加密性强的随机数生成器，其效率与 PCG 大致相似。 ChaCha8 是用于 math/rand/v2 中顶级函数的算法。从 Go 1.22 开始， math/rand 的顶级函数（未显式设定种子时）和 Go 运行时也使用 ChaCha8 来实现随机性。

## 增强的路由模式

标准库中的 HTTP 路由现在更具表现力。 net/http.ServeMux 使用的模式已得到增强，可以接受方法和通配符。

使用方法注册处理程序（例如 "POST /items/create" ）会将处理程序的调用限制为使用给定方法的请求。具有方法的模式优先于不具有方法的匹配模式。作为一种特殊情况，使用 "GET" 注册处理程序也会使用 "HEAD" 注册它。

模式中的通配符（例如 /items/{id} ）匹配 URL 路径的各个部分。实际的段值可以通过调用 Request.PathValue 方法来访问。以“...”结尾的通配符（如 /files/{path...} ）必须出现在模式的末尾并匹配所有剩余的段。

## 对库的小改动

- archive/tar
新方法 Writer.AddFS 将 fs.FS 中的所有文件添加到存档中。

- archive/zip

新方法 Writer.AddFS 将 fs.FS 中的所有文件添加到存档中。

···

--- 
![扫码加小助手微信，拉你进技术交流群🔥](https://raw.githubusercontent.com/mouuii/picture/master/weichat.jpg)

<p style="text-align: center;font-size: 10px;;color:#566B95">我是南哥，日常分享高质量文章、架构设计、前沿资讯，加微信拉粉丝交流群，和大家交流！</p>

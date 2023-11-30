---
title: 编写 terraform provider - 03
icon: circle-info
---

## 前言

上节课我们实现了如何读取数据，添加client，这节课我们来学习实现日志；在本教程中，您将在提供程序中实现日志消息，并从日志输出中筛选特殊值。然后，您将管理日志输出，以便在执行 Terraform 时查看这些日志语句。为此，您将：


1. Add log messages. 添加日志消息。
2. Add structured log fields.添加结构化日志字段。
3. Add log filtering. 添加日志筛选。
4. View all Terraform log output during commands.查看命令期间的所有 Terraform 日志输出
5. Save Terraform log output to a file during commands.在命令期间将 Terraform 日志输出保存到文件中。
6. View specific Terraform log output.查看特定的 Terraform 日志输出。

## 实现日志消息

Providers 支持通过 github.com/hashicorp/terraform-plugin-log Go 模块 tflog 的包进行日志记录。此包实现结构化日志记录和筛选功能。

打开 internal/provider/provider.go 文件。

使用以下内容更新 Configure 方法逻辑的顶部。

```go
func (p *hashicupsProvider) Configure(ctx context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
    tflog.Info(ctx, "Configuring HashiCups client")

    // Retrieve provider data from configuration
    var config hashicupsProviderModel
    /* ... */

```

将文件开头 import 的语句替换为以下内容

```go
import (
    "context"
    "os"

    "github.com/hashicorp-demoapp/hashicups-client-go"
    "github.com/hashicorp/terraform-plugin-framework/datasource"
    "github.com/hashicorp/terraform-plugin-framework/path"
    "github.com/hashicorp/terraform-plugin-framework/provider"
    "github.com/hashicorp/terraform-plugin-framework/provider/schema"
    "github.com/hashicorp/terraform-plugin-framework/resource"
    "github.com/hashicorp/terraform-plugin-framework/types"
    "github.com/hashicorp/terraform-plugin-log/tflog"
)

```

## 实现结构化日志字段

该 tflog package 支持将其他键值对添加到日志记录中，以实现一致性和跟踪流。这些对可以随调用一起添加到提供程序请求的其余部分，也可以作为任何日志记录 tflog.SetField() 调用的最终参数内联。

打开 internal/provider/provider.go 文件。

在provider Configure 的方法中，设置三个日志记录字段和紧接 hashicups.NewClient() 在呼叫前的日志消息，其中包含以下内容

```go
    /* ... */
    if resp.Diagnostics.HasError() {
        return
    }

    ctx = tflog.SetField(ctx, "hashicups_host", host)
    ctx = tflog.SetField(ctx, "hashicups_username", username)
    ctx = tflog.SetField(ctx, "hashicups_password", password)

    tflog.Debug(ctx, "Creating HashiCups client")

    // Create a new HashiCups client using the configuration values
    client, err := hashicups.NewClient(&host, &username, &password)
    /* ... */

```

在 Configure 方法末尾添加一条日志消息，如下所示。

```go
    /* ... */
    // Make the HashiCups client available during DataSource and Resource
    // type Configure methods.
    resp.DataSourceData = client
    resp.ResourceData = client

    tflog.Info(ctx, "Configured HashiCups client", map[string]any{"success": true})
}

```

## 实现日志筛选

使用以下命令在 tflog.Debug(ctx, "Creating HashiCups client") Configure 方法中添加筛选器以在调用之前屏蔽用户的密码。

```go
    /* ... */
    ctx = tflog.SetField(ctx, "hashicups_host", host)
    ctx = tflog.SetField(ctx, "hashicups_username", username)
    ctx = tflog.SetField(ctx, "hashicups_password", password)
    ctx = tflog.MaskFieldValuesWithFieldKeys(ctx, "hashicups_password")

    tflog.Debug(ctx, "Creating HashiCups client")
    /* ... */

```

生成并安装更新的提供程序。
```shell
go install .
```

## 查看所有 Terraform 日志输出

```shell
cd examples/coffees
```

运行 TF_LOG 环境变量设置为 TRACE 
```shell
TF_LOG=TRACE terraform plan
```

## 保存所有 Terraform 日志输出

```shell
TF_LOG=TRACE TF_LOG_PATH=trace.txt terraform plan
```
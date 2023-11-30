---
title: 编写 terraform provider
icon: circle-info
---

# 什么是 terraform provider


Terraform 是一种基础架构即代码工具，可让您在人类可读的配置文件中定义云和本地资源，并对其进行版本控制、重用和共享。

Terraform 建立在基于插件的架构之上，使开发人员能够通过编写新插件或编译现有插件的修改版本来扩展 Terraform。

# 创建 terraform provider 的意义

Infrastructure As Code 发展到今天，很明显的已经不再仅限于狭义的 Infrastructure，或者说，“基础设施”的定义已经外延了。例如虚拟机、容器、K8s，当然都是基础设施，网络设置、Service Mesh 等等，也是基础设施，我们正在快速步入一个 Everything As Code 的时代。

要想用代码编排一个服务，首先我们需要该服务暴露一组 API。只有通过 API，其他的程序才可以直接与其交互。有了 API 以后，直接在代码中收发 Http 不是一种好的实践，所以我们需要用 SDK 对 API 进行封装。但是直接调用 SDK 会让我们写出过程式而非声明式的代码，如下图：

![](https://raw.githubusercontent.com/mouuii/picture/master/%E6%88%AA%E5%B1%8F2023-11-29%20%E4%B8%8B%E5%8D%882.59.22.png)

# 正文

## Provisioner 插件的主要职责

在创建后或销毁时对指定的资源执行命令或脚本。

## terraform provider 架构


Terraform 通过其应用程序编程接口 （API） 在云平台和其他服务上创建和管理资源。提供商使 Terraform 能够使用几乎任何具有可访问 API 的平台或服务。我们将要编写的 Provider 程序会通过一个 Go 语言的 SDK 来调用服务的 REST API。架构图如下：


![](https://raw.githubusercontent.com/mouuii/picture/master/%E6%88%AA%E5%B1%8F2023-11-29%20%E4%B8%8B%E5%8D%883.09.37.png)

## 先决条件

- go 1.19+
- terraform v1.5+
- docker 和 docker compose 来本地运行 hashicups 实例

## 步骤

### 1. 设置开发环境

克隆 Terraform 提供程序基架框架存储库,建议使用此库作为创建的任何新 providor 的起点，您将在开发提供程序时扩展和自定义该模板。

```shell
git clone https://github.com/hashicorp/terraform-provider-scaffolding-framework
```

将目录重命名为 terraform-provider-hashicups。

```shell
mv terraform-provider-scaffolding-framework terraform-provider-hashicups
```

切换到克隆的存储库。

```shell
cd terraform-provider-hashicups
```

重命名 go.mod 模块。

```shell
go mod edit -module terraform-provider-hashicups
```

然后，安装提供程序的所有依赖项。

```shell
go mod tidy
```
打开 terraform-provider-hashicups 存储库根目录中 main.go 的文件，并将 import 声明替换为以下内容。

```go
import (
    "context"
    "flag"
    "log"

    "github.com/hashicorp/terraform-plugin-framework/providerserver"

    "terraform-provider-hashicups/internal/provider"
)

```

在克隆的存储库中创建一个目录，该 docker_compose 目录将包含启动 HashiCups 本地实例所需的 Docker 配置。

```shell
mkdir docker_compose
```

使用以下内容创建 docker_compose/conf.json 文件。

```json
{
  "db_connection": "host=db port=5432 user=postgres password=password dbname=products sslmode=disable",
  "bind_address": "0.0.0.0:9090",
  "metrics_address": "localhost:9102"
}

```

使用以下内容创建 docker_compose/docker-compose.yml 文件。

```yaml
version: '3.7'
services:
  api:
    image: "hashicorpdemoapp/product-api:v0.0.22"
    ports:
      - "19090:9090"
    volumes:
      - ./conf.json:/config/config.json
    environment:
      CONFIG_FILE: '/config/config.json'
    depends_on:
      - db
  db:
    image: "hashicorpdemoapp/product-api-db:v0.0.22"
    ports:
      - "15432:5432"
    environment:
      POSTGRES_DB: 'products'
      POSTGRES_USER: 'postgres'
      POSTGRES_PASSWORD: 'password'

```

### 2.实现初始 providor 类型

providor 使用 provider.Provider  类型的interface作为所有实现详细信息的起点。

此接口需要满足以下条件：

1. 一个 Metadata 方法，用于定义要包含在每个数据源和资源类型名称中的提供程序类型名称。例如，名为“hashicups_order”的资源类型的提供程序类型名称为“hashicups”。
2. 一个 Schema 方法，用于定义提供程序级配置的架构。在这些教程的后面部分，你将更新此方法以接受 HashiCups API token和endpoint。
3. 一个 Configure 方法，用于为数据源和资源实现配置共享客户端。
4. 一个 DataSources 方法，用于定义提供程序的数据源。
5. 一个 Resources 方法。用于定义提供程序资源的 Resources 方法。

转到克隆的存储库中的目录，该 internal/provider 目录将包含除提供程序服务器之外的所有提供程序的 Go 代码。
打开 internal/provider/provider.go 文件并将现有代码替换为以下内容。

```go
package provider

import (
    "context"

    "github.com/hashicorp/terraform-plugin-framework/datasource"
    "github.com/hashicorp/terraform-plugin-framework/provider"
    "github.com/hashicorp/terraform-plugin-framework/provider/schema"
    "github.com/hashicorp/terraform-plugin-framework/resource"
)

// Ensure the implementation satisfies the expected interfaces.
var (
    _ provider.Provider = &hashicupsProvider{}
)

// New is a helper function to simplify provider server and testing implementation.
func New(version string) func() provider.Provider {
    return func() provider.Provider {
        return &hashicupsProvider{
            version: version,
        }
    }
}

// hashicupsProvider is the provider implementation.
type hashicupsProvider struct {
    // version is set to the provider version on release, "dev" when the
    // provider is built and ran locally, and "test" when running acceptance
    // testing.
    version string
}

// Metadata returns the provider type name.
func (p *hashicupsProvider) Metadata(_ context.Context, _ provider.MetadataRequest, resp *provider.MetadataResponse) {
    resp.TypeName = "hashicups"
    resp.Version = p.version
}

// Schema defines the provider-level schema for configuration data.
func (p *hashicupsProvider) Schema(_ context.Context, _ provider.SchemaRequest, resp *provider.SchemaResponse) {
    resp.Schema = schema.Schema{}
}

// Configure prepares a HashiCups API client for data sources and resources.
func (p *hashicupsProvider) Configure(ctx context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
}

// DataSources defines the data sources implemented in the provider.
func (p *hashicupsProvider) DataSources(_ context.Context) []func() datasource.DataSource {
    return nil
}

// Resources defines the resources implemented in the provider.
func (p *hashicupsProvider) Resources(_ context.Context) []func() resource.Resource {
    return nil
}

```

### 3.实现 provider server

Terraform  providers是 Terraform 与之交互的服务器进程，用于处理每个数据源和资源操作，例如在远程系统上创建资源。在本教程的后面部分，你将把这些 Terraform 操作连接到本地运行的 HashiCups API服务。

启动提供程序服务器进程。通过实现该 main 函数（该函数是 Go 语言程序的代码执行起点），长时间运行的服务器将侦听 Terraform 请求。

打开 terraform-provider-hashicups 存储库根目录中 main.go 的文件，并将该 main 函数替换为以下内容。

```go
func main() {
    var debug bool

    flag.BoolVar(&debug, "debug", false, "set to true to run the provider with support for debuggers like delve")
    flag.Parse()

    opts := providerserver.ServeOpts{
        // NOTE: This is not a typical Terraform Registry provider address,
        // such as registry.terraform.io/hashicorp/hashicups. This specific
        // provider address is used in these tutorials in conjunction with a
        // specific Terraform CLI configuration for manual development testing
        // of this provider.
        Address: "hashicorp.com/edu/hashicups",
        Debug:   debug,
    }

    err := providerserver.Serve(context.Background(), provider.New(version), opts)

    if err != nil {
        log.Fatal(err.Error())
    }
}

```

### 4.验证 initial provider

准备好 Go 依赖项后，提供程序代码应编译并运行。通过直接执行代码来验证开发环境是否正常工作。这将返回一条错误消息，因为这不是 Terraform 通常启动提供者服务器的方式，但该错误表明 Go 能够编译和运行提供者服务器。

```shell
go run main.go
This binary is a plugin. These are not meant to be executed directly.
Please execute the program that consumes these plugins, which will
load any plugins automatically
exit status 1
```

###  5.Terraform provider 开发环境加载本地

Terraform 会安装providers，并在您运行时 terraform init 验证其版本和校验和。Terraform 将从提供程序注册表或本地注册表下载provider。但是，在生成提供程序时，需要针对提供程序的本地开发版本测试 Terraform 配置。开发版本不会有关联的版本号或提供程序注册表中列出的一组正式校验和。

Terraform 允许您通过 dev_overrides 在名为 .terraformrc .此块将覆盖所有其他配置的安装方法。

Terraform 在主目录中搜索文件， .terraformrc 并应用你设置的任何配置设置。

```shell
go env GOBIN
```

如果未设置 GOBIN go 环境变量，请使用默认路径 /Users/Username/go/bin 

在主目录 （ ~ ） .terraformrc 中创建一个名为 的新文件， dev_overrides 然后添加下面的块。将 PATH 更改为从上述 go env GOBIN 命令返回的值
```shell
provider_installation {

  dev_overrides {
      "hashicorp.com/edu/hashicups" = "<PATH>"
  }

  # For all other providers, install them directly from their origin provider
  # registries as normal. If you omit this, Terraform will _only_ use
  # the dev_overrides block, and so no other providers will be available.
  direct {}
}
```

#### 6.本地安装提供程序并使用 Terraform 进行验证

Terraform CLI 现在已准备好使用路径中本地安装的 GOBIN 提供程序。使用示例存储库根目录中 go install 的命令将提供程序编译为二进制文件，并将其安装在您的 GOBIN 路径中。

```shell
go install .
```

创建一个目录，该 examples/provider-install-verification 目录将包含用于验证本地提供程序安装的 terraform 配置，并导航到该目录。

```shell
mkdir examples/provider-install-verification && cd "$_"
```

使用以下内容创建 main.tf 文件。

```shell
terraform {
  required_providers {
    hashicups = {
      source = "hashicorp.com/edu/hashicups"
    }
  }
}

provider "hashicups" {}

data "hashicups_coffees" "example" {}

```

此目录中的 main.tf Terraform 配置文件使用提供程序尚不支持的“hashicups_coffees”数据源。您将在以后的教程中实现此数据源。

运行 Terraform 计划将报告 provider override，以及有关缺少数据源的错误。即使存在错误，这也会验证 Terraform 是否能够成功启动本地安装的提供程序并在开发环境中与之交互。

使用不存在的数据源运行 Terraform 计划。Terraform 将响应缺少数据源错误。

```shell
terraform plan
╷
│ Warning: Provider development overrides are in effect
│
│ The following provider development overrides are set in the CLI
│ configuration:
│  - hashicorp.com/edu/hashicups in /Users/<Username>/go/bin
│
│ The behavior may therefore not match any released version of the provider and
│ applying changes may cause the state to become incompatible with published
│ releases.
╵
╷
│ Error: Invalid data source
│
│   on main.tf line 11, in data "hashicups_coffees" "example":
│   11: data "hashicups_coffees" "example" {}
│
│ The provider hashicorp.com/edu/hashicups does not support data source
│ "hashicups_coffees".
╵
```

### 7.实现 provider schema

插件框架使用提供程序 Schema 的方法来定义可接受的配置属性名称和类型。HashiCups 客户端需要主机、用户名和密码才能正确配置。Terraform 插件框架 types 包包含可用于 Terraform 的 null、未知或已知值的架构和数据模型类型。

打开 internal/provider/provider.go 文件,将您的 Schema 方法替换为以下内容:

```go
// Schema defines the provider-level schema for configuration data.
func (p *hashicupsProvider) Schema(_ context.Context, _ provider.SchemaRequest, resp *provider.SchemaResponse) {
    resp.Schema = schema.Schema{
        Attributes: map[string]schema.Attribute{
            "host": schema.StringAttribute{
                Optional: true,
            },
            "username": schema.StringAttribute{
                Optional: true,
            },
            "password": schema.StringAttribute{
                Optional:  true,
                Sensitive: true,
            },
        },
    }
}

```

### 8.实现 provider data model

Terraform 插件框架使用带有 tfsdk 结构字段标记的 Go 结构类型，将架构定义映射到具有实际数据的 Go 类型。结构中的类型必须与架构中的类型一致。

将提供程序数据模型类型定义添加到其中 internal/provider/provider.go 

```go
// hashicupsProviderModel maps provider schema data to a Go type.
type hashicupsProviderModel struct {
    Host     types.String `tfsdk:"host"`
    Username types.String `tfsdk:"username"`
    Password types.String `tfsdk:"password"`
}
```

### 9.实现客户端配置功能

provider 使用该 Configure 方法从 Terraform 配置或环境变量中读取 API 客户端配置值。验证值应可接受后，将创建 API 客户端并使其可用于数据源和资源使用。

configure 方法遵循以下步骤：

1. Retrieves values from the configuration 该方法将尝试从提供程序配置中检索值并将其转换为 providerModel 结构。
2. Checks for unknown configuration values. 如果 Terraform 配置值仅在应用其他资源后才知道，则该方法可防止客户端意外配置错误。
3. Retrieves values from environment variables. 该方法从环境变量中检索值，然后使用任何设置的 Terraform 配置值重写它们。
4. Creates API client.  该方法调用 HashiCups API 客户端的 NewClient 函数。
5. Stores configured client for data source and resource usage. 该方法设置响应的 DataSourceData and ResourceData 字段，以便客户端可供数据源和资源实现使用。


将您的 Configure 方法 internal/provider/provider.go 替换为以下内容。


```go
func (p *hashicupsProvider) Configure(ctx context.Context, req provider.ConfigureRequest, resp *provider.ConfigureResponse) {
    // Retrieve provider data from configuration
    var config hashicupsProviderModel
    diags := req.Config.Get(ctx, &config)
    resp.Diagnostics.Append(diags...)
    if resp.Diagnostics.HasError() {
        return
    }

    // If practitioner provided a configuration value for any of the
    // attributes, it must be a known value.

    if config.Host.IsUnknown() {
        resp.Diagnostics.AddAttributeError(
            path.Root("host"),
            "Unknown HashiCups API Host",
            "The provider cannot create the HashiCups API client as there is an unknown configuration value for the HashiCups API host. "+
                "Either target apply the source of the value first, set the value statically in the configuration, or use the HASHICUPS_HOST environment variable.",
        )
    }

    if config.Username.IsUnknown() {
        resp.Diagnostics.AddAttributeError(
            path.Root("username"),
            "Unknown HashiCups API Username",
            "The provider cannot create the HashiCups API client as there is an unknown configuration value for the HashiCups API username. "+
                "Either target apply the source of the value first, set the value statically in the configuration, or use the HASHICUPS_USERNAME environment variable.",
        )
    }

    if config.Password.IsUnknown() {
        resp.Diagnostics.AddAttributeError(
            path.Root("password"),
            "Unknown HashiCups API Password",
            "The provider cannot create the HashiCups API client as there is an unknown configuration value for the HashiCups API password. "+
                "Either target apply the source of the value first, set the value statically in the configuration, or use the HASHICUPS_PASSWORD environment variable.",
        )
    }

    if resp.Diagnostics.HasError() {
        return
    }

    // Default values to environment variables, but override
    // with Terraform configuration value if set.

    host := os.Getenv("HASHICUPS_HOST")
    username := os.Getenv("HASHICUPS_USERNAME")
    password := os.Getenv("HASHICUPS_PASSWORD")

    if !config.Host.IsNull() {
        host = config.Host.ValueString()
    }

    if !config.Username.IsNull() {
        username = config.Username.ValueString()
    }

    if !config.Password.IsNull() {
        password = config.Password.ValueString()
    }

    // If any of the expected configurations are missing, return
    // errors with provider-specific guidance.

    if host == "" {
        resp.Diagnostics.AddAttributeError(
            path.Root("host"),
            "Missing HashiCups API Host",
            "The provider cannot create the HashiCups API client as there is a missing or empty value for the HashiCups API host. "+
                "Set the host value in the configuration or use the HASHICUPS_HOST environment variable. "+
                "If either is already set, ensure the value is not empty.",
        )
    }

    if username == "" {
        resp.Diagnostics.AddAttributeError(
            path.Root("username"),
            "Missing HashiCups API Username",
            "The provider cannot create the HashiCups API client as there is a missing or empty value for the HashiCups API username. "+
                "Set the username value in the configuration or use the HASHICUPS_USERNAME environment variable. "+
                "If either is already set, ensure the value is not empty.",
        )
    }

    if password == "" {
        resp.Diagnostics.AddAttributeError(
            path.Root("password"),
            "Missing HashiCups API Password",
            "The provider cannot create the HashiCups API client as there is a missing or empty value for the HashiCups API password. "+
                "Set the password value in the configuration or use the HASHICUPS_PASSWORD environment variable. "+
                "If either is already set, ensure the value is not empty.",
        )
    }

    if resp.Diagnostics.HasError() {
        return
    }

    // Create a new HashiCups client using the configuration values
    client, err := hashicups.NewClient(&host, &username, &password)
    if err != nil {
        resp.Diagnostics.AddError(
            "Unable to Create HashiCups API Client",
            "An unexpected error occurred when creating the HashiCups API client. "+
                "If the error is not clear, please contact the provider developers.\n\n"+
                "HashiCups Client Error: "+err.Error(),
        )
        return
    }

    // Make the HashiCups client available during DataSource and Resource
    // type Configure methods.
    resp.DataSourceData = client
    resp.ResourceData = client
}
```

将 provider/provider.go 文件顶部 import 的语句替换为以下内容。

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
)

```
下载新的 HashiCups 客户端依赖项。

```shell
go get github.com/hashicorp-demoapp/hashicups-client-go@v0.1.0
go: downloading github.com/hashicorp-demoapp/hashicups-client-go v0.1.0
go: added github.com/hashicorp-demoapp/hashicups-client-go v0.1.0
```

确保所有依赖项都已正确更新。
```shell
go mod tidy
```

生成并安装更新的提供程序。

```shell
go install .
```

### 9.在本地启动 HashiCups

您的 HashiCups 提供程序需要正在运行的 HashiCups 实例。

在另一个终端窗口中，导航到该 docker_compose 目录。

```shell
cd docker_compose
docker-compose up
```

让此过程在终端窗口中保持运行状态。HashiCups 服务将在此终端中打印出日志消息。

在原始终端窗口中，通过向其运行状况检查端点发送请求来验证 HashiCups 是否正在运行。HashiCups 服务将响应 ok 。
```shell
curl localhost:19090/health/readyz
```

### 10. 创建 HashiCups 用户

HashiCups 需要用户名和密码才能生成 JSON Web 令牌 （JWT），该令牌用于对受保护的端点进行身份验证。您将使用此用户向 HashiCups 提供商进行身份验证，以管理您的订单。

在 HashiCups 上创建一个以密码 test123 命名 education 的用户。


```shell
curl -X POST localhost:19090/signup -d '{"username":"education", "password":"test123"}'
```

将 HASHICUPS_TOKEN 环境变量设置为从调用终结点中检索到的 /signup 令牌。您将在后面的教程中使用它。

```shell
export HASHICUPS_TOKEN=ey...
```

现在，HashiCups 应用已运行，你已准备好开始验证 Terraform 提供程序配置行为。

### 11.实现临时数据源

仅当configuration 支持并在 Terraform 配置中使用有效的数据源或资源时，才会进行configuration configuration。现在，请创建一个临时数据源实现，以便可以验证提供程序配置行为。后面的教程将指导您了解真实数据源和资源的概念和实现细节。


通过创建以下名称的文件 internal/provider/coffees_data_source.go 来添加临时数据源。

```go
package provider

import (
    "context"

    "github.com/hashicorp/terraform-plugin-framework/datasource"
    "github.com/hashicorp/terraform-plugin-framework/datasource/schema"
)

func NewCoffeesDataSource() datasource.DataSource {
    return &coffeesDataSource{}
}

type coffeesDataSource struct{}

func (d *coffeesDataSource) Metadata(_ context.Context, req datasource.MetadataRequest, resp *datasource.MetadataResponse) {
    resp.TypeName = req.ProviderTypeName + "_coffees"
}

func (d *coffeesDataSource) Schema(_ context.Context, _ datasource.SchemaRequest, resp *datasource.SchemaResponse) {
    resp.Schema = schema.Schema{}
}

func (d *coffeesDataSource) Read(ctx context.Context, req datasource.ReadRequest, resp *datasource.ReadResponse) {
}

```

打开 internal/provider/provider.go 文件。通过将 DataSources 该方法替换为以下方法，将临时数据源添加到提供程序中。

```go
// DataSources defines the data sources implemented in the provider.
func (p *hashicupsProvider) DataSources(_ context.Context) []func() datasource.DataSource {
    return []func() datasource.DataSource {
        NewCoffeesDataSource,
    }
}

```

生成并安装更新的提供程序。

```shell
go install .
```

### 12.验证 provider configuration

导航到目录 examples/provider-install-verification 

```shell
cd examples/provider-install-verification
terraform plan
```

此目录中的 main.tf Terraform 配置文件在 Terraform 配置中没有提供程序配置值。

提供程序配置的 Terraform 计划。Terraform 将报告缺少提供程序配置值的错误。

```shell
 terraform plan
#...
╷
│ Error: Missing HashiCups API Host
│ 
│   with provider["hashicorp.com/edu/hashicups"],
│   on main.tf line 9, in provider "hashicups":
│    9: provider "hashicups" {}
│ 
│ The provider cannot create the HashiCups API client as there is a missing or
│ empty value for the HashiCups API host. Set the host value in the
│ configuration or use the HASHICUPS_HOST environment variable. If either is
│ already set, ensure the value is not empty.
╵
╷
│ Error: Missing HashiCups API Username
│ 
│   with provider["hashicorp.com/edu/hashicups"],
│   on main.tf line 9, in provider "hashicups":
│    9: provider "hashicups" {}
│ 
│ The provider cannot create the HashiCups API client as there is a missing or
│ empty value for the HashiCups API username. Set the username value in the
│ configuration or use the HASHICUPS_USERNAME environment variable. If either
│ is already set, ensure the value is not empty.
╵
╷
│ Error: Missing HashiCups API Password
│ 
│   with provider["hashicorp.com/edu/hashicups"],
│   on main.tf line 9, in provider "hashicups":
│    9: provider "hashicups" {}
│ 
│ The provider cannot create the HashiCups API client as there is a missing or
│ empty value for the HashiCups API password. Set the password value in the
│ configuration or use the HASHICUPS_PASSWORD environment variable. If either
│ is already set, ensure the value is not empty.
╵
```

在本教程前面添加的提供程序配置方法从环境变量或 Terraform 配置中的提供程序块加载配置数据。在执行 Terraform 计划时，通过设置提供程序定义的 HASHICUPS_HOST 、 HASHICUPS_USERNAME 和环境 HASHICUPS_PASSWORD 变量来验证环境变量行为。Terraform 将通过这些环境变量配置 HashiCups 客户端。

使用环境变量运行 Terraform 计划。

```shell
HASHICUPS_HOST=http://localhost:19090 \
  HASHICUPS_USERNAME=education \
  HASHICUPS_PASSWORD=test123 \
  terraform plan

```

Terraform 将报告它能够从 hashicups_coffees.example 数据源读取数据，并且配置不包括对基础结构的任何更改。

```shell
## ...
data.hashicups_coffees.example: Reading...
data.hashicups_coffees.example: Read complete after 0s

No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration and
found no differences, so no changes are needed.

```

当然，你也可以直接写在 provider 中，如下：

```go
terraform {
  required_providers {
    hashicups = {
      source = "hashicorp.com/edu/hashicups"
    }
  }
}

provider "hashicups" {
  host     = "http://localhost:19090"
  username = "education"
  password = "test123"
}

data "hashicups_coffees" "edu" {}

```

### 未完待续

本课代码：https://github.com/cit965/terraform-provider-hashicups/tree/course-01

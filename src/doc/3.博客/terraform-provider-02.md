---
title: 编写 terraform provider - 02
icon: circle-info
---

# 正文

上篇教程我们讲了如何添加数据源，配置客户端，这节我们继续来实现 terraform provider

## 实现数据源客户端功能



数据源使用可选 Configure 方法从提供程序提取已配置的客户端。提供程序配置 HashiCups 客户端，数据源可以保存对该客户端的引用以执行其操作。

打开 internal/provider/coffees_data_source.go 文件。

允许您的数据源类型存储对 HashiCups 客户端的引用，方法是将该 coffeesDataSource 类型替换为以下内容。

```go
// coffeesDataSource is the data source implementation.
type coffeesDataSource struct {
  client *hashicups.Client
}
```

将文件开头 import 的语句替换为以下内容。

```go
import (
  "context"

  "github.com/hashicorp-demoapp/hashicups-client-go"
  "github.com/hashicorp/terraform-plugin-framework/datasource"
  "github.com/hashicorp/terraform-plugin-framework/datasource/schema"
)

```

通过将 var ( ... ) 语句替换为以下内容，确保数据源实现 DataSourceWithConfigure 接口。

```go
// Ensure the implementation satisfies the expected interfaces.
var (
  _ datasource.DataSource              = &coffeesDataSource{}
  _ datasource.DataSourceWithConfigure = &coffeesDataSource{}
)
```

通过将 Configure 方法添加到数据源类型，从提供程序获取 HashiCups 客户端。

```go
// Configure adds the provider configured client to the data source.
func (d *coffeesDataSource) Configure(_ context.Context, req datasource.ConfigureRequest, resp *datasource.ConfigureResponse) {
  if req.ProviderData == nil {
    return
  }

  client, ok := req.ProviderData.(*hashicups.Client)
  if !ok {
    resp.Diagnostics.AddError(
      "Unexpected Data Source Configure Type",
      fmt.Sprintf("Expected *hashicups.Client, got: %T. Please report this issue to the provider developers.", req.ProviderData),
    )

    return
  }

  d.client = client
}
```

## 实现数据源 schema

数据源使用该 Schema 方法来定义可接受的配置和状态属性名称和类型。咖啡数据源需要将具有各种属性的咖啡列表保存到状态。

将数据源 Schema 的方法替换为以下内容。

```go
// Schema defines the schema for the data source.
func (d *coffeesDataSource) Schema(_ context.Context, _ datasource.SchemaRequest, resp *datasource.SchemaResponse) {
  resp.Schema = schema.Schema{
    Attributes: map[string]schema.Attribute{
      "coffees": schema.ListNestedAttribute{
        Computed: true,
        NestedObject: schema.NestedAttributeObject{
          Attributes: map[string]schema.Attribute{
            "id": schema.Int64Attribute{
              Computed: true,
            },
            "name": schema.StringAttribute{
              Computed: true,
            },
            "teaser": schema.StringAttribute{
              Computed: true,
            },
            "description": schema.StringAttribute{
              Computed: true,
            },
            "price": schema.Float64Attribute{
              Computed: true,
            },
            "image": schema.StringAttribute{
              Computed: true,
            },
            "ingredients": schema.ListNestedAttribute{
              Computed: true,
              NestedObject: schema.NestedAttributeObject{
                Attributes: map[string]schema.Attribute{
                  "id": schema.Int64Attribute{
                    Computed: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  }
}
```

## 实现数据源数据模型

使用以下命令将数据模型类型添加到数据源。

```go
// coffeesDataSourceModel maps the data source schema data.
type coffeesDataSourceModel struct {
  Coffees []coffeesModel `tfsdk:"coffees"`
}

// coffeesModel maps coffees schema data.
type coffeesModel struct {
  ID          types.Int64               `tfsdk:"id"`
  Name        types.String              `tfsdk:"name"`
  Teaser      types.String              `tfsdk:"teaser"`
  Description types.String              `tfsdk:"description"`
  Price       types.Float64             `tfsdk:"price"`
  Image       types.String              `tfsdk:"image"`
  Ingredients []coffeesIngredientsModel `tfsdk:"ingredients"`
}

// coffeesIngredientsModel maps coffee ingredients data
type coffeesIngredientsModel struct {
  ID types.Int64 `tfsdk:"id"`
}

```

将文件开头 import 的语句替换为以下内容。
```go
import (
  "context"
  "fmt"

  "github.com/hashicorp-demoapp/hashicups-client-go"
  "github.com/hashicorp/terraform-plugin-framework/datasource"
  "github.com/hashicorp/terraform-plugin-framework/datasource/schema"
  "github.com/hashicorp/terraform-plugin-framework/types"
)
```

## 实现读取功能

数据源使用该 Read 方法根据架构数据刷新 Terraform 状态。 hashicups_coffees 数据源将使用配置的 HashiCups 客户端调用 HashiCups API 咖啡列表终结点，并将此数据保存到 Terraform 状态.

read 方法遵循以下步骤：

1. Reads coffees list. 该方法调用 API 客户端 GetCoffees 的方法。
2. Maps response body to schema attributes 该方法读取咖啡后，会将 []hashicups.Coffee 响应映射到， coffeesModel 以便数据源可以设置 Terraform 状态
3. Sets state with coffees list.

将数据源 Read 的方法替换为以下内容。

```go
// Read refreshes the Terraform state with the latest data.
func (d *coffeesDataSource) Read(ctx context.Context, req datasource.ReadRequest, resp *datasource.ReadResponse) {
  var state coffeesDataSourceModel

  coffees, err := d.client.GetCoffees()
  if err != nil {
    resp.Diagnostics.AddError(
      "Unable to Read HashiCups Coffees",
      err.Error(),
    )
    return
  }

  // Map response body to model
  for _, coffee := range coffees {
    coffeeState := coffeesModel{
      ID:          types.Int64Value(int64(coffee.ID)),
      Name:        types.StringValue(coffee.Name),
      Teaser:      types.StringValue(coffee.Teaser),
      Description: types.StringValue(coffee.Description),
      Price:       types.Float64Value(coffee.Price),
      Image:       types.StringValue(coffee.Image),
    }

    for _, ingredient := range coffee.Ingredient {
      coffeeState.Ingredients = append(coffeeState.Ingredients, coffeesIngredientsModel{
        ID: types.Int64Value(int64(ingredient.ID)),
      })
    }

    state.Coffees = append(state.Coffees, coffeeState)
  }

  // Set state
  diags := resp.State.Set(ctx, &state)
  resp.Diagnostics.Append(diags...)
  if resp.Diagnostics.HasError() {
    return
  }
}

```

生成并安装更新的提供程序。

```shell
go install .
```

## 验证数据源

```shell
cd examples/coffees
```

此目录中的 main.tf Terraform 配置文件从新 hashicups_coffees 数据源读取数据并输出该数据。

```tf
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

output "edu_coffees" {
  value = data.hashicups_coffees.edu
}
```

运行 Terraform 计划。Terraform 将报告从 HashiCups API 检索到的数据

```shell
 terraform plan
#...
data.hashicups_coffees.edu: Reading...
data.hashicups_coffees.edu: Read complete after 0s

Changes to Outputs:
  + edu_coffees = {
      + coffees = [
          + {
              + description = ""
              + id          = 1
              + image       = "/hashicorp.png"
              + ingredients = [
                  + {
                      + id = 6
                    },
                ]
              + name        = "HCP Aeropress"
              + price       = 200
              + teaser      = "Automation in a cup"
            },
#...
You can apply this plan to save these new output values to the Terraform state,
without changing any real infrastructure.

───────────────────────────────────────────────────────────────────────────────

Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.
```
---
title: 编写 terraform provider - 04
icon: circle-info
---

## 前言

上节课我们学习了如何添加日志，这节课我们来创建和读取数据，在本教程中，您将向提供程序的新 order 资源添加创建和读取功能，该资源与名为 Hashicups 的虚构咖啡店应用程序的 API 进行交互。为此，您将：

1. Define the initial resource type.
2. Add the resource to the provider.
3. Implement the HashiCups client in the resource.
4. Define the resource's schema
5. Define the resource's data model.
6. Define the resource's create logic.
7. Define the resource's read logic.
8. Verify the resource's behavior.


##  实现初始资源类型



Providers 使用 resource.Resource 接口类型的实现作为资源实现的起点，此接口需要满足以下条件：

1. 用于定义资源类型名称的 Metadata method，这是资源在 Terraform 配置中的使用方式。
2. 一种 Schema method，用于定义任何资源配置、计划和状态数据的架构。
3. 一个 Create 方法，用于定义创建资源并设置其初始 Terraform 状态的逻辑。
4. 一个 Read 方法，用于定义刷新资源的 Terraform 状态的逻辑。
5. 一个 Update 方法，用于定义更新资源并在成功时设置更新的 Terraform 状态的逻辑。
6. 一个 Delete 方法，用于定义删除资源并在成功时删除 Terraform 状态的逻辑。

创建 internal/provider/order_resource.go 文件。

```go
package provider

import (
    "context"

    "github.com/hashicorp/terraform-plugin-framework/resource"
    "github.com/hashicorp/terraform-plugin-framework/resource/schema"
)

// Ensure the implementation satisfies the expected interfaces.
var (
    _ resource.Resource = &orderResource{}
)

// NewOrderResource is a helper function to simplify the provider implementation.
func NewOrderResource() resource.Resource {
    return &orderResource{}
}

// orderResource is the resource implementation.
type orderResource struct{}

// Metadata returns the resource type name.
func (r *orderResource) Metadata(_ context.Context, req resource.MetadataRequest, resp *resource.MetadataResponse) {
    resp.TypeName = req.ProviderTypeName + "_order"
}

// Schema defines the schema for the resource.
func (r *orderResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
    resp.Schema = schema.Schema{}
}

// Create creates the resource and sets the initial Terraform state.
func (r *orderResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
}

// Read refreshes the Terraform state with the latest data.
func (r *orderResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
}

// Update updates the resource and sets the updated Terraform state on success.
func (r *orderResource) Update(ctx context.Context, req resource.UpdateRequest, resp *resource.UpdateResponse) {
}

// Delete deletes the resource and removes the Terraform state on success.
func (r *orderResource) Delete(ctx context.Context, req resource.DeleteRequest, resp *resource.DeleteResponse) {
}
```

## 向 provider 添加资源

提供程序从其 Resources 方法中返回它们支持的资源。打开 internal/provider/provider.go 文件。

通过将 Resources 该方法替换为以下方法，将 NewOrderResource 资源添加到提供程序。

## 实现资源客户端功能

资源使用可选 Configure 方法从提供程序获取已配置的客户端。提供程序已配置 HashiCups 客户端，并且资源可以保存对该客户端的引用以执行其操作。

打开 internal/provider/order_resource.go 文件。

允许您的资源类型存储对 HashiCups 客户端的引用，方法是将该 orderResource 类型替换为以下内容。

```go
// orderResource is the resource implementation.
type orderResource struct {
    client *hashicups.Client
}
```

导入资源所需的 HashiCups 客户端包，方法是将文件开头 import 的语句替换为以下内容。

```go
import (
    "context"

    "github.com/hashicorp-demoapp/hashicups-client-go"
    "github.com/hashicorp/terraform-plugin-framework/resource"
    "github.com/hashicorp/terraform-plugin-framework/resource/schema"
)

```

通过将 var 语句替换为以下内容，确保您的资源满足框架定义的 Resource 和 ResourceWithConfigure 接口。

```go
// Ensure the implementation satisfies the expected interfaces.
var (
    _ resource.Resource              = &orderResource{}
    _ resource.ResourceWithConfigure = &orderResource{}
)

```

使用以下命令添加检索 HashiCups 客户端 Configure 的方法
```go
// Configure adds the provider configured client to the resource.
func (r *orderResource) Configure(_ context.Context, req resource.ConfigureRequest, resp *resource.ConfigureResponse) {
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

    r.client = client
}

```

## 实现资源 schema


资源使用该 Schema 方法来定义支持的配置、计划和状态属性名称和类型。订单资源需要将具有各种属性的咖啡列表保存到 Terraform 的状态。

将订单资源 Schema 的方法替换为以下内容

```go
// Schema defines the schema for the resource.
func (r *orderResource) Schema(_ context.Context, _ resource.SchemaRequest, resp *resource.SchemaResponse) {
    resp.Schema = schema.Schema{
        Attributes: map[string]schema.Attribute{
            "id": schema.StringAttribute{
                Computed: true,
            },
            "last_updated": schema.StringAttribute{
                Computed: true,
            },
            "items": schema.ListNestedAttribute{
                Required: true,
                NestedObject: schema.NestedAttributeObject{
                    Attributes: map[string]schema.Attribute{
                        "quantity": schema.Int64Attribute{
                            Required: true,
                        },
                        "coffee": schema.SingleNestedAttribute{
                            Required: true,
                            Attributes: map[string]schema.Attribute{
                                "id": schema.Int64Attribute{
                                    Required: true,
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
                            },
                        },
                    },
                },
            },
        },
    }
}

```

## 实现资源数据模型

将资源的以下数据模型类型添加到 order_resource.go 。


```go
// orderResourceModel maps the resource schema data.
type orderResourceModel struct {
    ID          types.String     `tfsdk:"id"`
    Items       []orderItemModel `tfsdk:"items"`
    LastUpdated types.String     `tfsdk:"last_updated"`
}

// orderItemModel maps order item data.
type orderItemModel struct {
    Coffee   orderItemCoffeeModel `tfsdk:"coffee"`
    Quantity types.Int64          `tfsdk:"quantity"`
}

// orderItemCoffeeModel maps coffee order item data.
type orderItemCoffeeModel struct {
    ID          types.Int64   `tfsdk:"id"`
    Name        types.String  `tfsdk:"name"`
    Teaser      types.String  `tfsdk:"teaser"`
    Description types.String  `tfsdk:"description"`
    Price       types.Float64 `tfsdk:"price"`
    Image       types.String  `tfsdk:"image"`
}
```

## 实现创建功能

提供程序使用该 Create 方法基于架构数据创建新资源。

create 方法遵循以下步骤

1. Checks whether the API Client is configured
2. Retrieves values from the plan.
3. Generates an API request body from the plan values
4. Creates a new order
5. Maps response body to resource schema attributes.
6. Sets Terraform's state with the new order's details.

将资源 Create 的方法替换为以下内容。

```go
// Create a new resource.
func (r *orderResource) Create(ctx context.Context, req resource.CreateRequest, resp *resource.CreateResponse) {
    // Retrieve values from plan
    var plan orderResourceModel
    diags := req.Plan.Get(ctx, &plan)
    resp.Diagnostics.Append(diags...)
    if resp.Diagnostics.HasError() {
        return
    }

    // Generate API request body from plan
    var items []hashicups.OrderItem
    for _, item := range plan.Items {
        items = append(items, hashicups.OrderItem{
            Coffee: hashicups.Coffee{
                ID: int(item.Coffee.ID.ValueInt64()),
            },
            Quantity: int(item.Quantity.ValueInt64()),
        })
    }

    // Create new order
    order, err := r.client.CreateOrder(items)
    if err != nil {
        resp.Diagnostics.AddError(
            "Error creating order",
            "Could not create order, unexpected error: "+err.Error(),
        )
        return
    }

    // Map response body to schema and populate Computed attribute values
    plan.ID = types.StringValue(strconv.Itoa(order.ID))
    for orderItemIndex, orderItem := range order.Items {
        plan.Items[orderItemIndex] = orderItemModel{
            Coffee: orderItemCoffeeModel{
                ID:          types.Int64Value(int64(orderItem.Coffee.ID)),
                Name:        types.StringValue(orderItem.Coffee.Name),
                Teaser:      types.StringValue(orderItem.Coffee.Teaser),
                Description: types.StringValue(orderItem.Coffee.Description),
                Price:       types.Float64Value(orderItem.Coffee.Price),
                Image:       types.StringValue(orderItem.Coffee.Image),
            },
            Quantity: types.Int64Value(int64(orderItem.Quantity)),
        }
    }
    plan.LastUpdated = types.StringValue(time.Now().Format(time.RFC850))

    // Set state to fully populated data
    diags = resp.State.Set(ctx, plan)
    resp.Diagnostics.Append(diags...)
    if resp.Diagnostics.HasError() {
        return
    }
}

```

通过将 import 语句替换为以下内容来添加 Create 方法中使用的包。

```go
import (
    "context"
    "fmt"
    "strconv"
    "time"

    "github.com/hashicorp-demoapp/hashicups-client-go"
    "github.com/hashicorp/terraform-plugin-framework/resource"
    "github.com/hashicorp/terraform-plugin-framework/resource/schema"
    "github.com/hashicorp/terraform-plugin-framework/types"
)

```

## 实现读取功能

provider 使用该 Read 函数检索资源的信息，并更新 Terraform 状态以反映资源的当前状态。提供程序在每个计划之前调用此函数，以在资源的当前状态和配置之间生成准确的差异。

read 函数遵循以下步骤：

1. Gets the current state
2. Retrieves the order ID from Terraform's state.
3. Retrieves the order details from the client.
4. Maps the response body to resource schema attributes.
5. Set Terraform's state with the order's details.


将提供程序 Read 的方法 order_resource.go 替换为以下内容：

```go
// Read resource information.
func (r *orderResource) Read(ctx context.Context, req resource.ReadRequest, resp *resource.ReadResponse) {
// Get current state
    var state orderResourceModel
    diags := req.State.Get(ctx, &state)
    resp.Diagnostics.Append(diags...)
    if resp.Diagnostics.HasError() {
        return
    }

    // Get refreshed order value from HashiCups
    order, err := r.client.GetOrder(state.ID.ValueString())
    if err != nil {
        resp.Diagnostics.AddError(
            "Error Reading HashiCups Order",
            "Could not read HashiCups order ID "+state.ID.ValueString()+": "+err.Error(),
        )
        return
    }

    // Overwrite items with refreshed state
    state.Items = []orderItemModel{}
    for _, item := range order.Items {
        state.Items = append(state.Items, orderItemModel{
            Coffee: orderItemCoffeeModel{
                ID:          types.Int64Value(int64(item.Coffee.ID)),
                Name:        types.StringValue(item.Coffee.Name),
                Teaser:      types.StringValue(item.Coffee.Teaser),
                Description: types.StringValue(item.Coffee.Description),
                Price:       types.Float64Value(item.Coffee.Price),
                Image:       types.StringValue(item.Coffee.Image),
            },
            Quantity: types.Int64Value(int64(item.Quantity)),
        })
    }

    // Set refreshed state
    diags = resp.State.Set(ctx, &state)
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

## 验证资源

刚刚修改的 Terraform 提供程序已准备好与 API endpoint 通信以创建订单。

```shell
mkdir examples/order && cd "$_"
```

在此目录中创建一个 main.tf Terraform 配置文件，用于创建新订单。

```go
terraform {
  required_providers {
    hashicups = {
      source  = "hashicorp.com/edu/hashicups"
    }
  }
  required_version = ">= 1.1.0"
}

provider "hashicups" {
  username = "education"
  password = "test123"
  host     = "http://localhost:19090"
}

resource "hashicups_order" "edu" {
  items = [{
    coffee = {
      id = 3
    }
    quantity = 2
    }, {
    coffee = {
      id = 1
    }
    quantity = 2
    }
  ]
}

output "edu_order" {
  value = hashicups_order.edu
}

```

应用您的配置以创建订单。请注意执行计划如何显示建议的订单，以及有关该订单的其他信息。请记住使用 . yes

```shell
 terraform apply

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

   hashicups_order.edu will be created
  + resource "hashicups_order" "edu" {
      + id           = (known after apply)
      # ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + edu_order = {
      + id           = (known after apply)
      + items        = [
          + {
#...

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

hashicups_order.edu: Creating...
hashicups_order.edu: Creation complete after 0s [id=21]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

edu_order = {
  "id" = "1"
  "items" = tolist([
    {
      "coffee" = {
        "description" = ""
        "id" = 3
        "image" = "/vault.png"
        "name" = "Vaulatte"
        "price" = 200
        "teaser" = "Nothing gives you a safe and secure feeling like a Vaulatte"
      }
      "quantity" = 2
    },
    {
      "coffee" = {
        "description" = ""
        "id" = 1
        "image" = "/hashicorp.png"
        "name" = "HCP Aeropress"
        "price" = 200
        "teaser" = "Automation in a cup"
      }
      "quantity" = 2
    },
  ])
  "last_updated" = "Thursday, 09-Feb-23 11:32:05 EST"
}

```

应用完成后，提供程序会将资源的详细信息保存在 Terraform 的状态中。通过运行 terraform state show <resource_name> 查看状态。

```shell
 terraform state show hashicups_order.edu
 hashicups_order.edu:
resource "hashicups_order" "edu" {
    id           = "1"
    items        = [
       (2 unchanged elements hidden)
    ]
    last_updated = "Thursday, 22-Jul-21 03:26:51 PDT"
}
```

由于订单已成功创建，因此在 terraform apply 状态期间执行计划中 (known after apply) 的值已全部填充。


## 验证已创建的订单

当您使用 Terraform 在 HashiCups 中创建订单时，包含 HashiCups 日志的终端将记录 HashiCups 提供程序调用的操作。切换到该终端以查看日志消息。

```shell
api_1  | 2021-07-22T10:26:31.179Z [INFO]  Handle User | signin
api_1  | 2021-07-22T10:26:51.179Z [INFO]  Handle User | signin
api_1  | 2021-07-22T10:26:51.195Z [INFO]  Handle Orders | CreateOrder
```

通过 API 检索订单详细信息来验证 Terraform 是否创建了订单


```shell
curl -X GET  -H "Authorization: ${HASHICUPS_TOKEN}" localhost:19090/orders/1
```

## 代码

https://github.com/cit965/terraform-provider-hashicups/tree/course-04
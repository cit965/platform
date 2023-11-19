---
title: 开发者门户
icon: fab fa-markdown
order: 1
category:
  - 使用指南
tag:
  - Markdown
---

我们应该给每个公司提供一个开发者门户网站开发框架，比如 backstage 和 port。


## 什么是 backstage

Backstage是一个用于构建开发者门户的开放平台。 在集中式软件目录的支持下，Backstage 可以恢复您的微服务和基础设施的秩序，并使您的产品团队能够快速交付高质量的代码，而不会影响自主权。

Backstage 统一了所有基础设施工具、服务和文档，以创建端到端的简化开发环境。

## 核心功能

- 管理所有软件（微服务、库、数据管道、网站、ML 模型等）的后台软件目录
- 后台软件模板，用于快速启动新项目并根据组织的最佳实践标准化您的工具
- 后台 TechDocs，使用“文档如代码”的方法，轻松创建、维护、查找和使用技术文档
- 此外，不断发展的开源插件生态系统进一步扩展了 Backstage 的可定制性和功能

## 好处

- 对于工程经理来说，它允许您在整个组织中维护标准和最佳实践，并可以帮助您管理从迁移到测试认证的整个技术生态系统。
- 对于最终用户（开发人员），它使以标准化方式构建软件组件变得快速而简单，并且它提供了一个管理所有项目和文档的中心位置。
- 对于平台工程师来说，它通过让您轻松集成新工具和服务（通过插件）以及扩展现有工具和服务的功能来实现可扩展性和可扩展性。
- 对于每个人来说，这是一种单一、一致的体验，可将所有基础结构工具、资源、标准、所有者、参与者和管理员集中在一个位置。

## 架构设计

Backstage 由三部分构成。我们以这种方式分离 Backstage，因为我们看到三组贡献者以三种不同的方式使用 Backstage。

- Core - 由开源项目中的核心开发人员构建的基本功能。
- App - 应用是已部署和调整的 Backstage 应用的实例。该应用程序将核心功能与其他插件联系在一起。该应用程序由应用程序开发人员（通常是公司内的生产力团队）构建和维护。
- Plugins - 使您的 Backstage 应用程序对您的公司有用的附加功能。插件可以特定于公司，也可以是开源和可重用的。在 Spotify，我们有 100 多个插件，由 50 多个不同的团队构建。将来自各个基础结构团队的贡献添加到单个统一的开发人员体验中是非常强大的。

## 概述

下图显示了在使用 Tech Radar 插件、Lighthouse 插件、CircleCI 插件和软件目录的公司内部部署 Backstage 时的外观。

此体系结构中有 3 个主要组件：

1. 核心 Backstage UI
2. UI插件及其支持服务
3. Databases 数据库

![](https://backstage.io/assets/images/backstage-typical-architecture-c38b04130f70f294725a9f646df94d3a.png)

## 用户界面

UI 是围绕一组插件的精简客户端包装器。它为共享活动（如配置管理）提供了一些核心 UI 组件和库。

![](https://backstage.io/assets/images/core-vs-plugin-components-highlighted-de03cf2f3bb3f96bea4834f1db02172e.png)

每个插件通常在专用 URL 的 UI 中提供自身。例如，Lighthouse 插件在 上 /lighthouse 注册到 UI 中
![](https://backstage.io/assets/images/lighthouse-plugin-3543fecb164ca2e8dca3959c8b4909f4.png)

CircleCI 插件可在 /circleci 上找到。

![](CircleCI 插件可在 /circleci 上找到。)


## 插件和插件后端

每个插件都是一个客户端应用程序，它将自己挂载在 UI 上。插件是用 TypeScript 或 JavaScript 编写的。他们每个人都位于自己的目录中 backstage/plugins 。例如，lighthouse 插件的源代码位于 backstage/plugins/lighthouse

### 安装插件

插件通常作为 React 组件安装在 Backstage 应用程序中。例如，下面是一个文件，用于在 Backstage 示例应用中导入许多整页插件。

其中一个插件组件的一个示例是 ，这是一个整页视图 CatalogIndexPage ，允许您浏览 Backstage 目录中的实体。它通过导入它并将其添加为如下所示的元素安装在应用程序中：

```js
import { CatalogIndexPage } from '@backstage/plugin-catalog';

...

const routes = (
  <FlatRoutes>
    ...
    <Route path="/catalog" element={<CatalogIndexPage />} />
    ...
  </FlatRoutes>
);
```

请注意，我们使用 "/catalog" 该插件页面的路径，但我们可以为该页面选择任何我们想要的路由，只要它不与我们为应用程序中的其他插件选择的路由冲突。

这些从插件导出的组件称为“插件扩展组件”或“扩展组件”。它们是常规的 React 组件，但除了能够由 React 渲染之外，它们还包含用于将整个应用程序连接在一起的各种元数据。扩展组件是使用 create*Extension 方法创建的，您可以在可组合性文档中阅读有关这些方法的更多信息。

截至目前，插件没有基于配置的安装程序。需要对代码进行一些更改。

### 插件架构

在架构上，插件可以采用三种形式：

1. Standalone 独立
2. Service backed 服务支持
3. Third-party backed 第三方支持

#### 独立插件

完全在浏览器中运行。例如，Tech Radar 插件只是渲染硬编码信息。它不会向其他服务发出任何 API 请求

![](https://backstage.io/assets/images/tech-radar-plugin-4d2311a5ccbe580f9fc5f071c734f06c.png)

安装在 Backstage 应用程序中的 Tech Radar 的架构非常简单。

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA7gAAAGBCAIAAADDsYpAAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAAW9yTlQBz6J3mgAAHnlJREFUeNrt3X9wlPW96PG0xdbanBOk/Igm8kOCBEgRKheDBlxPgg01ahqhpJpK0G0Dh1RDSUsMQVZErj/4EWwoSEMJTrzm0rTNqTkSDznmlNwSj8yYuTKWaR2baTNOhhu8sROdTGf/2PvHc0+aQcWohAR8veb7x7K7z0PIfBzf88x3n42LAQAA7xPnVwAAAEIZAACEMgAACGUAABDKAAAglAEAQCgDAIBQBgAAoQwAAEIZAACEMgAACGUAABDKAAAglAEAAKEMAABCGQAAhDIAAAhlAAAQygAAIJQBAEAoAwCAUGYkS09PnwxDY+nSpf4TA0Aoc6GaPHmyXwKmCwCEMlIG0wUAQhkpg+kCAKGMlMF0AYBQRspgugBAKCNlMF0AIJSRMpguABDKSBlMFwAIZaQMpgsAhDJSBkwXAEIZKQOmCwChjJQB0wWAUEbKgOkCQCgjZcB0ASCUQcpgugBAKCNlMF0AIJSRMpguABDKSBlMFwAIZaQMpgsAhDJSBtMFAEIZKYPpAgChjJTBdAGAUEbKYLoAQCgjZcB0ASCUkTJgugAQykgZMF0ACGWkDJguAIQyUgZMFwBCGaQMpgsAhDJSBtMFAEIZKYPpAgChjJTBdAGAUEbKYLoAQCgjZTBdACCUkTKYLgAQykgZTBcACGWkDKbLLwEAoYyUAdMFgFBGyoDpAkAoI2XAdAEglJEyYLoAEMogZTBdACCUkTKYLgAQykgZTBcACGWkDKYLAIQyUgbTBQBCGSmD6QIAoYyUwXQBgFBGymC6AEAoI2UwXQAglJEyYLoAEMpIGTBdAAhlpAyYLgCEMlIGTBcAQhkpA6YLAKEMUgbTBQBCGSmD6QIAoYyUwXQBgFBGymC6AEAoI2UwXQAglJEymC4AEMpIGUwXAAhlpAymCwCEMlIG0wUAQhkpA6YLAKGMlAHTBYBQRsqA6QJAKCNlwHQBIJSRMlIG0wUAQhkpg+kCAKGMlMF0AYBQ5rykzIzZ8ydcOemiWaFv5BkAoQwAQplzkDLjEifVHn33olnjr5hkAIQyAAhlhLJQFsoAIJQRykJZKAOAUEYoC2WhDABCGaEslIUyAAhlhLJQFsoAIJQRykJZKAOAUEYoC2XTBQBCGaEslE0XAAhlhLJQRigDIJQRykIZoQyAUEYoC2WEMgBCGSkjlBHKAAhlpIxQRigDIJRBKAtloQwAQhmhLJSFMgAIZYSyUBbKACCUEcpCWSgDgFBGKAtloQwAQhmhLJSFMgAIZYSyUDZdACCUEcpC2XQBgFBGKAtl0wUAQhmhLJQRygAIZYSyUEYoAyCUkTJCGaEMgFBGyghlhDIAQhmEMkIZAIQyQlkoC2UAEMoIZaEslAFAKCOUhbJQBgChjFAWykIZAIQyQlkoC2UAEMoIZaEslAFAKCOUhbLpAgChjFAWyqYLAIQyQlkoI5QBEMoIZaGMUAZAKCOUhTJCGQChjJQRyghlAIQyUkYoI5QBEMoglIWyUAYAoYxQFspCGQCEMkJZKAtlABDKCGWhLJQBQCgjlIWyUAYAoYxQFspCGQCEMkJZKAtlABDKCGWhbLoAQCgjlIWy6QIAoYxQFsoIZQCEMkJZKCOUARDKSBmhjFAGQCgjZYQyQhkAoYyUEcoIZQAQyghloSyUAUAoI5SFslAGAKGMUBbKQhkAhDJCWSgLZQAQyghloSyUAUAoI5SFslAGAKGMUBbKpgsAhDJCWSibLgAQyghloYxQBkAoI5SFMkIZAKGMUBbKCGUAhDJSRigjlAEQykgZoYxQBkAog1AWykIZAIQyQlkoC2UAEMoIZaEslAFAKCOUhbJQBgChjFAWykIZAIQyQlkoC2UAEMoIZaEslAFAKCOUhbLpAgChjFAWyqYLAIQyQlkoI5QBEMoIZaGMUAZAKCNlhDJCGQChjJQRyghlAIQyUkYoI5QBEMoglIWyUAYAoYxQFspCGQCEMkJZKAtlABDKCGWhLJQBQCgjlIWyUAYAoYxQFspCGQCEMkJZKJsuABDKCGWhbLoAQCgTi8WOHz9eVVVVVlZWWFgYCoVSU1MnT56clpaWlZVVWFhYUVGxd+/ekydPCmWhLJQBQChf/KLRaHNzc0lJSXJycsrUq9fcd/fWB4v3b3uw+ZnHTvxm158OV7bXP960/+H9j6/bvC58313fSr4yMSVlakVFRWtrq1AWykIZAITyRaivr2/Lli1jx45Nnz9v8/o1J5v2/O149WDWK/8jUv7P35mVOi05KWnv3r3RaFQoC2WhDABC+WIQjUZramoSExOX59128vBPB9nHH1DMz27KvGFuytQpDQ0NQlkoC2UAEMoXtpaWljlz5ty08IaX6ys/cSIPXE0/XXftzJTQooz29nahLJSFMgAI5QvS3r17k5OT/mfVpnOSyP3rvZf37d24MnHcVxt+/WuhLJSFMgAI5QtJNBpdtWpV2swZbzT95NxW8sCdGMmJY7dsjghloSyUAUAoXxh6enqysrJu/cY/vd369BBVcrD+0rT9+tnTCvKX9fX1CWWhLJQBQCiPaNFoNCMj44HvFbz38r4hreRg/fV3e/Ky/tvyvNuEslAWygAglEe0cDh8xzcXn4dEHtjK139t6iObyoWyUBbKACCUR6iqqqo5s9PePrrnfIZysAcjacKY5xt+JZSFslAGAKE84jQ3NycnJb3xQuV5ruRgHXumInHs5Sf+d7tQFspCGQCE8ggSjUZTUlIa920alkoOVtWD370pfa5QFspCGQCE8ghSWVl5xzezhrGSg3XtNRN/fahWKAtloQwAQnlE6OnpSUxMbK9/fNhDufGptdOvvioajQploSyUAUAoD79IJLLi27cPeyUHa9F10w/sqRTKQlkoA4BQHma9vb2jRyf85d+e+siEffu3u3/wncXTJk5IGn/59MmJj6y5czCHFOdnpVw1Pmn85alTrni0+M7BfGNf0oSvCmWhLJQBQCgPs7q6ultvuXkw13pvWZD2jRvSnt1a9C+V92/7Yf78tKsbn1p79kMWp8/KnD+z/5Abrk35yEP+drx61tSkY//xb0JZKAtlABDKw6mgoGDfoz8cTChf+sVLDu/+YdszFcF6Zsv3Zk+76uyHfOmLowYecujJf772mqs+8i968L6cDSXfE8pCWSgDgFAeNtFoND4+/q1//8lgQnn65MRNq3L7qzf8rUVZ6bPOfsi0iRM2fv/2/kNWLbv5lgVpg7mn8vQpSUJZKAtlABDKw6a5uTkjfd4gP2bXsPP+cZf/w8bv3/7Svh+X3H3LP37ly688u+kjDxk7Oj44ZO3dt/xj/EcfEqyk8Zf/8fevCWWhLJQBQCgPj9LS0q3rVw/+lhT124qnTZww6gufn5s68aWfrR/MIYeeXJNy1fhRX/j812dMGuQhfzte/f07Qz957KELPZQXZC5dXrT5jCeXF21ekLm0/4/Zy9ZkL1sjlIUyAAjlkaWgoODgk6Uj5MZwA9fDq7+14YH7LvRQHpc4adGSgjOeXLSkYODfNWPuwhlzFwploQwAQnlkCYVCR37+8AgM5epN996zdMnQpUxfX59QRigDIJT5UCkpKb//lydHYCg3/XRd5g1zhy5lEhMTKysrB+ayUEYoAyCU+bv4+Pi3f7t7BIbyq3UPz5o2cehS5vOf//zMmTPHjx/fn8tCGaEMgFDm70aNGjUCK/lvx6v/9K9PjkmIn/zpjBo16sNeivsvl1xySVJSUkdHh1BGKAMglPm7Sy+99K+/2zMCQ/m1X2z59LdSPkvKfO5zn0tNTb388suLi4u7urpirigjlAEQypzxP/s/Pr99BIbykb0/umn+14YuZb70pS+VlJQEiRwQyghlAIQyfxcKhY7s3/QZvOvFwEQeulBOnjLz/RG8IHPplROvEcpCGQCE8oiWn5//7I71IzCUHy2+c/2awvOZMkP0hSOXxSccaD498Mkx45Lmh3KFslAGAKE8opWUlOx46AcjMJR/8J3FO7aUXeihvHZrXVxc3K35D/Q/syz8UFxc3NqtdUJZKAOAUB7RGhoaMm+6YQSG8tSrxr/6n//rQg/lYEdyXFzclROvWZC5NHnKzLi4uBtvyR/4BqEslAFAKI9EfX198fHxbx/dM9JueTHpyvHnOWWGKJRrj75b+nh95h3hRUsKMu8ID7yWHKyi8qeLyp8WykIZAITyiJObm3tw249GVCg/vPpbD4TvumhCeViWUBbKACCUP62amprlud8cUaF8/deufulwg1AWykIZAITycOru7h49OuHUf4yUL7L+/a+2jh39D9FoVCgLZaEMAEJ5mBUXF68ruvvDyvXxB75dvenec5jC7728b/u6/A87Z17mdU8+Un7+U0YoI5QBEMqcqaura+zYsX9s3PGB5XrsmYrrv3b1jXOmvfSzc3DH5Yad98+amnTLgrTf/2rr+189+vPypAlj+/r6hLJQFsoAIJRHhEgksmJ57lmuAVdvunfSFWO/uXB200/XfbJErt9WfOOcabOmJtVvK/6w9yy6bvqBvU8NS8oIZYQyAEKZD9Db25ucnNz23H8/S+n+9Xd79lasmDU1aepV4x9e/a3XfrFlMH187JmKB+/LSRp/+fVfu7ru8dXvvbzvLCV97YyUc7I7WSgLZaEMAEL5nKmrq0uZOuWtf6/6yPY9+vPy1d/+p0lXjJ10xdi8zOseLb6zdmvRkb0/6l81j4Q3fv/220NzJ3w1YepV49cWfOOVZzd95Gf4EseObv3tS8OVMkIZoQyAUOZDVVRUZIYy3vvPj/HNIDWPhNcWfCMv87pF100PtjIvum76t2+Z/6PCJXWPr/7jbx4bzHne/u3uWSnJP9vz1Ln95whlhDIACOVzIxqN5uTkFN2z7HzeD+69l/d9c+G1RffdM7wpI5QRygAIZc6mt7c3NTV1x6aS8xbKP7hr8U03Xn8OtyYLZaEslAFAKA+Jzs7OtLS0ohXfHvwejE+23v7t7ttvvu6mjAU9PT3DnjJCGaEMgFDmo/X29ubk5GSGFp46um+IKvlP//rktalTwitXDMW1ZKEslIUyAAjloRKNRsvKylKnX9N2aNs5r+Smn65LThxXuXP7yEkZoYxQBkAo8zHU1tYmJiau+M6dHUf2nJNEfu0XW24NzU+5enJTU9OIShmhjFAGQCjz8fT29kYikdGjR6+/P/x/Wn/2iRP5L03b7126eOxXx1RWVg7ddguhLJSFMgAI5fOqq6srHA6PHj16ed5tB3du/L/H9g+yj986Uvl0ZNWtWRmjExLKysqG6HN7QlkoC2UAEMrDqbu7u7q6Ojc3d/To0Vk3L3piY8mzTz3U/MxjbzTt/mvb/7+Rxe9/s/3Igc0Ht/1o87rwjfPnjh6dUFBQUFtb29vbO5JTRigjlAEQypwDvb299fX1paWl+fn5oVBo8uTJl1566ahRo+Lj41NSUkKhUEFBQVlZWVNTU19f3wWRMkIZoQyAUEbKCGWEMgBCGSkjlBHKAAhlEMpCWSgDgFBGKAtloQwAQhmhLJSFMgAIZYSyUBbKACCUEcpCWSgDgFC+YL3xxhvt7e3B466urtbWVqEslIUyAAhlYjU1NZFIJHjc0tJSWFgolIWyUAYAocwHh3Jzc3NBQUFJSUlXV1fwx/z8/LKysuDbqmtraxsbG4uLi4WyUBbKACCUP1uhnJKS0tPTc+LEie7u7vb29uzs7J6enuCrrWOxWFpa2pYtW4KGFspCWSgDgFD+DIVybm5ucXHxiRMnYrFYaWlpcXFxTU1NTU1NKBQaCSUhlBHKACCUh1xtbW1ZWVnwuKGhIbhmHERzenp6XV1dSUlJJBJpaWlpaWkJPvYnlIWyUAYAoXzx6+zsTE1NPXnyZFdXV0ZGRmtra19fX0NDQywWq6urKy0tbW1tDYVCPT09vb29HR0dQlkoC2UAEMqfFc3Nzbm5uTk5OXV1dbFYLBqNPvbYY7m5uatWreru7o7FYo2NjTk5OUuXLm1ra4vFYv1XnYWyUBbKACCUuVBTRigjlAEQykgZoYxQBkAoI2WEMkIZAKEMQlkoC2UAEMoIZaEslAFAKCOUhbJQBgChjFAWykIZAIQyQlkoC2UAEMoIZaEslAFAKCOUhbLpAgChjFAWyqYLAIQyQlkomy4AEMoIZaGMUAZAKCOUhTJCGQChjJQRyghlAIQyUkYoI5QBEMoglBHKACCUEcpCWSgDgFBGKAtloQwAQhmhLJSFMgAIZYSyUBbKACCUEcpCWSgDgFBGKAtloQwAQhmhLJRNFwAIZYTyCFyXXPKlqyZOtvrX7bl3CmUAhDII5Xe/8IVRF9M/59OvCVdOEsoACGUQykJZKAOAUEYoC2WhDABCGaEslIUyAAhlhLJQFsoAIJQRykJZKAOAUEYoC2WhDABCGaEslIUyAAhlhLJQFsoAIJQRykJZKAOAUEYoC2WhLJQBEMoIZaEslIUyAEIZoSyUP/F6dP+xjVVHzu05dze8+eNtDUIZAIQyQnn4Q3nRkoIz1hO1rw7mwLyV5YuWFHzYq2u31vWfcHnR5j3P/3kw59yw6/CMuQuFMgAIZYTy8Ifyhl2HN+w6vGhJwezrFweP973w1qcP5byV5cEJSx+vX5xXNGZc0oHm00IZAIQyQvkC23pxRvUeaD4dXr87b2X5o/uP9T+5/bnX7lqzdXnR5p2HXg8OyV625pF9R/NWlq/euP/sJxwzLmnDrsPB5ooVa3fkrSyP7Hlp4I6Lu9Zs/e79T6zdWtcfyvteeOve0l15K8v7N2PsbnhzY9WRJ2pfzVtZ/tQv/yCUAUAoI5TPaygfaD49adrsxXlF4fW7k6fMDAJ3Y9WRhDETloUfWl60OfOOcHDIlROvWZC59K41WxPGTDijlQeesPrFU5fFJzyy7+i+F95KnjJzedHm797/RPBM7dF3dx56PWHMhMV5Rd+9/4krJ14ThPLBlndSZs3PW1m+Yu2OhDETSh+vD643p8yaP332gryV5YPcyyGUARDKIJTPWSivWLvjxlvy+/dCzA/l1h5998qJ14TX737/5ooP24aRt7J80rTZeSvLc+9ZnzxlZnCSgWtxXlHuPeuDTdJBeZ+x9eJgyzvBg2Xhh0I5hcGrl375K4NPZKEMAEIZoXwuQ3nRkoLpsxcEn8ObH8qdNG129Yun4uLigh0XH3hIUfnT7w/l6bMXFJU/PSX16/0dHFyZXrSkIG3ezeMSJwWHXDnxmuCC8Rmh/NjBV0I5hTPmLkyeMjN45yfbwSyUARDKIJTPTSiHcgpz71m/89Drwdrd8OaB5tNxcXHbn3vtY4Vy8Exkz0uXxScEl4E3Vh2ZkHR1sOOi/w3JU2Y+8MizZ4TyE7WvJoyZ8ODOxoEnF8oAIJQRysMZyqs37k+eMrP6xVMDt0Ckzbv5trvXBc8E1TvIUK49+u6Nt+T3b2vu39SxIHNp8IbMO8L9GzPuLd0VpHBR+dPXLbwtePK2u9cJZQAQygjlEXHXi8w7wsHWiJRZ84PLvU/UvjoucVLavJvn3rBk+uwFHyuUn/rlHy798lce3X/skX1HL4tPWJC5NDhP8Iadh14flzhp+uwFafNunh/KDVJ4+3Ov9b9zfihXKAOAUEYoD08o73vhrTM+JLfz0Osbdh0eeBe2A82nI3teCjZOnHFI9Yunzjj8jBPubngzuD3zU7/8w4Zdh6tfPDXwkAPNpzdWHdn+3GsHW97Z3fBm/3XrDbsO73n+zweaTwfvPNB8uv9VoQwAQhmhPEK/wvpCWUIZAKEMQlkoC2UAEMoIZaEslAFAKCOUhbJQBgChjFAWykIZAIQyQvkCD+Ufb2s444tIPnIdbHknuAOGUAYAoYxQvhhCOfhS60VLCm67e92j+48FT86Yu7Co/OmPdZ5b8x9InjJTKAOAUEYoXyShHBcXt2HX4Q27Dt+1Zutl8QnBDZU/QSjvef7Pjx18RSgDgFBGKF88odz/OHvZmuxlawaG8qP7j22sOhK8uv251368raH/q0buWrN1WfihovKni8qf3t3wZv+r1S+eKn28ft8LbwVvGPjlJkIZAIQyQvmCDOXMO8K33b1uYCif8Y3WwXdN73vhrTHjklas3VEcOXhZfEL2sjU7D73e/+rOQ69fFp8wY+7CFWt3zL5+ccqs+UIZAIQyQvlC3Xrx4M7GvJXll8UnPFH76keGcnHk4PTZC/ovQq9Yu2PgqzsPvR4XFxd8K/XuhjcHhrhQBgChjFC+kEI5+DBf3sry/jtdnD2UI3teGpc46WDLO7VH302bd/ParXXvD+UPvGItlAFAKCOUL8itF/2rP5SXhR96fygHb5iS+vWUWfMz7wgHxSyUAUAoI5Q/Q6G8euP+SdNmB7dJnh/KDVL40f3H+rde9C+hDABCGaF88YfyoiUFQQrvbngzYcyEKalfn5L69cV5RQM/zDd99oIZcxdet/C2u9ZsPdjyjlAGAKGMUL6oQnnnodff/+SB5tP9d4WrfvHUhl2H9zz/5wPNp4OP6P14W0Mop/Cxg68EnwIcMy5p7da66hdPBa8ebHln4Dk/8PxCGQCEMkL5gvwK67OvzDvCy8IPBY/3vfDWuMRJwdeUnM8llAEQyiCUR1wob3/uteCTfDPmLkyZNX/1xv3n/2cQygAIZRDKIy6U+7dnVL94arj+dqEMgFAGoTxCQ3l4l1AGQCiDUBbKQhkAhDJCWSgLZQAQyghloSyUAUAoI5SFslAGAKGMUBbKQhkAhDJCWSgLZQAQyghloSyUAUAocyGH8lfHJ42/YtJFsy655IsX0z/n069Z184XygAIZZAymC4AEMpIGUwXAAhlpAymCwCEMlIG0wUAQhkpg+kCAKGMlMF0AYBQRspgugBAKCNlMF0AIJSRMpguABDKSBkwXQAIZaQMmC4AhDJSBkwXAEIZKQOmCwChjJQB0wWAUPYrQMpgugBAKCNlMF0AIJSRMpguABDKSBlMFwAIZaQMpgsAhDJSBtMFAEIZKTNydHd3V1dX+z2YLgCEMlyEKVNYWNjS0hI8jkQiNTU1gz+2s7MzLS3tA1+qqamZM2dOYWFhRkZGRUWFsRHKAAhlpMzFEMqdnZ01NTVtbW3B8x0dHTU1NSdOnIjFYn19fSdPnjxx4kRzc3NXV1dJSUksFjt+/HhNTU1HR8fAUI5EIsHjxMTEWCzW09PT0dHR1tYWnLatra22trarqys4f/Cgq6srOEnw5lgs1tzcXFdX19PTE5yqqamprq6ur68vOKq3t7e+vj441nQBgFBGygxtKPf29s6ZM6e+vr60tLS3t7e9vT0rK6umpiYnJ6e1tbWjo2POnDnhcLi5ubm7u7uvr6+1tTU7O7u+vr6/jINQLikp6ejoaG5uzsjIiMViLS0t6enpJSUlra2te/fuzcnJqa6unjdv3okTJ+rq6srKymKxWHFxcWFhYSwWq6ysrKmpqaysDIfDdXV1e/fujcVi4XC4tLS0qqoqJycn+GmzsrK2bdsmlAFAKCNlzkcod3d3p6amHj9+PHiyoKCgsbGxo6OjsbGxuLi4o6MjNTV14Bmampqys7M7OzsHPtm/9SInJ6ewsLC3t7elpSU7O7v/dxhcFW5sbCwsLOzu7p43b14sFsvPzw8iODc3t6Ojo6KiIoj1WCzW1dWVnp7e0dHR0dGRk5PT2dkZiUQqKytNFwAIZaTMkAiHw01NTQNDORaLnThxorCwMCsrq7u7OxQKlZSURCKRSCTS0NDQ0dERCoXOOEljY2N2dvaqVasGhnL/BeZIJFJVVdXS0hJcLR74Ozx58mRwtvT09Pb29rKysoqKiuPHj6enp8disWg0WlVVlZGRUVlZ2drampaWFvkvPT09H3dHtekCAKGMlPkYqquri4uLgyrNyMhob2+PRqPBRdyKioqamprS0tKBPfr+UO7fQJyRkdG/TXlgKAfbJwaGcmpq6htvvBGLxSorK4NNFxUVFfn5+U1NTS0tLfn5+UFzd3d3Bz/Y5MmTe3t709LSgh/sjKw3XQAglJEy5140Gl26dOm8efPmzJkT3J7i5MmTWVlZhYWFoVCoq6urp6cnJycnNzc3Jyenvb29s7MzPz9/4Bnq6+uzsrLy8/MHPl9fXx8KhQoLC7Ozs0tLS6PRaFtbW2lpafBqW1tbenp6cM6gfdva2lJSUnp7e/v6+tLS0oKL3JFIJCcnJzs7O2juhoaGefPm5efnB2VfWVlZX19vugBAKCNlMF0AIJSRMpguABDKSBkwXQAIZaQMmC4AhDJSBkwXAEIZKQOmCwChjJQB0wWAUAYpg+kCAKGMlMF0AYBQRspgugBAKCNlMF0AIJQZIsnJyZNhaKSnp/tPDAChDAAAQhkAAIQyAAAIZQAAEMoAAIBQBgAAoQwAAEIZAACEMgAACGUAABDKAAAglAEAQCgDAIBQBgAAoQwAAEIZAAAuTv8PTp8myvYT4PUAAABQZVhJZk1NACoAAAAIAAIBEgADAAAAAQABAACHaQAEAAAAAQAAACYAAAAAAAOgAQADAAAAAQABAACgAgAEAAAAAQAAA7igAwAEAAAAAQAAAYEAAAAAmQvpBwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0xMC0wNVQwNzo1MzozNSswMDowMCgGuf8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMTAtMDVUMDc6NTM6MzUrMDA6MDBZWwFDAAAAEXRFWHRleGlmOkNvbG9yU3BhY2UAMQ+bAkkAAAASdEVYdGV4aWY6RXhpZk9mZnNldAAzOK24viMAAAAYdEVYdGV4aWY6UGl4ZWxYRGltZW5zaW9uADk1MttYhLwAAAAYdEVYdGV4aWY6UGl4ZWxZRGltZW5zaW9uADM4NWAKC/IAAAAASUVORK5CYII=)


#### 服务支持的插件

服务支持的插件向运行 Backstage 的组织权限范围内的服务发出 API 请求。

例如，Lighthouse 插件向 lighthouse-audit-service 发出请求。这是一个 lighthouse-audit-service 微服务，它运行 Google Lighthouse 库的副本并将结果存储在 PostgreSQL 数据库中。

![](https://backstage.io/assets/images/lighthouse-plugin-architecture-bc78e37450e4ffd6a9149f752e142ada.png)

#### 第三方支持的插件

第三方支持的插件类似于服务支持的插件。主要区别在于，支持插件的服务托管在托管 Backstage 的公司的生态系统之外。

CircleCI 插件是第三方支持的插件的一个例子。CircleCI 是一种 SaaS 服务，无需了解 Backstage 即可使用。它有一个 API，Backstage 插件使用该 API 来显示内容。

从用户浏览器进入 CircleCI 的请求通过 Backstage 提供的代理服务传递。否则，请求将被跨域资源共享策略阻止，该策略会阻止在 https://example.com 提供的浏览器页面提供在 https://circleci.com 托管的资源。

![](https://backstage.io/assets/images/circle-ci-plugin-architecture-637c8554269d35240f4458083cca146f.png)
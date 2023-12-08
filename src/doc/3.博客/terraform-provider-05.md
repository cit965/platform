---
title: 编写 terraform provider - 05
icon: circle-info
---

# 概述

Terraform Providers是Terraform生态系统的关键组成部分，用于连接和管理各种基础设施和云服务。如果你已经开发了自己的Terraform Provider，并且现在希望发布它供其他人使用，本文将为你提供一步步的指南。


## 步骤1：准备工作

在发布之前，确保你的Terraform Provider代码已经经过充分的测试，并且你已经解决了任何可能的bug。确保你的代码符合[HashiCorp的最佳实践](https://developer.hashicorp.com/terraform/tutorials/providers-plugin-framework/providers-plugin-framework-provider)

## 步骤2：创建GitHub仓库

将你的Terraform Provider代码推送到GitHub仓库。确保你的仓库中包含适当的文档，以便其他人能够理解如何使用你的Provider。

:::tip
重要提示：为了能够被 Terraform 注册表检测到，GitHub 上的所有提供程序存储库都必须匹配模式 terraform-provider-{NAME} ，并且存储库必须是公共的。仅支持小写存储库名称。
:::

## 步骤3：准备并添加签名密钥

所有提供商版本都需要签名，因此您必须向 HashiCorp 提供用于签署版本的 GPG 密钥对的公钥。 Terraform 注册表将在发布每个版本时验证该版本是否使用此密钥进行签名，并且 Terraform 将在 terraform init 期间验证这一点。

要准备并添加签名密钥：

1. 生成签名版本时使用的 GPG 密钥。此步骤请参考 GitHub 的[详细说明](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account)，但不需要将密钥添加到GitHub
2. 使用以下命令以 ASCII-armor 格式导出您的公钥。替换在上一步中创建的 GPG 密钥 ID。

```shell
gpg --armor --export "{Key ID or email address}"
```

3. 在 Terraform 注册表中，单击用户设置 > 签名密钥以添加 ASCII 公钥。您可以为您的个人命名空间或您作为管理员的任何组织添加密钥。


## 步骤4：创建Release

我们通过执行 github workflow 来自动发布我们的版本，只需要打tag来触发，需要注意的是，tag 要符合语义化版本号（Semantic Versioning），例如`v1.0.0`。我们需要再 secret 中填入私钥和密码

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2023-12-08%20%E4%B8%8B%E5%8D%883.38.03.png)

```yaml
# Terraform Provider release workflow.
name: Release

# This GitHub action creates a release when a tag that matches the pattern
# "v*" (e.g. v0.1.0) is created.
on:
  push:
    tags:
      - 'v*'

# Releases need permissions to read and write the repository contents.
# GitHub considers creating releases and uploading assets as writing contents.
permissions:
  contents: write

jobs:
  goreleaser:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
        with:
          # Allow goreleaser to access older tag information.
          fetch-depth: 0
      - uses: actions/setup-go@93397bea11091df50f3d7e59dc26a7711a8bcfbe # v4.1.0
        with:
          go-version-file: 'go.mod'
          cache: true
      - name: Import GPG key
        uses: crazy-max/ghaction-import-gpg@82a020f1f7f605c65dd2449b392a52c3fcfef7ef # v6.0.0
        id: import_gpg
        with:
          gpg_private_key: ${{ secrets.GPG_PRIVATE_KEY }}
          passphrase: ${{ secrets.PASSPHRASE }}
      - name: Run GoReleaser
        uses: goreleaser/goreleaser-action@7ec5c2b0c6cdda6e8bbb49444bc797dd33d74dd8 # v5.0.0
        with:
          args: release --clean
        env:
          # GitHub sets the GITHUB_TOKEN secret automatically.
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GPG_FINGERPRINT: ${{ steps.import_gpg.outputs.fingerprint }}
```

执行过工作流后，发布页面会出现编译好的各平台的二进制：

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2023-12-08%20%E4%B8%8B%E5%8D%883.35.24.png)

## 步骤5：在 terraform registry 中注册

terraform registry 会验证你的仓库是否名称符合 terraform-provider-xx , 会验证 release 页面有发布过制品，符合条件后会在你的github上创建一个 webhooks，当你发布更新后，会通知 terraform 同时更新

![](https://cdn.jsdelivr.net/gh/mouuii/picture/%E6%88%AA%E5%B1%8F2023-12-08%20%E4%B8%8B%E5%8D%883.40.56.png)



## 结语

通过遵循这些步骤，你成功地发布你的Terraform Provider，使其能够被更广泛地被全球所有开发者使用。不断维护和更新你的Provider，以确保它与最新的Terraform版本和基础设施服务保持兼容。发布Terraform Provider是贡献给社区的一种方式，也是分享你的技术成果的机会。关于本教程代码，你可以查看  https://github.com/mouuii/terraform-provider-cit/tree/course-05


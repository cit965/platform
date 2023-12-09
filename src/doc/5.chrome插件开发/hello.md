---
title: 插件开发
icon: circle-info
---

通过构建您的第一个 Hello World 扩展程序，了解 Chrome 扩展程序开发的基础知识。

##  概述

您将创建一个“Hello World”示例，在本地加载扩展，查找日志，并浏览其他建议。

##  世界您好

当用户单击扩展工具栏图标时，此扩展将显示“Hello Extensions”。

![Hello extension](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/hello-extension-6e3eacba176d3.png)

 Hello 扩展弹出窗口

首先创建一个新目录来存储扩展文件。如果您愿意，可以从 GitHub 下载完整的源代码。

接下来，在此目录中创建一个名为 `manifest.json` 的新文件。此 JSON 文件描述了扩展的功能和配置。例如，大多数清单文件都包含一个 `"action"` 键，用于声明 Chrome 应用作扩展程序操作图标的图片，以及单击扩展程序的操作图标时要在弹出窗口中显示的 HTML 页面。

```
{
  "manifest_version": 3,
  "name": "Hello Extensions",
  "description": "Base Level Extension",
  "version": "1.0",
  "action": {
    "default_popup": "hello.html",
    "default_icon": "hello_extensions.png"
  }
}
```

将图标下载到您的目录，并确保更改其名称以匹配 `"default_icon"` 密钥中的内容。

对于弹出窗口，创建一个名为 `hello.html` 的文件，并添加以下代码：

```
<html>
  <body>
    <h1>Hello Extensions</h1>
  </body>
</html>
```

现在，当单击扩展的操作图标（工具栏图标）时，扩展会显示一个弹出窗口。您可以通过在本地加载它在 Chrome 中对其进行测试。确保所有文件都已保存。

## 加载解压缩的扩展

要在开发人员模式下加载解压缩的扩展，请执行以下操作：

1.  通过输入 `chrome://extensions` 新选项卡转到“扩展”页面。 （根据设计 `chrome://` ，URL 不可链接。
    -   或者，单击“扩展”菜单拼图按钮，然后选择菜单底部的“管理扩展”。
    -   或者，点击 Chrome 菜单，将鼠标悬停在“更多工具”上，然后选择“扩展程序”。
2.  通过单击“开发人员模式”旁边的切换开关来启用开发人员模式。
3.  单击“加载解压”按钮，然后选择扩展目录。
    
    ![Extensions page](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/extensions-page-e0d64d89a6acf.png)
    
    “扩展”页 （chrome://extensions）
    

哒哒！扩展已成功安装。如果清单中未包含任何扩展图标，则将为扩展创建一个通用图标。

##  固定扩展

默认情况下，当您在本地加载扩展时，它将显示在扩展菜单中 !将扩展固定到工具栏，以便在开发过程中快速访问扩展。

![Pinning the extension](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/pinning-extension-215cb97773ab6.png)

 固定扩展

单击扩展程序的操作图标（工具栏图标）;您应该会看到一个弹出窗口。

![hello world extension](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/hello-world-extension-27a679d21340d.png)

 Hello World 扩展

##  重新加载扩展

返回到代码，在清单中将扩展的名称更改为“Hello Extensions of the world！

```
{
  "manifest_version": 3,
  "name": "Hello Extensions of the world!",
  ...
}
```

保存文件后，要在浏览器中查看此更改，您还必须刷新扩展名。转到“扩展”页面，然后单击“开/关”开关旁边的刷新图标：

![Reload an extension](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/reload-extension-241cc5378fffb.png)

### 何时重新加载扩展

下表显示了需要重新加载哪些组件才能看到更改：

|  扩展组件 | 需要重新加载扩展 |
| --- | --- |
|  The manifest  | Yes |
| Service worker  | Yes |
|  Content scripts  | 是（加上主机页面） |
|  The popup  | No |
| Options page | No |
| Other extension HTML pages | No |

## 查找控制台日志和错误

###  控制台日志

在开发过程中，您可以通过访问浏览器控制台日志来调试代码。在这种情况下，我们将找到弹出窗口的日志。首先向 添加脚本标签 `hello.html` 。

```
<html>
  <body>
    <h1>Hello Extensions</h1>
  </body>
</html>
```

创建一个 `popup.js` 文件并添加以下代码：

```
console.log("This is a popup!")
```

要查看控制台中记录的此消息，请执行以下操作：

1.   打开弹出窗口。
2.   右键单击弹出窗口。
3.   选择“检查”。
    
    ![Inspecting the popup.](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/inspecting-popup-359e35efc3afb.png)
    
     检查弹出窗口。
    
4.  在 DevTools 中，导航到“控制台”面板。
    
    ![DevTools Code Panel](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/devtools-code-panel-71b4e1577c834.png)
    
     检查弹出窗口
    

###  错误日志

现在让我们打破扩展。我们可以通过删除以下中的 `popup.js` 结束引号来做到这一点：

```
console.log("This is a popup!) // ❌ broken code
```

转到“扩展”页面并打开弹出窗口。将出现一个“错误”按钮。

![Extensions page with error button](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/extensions-page-error-bu-5c0c2b74fc8ee.png)

单击“错误”按钮以了解有关错误的详细信息：

![Extension error details](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/extension-error-details-7784a142a2649.png)

若要了解有关调试 Service Worker、选项页和内容脚本的详细信息，请参阅调试扩展。

## 构建扩展项目

有很多方法可以构建扩展项目;但是，唯一的先决条件是将 manifest.json 文件放在扩展的根目录中，如以下示例所示：

![The contents of an extension folder: manifest.json, background.js, scripts folder, popup folder, and images folder.](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/the-contents-an-extensio-fc9e4690df76c.png)

##  使用 TypeScript

如果您使用 VSCode 或 Atom 等代码编辑器进行开发，则可以使用 npm 包 chrome-types 来利用 Chrome API 的自动完成功能。当 Chromium 源代码更改时，此 npm 包会自动更新。

## 🚀 准备好开始构建了吗？

选择以下任一教程，开始扩展学习之旅。
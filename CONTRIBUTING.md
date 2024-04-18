# Contributing 贡献指南

## Tech Stack 项目技术栈

- `pnpm` 包管理工具
- `tsup` 打包插件
- `solidjs` 开发插件UI
- `typescript` 作为开发语言
- `vite` 脚手架工具
- `eslint` 格式化代码
- `...`

## Extension commands 插件命令

- `dev:client` 启动开发服务器（针对client项目）
- `build:client` 为生产环境构建产物（针对client项目）
- `preview:client` 本地预览生产构建产物（针对client项目）
- `build:dev` 构建开发环境
- `publish` 插件发布上线
- `pack` 插件项目打包
- `build` 打包输出文件
- `build:ts` 打包`src`文件
- `lint` 使用eslint对代码进行审查
- `lint:fix` 使用eslint格式化
- `lint:ui` 可视化查看eslint规则
- `release` 发布新版本
- `up` 更新项目依赖

## 目录分析

- `client` webview ui界面
- `src` 插件开发逻辑代码
- `resource` 插件静态资源
- `screenshots` 插件项目的一些截图

## Extension development cycle 插件开发周期

这个基于solidjs的webview扩展的预期开发周期与其他VS Code扩展略有不同。

由于`client`目录包含一个独立的SolidJS应用程序，我们可以利用它带来的一些好处。特别是,
使用Vite, UI开发和迭代周期可以更快地进行
-依赖性管理和项目配置大大简化

### UI development cycle UI开发周期

因为我们可以利用更快的Vite开发服务器，所以我们鼓励通过运行`pnpm dev:client`命令开始开发webview UI，然后在`client`目录下编辑代码。

_Tip:打开命令面板，运行“Simple Browser”命令，并在提示时填写`http://localhost:3000/`。这将在VS Code._中打开一个简单的浏览器环境

### Message passing 消息传递

如果你需要通过VS Code API实现webview上下文和扩展上下文之间的消息传递，`client/utilities/vscode`中提供了一个有用的实用工具。ts文件。

该文件包含一个围绕`acquireVsCodeApi()`函数的实用程序包装器，该函数支持在webview和扩展上下文之间传递消息和状态管理。

该实用程序还允许webview代码在Vite开发服务器中运行，方法是使用模拟acquireVsCodeApi启用的功能的本地web浏览器特性。这意味着即使使用VS Code API，你也可以继续使用Vite开发服务器构建你的webview UI。

### Move to traditional extension development 转向传统的扩展开发

一旦你准备好开始构建扩展的其他部分，只需切换到一个开发模型，在你做更改时运行`pnpm build`命令，按`F5`编译你的扩展并打开一个新的扩展开发主机窗口。在主机窗口中，打开命令面板(Mac上为“Ctrl+Shift+P”或“Cmd+Shift+P”)并键入“Hello World (SolidJS): Show”。

### Dependency management and project configuration 依赖管理和项目配置

如上所述，`client`目录包含一个独立的SolidJS应用程序，这意味着你可以(在大多数情况下)以与开发常规SolidJS应用程序相同的方式来开发你的webview UI。

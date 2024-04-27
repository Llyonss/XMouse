import * as vscode from 'vscode'
import { getUri } from '../../utilities/getUri'
import { updateImport } from '../../utilities/astTool'
import CustomService from './Service/CustomService'
import DirectoryService from './Service/DirectoryService'
import PackageService from './Service/PackageService'

interface Lego { id: string, name: string, code: string, source: string, group: string }
export class LegoListPanel implements vscode.WebviewViewProvider {
  public vscodeContext
  public xmFiles: any
  public webviewView: vscode.WebviewView | undefined
  private draging: any
  private data: Lego[]
  private customService = new CustomService()
  private directoryService = new DirectoryService()
  private packageService = new PackageService()
  constructor(context: vscode.ExtensionContext, xmFiles: any) {
    this.vscodeContext = context
    this.xmFiles = xmFiles
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(
      'xmouse.lego.list',
      this,
      { webviewOptions: { retainContextWhenHidden: true } },
    ))
    this.registeCommand(context)
  }

  private registeCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.add', () => {
      this.webviewView?.webview.postMessage({ command: 'lego.list.add' })
    }))
    context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.multi-delete', () => {
      this.webviewView?.webview.postMessage({ command: 'lego.list.multi-delete' })
    }))
    context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.import', () => {
      this.webviewView?.webview.postMessage({ command: 'command.lego.list.import' })
    }))
    context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.export', () => {
      this.webviewView?.webview.postMessage({ command: 'lego.list.export' })
    }))
    context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.save', () => {
      this.xmFiles.saveWorkspaceConf(this.data)
    }))
    this.xmFiles.readWorkspaceConf().then((res: any) => {
      const [err, data] = this.customService.importLego({ data: res })
      this.webviewView?.webview.postMessage({ command: 'lego.list.fresh', data })
    })

    // 注册到监听队列中
    context.subscriptions.push(vscode.commands.registerCommand(
      'xmouse.lego.add',
      (uri: vscode.Uri) => {
        const editor = vscode.window.activeTextEditor
        if (!editor)
          return
        const text = editor.document.getText(editor.selection)
        const [err, data] = this.customService.addLego({
          data: {
            name: `未命名${(new Date()).getTime()}`,
            group: '快捷添加',
            code: text,
          },
        })
        this.webviewView?.webview.postMessage({ command: 'lego.list.fresh', data })
      },
    ))
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
      // 时序问题和代码位置问题，入队列
      const component = this.draging
      const depends = (() => {
        if (!component?.source)
          return []

        if ((Array.isArray(component?.source))) {
          return component?.source.map((item: any) => ({
            import: item.import,
            from: item.from,
          }))
        }
        if (component?.source?.import && component?.source?.from)
          return [component?.source]

        return []
      })()
      if (!depends.length)
        return

      const activeTextEditor = vscode.window.activeTextEditor
      if (!activeTextEditor)
        return

      const text = event.contentChanges?.[0].text || ''
      if (text.replaceAll(/[\s\n\t]*/g, '') === component.code.replaceAll(/[\s\n\t]*/g, '')) {
        depends.forEach(async (source: any, index: number) => {
          const dependsCodes = await updateImport(activeTextEditor.document, depends)
          dependsCodes?.forEach((item) => {
            setTimeout(async () => {
              activeTextEditor?.edit((editBuilder) => {
                if (item.loc) {
                  const range = new vscode.Range(
                    new vscode.Position(item.loc.start.line - 1, item.loc.start.column),
                    new vscode.Position(item.loc.end.line - 1, item.loc.end.column),
                  )
                  editBuilder.replace(range, item.code)
                }
                else {
                  editBuilder.replace(new vscode.Position(0, 0), `${item.code}\n`)
                }
              })
            }, 50 * index)
          })
        })
      }
    }))
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    webviewView.webview.options = { enableScripts: true }
    webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.vscodeContext.extensionUri)
    webviewView.webview.onDidReceiveMessage((message) => {
      const responce = (err, data) => {
        webviewView.webview.postMessage({
          id: message.id,
          body: { data, code: err, msg: 'ok' },
        })
      }
      const apis = {
        // // PakcageApi:
        'lego.list.packages': () => this.packageService.getPackages(message),
        'lego.list.exports': () => this.packageService.getExports(message),
        // DirectoryApi
        'lego.list.workspace': () => this.directoryService.getWorkspace(message),
        'lego.list.directory': () => this.directoryService.getDirectory(message),
        'lego.list.file': () => this.directoryService.getFile(message),
        // CustomApi
        'lego.list.get': () => this.customService.getLego(message),
        'lego.list.add': () => this.customService.addLego(message),
        'lego.list.update': () => this.customService.updateLego(message),
        'lego.list.delete': () => this.customService.deleteLego(message),
        'lego.list.deleteMulti': () => this.customService.deleteMultiLego(message),
        'lego.list.import': () => this.customService.importLego(message),
      }

      if (apis[message.command]) {
        Promise.resolve(apis[message.command]())?.then(([err, res]) => {
          responce(err, res)
        })
      }

      if (message.command === 'lego.list.drag.start')
        this.draging = message.data

      if (message.command === 'lego.list.drag.end') {
        // todo: 时序问题
        setTimeout(() => {
          this.draging = null
        }, 16)
      }
    }, undefined, this.vscodeContext.subscriptions)
    this.webviewView = webviewView
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const stylesUri = getUri(webview, extensionUri, ['out', 'client', 'assets', 'index.css'])
    // The JS file from the SolidJS build output
    const scriptUri = getUri(webview, extensionUri, ['out', 'client', 'assets', 'index.js'])
    const fontUri = getUri(webview, extensionUri, ['out', 'client', 'assets', 'cui.ttf'])
    const assetsUrl = getUri(webview, extensionUri, ['out', 'client', 'assets'])
    return /* html */ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <title>Hello World</title>
                <style>
                    @font-face {
                        font-family: 'cui';
                        src: url('${fontUri}');
                    }
                    @font-face {
                        font-family: 'FontAwesome';
                        src: url('${assetsUrl}/fontawesome-webfont.eot?v=4.7.0');
                        src: url('${assetsUrl}/fontawesome-webfont.eot?#iefix&v=4.7.0') format('embedded-opentype'),
                            url('${assetsUrl}/fontawesome-webfont.woff2?v=4.7.0') format('woff2'),
                            url('${assetsUrl}/fontawesome-webfont.woff?v=4.7.0') format('woff'),
                            url('${assetsUrl}/fontawesome-webfont.ttf?v=4.7.0') format('truetype'),
                            url('${assetsUrl}/fontawesome-webfont.svg?v=4.7.0#fontawesomeregular') format('svg');
                        font-weight: normal;
                        font-style: normal;
                      }
                </style>
            </head>
            <body>
                <div id="LegoList"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>
        `
  }
}

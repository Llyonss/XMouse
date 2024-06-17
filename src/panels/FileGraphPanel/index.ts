import * as vscode from 'vscode'
import { getUri } from '../../utilities/getUri'
import { updateImport } from '../../utilities/astTool'
import DirectoryService from '../../Service/DirectoryService'
import PackageService from '../../Service/PackageService'

class BaseProvider implements vscode.WebviewViewProvider {
  public vscodeContext
  public xmFiles: any
  public webviewView: vscode.WebviewView | undefined

  public apis: any
  constructor(context: vscode.ExtensionContext, xmFiles: any) {
    this.vscodeContext = context
    this.xmFiles = xmFiles
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(
      'xmouse.view.filegraph',
      this,
      { webviewOptions: { retainContextWhenHidden: true } },
    ))

    this.registeCommand(context)
  }

  private registeCommand(context: vscode.ExtensionContext) {

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

      if (this.apis[message.command]) {
        Promise.resolve(this.apis[message.command](message))?.then(([err, res]) => {
          responce(err, res)
        })
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
                <div id="FileGraph"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>
        `
  }
}

export default class FileGraphPanel extends BaseProvider {
  private directoryService = new DirectoryService()
  private packageService = new PackageService()
  constructor(context: vscode.ExtensionContext, xmFiles: any) {
    super(context, xmFiles)
    this.apis = {
      'lego.relations': async (message) => {
        const packages = await this.xmFiles.solvePackageJson()
        const files = await this.xmFiles.solveFiles(packages)
        const relations = this.xmFiles.solveRelation(files)
        return [0, relations]
      },

      'lego.fileTree': async (message) => {
        const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath
        const result = await this.directoryService.getFileGraph({ directory: workspace, workspace })
        const packages = await this.xmFiles.solvePackageJson()
        const files = await this.xmFiles.solveFiles(packages)
        result.relations = this.xmFiles.solveRelation(files).line
        console.log('ssss', result)
        return [0, result]
      },

      'lego.changeEditor': async (message) => {
        console.log('click', message.data.id)

        const openPath = vscode.Uri.file(message.data.id)
        vscode.workspace.openTextDocument(openPath).then((doc) => {
          vscode.window.showTextDocument(doc)
        })

        return [0, 'ok']
      },
      // CustomApi
    }

    // 获取当前activeWindow

    // 当activeWindow切换时
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      // 判断当前是否为activeWindow
      // 执行你的逻辑
      console.log('当前窗口已激活', editor?.document.fileName)
      // 获取当前文件名
      const fileName = editor?.document.uri.fsPath
      this.webviewView?.webview.postMessage({
        command: 'lego.current',
        data: fileName,
      })
    })
  }
}

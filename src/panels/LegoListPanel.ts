import * as vscode from 'vscode';
import * as path from 'path'
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class LegoListPanel implements vscode.WebviewViewProvider {
    public vscodeContext;
    public components: any;
    public webviewView: vscode.WebviewView | undefined;
    public onDragStart = (component: any) => { };
    public onDragEnd = (component: any) => { };
    constructor(context: vscode.ExtensionContext, components: any) {
        this.vscodeContext = context;
        this.components = components;
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('xmouse.lego.list', this)
        );
    }
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.vscodeContext.extensionUri)

        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'lego.list.init') {
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data: this.components })
            }
            if (message.command === 'lego.list.dragEnd') {
                const component = this.components[message.data.id]
                if (!component) { return; }
                // 获取当前光标位置
                const position = vscode.window.activeTextEditor?.selection.active;
                if (!position) return;
                // 插入引入代码
                const fileName = component.path.split('\\').reverse().find((name: any) => !['index', 'src'].includes(name.split('.')[0])).split('.')[0]
                const componentName = message.data.item === "default" ? fileName : message.data.item;
                const componentString = `<${componentName}></${componentName}>`;
                console.log('测测', vscode.window.activeTextEditor?.document.uri.fsPath, component.path,)
                const repath = path.normalize(path.relative(vscode.window.activeTextEditor?.document.uri.fsPath || '', component.path,)).replace(/\\/g, "/").replace('../', '')
                const importDefaultString = `import ${componentName} from '${repath}'`;
                const importSingleString = `import {${componentName}} from '${repath}'`;

                const hasImport = vscode.window.activeTextEditor?.document.getText().includes(importDefaultString);
                vscode.window.activeTextEditor?.edit(editBuilder => {
                    editBuilder.replace(position, componentString);
                    if (!hasImport) {
                        editBuilder.replace(new vscode.Position(0, 0), `${importDefaultString}\n`);
                    }
                });
            }
        }, undefined, this.vscodeContext.subscriptions);
        this.webviewView = webviewView;
    }
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        // The JS file from the SolidJS build output
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);
        const nonce = getNonce();

        return  /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <title>Hello World</title>
            </head>
            <body>
                <div id="LegoList"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}
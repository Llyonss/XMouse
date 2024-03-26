import * as vscode from 'vscode';
import * as path from 'path'
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import Storage from '../storage';

type Lego = { id: string, name: string, code: string, source: string, group: string };
export class LegoListPanel implements vscode.WebviewViewProvider {
    public vscodeContext;
    public components: any;
    public webviewView: vscode.WebviewView | undefined;
    private draging: any;
    private storage: Storage;
    private data: Lego[];
    public onDragStart = (component: any) => { };
    public onDragEnd = (component: any) => { };
    constructor(context: vscode.ExtensionContext, components: any) {
        this.vscodeContext = context;
        this.components = components;

        this.storage = new Storage(context);
        this.data = this.storage.get('LegoList') as Lego[] || []
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                'xmouse.lego.list',
                this,
                { webviewOptions: { retainContextWhenHidden: true } }
            )
        );
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.add', () => {
            console.log(`Hello !!!`);
            this.webviewView?.webview.postMessage({ command: 'lego.list.add', data: this.components })
        }));

        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
            //时序问题和代码位置问题，入队列
            const component = this.draging;
            const useImport = component?.source?.import && component?.source?.from;
            if (!useImport) { return; }

            const text = event.contentChanges?.[0].text;
            if (text === component.code) {
                const importDefaultString = `import ${component.source.import} from '${component.source.from}'`;
                const hasImport = vscode.window.activeTextEditor?.document.getText().includes(importDefaultString);
                vscode.window.activeTextEditor?.edit(editBuilder => {
                    if (!hasImport) {
                        editBuilder.replace(new vscode.Position(0, 0), `${importDefaultString}\n`);
                    }
                });
            }
        }));
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
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data: this.data })
            }
            if (message.command === 'lego.list.update') {
                console.log('message.data', message.data)
                const index = this.data.findIndex(({ id }) => id === message.data.id);
                const isAdd = index === -1
                if (isAdd) {
                    this.data.push(message.data);
                    this.storage.set('LegoList', this.data)
                    webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data: this.data })
                    return;
                }
                const isDelete = ['', null, undefined].includes(message.data.name)
                if (isDelete) {
                    console.log('删除')
                    this.data.splice(index, 1)
                    this.storage.set('LegoList', this.data)
                    webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data: this.data })
                    return;
                }

                const isUpdate = true;
                if (isUpdate) {
                    console.log('更新')
                    this.data[index] = message.data;
                    this.storage.set('LegoList', this.data);
                    webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data: this.data })
                    return;
                }
            }
            if (message.command === 'lego.list.drag.start') {
                this.draging = message.data;
                console.log('setDraging', this.draging)
            }
            if (message.command === 'lego.list.drag.end') {
                // todo: 时序问题
                setTimeout(() => {
                    this.draging = null
                    console.log('setDraging', null)
                }, 16)

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
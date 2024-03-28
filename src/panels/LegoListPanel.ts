import * as vscode from 'vscode';
import * as path from 'path';
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import Storage from '../storage';
import NpmData from './LegoList.data'

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
        this.data = this.storage.get('LegoList') as Lego[] || [];
        console.log('测试', this.storage.get('LegoList'));
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                'xmouse.lego.list',
                this,
                { webviewOptions: { retainContextWhenHidden: true } }
            )
        );
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.add', () => {
            this.webviewView?.webview.postMessage({ command: 'lego.list.add' });
        }));
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.multi-delete', () => {
            this.webviewView?.webview.postMessage({ command: 'lego.list.multi-delete' });
        }));
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.import', () => {
            this.webviewView?.webview.postMessage({ command: 'lego.list.import' });
        }));
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.export', () => {
            this.webviewView?.webview.postMessage({ command: 'lego.list.export', data: JSON.stringify(this.storage.get('LegoList')) });
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
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.vscodeContext.extensionUri);

        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'lego.list.init') {
                const data = [...NpmData, ...this.data] as Lego[];;
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data });
            }
            if (message.command === 'lego.list.add') {
                console.log('添加', message);
                this.data.push(message.data);
                this.storage.set('LegoList', this.data);
                const data = [...NpmData, ...this.data] as Lego[];;
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data });
            }
            if (message.command === 'lego.list.update') {
                console.log('更新', message);
                const index = this.data.findIndex(({ group, name }) => group === message.data.old.group && name === message.data.old.name);
                if (index === -1) {
                    return;
                }
                this.data[index] = message.data.new;
                this.storage.set('LegoList', this.data);
                const data = [...NpmData, ...this.data] as Lego[];;
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data });
                return;
            }
            if (message.command === 'lego.list.delete') {
                console.log('删除', message);
                const index = this.data.findIndex(({ group, name }) => group === message.data.group && name === message.data.name);
                if (index === -1) {
                    return;
                }
                this.data.splice(index, 1);
                this.storage.set('LegoList', this.data);
                const data = [...NpmData, ...this.data] as Lego[];;
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data });
                return;
            }
            if (message.command === 'lego.list.updateList') {
                console.log('message.dataList', message.data);
                message.data?.forEach((item: any) => {
                    const index = this.data.findIndex(({ name, group }) => name === item.name && group === item.group);
                    const isAdd = index === -1;
                    if (isAdd) {
                        console.log('list加', item)
                        this.data.push(item);
                        this.storage.set('LegoList', this.data);
                        return;
                    }
                    const isUpdate = true;
                    if (isUpdate) {
                        console.log('list更', item)
                        this.data[index] = item;
                        this.storage.set('LegoList', this.data);
                        return;
                    }
                })
                const data = [...NpmData, ...this.data] as Lego[];;
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data });
            }
            if (message.command === 'lego.list.deleteList') {
                console.log('list删除', message.data)
                message.data?.forEach((item: any) => {
                    const index = this.data.findIndex(({ group, name }) => group === item.group && name === item.name);
                    if (index === -1) {
                        return;
                    }
                    this.data.splice(index, 1);
                })
                this.storage.set('LegoList', this.data);
                const data = [...NpmData, ...this.data] as Lego[];;
                webviewView.webview.postMessage({ command: 'lego.list.updateLegos', data });
            }
            if (message.command === 'lego.list.drag.start') {
                this.draging = message.data;
                console.log('setDraging', this.draging);
            }
            if (message.command === 'lego.list.drag.end') {
                // todo: 时序问题
                setTimeout(() => {
                    this.draging = null;
                    console.log('setDraging', null);
                }, 16);

            }
            // if (message.command === 'lego.list.dragEnd') {
            //     const component = this.components[message.data.id];
            //     if (!component) { return; }
            //     // 获取当前光标位置
            //     const position = vscode.window.activeTextEditor?.selection.active;
            //     if (!position) return;
            //     // 插入引入代码
            //     const fileName = component.path.split('\\').reverse().find((name: any) => !['index', 'src'].includes(name.split('.')[0])).split('.')[0];
            //     const componentName = message.data.item === "default" ? fileName : message.data.item;
            //     const componentString = `<${componentName}></${componentName}>`;
            //     console.log('测测', vscode.window.activeTextEditor?.document.uri.fsPath, component.path,);
            //     const repath = path.normalize(path.relative(vscode.window.activeTextEditor?.document.uri.fsPath || '', component.path,)).replace(/\\/g, "/").replace('../', '');
            //     const importDefaultString = `import ${componentName} from '${repath}'`;
            //     const importSingleString = `import {${componentName}} from '${repath}'`;

            //     const hasImport = vscode.window.activeTextEditor?.document.getText().includes(importDefaultString);
            //     vscode.window.activeTextEditor?.edit(editBuilder => {
            //         editBuilder.replace(position, componentString);
            //         if (!hasImport) {
            //             editBuilder.replace(new vscode.Position(0, 0), `${importDefaultString}\n`);
            //         }
            //     });
            // }
        }, undefined, this.vscodeContext.subscriptions);
        this.webviewView = webviewView;
    }
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        // The JS file from the SolidJS build output
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);
        const fontUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "cui.ttf"]);
        return  /*html*/ `
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
                </style>
            </head>
            <body>
                <div id="LegoList"></div>
                <script type="module" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}
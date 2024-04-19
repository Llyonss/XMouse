import * as vscode from 'vscode';
import * as path from 'path';
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import Storage from '../storage';
import NpmData from './LegoList.data'
import { updateImport } from '../utilities/astTool'
type Lego = { id: string, name: string, code: string, source: string, group: string };
export class LegoListPanel implements vscode.WebviewViewProvider {
    public vscodeContext;
    public xmFiles: any;
    public webviewView: vscode.WebviewView | undefined;
    private draging: any;
    private storage: Storage;
    private data: Lego[];
    private dependencieCache: any = {};
    public onDragStart = (component: any) => { };
    public onDragEnd = (component: any) => { };
    constructor(context: vscode.ExtensionContext, xmFiles: any) {
        this.vscodeContext = context;
        this.xmFiles = xmFiles;

        this.storage = new Storage(context);
        this.data = this.storage.get('LegoList') as Lego[] || [];
        xmFiles.readWorkspaceConf().then((res: any) => {
            const map: any = {};
            res.forEach((item: Lego) => {
                map[String(item.group) + String(item.name)] = item;
            })
            this.data.forEach((item: Lego) => {
                map[String(item.group) + String(item.name)] = item;
            })
            this.data = Object.values(map);
            this.webviewView?.webview.postMessage({ command: 'lego.list.updateLegos', data: this.data });
        })

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
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.lego.list.save', () => {
            this.xmFiles.saveWorkspaceConf(this.data);
        }));

        // 注册到监听队列中
        context.subscriptions.push(vscode.commands.registerCommand(
            'xmouse.lego.add',
            (uri: vscode.Uri) => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;

                const text = editor.document.getText(editor.selection);
                this.data.push({
                    name: '未命名' + (new Date()).getTime(),
                    group: '快捷添加',
                    code: text,
                } as Lego);
                this.storage.set('LegoList', this.data);
                const data = [...NpmData, ...this.data] as Lego[];;
                this.webviewView?.webview.postMessage({ command: 'lego.list.updateLegos', data });
            }
        ))
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {

            //时序问题和代码位置问题，入队列
            const component = this.draging;
            const depends = (() => {
                if (!component?.source) {
                    return []
                }
                if ((component?.source instanceof Array)) {
                    return component?.source.map((item: any) => ({
                        import: item.import,
                        from: item.from
                    }));
                }
                if (component?.source?.import && component?.source?.from) {
                    return [component?.source]
                }
                return []
            })()
            if (!depends.length) {
                return;
            }

            const activeTextEditor = vscode.window.activeTextEditor;
            if (!activeTextEditor) {
                return;
            }

            const text = event.contentChanges?.[0].text || '';
            if (text.replaceAll(/[\s\n\t]*/g, '') === component.code.replaceAll(/[\s\n\t]*/g, '')) {
                depends.forEach(async (source: any, index: number) => {
                    const dependsCodes = await updateImport(activeTextEditor.document, depends);
                    dependsCodes?.forEach((item) => {
                        setTimeout(async () => {
                            activeTextEditor?.edit(editBuilder => {
                                console.log(item)
                                if (item.loc) {
                                    const range = new vscode.Range(
                                        new vscode.Position(item.loc.start.line - 1, item.loc.start.column),
                                        new vscode.Position(item.loc.end.line - 1, item.loc.end.column)
                                    );
                                    editBuilder.replace(range, item.code);
                                } else {
                                    editBuilder.replace(new vscode.Position(0, 0), `${item.code}\n`);
                                }

                            });
                        }, 50 * index);

                    })

                })
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
            if (message.command === 'lego.list.direction') {
                this.xmFiles.solveDirection().then((res: any) => {
                    console.log('res', res);
                    this.webviewView?.webview.postMessage({ command: 'lego.list.direction', data: res });
                })
            }
            if (message.command === 'lego.list.packages') {
                this.xmFiles.solvePackage().then((res: any) => {
                    this.webviewView?.webview.postMessage({ command: 'lego.list.packages', data: res });
                    console.log('paaaaa', res)
                })
            }

            if (message.command === 'lego.list.packages.dependencie') {
                if (this.dependencieCache[message.data.dependencie]) {
                    console.log('缓存', this.dependencieCache)
                    this.webviewView?.webview.postMessage({
                        id: message.id, body: {
                            data: this.dependencieCache[message.data.dependencie],
                            code: 0,
                            msg: 'ok'
                        }
                    })
                } else {
                    console.log('请求', this.dependencieCache)
                    this.xmFiles.solveDependencie(message.data.dependencie, message.data.root).then((res: any) => {
                        this.dependencieCache[message.data.dependencie] = res.children;
                        this.webviewView?.webview.postMessage({
                            id: message.id, body: {
                                data: res.children,
                                code: 0,
                                msg: 'ok'
                            }
                        })
                    })
                }

            }
            if (message.command === 'lego.list.direction.update') {
                const directory: any[] = []
                this.xmFiles.walk(message.data.path, directory, true).then(() => {
                    console.log('resss', directory);
                    this.webviewView?.webview.postMessage({
                        id: message.id, body: {
                            data: directory,
                            code: 0,
                            msg: 'ok'
                        }
                    });
                })
            }
            if (message.command === 'lego.list.file.open') {
                message.data
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
        }, undefined, this.vscodeContext.subscriptions);
        this.webviewView = webviewView;
    }
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const stylesUri = getUri(webview, extensionUri, ["out", "client", "assets", "index.css"]);
        // The JS file from the SolidJS build output
        const scriptUri = getUri(webview, extensionUri, ["out", "client", "assets","index.js"]);
        const fontUri = getUri(webview, extensionUri, ["out", "client", "assets","cui.ttf"]);
        const assetsUrl = getUri(webview, extensionUri, ["out", "client", "assets"]);
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
        `;
    }
}

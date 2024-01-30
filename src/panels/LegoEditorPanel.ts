import * as vscode from 'vscode';
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";


export class LegoEditorPanel implements vscode.WebviewViewProvider {
    public static readonly viewType = 'xmouse.component';
    public vscodeContext;
    public component: XMComponent | undefined;
    public position: vscode.Position | undefined;
    private webviewView: vscode.WebviewView | undefined;
    constructor(context: vscode.ExtensionContext, components: XMComponents) {
        this.vscodeContext = context;
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('xmouse.lego.editor', this)
        );
        // vscode.window.onDidChangeTextEditorSelection((event) => {
        //     const editor = vscode.window.activeTextEditor;
        //     if (!editor) { return; }
        //     const doc = editor.document.getText();
        //     const position = event.selections[0].start;
        //     const path = parser.findJSXElement(doc, position);
        //     if (!path) {
        //         this.component = undefined;
        //         this.position = undefined;
        //         const message = { command: 'setActiveComponent', undefined };
        //         this.webviewView?.webview.postMessage(message);
        //     }
        //     // @ts-ignore
        //     const component = components.find(item => item.name === path?.node.openingElement.name.name);
        //     if (!component) { return; }

        //     const attrs = Object.fromEntries<any>(
        //         // @ts-ignore
        //         path?.node.openingElement.attributes.map(item => {
        //             // @ts-ignore
        //             return [item.name.name, item.value.value];
        //         })
        //     );
        //     component.props?.forEach(item => {
        //         // @ts-ignore
        //         item.value = attrs[item.name];
        //     });
        //     this.component = component;
        //     this.position = position;
        //     const message = { command: 'setActiveComponent', component };
        //     this.webviewView?.webview.postMessage(message);
        // });
        // vscode.workspace.onDidChangeTextDocument((event) => {
        //   console.log(event)
        //   if (this.component) {
        //     this.component = undefined;
        //     // const message = { command: 'setActiveComponent', component: undefined };
        //     // this.webviewView?.webview.postMessage(message);
        //   }
        // })
    }
    // resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
    //     throw new Error('Method not implemented.');
    // }
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this.webviewView = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.vscodeContext.extensionUri);
        webviewView.webview.onDidReceiveMessage(message => {
            // 处理从Webview传递过来的消息
            // if (message.command === 'propChange') {
            //     this.onPropChange(message.name || "", message.value || "");
            // }
        }, undefined, this.vscodeContext.subscriptions);
        const message = { command: 'test', data: '草草草草' };
        this.webviewView?.webview.postMessage(message);
    }
    // onPropChange(name: string, value: string) {
    //     const editor = vscode.window.activeTextEditor;
    //     if (!editor) { return; }
    //     const doc = editor.document.getText();
    //     if (!this.component?.name || !this.position) return;
    //     const path = parser.findCompPath(doc, this.component?.name, this.position);
    //     if (!path?.node.loc) return;
    //     const range = new vscode.Range(
    //         new vscode.Position(path.node.loc.start.line - 1, path.node.loc.start.column),
    //         new vscode.Position(path.node.loc.end.line - 1, path.node.loc.end.column)
    //     );
    //     const code = parser.setAttr(path, name, value);
    //     editor?.edit((editBuilder: vscode.TextEditorEdit) => {
    //         editBuilder.replace(range, code);
    //     });
    // }
    // setComponent(component: XMComponent, position: vscode.Position) {
    //     this.component = component;

    //     this.position = position;
    //     // todo: 初始化时生成prop, 并在后续也更新prop
    //     const editor = vscode.window.activeTextEditor;
    //     if (!editor) { return; }
    //     const doc = editor.document.getText();
    //     if (!this.component?.name || !this.position) return;

    //     const path = parser.findCompPath(doc, this.component?.name, this.position);

    //     const attrs = Object.fromEntries<any>(
    //         // @ts-ignore
    //         path?.node.openingElement.attributes.map(item => {
    //             // @ts-ignore
    //             return [item.name.name, item.value.value];
    //         })
    //     );

    //     component.props?.forEach(item => {
    //         // @ts-ignore
    //         item.value = attrs[item.name];
    //     });
    //     const message = { command: 'setActiveComponent', component };

    //     this.webviewView?.webview.postMessage(message);
    // }
    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        // 返回完整的HTML内容
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
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <title>Hello World</title>
            </head>
            <body>
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}
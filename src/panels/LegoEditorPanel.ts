import * as vscode from 'vscode';
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { findJSXElement, findCompPath, setJSXAttr } from "../utilities/astTool"

export class LegoEditorPanel implements vscode.WebviewViewProvider {
    public static readonly viewType = 'xmouse.component';
    public vscodeContext;
    public component: any | undefined;
    public position: vscode.Position | undefined;
    public activeLego: any;
    private webviewView: vscode.WebviewView | undefined;
    constructor(context: vscode.ExtensionContext, components: any) {
        this.vscodeContext = context;
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('xmouse.lego.editor', this)
        );
        vscode.window.onDidChangeTextEditorSelection((event) => {
            const position = event.selections[0].start;
            this.setAttr2Editor(position)
        });
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.activeLego) {
                this.setAttr2Editor(this.activeLego.position)
            }
        })
    }
    setAttr2Editor(position: any) {
        const editor = vscode.window.activeTextEditor; if (!editor) { return; }
        const doc = editor.document.getText();
        const jsxElement = findJSXElement(doc, position); if (!jsxElement) { return; }
        this.activeLego = { name: jsxElement.name, attr: jsxElement.attr, position };
        this.webviewView?.webview.postMessage({ command: 'lego.editor.updateLego', data: this.activeLego });
    }
    setAttr2Code(activeLego: any, name: string, value: string) {
        if (!activeLego) { return; }
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const doc = editor.document.getText();
        const path = findCompPath(doc, activeLego.name, activeLego.position);
        if (!path?.node.loc) { return; }

        const range = new vscode.Range(
            new vscode.Position(path.node.loc.start.line - 1, path.node.loc.start.column),
            new vscode.Position(path.node.loc.end.line - 1, path.node.loc.end.column)
        );
        const code = setJSXAttr(path, name, value);
        editor?.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(range, code);
        });
    }
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
            if (message.command === 'lego.editor.propChange') {
                console.log('mmmm', message)
                this.setAttr2Code(this.activeLego, message.data.name || "", message.data.value || "");
            }
        }, undefined, this.vscodeContext.subscriptions);
    }
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
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <title>Hello World</title>
            </head>
            <body>
                <div id="LegoEditor"></div>
                <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}
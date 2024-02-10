import * as vscode from 'vscode';
import * as path from 'path'
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class FileRelationPanel implements vscode.WebviewViewProvider {
    public vscodeContext;
    public relations: any;
    public webviewView: vscode.WebviewView | undefined;
    constructor(context: vscode.ExtensionContext, relations: any) {
        this.vscodeContext = context;
        this.relations = relations;
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('xmouse.file.relation', this)
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
        this.webviewView = webviewView;

        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this.vscodeContext.extensionUri)
        webviewView.webview.postMessage({ command: 'relation.draw', data: this.relations })
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'relation.init') {
                webviewView.webview.postMessage({ command: 'relation.draw', data: this.relations })
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
                <div id="FileRelation"></div>
                <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

}
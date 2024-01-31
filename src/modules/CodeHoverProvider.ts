import * as vscode from 'vscode';
import { findJSXElement } from '../utilities/astTool'
export type XMHoverInfo = {
    name: string,
    position: vscode.Position
}
export class LegoHoverProvider implements vscode.HoverProvider {
    onClick = (hover: XMHoverInfo) => { };
    onHover = (hover: any) => { };
    public hoverInfo: XMHoverInfo | undefined;
    public hoverString: string = '';

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                ['javascriptreact', 'typescriptreact', 'javascript', 'typescript'], // 替换为实际的语言标识符
                this
            )
        );
        context.subscriptions.push(vscode.commands.registerCommand('xmouse.openComponents', () => {
            if (!this.hoverInfo) return;
            this.onClick(this.hoverInfo);
        }));
        vscode.window.onDidChangeTextEditorSelection((event) => {
            const editor = vscode.window.activeTextEditor; if (!editor) { return; }
            const doc = editor.document.getText();
            const position = event.selections[0].start;
            const jsxElement = findJSXElement(doc, position); if (!jsxElement) { return; }
            this.onHover({ ...jsxElement, position });
        });
    }
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
        const lineText = document.lineAt(position.line).text;
        const wordRange = document.getWordRangeAtPosition(position, /[\w-]+/)
        const name = document.getText(wordRange);
        // 使用正则表达式判断鼠标悬停位置是否在 <xxx></xxx> 上
        const partten = new RegExp(`<[\\s]*${name}[\\s]*`);

        if (partten.test(lineText)) {
            this.hoverInfo = { name, position }
            const string = `[XMouse配置](${vscode.Uri.parse(`command:xmouse.lego.editor.open`)})`;
            const linkMarkdown = new vscode.MarkdownString(string);
            linkMarkdown.isTrusted = true;
            // 返回 Hover 提示
            return new vscode.Hover(linkMarkdown);
        }
        return null;
    }
}
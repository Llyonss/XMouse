export function code(){
    vscode.window.onDidChangeTextEditorSelection((event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        const doc = editor.document.getText();
        const position = event.selections[0].start;
        const path = parser.findJSXElement(doc, position);
        if (!path) {
            this.component = undefined;
            this.position = undefined;
            const message = { command: 'setActiveComponent', undefined };
            this.webviewView?.webview.postMessage(message);
        }
        // @ts-ignore
        const component = components.find(item => item.name === path?.node.openingElement.name.name);
        if (!component) { return; }

        const attrs = Object.fromEntries<any>(
            // @ts-ignore
            path?.node.openingElement.attributes.map(item => {
                // @ts-ignore
                return [item.name.name, item.value.value];
            })
        );
        component.props?.forEach(item => {
            // @ts-ignore
            item.value = attrs[item.name];
        });
        this.component = component;
        this.position = position;
        const message = { command: 'setActiveComponent', component };
        this.webviewView?.webview.postMessage(message);
    });
}
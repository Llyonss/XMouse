import * as vscode from 'vscode';

export default class Storage {
    context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }
    set(key: string, value: any) {
        console.log('setset',key, value)
        this.context.globalState.update(key, value);
    }
    get(key: string) {
        return this.context.globalState.get(key)
    }
}

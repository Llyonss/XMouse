import type * as vscode from 'vscode'

export default class Storage {
  context: vscode.ExtensionContext
  instance: Storage
  constructor() {
    // 首次使用构造器实例
    if (!Storage.instance)
      Storage.instance = this

    return Storage.instance
  }

  setContext(context: vscode.ExtensionContext) {
    this.context = context
  }

  set(key: string, value: any) {
    this.context?.globalState.update(key, value)
  }

  get(key: string, defaultValue: any) {
    return this.context?.globalState.get(key) || defaultValue
  }
}

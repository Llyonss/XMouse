import * as path from 'node:path'
import * as fs from 'node:fs'
import Ignore from 'ignore'
import * as vscode from 'vscode'

export default class MyIgnore {
  gitignoreContents = new Map()
  constructor() {
    this.setIgnoreRule()
  }

  setIgnoreRule() {
    const workspaceFolders = vscode.workspace.workspaceFolders || []
    for (const workspaceFolder of workspaceFolders) {
      const gitignorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore')

      // 如果缓存中没有.gitignore内容，则读取并缓存
      if (!this.gitignoreContents.has(workspaceFolder.uri.fsPath)) {
        if (fs.existsSync(gitignorePath)) {
          const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
          const ignoreRules = gitignoreContent.split('\n').filter(rule => !!rule.trim() && !rule.startsWith('#'))
          this.gitignoreContents.set(workspaceFolder.uri.fsPath, [...ignoreRules, '.git'])
        }
        else {
          this.gitignoreContents.set(workspaceFolder.uri.fsPath, [])
        }
      }
    }
  }

  check(filePath: string, workspaceFolder: string): boolean {
    try {
      const ignore = Ignore()
      const ignoreRules = this.gitignoreContents.get(workspaceFolder)
      ignore.add(ignoreRules)
      const relativePath = path.relative(workspaceFolder, filePath)
      if (ignore.ignores(`${relativePath}\\`) || ignore.ignores(relativePath))
        return true
      return false
    }
    catch (e) {
      console.log(e)
    }
  }
}

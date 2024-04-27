import * as path from 'node:path'
import * as vscode from 'vscode'

import { loadCode, solveExports } from '../../../modules/solveExports'
import Ignore from '../../../modules/checkIgnore'

interface FileItem {
  id: string
  title: string
  fileType: string
  fileExt?: string
  children?: FileItem[]
  leaf?: boolean
  path: string
  root: string
}

export default class DirectoryService {
  ignore = new Ignore()
  constructor() {
  }

  async getWorkspace() {
    const workspaceFolders = vscode.workspace.workspaceFolders || []
    const workspace: FileItem[] = workspaceFolders.map((item) => {
      return {
        id: item.uri.fsPath,
        path: item.uri.fsPath,
        title: item.name,
        fileType: 'Directory',
        leaf: false,
        children: [],
        root: item.uri.fsPath,
      }
    })

    return [0, workspace]
  }

  async getDirectory(message) {
    const directory = message.data.path
    const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(directory))
    const resultPromise = entries.map(async ([name, type]) => {
      const filePath = path.join(directory, name)
      if (this.ignore.check(filePath, message.data.root))
        return
      const item: FileItem = {
        id: filePath,
        path: filePath,
        title: name,
        fileType: type === vscode.FileType.Directory ? 'Directory' : 'File',
        leaf: false,
        root: message.data.root,
      }
      if (type === vscode.FileType.File) {
        const extname = path.extname(filePath).replace('.', '')
        item.fileExt = extname
      }
      if (type === vscode.FileType.Directory)
        item.children = []
      return item
    })

    const results = await Promise.all(resultPromise)
    console.log(results)
    return [0, results.filter(item => item)]
  }

  async getFile(message) {
    const filePath = message.data.path
    const extname = path.extname(filePath).replace('.', '')
    if (!['jsx', 'tsx', 'js', 'ts'].includes(extname))
      return [0, []]
    const code = await loadCode(filePath)
    const exports = await solveExports(code, filePath)

    const result: FileItem[] = exports.map((item: any) => ({
      id: path.join(filePath, item.name),
      path: filePath,
      title: item.name,
      fileType: 'Export',
      leaf: true,
      root: message.data.root,
      meta: item,
    }))

    return [0, result]
  }
}

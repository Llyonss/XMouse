import * as path from 'node:path'
import * as vscode from 'vscode'
import { autoSolve, loadJson } from '../modules/solveExports'

export default class PakcageService {
  async getPackages(message) {
    const uris = await vscode.workspace.findFiles('{**​/package.json,package.json}', '**​/node_modules/**')

    const packages = await Promise.all(
      uris.map(async (uri) => {
        const root = path.dirname(uri.fsPath)
        console.log(1)

        const json: any = await loadJson(uri.fsPath)
        console.log(2, json)

        const dependencies = Object.keys(json?.dependencies || [])
        console.log(3, dependencies)
        return {
          meta: {
            root,
            uri,
            json,
            alias: [],
          },
          id: root,
          title: path.basename(root),
          fileType: 'Directory',
          leaf: false,
          children: dependencies?.map((name) => {
            return {
              id: `${root}\\${name}`,
              title: name,
              fileType: 'Dependencie',
              children: [],
              leaf: false,
            }
          }) || [],
        }
      }),
    )
    return [0, packages]
  }

  async getExports(message) {
    const data = await autoSolve(message.data.root, message.data.dependencie)
    console.log('data', data)
    const result = data.map(item => ({
      id: `${message.data.root}\\${message.data.dependencie}\\${item.name}`,
      title: item.name,
      fileType: 'Export',
      leaf: !item?.children?.length,
      meta: item,
      from: message.data.dependencie,
      children: item?.children?.map(child => ({
        id: `${message.data.root}\\${message.data.dependencie}\\${item.name}\\${child.name}`,
        title: child.name,
        leaf: true,
        fileType: 'Export',
        from: message.data.dependencie,
      })),
    }))
    return [0, result]
  }
}

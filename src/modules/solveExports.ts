import * as path from 'node:path'
import * as vscode from 'vscode'
import * as vuecompiler from '@vue/compiler-dom'
import * as types from '@babel/types'
import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import { getExportsRuntime } from 'pkg-exports'
import {
  getPackageInfo,
  importModule,
  isPackageExists,
  resolveModule,
} from 'local-pkg'

export async function loadCode(uri) {
  const fileType = path.extname(uri).replace('.', '')
  const buffer = await vscode.workspace.fs.readFile(vscode.Uri.file(uri))
  switch (fileType) {
    case 'vue': return await loadVue(buffer)
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx': return await loadJs(buffer)
    default: return ''
  }

  async function loadVue(buffer) {
    const vue = vuecompiler.parse(buffer.toString())
    const vueScript: any = vue.children.find((item: any) => item.tag === 'script')
    const vueScriptContent = vueScript.children.find((item: any) => item.type === 2)
    return vueScriptContent.content
  }
  async function loadJs(buffer) {
    return buffer.toString()
  }
}
async function loadJson(jsonPath) {
  const packageFile = await vscode.workspace.fs.readFile(
    vscode.Uri.file(jsonPath),
  )
  const packageText = packageFile.toString()
  const packageJson = JSON.parse(packageText)
  return packageJson
}

export async function solveExports(code, uri) {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators'],
      errorRecovery: true,
    })
    const exports: any = []
    traverse(ast, {
      ExportDefaultDeclaration(astPath: any) {
        exports.push({
          exportType: 'default',
          returnType: '',
          debug: astPath,
          name: (() => {
            console.log('ExportDefaultDeclaration', astPath.node)
            // astPath.node.specifiers
            return ''
          })(),
        })
      },
      ExportNamedDeclaration(astPath: any) {
        const specifiers = astPath.node.specifiers
        specifiers.forEach((specifier: any) => {
          if (types.isExportSpecifier(specifier))
            exports.push({ name: specifier.exported.name })
        })

        // exports.push({
        //   name: (() => {
        //     console.log('ExportNamedDeclaration', astPath.node)
        //     // astPath.node.specifiers
        //   })(),
        // })
      },
      //   'ExportNamedDeclaration|ExportDefaultDeclaration': function (astPath) {

      //     const node = astPath.node
      //     const exportNames = (() => {
      //       if (types.isExportDefaultDeclaration(node)) {
      //         return [{ name: 'default', desc: '', type: 'jsx', params: [] }]
      //       }
      //       if (!types.isExportNamedDeclaration(node))
      //         return []
      //       const specifiers = node.specifiers
      //       if (specifiers.length) {
      //         return specifiers.map((specifier) => {
      //           if (types.isExportSpecifier(specifier)) {
      //             const exported = specifier.exported as types.Identifier
      //             return { name: exported.name, desc: '', type: 'jsx', params: [] }
      //           }
      //         }) || []
      //       }
      //       const declaration = node.declaration
      //       if (declaration) {
      //         if (types.isFunctionDeclaration(declaration))
      //           return [{ name: declaration.id?.name, desc: 'function', type: 'jsx', params: [] }]

      //         if (types.isClassDeclaration(declaration))
      //           return [{ name: declaration.id?.name, desc: 'class', type: 'class', params: [] }]

      //         if (types.isTSInterfaceDeclaration(declaration)
      //           || types.isTSTypeAliasDeclaration(declaration)
      //           || types.isTSEnumDeclaration(declaration)
      //           || types.isTSDeclareFunction(declaration)
      //           || types.isTSInterfaceDeclaration(declaration)
      //           || types.isTSModuleBlock(declaration)
      //           || types.isTSModuleDeclaration(declaration)
      //         ) {
      //           /** @ts-expect-error */
      //           return [{ name: declaration.id?.name, desc: declaration.type, type: 'type', params: [] }]
      //         }
      //         if (types.isVariableDeclaration(declaration)) {
      //           return declaration?.declarations.map((item: any) => ({
      //             name: item.id?.name,
      //             desc: '',
      //             type: declaration.kind,
      //             params: [],
      //           }))
      //         }
      //       }
      //     })()

      //     xmfile.exports.push(...(exportNames || []))
      //   },
    })
    return exports
  }
  catch (e) {
  }
}
export async function solveWebType(dependencie, root) {
  try {
    const packageJson = await getPackageInfo(dependencie, { paths: root })
    const webTypePath = packageJson?.packageJson?.['web-types']
    if (!webTypePath)
      return
    const webTypeJson = await loadJson(path.join(packageJson.rootPath, webTypePath))
    const components = webTypeJson?.contributions?.html['vue-components'] || webTypeJson.contributions.html.tags || []
    const exports = components.map((item: any) => ({
      name: item.name,
      detail: webTypeJson,
    }))
    return exports
  }
  catch (e) {
  }
}

export default async function (packageUri, dependencieName) {
  const filePath = resolveModule(dependencieName, { paths: packageUri }) || ''
  if (!filePath)
    return []

  const result: any = {}
  const error: any = {}
  try {
    const code = await loadCode(filePath)
    const exports = await solveExports(code, filePath)
    if (exports.length)
      result.exports = exports
  }
  catch (e) { error.exports = e }

  try {
    const exports = await getExportsRuntime(dependencieName, { url: packageUri })
    if (exports.length) {
      result.runtime = exports.map(item => ({
        name: item,
      }))
    }
  }
  catch (e) { error.runtime = e }

  try {
    // todo: 实现性API, 打包cjs之后无法使用
    // test('test', getExportsStatic)
    // const exports = await getExportsStatic(dependencieName, { url: packageUri })
    // if (exports.length) {
    //   result.statics = exports.map(item => ({
    //     name: item,
    //   }))
    // }
  }
  catch (e) { error.statics = e }

  try {
    const exports = await importModule(`file://${filePath}`)
    if (Object.values(exports).length) {
      result.imports = Object.keys(exports).map(item => ({
        name: item,
        detail: exports[item],
      }))
    }
  }
  catch (e) { error.imports = e }

  try {
    const exports = await solveWebType(dependencieName, packageUri)
    result.webtypes = exports
  }
  catch (e) { error.webtypes = e }

  console.log('exports:', filePath, '\n', { dependencieName, packageUri }, '\n', result, '\n', error)
  return result.webtypes || result.imports || result.runtime || result.statics || result.exports || []
}

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

export async function loadJson(jsonPath) {
  const packageFile = await vscode.workspace.fs.readFile(
    vscode.Uri.file(jsonPath),
  )
  const packageText = packageFile.toString()
  const packageJson = JSON.parse(packageText)
  return packageJson
}

export async function solveExports(code) {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators'],
      errorRecovery: true,
    })
    const exports: any = []
    traverse(ast, {
      ExportDefaultDeclaration(astPath: any) {
        const returnType = solveDetail(astPath)
        exports.push({
          name: 'default',
          type: astPath.node.declaration.type,
          returnType: returnType?.type,
          children: returnType?.children,
        })
      },
      ExportNamedDeclaration(astPath: any) {
        const specifiers = astPath.node?.specifiers || []
        specifiers?.forEach((specifier: any) => {
          exports.push({ name: specifier.exported?.name, type: specifier.exported?.type })
        })
        const returnType = solveDetail(astPath)
        exports.push({
          name: astPath.node?.declaration?.id?.name,
          type: astPath.node?.declaration?.type,
          returnType: returnType?.type,
          children: returnType?.children,
        })
      },
    })
    return exports
  }
  catch (e) {
    // console.log('eee', e)
  }
  function solveDetail(astPath) {
    switch (astPath?.node?.declaration?.type) {
      case 'FunctionDeclaration ':
      case 'ArrowFunctionExpression': return { type: solveFunctionReturn(astPath), children: null }
      case 'Identifier': return { type: solveIdentify(astPath), children: null }
      case 'ObjectExpression': return { type: 'object', children: solveObject(astPath) }
      case 'ArrayExpression ':
      case 'CallExpression':
      default: return {}
    }
  }
  function solveFunctionReturn(astPath) {
    let result
    astPath.traverse({
      JSXElement(returnAstPath) {
        result = returnAstPath.node.type
      },
    })
    return result
  }
  function solveObject(astPath) {
    return astPath?.node?.declaration?.properties?.map(item => ({
      name: item.key.name,
      type: item.type,
    })) || 'object'
  }
  function solveIdentify(astPath) {
    const binding = astPath.scope.getBinding(astPath.node.declaration.name)
    return solveFunctionReturn(binding.path)
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

export async function autoSolve(packageUri, dependencieName) {
  const filePath = resolveModule(dependencieName, { paths: packageUri }) || ''
  if (!filePath)
    return []

  const result: any = {}
  const error: any = {}
  try {
    const code = await loadCode(filePath)
    const exports = await solveExports(code)
    if (exports?.length)
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

  // console.log('exports:', filePath, '\n', { dependencieName, packageUri }, '\n', result, '\n', error, result.webtypes || result.imports || result.runtime || result.statics || result.exports || [])
  return result.webtypes || result.imports || result.runtime || result.statics || result.exports || []
}

export default autoSolve

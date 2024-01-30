
import * as vscode from 'vscode';
import * as path from 'path'
import * as types from '@babel/types';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
export class XMFile {
    packages: { root: string, uri: vscode.Uri, json: {}, alias: any[] }[] = [];
    files: any[] = [];
    relations: any[] = [];
    constructor() {}
    async init() {
        this.packages = await this.solvePackageJson();
        this.files = await this.solveFiles();
        this.relations = this.solveRelation(this.files);
    }
    async solvePackageJson() {
        const uris = await vscode.workspace.findFiles('{package.json,**/package.json}', '{node_modules/**,dist/**}');
        const packages = uris.map(uri => ({
            root: path.dirname(uri.path),
            uri: uri,
            json: require(uri.fsPath),
            alias: [],
        }))
        return packages
    }
    async solveFiles() {
        const uris = await vscode.workspace.findFiles('**/**', '{package.json,**/package.json ,**/node_modules/**, node_modules/**,dist/**,**/dist/**}');
        const xmfiles = await Promise.all(uris.map(async (uri) => {
            const xmfile = {
                uri,
                path: uri.fsPath,
                dir: path.dirname(uri.fsPath),
                name: path.basename(uri.fsPath),
                type: path.extname(uri.fsPath),
                exports: [],
                imports: [],
            }
            if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(uri.fsPath))) {
                return await this.solveJSFile(xmfile)
            }
            return xmfile
        }))
        return xmfiles;
    }
    async solveJSFile(xmfile: any) {
        try {
            const buffer = await vscode.workspace.fs.readFile(xmfile.uri);
            const code = buffer.toString();
            const ast = parser.parse(code, {
                sourceType: "module",
                plugins: ["jsx", "typescript", "decorators"],
                errorRecovery: true,
            })

            traverse(ast, {
                'ExportNamedDeclaration|ExportDefaultDeclaration'(astPath) {
                    const node = astPath.node;
                    const exportNames = (() => {

                        if (types.isExportDefaultDeclaration(node)) {

                            // const declaration = node.declaration
                            // if (types.isIdentifier(declaration)) {
                            //     const from = path.scope.getOwnBinding(declaration.name)?.path?.parentPath?.node?.source?.value
                            //     if (from) {

                            //     }
                            //     // console.log(file.path, declaration.name, from,);
                            // }
                            return [{ name: 'default', desc: '', type: 'jsx', params: [] }]
                        }
                        if (!types.isExportNamedDeclaration(node)) {
                            return []
                        }
                        const specifiers = node.specifiers;
                        if (specifiers.length) {
                            return specifiers.map(specifier => {
                                if (types.isExportSpecifier(specifier)) {
                                    const exported = specifier.exported as types.Identifier
                                    return { name: exported.name, desc: '', type: 'jsx', params: [] }
                                }
                            }) || [];
                        }
                        const declaration = node.declaration;
                        if (declaration) {
                            if (types.isFunctionDeclaration(declaration)) {
                                return [{ name: declaration.id?.name, desc: '', type: 'jsx', params: [] }]
                            }
                        }
                    })()

                    xmfile.exports.push(...(exportNames || []))
                },
                ImportDeclaration(astPath) {
                    const importPath = astPath.node.source.value;
                    const resolvePath = (() => {
                        const isAlilas = /^@\//.test(importPath)
                        if (isAlilas) {
                            const basePath = path.normalize('c:\\Users\\欧拯救\\Desktop\\blog-client\\src')
                            const normalizedImportPath = importPath.replace(/^@\//, '');

                            return path.resolve(basePath, normalizedImportPath);
                        } else {
                            return path.resolve(path.dirname(xmfile.path), importPath)

                        }
                    })()
                    xmfile.imports.push({
                        dir: path.dirname(resolvePath),
                        name: astPath.node.specifiers.map(specifier => specifier.local.name),
                        from: importPath,
                        path: resolvePath
                    })
                }
            })
            return xmfile;
        } catch (e) {
        }
    }
    solveRelation(xmfiles: any) {
        const relations: any[] = [{ id: 'npm' }];
        // todo: 封装成通用模块
        xmfiles.forEach((xmfile, xmfileIndex) => {
            relations.push({ id: xmfileIndex, file: xmfile.path, label: xmfile.name, group: xmfile.dir.replace("c:\\Users\\欧拯救\\Desktop", "@") })
            xmfile.imports.forEach(importItem => {
                let find = false;
                xmfiles.forEach((item, itemIndex) => {
                    if (
                        importItem.path.toLowerCase() === item.path.toLowerCase()
                        || importItem.path.toLowerCase() === item.path.replace(/\.\w*$/, '').toLowerCase()
                        || path.join(importItem.path, 'index').toLowerCase() === item.path.replace(/\.\w*$/, '').toLowerCase()
                    ) {
                        relations.push({
                            file: xmfile.path,
                            target: xmfileIndex,
                            use: item.path,
                            source: itemIndex,
                            id: xmfileIndex + '-' + itemIndex,
                        })
                        find = true;
                    }
                })
                if (!find) {
                    // console.log('xxxxmm', importItem.from, importItem.path,xmfile.path, )
                    relations.push({
                        file: xmfile.path,
                        target: xmfileIndex,
                        use: importItem.from,
                        source: 'npm',
                        id: importItem.from,
                    })
                }
            })
        })
        console.log('relations', relations)
        return relations;
    }
    solveNodeModule() {

    }
    solveElementui() {
    }
}
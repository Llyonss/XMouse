
import * as vscode from 'vscode';
import * as path from 'path'
import * as types from '@babel/types';
import * as parser from '@babel/parser';
import * as fs from 'fs';
import traverse from '@babel/traverse';
import Ignore from 'ignore'
import * as vuecompiler from '@vue/compiler-dom';


interface FileItem {
    id: string;
    title: string;
    fileType: string;
    fileExt?: string;
    children?: FileItem[];
    leaf?: boolean
    path: string
}
export class XMFile {
    packages: { root: string, uri: vscode.Uri, json: {}, alias: any[] }[] = [];
    files: any[] = [];
    relations: any[] = [];
    direction: any[] = [];
    gitignoreContents: Map<string, string[]> = new Map();
    constructor() { }
    async init() {
        // this.packages = await this.solvePackageJson();
        // this.files = await this.solveFiles(this.packages);
        // this.direction = await this.solveDirection();
        // this.relations = this.solveRelation(this.files);
    }
    async saveWorkspaceConf(configData: any) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        workspaceFolders?.forEach(folder => {
            const snippetsFilePath = vscode.Uri.file(path.join(folder.uri.fsPath, '.vscode', 'xmouse.json'));
            const snippetsContent = JSON.stringify(configData, null, 2);
            vscode.workspace.fs.writeFile(snippetsFilePath, Buffer.from(snippetsContent, 'utf-8'));
        })
    }
    async readWorkspaceConf() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const result = workspaceFolders?.map(async (folder) => {
            const snippetsFilePath = vscode.Uri.file(path.join(folder.uri.fsPath, '.vscode', 'xmouse.json'));
            try {
                const file = await vscode.workspace.fs.readFile(snippetsFilePath);
                const conf = JSON.parse(file.toString());
                if (!Array.isArray(conf)) {
                    return []
                }
                return conf.filter(item => item.hasOwnProperty('name') && item.hasOwnProperty('group') && item.hasOwnProperty('code'))
            } catch (e) {
                return []
            }

        }) || []
        return (await Promise.all(result)).flat()
    }

    async solvePackageJson() {
        const uris = await vscode.workspace.findFiles('{package.json,**/package.json}', '{**/node_modules/**, node_modules/**,dist/**,**/dist/**}');
        const packages = uris.map(uri => ({
            root: path.dirname(uri.fsPath),
            uri: uri,
            json: require(uri.fsPath),
            alias: [],
        }))
        return packages
    }
    async solveDirection() {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders) {
            const result: FileItem[] = [];
            for (let workspaceFolder of workspaceFolders) {
                await this.walk(workspaceFolder.uri.fsPath, result, true);
            }
            workspaceFolders.forEach(async workspaceFolder => {
                // 读取工作区文件夹下的文件和子目录
            });
            return result;
        }
        return []
    }
    async walk(directory: string, parent: FileItem[], lazy: boolean = false) {
        const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(directory));

        for (const [name, type] of entries) {
            const filePath = path.join(directory, name);

            // 检查文件路径是否应该忽略
            if (this.isPathIgnored(filePath, directory,)) {
                continue; // 如果文件被忽略，则跳过
            }

            const item: FileItem = {
                id: filePath,
                path: filePath,
                title: name,
                fileType: type === vscode.FileType.Directory ? 'Directory' : 'File',
                leaf: true
            };
            if (type === vscode.FileType.File) {
                // 如果是文件，获取文件扩展名
                const extname = path.extname(filePath).replace('.', '');
                item.fileExt = extname;
                if (!['jsx', 'tsx', 'js', 'ts'].includes(extname)) {
                    continue;
                }
                const fileInfo = await this.solveJSFile({
                    uri: vscode.Uri.file(filePath),
                    path: vscode.Uri.file(filePath).fsPath,
                    exports: [],
                    imports: [],
                });
                item.children = fileInfo.exports.map((item: any) => ({
                    id: `${filePath}@${item.name}`,
                    path: filePath,
                    title: item.name,
                    fileType: 'Export',
                    leaf: true,
                }))
                item.leaf = false;
            }
            if (type === vscode.FileType.Directory) {
                item.children = [];
                item.leaf = false;
                if (!lazy) {
                    await this.walk(filePath, item.children, lazy);
                }

            }

            parent.push(item);
        }
    }
    isPathIgnored(filePath: string, directory: string,): boolean {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return false;

        for (const workspaceFolder of workspaceFolders) {
            const gitignorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore');

            // 如果缓存中没有.gitignore内容，则读取并缓存
            if (!this.gitignoreContents.has(gitignorePath)) {
                if (fs.existsSync(gitignorePath)) {
                    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
                    const ignoreRules = gitignoreContent.split('\n').filter(rule => !!rule.trim() && !rule.startsWith('#'));
                    this.gitignoreContents.set(gitignorePath, ignoreRules);
                } else {
                    this.gitignoreContents.set(gitignorePath, []);
                }
            }

            // 从缓存中获取.gitignore内容
            const ignoreRules = this.gitignoreContents.get(gitignorePath)!;
            const ignore = Ignore();
            ignore.add(ignoreRules)
            // 对文件路径进行匹配
            const relativePath = path.relative(workspaceFolder.uri.fsPath, filePath,)
            if (ignore.ignores(relativePath + '\\') || ignore.ignores(relativePath)) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
    async solveFiles(pacakges: any) {
        const uris = await vscode.workspace.findFiles('{**/**.[jt]s,**/**.[jt]sx}', '{package.json,**/package.json ,**/node_modules/**, node_modules/**,dist/**,**/dist/**}');
        const xmfiles = await Promise.all(uris.map(async (uri) => {
            const dir = path.dirname(uri.fsPath);
            const root = pacakges.find((item: any) => dir.includes(item.root))
            const xmfile = {
                root,
                uri,
                relativePath: dir.replace(root.root, path.basename(root.root)),
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
            const fileType = path.extname(xmfile.uri.fsPath).replace('.', '');
            let docCode = '';
            if (fileType === 'vue') {
                const vue = vuecompiler.parse(buffer.toString());
                const vueScript: any = vue.children.find((item: any) => item.tag === 'script')
                const vueScriptContent = vueScript.children.find((item: any) => item.type === 2);
                docCode = vueScriptContent.content;
            }
            if (['js', 'ts', 'jsx', 'tsx'].includes(fileType)) {
                docCode = buffer.toString();
            }

            const ast = parser.parse(docCode, {
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
                                return [{ name: declaration.id?.name, desc: 'function', type: 'jsx', params: [] }]
                            }
                            if (types.isClassDeclaration(declaration)) {
                                return [{ name: declaration.id?.name, desc: 'class', type: 'class', params: [] }]
                            }
                            if (types.isTSInterfaceDeclaration(declaration)
                                || types.isTSTypeAliasDeclaration(declaration)
                                || types.isTSEnumDeclaration(declaration)
                                || types.isTSDeclareFunction(declaration)
                                || types.isTSInterfaceDeclaration(declaration)
                                || types.isTSModuleBlock(declaration)
                                || types.isTSModuleDeclaration(declaration)
                            ) {
                                /** @ts-ignore */
                                return [{ name: declaration.id?.name, desc: declaration.type, type: 'type', params: [] }]
                            }
                            if (types.isVariableDeclaration(declaration)) {
                                return declaration?.declarations.map((item: any) => ({
                                    name: item.id?.name,
                                    desc: '',
                                    type: declaration.kind,
                                    params: []
                                }))
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
        xmfiles.forEach((xmfile: any, xmfileIndex: any) => {
            relations.push({ id: xmfileIndex, file: xmfile.path, label: xmfile.name, group: xmfile.relativePath.replace("c:\\Users\\欧拯救\\Desktop", "@") })
            xmfile.imports.forEach((importItem: any) => {
                let find = false;
                xmfiles.forEach((item: any, itemIndex: any) => {
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
        return relations;
    }
    solveNodeModule() {

    }
    solveElementui() {
    }


    async solvePackage() {
        const uris = await vscode.workspace.findFiles('{**​/package.json,package.json}', '**​/node_modules/**');
        return Promise.all(
            uris.map(async uri => {
                const root = path.dirname(uri.fsPath);
                const json = require(uri.fsPath)
                const dependencies = await this.solveDependencies(json.dependencies, root);
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
                    children: dependencies
                }
            })
        )
    }
    async solveDependencies(dependencies: any, root: any) {
        return Promise.all(
            Object.keys(dependencies).map(async dependencie => {
                // const meta = await this.solveDependencie(dependencie, root);
                return {
                    id: root + '/' + dependencie,
                    title: dependencie,
                    fileType: 'Dependencie',
                    children: []
                }
            })
        )

    }

    async solveDependencie(dependencie: any, root: any) {
        const meta: any = {};
        meta.name = dependencie

        try {
            meta.resolve = require.resolve(path.join(root, 'node_modules', dependencie));
            const packagePath = path.join(root, 'node_modules', dependencie, 'package.json');
            const packageJson = require(packagePath);

            if (packageJson["web-types"]) {
                const json = require(
                    path.join(root, 'node_modules', dependencie, packageJson["web-types"])
                );

                const components = json.contributions.html["vue-components"] || json.contributions.html["tags"] || [];
                meta.content = json;
                meta.children = components.map((item: any) => ({
                    id: path.join(root, 'node_modules', dependencie, item.name),
                    title: item.name,
                    path: dependencie,
                    fileType: 'Export'
                }))
            } else if (packageJson.module) {
                const packageIndexPath = path.join(root, 'node_modules', dependencie, packageJson.module);
                const json = await this.solveJSFile({
                    uri: vscode.Uri.file(packageIndexPath),
                    path: vscode.Uri.file(packageIndexPath).fsPath,
                    exports: [],
                    imports: [],
                })
                meta.content = json;
                meta.children = json.exports.map((item: any) => ({
                    id: path.join(root, 'node_modules', dependencie, item.name),
                    title: item.name,
                    path: dependencie,
                    fileType: 'Export'
                }))
            } else if (['js', 'jsx', 'ts', 'tsx'].includes(path.extname(meta.resolve).replace('.', ''))) {
                const json = await import(meta.resolve);
                meta.content = json;

                meta.children = Object.keys(json).map(key => ({
                    id: path.join(root, 'node_modules', dependencie, key),
                    title: key,
                    path: dependencie,
                    fileType: 'Export'
                }))

            } else if (['vue'].includes(path.extname(meta.resolve).replace('.', ''))) {
                const json = await this.solveJSFile({
                    uri: vscode.Uri.file(meta.resolve),
                    path: vscode.Uri.file(meta.resolve).fsPath,
                    exports: [],
                    imports: [],
                })
                meta.content = json;
                meta.children = Object.keys(json).map(key => ({
                    id: path.join(root, 'node_modules', dependencie, key),
                    title: key,
                    path: dependencie,
                    fileType: 'Export'
                }))

            } else {
                meta.content = 'unknow'
                meta.children = []
            }
        } catch (e) {
            meta.content = e;
        }
        return meta;
    }
} 
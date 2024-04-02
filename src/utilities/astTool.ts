
import * as vscode from 'vscode';
import * as parser from '@babel/parser';
import * as traverse from '@babel/traverse';
import * as generate from "@babel/generator";
import * as types from '@babel/types';
export function findJSXElement(code: string, position: vscode.Position): any | undefined {
    const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"],
    })

    let compPath: any;
    traverse.default(ast, {
        JSXElement(path) {

            const hoverLine = position.line + 1;
            const hoverCol = position.character
            if (!path.node.loc) return;
            if (
                // start< hoverLine< end
                hoverLine >= path.node.loc.start.line
                && hoverLine <= path.node.loc.end.line
                // start< hoverCol < end
                && hoverCol >= path.node.loc.start.column
                && hoverCol <= path.node.loc.end.column
            ) {
                compPath = path;
            }
        }
    })
    if (!compPath) {
        return null
    }
    return {
        attr: compPath?.node.openingElement.attributes.map((item: any) => {
            return {
                name: item.name.name,
                value: item.value.value,
                type: 'string'
            };
        }),
        name: compPath?.node.openingElement.name.name,
        ast: compPath
    }
}
export function findCompPath(code: string, name: string, position: vscode.Position): traverse.NodePath<types.JSXElement> | undefined {
    const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"],
    })

    let compPath;
    traverse.default(ast, {
        JSXElement(path) {
            if ((path.node.openingElement.name as types.JSXIdentifier).name === name) {
                const hoverLine = position.line + 1;
                const hoverCol = position.character
                if (!path.node.loc) return;
                if (
                    // start< hoverLine< end
                    hoverLine >= path.node.loc.start.line
                    && hoverLine <= path.node.loc.end.line
                    // start< hoverCol < end
                    && hoverCol >= path.node.loc.start.column
                    && hoverCol <= path.node.loc.end.column
                ) {
                    compPath = path;
                }
            }
        }
    })
    return compPath
}

export function setJSXAttr(path: traverse.NodePath<types.JSXElement>, name: string, value: any): string {
    const attr = path.node.openingElement.attributes.find((item: any) => item.name.name === name)
    if (attr) {
        if (typeof value === 'string') {
            ((attr as types.JSXAttribute).value as types.StringLiteral).value = value
            if (!value) {
                // @ts-ignore
                path.node.openingElement.attributes = path.node.openingElement.attributes.filter(item => item?.name.name !== name)
            }
        } else {
            // @ts-ignore
            attr.value.expression = types.jSXExpressionContainer(types.booleanLiteral(true))
        }

    } else {
        if (typeof value === 'string') {
            if (value) {
                path.node.openingElement.attributes.push(
                    types.jSXAttribute(
                        types.jSXIdentifier(name),
                        types.stringLiteral(value)
                    )
                )
            }
        } else {
            path.node.openingElement.attributes.push(
                types.jSXAttribute(
                    types.jSXIdentifier(name),
                    types.jSXExpressionContainer(types.booleanLiteral(true))
                )
            )
        }
    }

    const generatedCode = generate.default(path.node, { jsescOption: { minimal: true } }).code;
    return generatedCode;
}


export function updateImport(code: string, dependsForAdd: any[]) {
    try {
        const dependsCode = dependsForAdd.map(depend => `import ${depend.import} from '${depend.from}'`).join('\n')
        const dependsAst = parser.parse(dependsCode, {
            sourceType: "module",
            plugins: ["jsx", "typescript", "decorators"],
            errorRecovery: true,
        })
        const solvedDependsForAdd = dependsAst.program.body.map((item: any) => ({
            from: item.source.value,
            specifiers: item?.specifiers,
            node: item
        }));

        const ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "typescript", "decorators"],
            errorRecovery: true,
        })

        const imports: any[] = []
        traverse.default(ast, {
            ImportDeclaration(astPath) {
                imports.push({
                    from: astPath.node.source.value,
                    loc: astPath.node.loc,
                    node: astPath.node,
                });

            }
        })
        const results = solvedDependsForAdd.map(depend => {
            const importItem = imports.find(item => depend.from === item.from);
            if (importItem) {
                const specifiersMap: any = {};
                importItem.node.specifiers.forEach((item: any) => {
                    specifiersMap[item.local.name] = item
                });
                depend.specifiers.forEach((item: any) => {
                    specifiersMap[item.local.name] = item
                });
                const specifiers = Object.values(specifiersMap);
                importItem.node.specifiers = specifiers;
                const generatedCode = generate.default(importItem.node, { jsescOption: { minimal: true } }).code;
                return {
                    code: generatedCode,
                    loc: importItem.loc
                }
            }
            const code = generate.default(depend.node, { jsescOption: { minimal: true } }).code;;
            return { code };
        })
        return results;
    } catch (e) {
        console.log(e)
    }
}
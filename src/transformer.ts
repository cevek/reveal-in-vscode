import * as ts from 'typescript';
const fileNameProp = '__filename';

export default function(program: ts.Program, pluginOptions: { productionEnv: string }) {
    const productionEnv = new RegExp('^' + (pluginOptions.productionEnv || 'production') + '$');
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            if (productionEnv.test(process.env.NODE_ENV || '')) return sourceFile;
            if (sourceFile.isDeclarationFile) return sourceFile;
            if (sourceFile.languageVariant !== ts.LanguageVariant.JSX) return sourceFile;
            let fileNameIdent: ts.Identifier | undefined;
            function add(tag: ts.JsxElement | ts.JsxSelfClosingElement, attrs: ts.JsxAttributes) {
                if (!fileNameIdent) {
                    fileNameIdent = ts.createOptimisticUniqueName('filename');
                }
                const pos = ts.getLineAndCharacterOfPosition(sourceFile, tag.getStart(sourceFile));
                return ts.updateJsxAttributes(attrs, [
                    ...attrs.properties,
                    ts.createJsxAttribute(
                        ts.createIdentifier(fileNameProp),
                        ts.createJsxExpression(
                            undefined,
                            ts.createBinary(
                                fileNameIdent,
                                ts.SyntaxKind.PlusToken,
                                ts.createLiteral(':' + (pos.line + 1) + ':' + (pos.character + 1))
                            )
                        )
                    ),
                ]);
            }
            function visitor(node: ts.Node): ts.Node {
                if (ts.isJsxElement(node)) {
                    const open = node.openingElement;
                    return ts.visitEachChild(
                        ts.updateJsxElement(
                            node,
                            ts.updateJsxOpeningElement(
                                open,
                                open.tagName,
                                open.typeArguments,
                                add(node, open.attributes)
                            ),
                            node.children,
                            node.closingElement
                        ),
                        visitor,
                        ctx
                    );
                }
                if (ts.isJsxSelfClosingElement(node)) {
                    return ts.visitEachChild(
                        ts.updateJsxSelfClosingElement(
                            node,
                            node.tagName,
                            node.typeArguments,
                            add(node, node.attributes)
                        ),
                        visitor,
                        ctx
                    );
                }

                return ts.visitEachChild(node, visitor, ctx);
            }
            const sf = ts.visitEachChild(sourceFile, visitor, ctx);
            if (fileNameIdent) {
                // const imprt = ts.createImportDeclaration(
                //     undefined,
                //     undefined,
                //     ts.createImportClause(
                //         undefined,
                //         ts.createNamedImports([ts.createImportSpecifier(ts.createIdentifier(wrap), wrapIdent)])
                //     ),
                //     ts.createLiteral(packageName)
                // );
                const fileNameVar = ts.createVariableStatement(
                    undefined,
                    ts.createVariableDeclarationList([
                        ts.createVariableDeclaration(fileNameIdent, undefined, ts.createLiteral(sf.fileName)),
                    ])
                );
                const statements = [fileNameVar, ...sf.statements];
                return ts.updateSourceFileNode(
                    sf,
                    statements,
                    sf.isDeclarationFile,
                    sf.referencedFiles,
                    sf.typeReferenceDirectives,
                    sf.hasNoDefaultLib,
                    sf.libReferenceDirectives
                );
            }
            return sf;
        };
    };
}

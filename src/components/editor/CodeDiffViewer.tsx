import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import styles from './style/diff.module.scss';

interface CodeDiffViewerProps {
    originalCode: string;
    modifiedCode: string;
    language: string;
}

const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ originalCode, modifiedCode, language }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let diffEditor: monaco.editor.IStandaloneDiffEditor;
        if (editorRef.current) {
            diffEditor = monaco.editor.createDiffEditor(editorRef.current, {
                scrollBeyondLastLine: false,
                readOnly: true,
                contextmenu: true,
                automaticLayout: true,
            });

            const originalModel = monaco.editor.createModel(originalCode, language);
            const modifiedModel = monaco.editor.createModel(modifiedCode, language);

            diffEditor.setModel({ original: originalModel, modified: modifiedModel });

            // 为了避免在渲染后立即调用getLineChanges可能导致的问题，使用setTimeout
            setTimeout(() => {
                const lineChanges = diffEditor.getLineChanges();
                if (lineChanges) {
                    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
                    // 处理修改后的模型
                    lineChanges.forEach(change => {
                        for (let i = change.modifiedStartLineNumber; i <= change.modifiedEndLineNumber; i++) {
                            const lineContent = modifiedModel.getLineContent(i);
                            if (lineContent.includes("scriptText")) {
                                decorations.push({
                                    range: new monaco.Range(i, 1, i, 1),
                                    options: {
                                        isWholeLine: true,
                                        linesDecorationsClassName: styles.myScriptTextDecoration,
                                        marginClassName: styles.myScriptTextMarginDecoration
                                    }
                                });
                            }
                        }
                    });

                    // 处理原始模型
                    lineChanges.forEach(change => {
                        for (let i = change.originalStartLineNumber; i <= change.originalEndLineNumber; i++) {
                            const lineContent = originalModel.getLineContent(i);
                            if (lineContent.includes("scriptText")) {
                                decorations.push({
                                    range: new monaco.Range(i, 1, i, 1),
                                    options: {
                                        isWholeLine: true,
                                        linesDecorationsClassName: styles.myScriptTextDecoration,
                                        marginClassName: styles.myScriptTextMarginDecoration
                                    }
                                });
                            }
                        }
                    });

                    // 添加装饰器到修改后的编辑器
                    diffEditor.getModifiedEditor().deltaDecorations([], decorations);
                    // 如果需要，也可以为原始编辑器添加装饰器
                    diffEditor.getOriginalEditor().deltaDecorations([], decorations);

                    diffEditor.getModifiedEditor().onMouseDown(e => {
                        console.log(e.target.type, monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS)
                        const lineNumber = e.target.position!.lineNumber;
                        const lineContent = diffEditor.getModifiedEditor()!.getModel()!.getLineContent(lineNumber);
                        console.log(`Clicked line ${lineNumber}: ${lineContent}`);
                    });

                    diffEditor.getOriginalEditor().onMouseDown(e => {
                        const lineNumber = e.target.position!.lineNumber;
                        const lineContent = diffEditor.getOriginalEditor()!.getModel()!.getLineContent(lineNumber);
                        console.log(`Clicked line ${lineNumber}: ${lineContent}`);
                    });


                }


            }, 100);
        }



        return () => {
            if (diffEditor) {
                diffEditor.dispose();
            }
        };
    }, [originalCode, modifiedCode, language]);

    return <div ref={editorRef} style={{ height: '800px', width: 'auto' }} />;
};

export default CodeDiffViewer;

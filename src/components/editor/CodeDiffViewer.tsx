import React, {useEffect, useRef} from 'react';
import * as monaco from 'monaco-editor';
import styles from './style/diff.module.scss';

interface CodeDiffViewerProps {
    originalCode: string;
    modifiedCode: string;
    language: string;
    onLineClick?: (lineContent: string) => void;
}

const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({originalCode, modifiedCode, language,onLineClick}) => {
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

            diffEditor.setModel({original: originalModel, modified: modifiedModel});

            // 为了避免在渲染后立即调用getLineChanges可能导致的问题，使用setTimeout
            setTimeout(() => {
                const lineChanges = diffEditor.getLineChanges();
                if (lineChanges) {
                    const modifiedDecorations: monaco.editor.IModelDeltaDecoration[] = [];
                    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
                    // 处理修改后的模型
                    lineChanges.forEach(change => {
                        for (let i = change.modifiedStartLineNumber; i <= change.modifiedEndLineNumber; i++) {
                            const lineContent = modifiedModel.getLineContent(i);
                            if (lineContent.includes("scriptText")) {
                                modifiedDecorations.push({
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
                    diffEditor.getModifiedEditor().createDecorationsCollection(modifiedDecorations);
                    // 如果需要，也可以为原始编辑器添加装饰器
                    diffEditor.getOriginalEditor().createDecorationsCollection( decorations);

                    diffEditor.getModifiedEditor().onMouseDown(e => {

                        if (e.target.type ==3 || e.target.type == 4) {
                            const lineNumber = e.target.position!.lineNumber;
                            const lineContent = diffEditor.getModifiedEditor()!.getModel()!.getLineContent(lineNumber);

                            if (onLineClick){
                                onLineClick(lineContent)
                            }
                        }


                    });

                    diffEditor.getOriginalEditor().onMouseDown(e => {
                        if (e.target.type ==3 || e.target.type == 4) {
                            const lineNumber = e.target.position!.lineNumber;
                            const lineContent = diffEditor.getOriginalEditor()!.getModel()!.getLineContent(lineNumber);
                            onLineClick && onLineClick(lineContent);
                        }

                    });


                }


            }, 10);
        }


        return () => {
            if (diffEditor) {
                diffEditor.dispose();
            }
        };
    }, [originalCode, modifiedCode, language]);

    return <div ref={editorRef} className={styles.codeDiffViewer} />;
};

export default CodeDiffViewer;

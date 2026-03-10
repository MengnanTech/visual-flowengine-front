import React, {useEffect, useRef} from 'react';
import styles from './style/diff.module.scss';
import {registerGroovyLanguageForMonaco} from '@/components/editor/style/groovy-language-definition-for-monaco.ts';
import {ensureMonacoSetup, MonacoModule} from '@/components/editor/monacoSetup.ts';

interface CodeDiffViewerProps {
    originalCode: string;
    modifiedCode: string;
    language: string;
    onLineClick?: (lineContent: string) => void;
}

const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({originalCode, modifiedCode, language, onLineClick}) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let disposed = false;
        let diffEditor: ReturnType<MonacoModule['editor']['createDiffEditor']> | null = null;
        let originalModel: ReturnType<MonacoModule['editor']['createModel']> | null = null;
        let modifiedModel: ReturnType<MonacoModule['editor']['createModel']> | null = null;

        const renderDiffEditor = async () => {
            const monaco = await ensureMonacoSetup();

            if (disposed || !editorRef.current) {
                return;
            }

            if (language === 'groovy') {
                registerGroovyLanguageForMonaco(monaco);
            }

            diffEditor = monaco.editor.createDiffEditor(editorRef.current, {
                scrollBeyondLastLine: false,
                readOnly: true,
                contextmenu: true,
                automaticLayout: true,
            });

            originalModel = monaco.editor.createModel(originalCode, language);
            modifiedModel = monaco.editor.createModel(modifiedCode, language);
            diffEditor.setModel({original: originalModel, modified: modifiedModel});

            window.setTimeout(() => {
                if (!diffEditor || !originalModel || !modifiedModel) {
                    return;
                }

                const lineChanges = diffEditor.getLineChanges();

                if (!lineChanges) {
                    return;
                }

                const originalDecorations: any[] = [];
                const modifiedDecorations: any[] = [];

                lineChanges.forEach((change) => {
                    for (let lineNumber = change.modifiedStartLineNumber; lineNumber <= change.modifiedEndLineNumber; lineNumber += 1) {
                        const lineContent = modifiedModel!.getLineContent(lineNumber);

                        if (lineContent.includes('scriptText')) {
                            modifiedDecorations.push({
                                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                                options: {
                                    isWholeLine: true,
                                    linesDecorationsClassName: styles.myScriptTextDecoration,
                                    marginClassName: styles.myScriptTextMarginDecoration,
                                },
                            });
                        }
                    }
                });

                lineChanges.forEach((change) => {
                    for (let lineNumber = change.originalStartLineNumber; lineNumber <= change.originalEndLineNumber; lineNumber += 1) {
                        const lineContent = originalModel!.getLineContent(lineNumber);

                        if (lineContent.includes('scriptText')) {
                            originalDecorations.push({
                                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                                options: {
                                    isWholeLine: true,
                                    linesDecorationsClassName: styles.myScriptTextDecoration,
                                    marginClassName: styles.myScriptTextMarginDecoration,
                                },
                            });
                        }
                    }
                });

                diffEditor.getModifiedEditor().createDecorationsCollection(modifiedDecorations);
                diffEditor.getOriginalEditor().createDecorationsCollection(originalDecorations);

                diffEditor.getModifiedEditor().onMouseDown((event) => {
                    if (event.target.type !== 3 && event.target.type !== 4) {
                        return;
                    }

                    const lineNumber = event.target.position?.lineNumber;

                    if (!lineNumber) {
                        return;
                    }

                    const lineContent = diffEditor!.getModifiedEditor().getModel()!.getLineContent(lineNumber);
                    onLineClick?.(lineContent);
                });

                diffEditor.getOriginalEditor().onMouseDown((event) => {
                    if (event.target.type !== 3 && event.target.type !== 4) {
                        return;
                    }

                    const lineNumber = event.target.position?.lineNumber;

                    if (!lineNumber) {
                        return;
                    }

                    const lineContent = diffEditor!.getOriginalEditor().getModel()!.getLineContent(lineNumber);
                    onLineClick?.(lineContent);
                });
            }, 10);
        };

        void renderDiffEditor();

        return () => {
            disposed = true;
            diffEditor?.dispose();
            originalModel?.dispose();
            modifiedModel?.dispose();
        };
    }, [language, modifiedCode, onLineClick, originalCode]);

    return <div ref={editorRef} className={styles.codeDiffViewer}/>;
};

export default CodeDiffViewer;

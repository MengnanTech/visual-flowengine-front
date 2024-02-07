import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
interface CodeDiffViewerProps {
    originalCode: string;
    modifiedCode: string;
    language: string;
}

const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ originalCode, modifiedCode,language }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current) {
            const diffEditor = monaco.editor.createDiffEditor(editorRef.current, {
                scrollBeyondLastLine: false,
                readOnly: true,
                contextmenu: true,
                automaticLayout: true,
            });

            const originalModel = monaco.editor.createModel(originalCode, language);
            const modifiedModel = monaco.editor.createModel(modifiedCode, language);

            diffEditor.setModel({
                original: originalModel,
                modified: modifiedModel,
            });

            return () => {
                diffEditor.dispose();
                originalModel.dispose();
                modifiedModel.dispose();
            };
        }
    }, [originalCode, modifiedCode]);

    return <div ref={editorRef} style={{ height: '800px', width: 'auto' }} />;
};

export default CodeDiffViewer;

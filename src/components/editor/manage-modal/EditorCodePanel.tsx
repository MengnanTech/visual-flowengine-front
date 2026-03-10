import React, {Suspense} from 'react';
import type {Monaco} from '@monaco-editor/react';
import type {editor} from 'monaco-editor';

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

interface EditorCodePanelProps {
    clickNodeScriptType?: string;
    clickNodeScriptText?: string;
    isMonacoReady: boolean;
    editorHeight: string;
    editorCode: string;
    readonly: boolean;
    onEditorChange: (value: string | undefined) => void;
    onEditorDidMount: (editorInstance: editor.IStandaloneCodeEditor) => void;
    onEditorWillMount: (handleMonaco: Monaco) => void;
    onEditorValidate: (markers: editor.IMarker[]) => void;
}

const EditorCodePanel: React.FC<EditorCodePanelProps> = ({
    clickNodeScriptType,
    clickNodeScriptText,
    isMonacoReady,
    editorHeight,
    editorCode,
    readonly,
    onEditorChange,
    onEditorDidMount,
    onEditorWillMount,
    onEditorValidate,
}) => {
    if (clickNodeScriptType === 'Start') {
        return null;
    }

    return (
        <div
            style={{
                border: '1px solid #e1e4e8',
                background: '#f6f8fa',
                borderRadius: '4px',
                padding: '10px',
                height: editorHeight,
            }}
        >
            {isMonacoReady ? (
                <Suspense fallback={<div>Loading editor...</div>}>
                    {clickNodeScriptType === 'rule' ? (
                        <div>非 rule 类型或 clickNode 不存在时显示的内容{clickNodeScriptText}</div>
                    ) : (
                        <MonacoEditor
                            height={editorHeight}
                            value={editorCode}
                            onChange={onEditorChange}
                            onMount={onEditorDidMount}
                            beforeMount={onEditorWillMount}
                            onValidate={onEditorValidate}
                            defaultLanguage="groovy"
                            options={{
                                contextmenu: true,
                                wordWrap: 'off',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontSize: 16,
                                readOnly: readonly,
                            }}
                        />
                    )}
                </Suspense>
            ) : (
                <div>Loading editor...</div>
            )}
        </div>
    );
};

export default EditorCodePanel;

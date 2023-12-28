import React from "react";
import Editor from '@monaco-editor/react';

const ManageEditor: React.FC = () => {

    function handleEditorChange(value: any, event: any) {
        console.log("onMount: the value instance:", value);
        console.log("onMount: the event instance:", event);
    }

    function handleEditorDidMount(editor: any, monaco: any) {
        console.log("onMount: the editor instance:", editor);
        console.log("onMount: the monaco instance:", monaco);
    }

    function handleEditorWillMount(monaco: any) {
        console.log("beforeMount: the monaco instance:", monaco);

        // 在这里注册 Groovy 语言
        monaco.languages.register({ id: 'groovy' });

        // 定义 Groovy 语言的简单语法高亮
        monaco.languages.setMonarchTokensProvider('groovy', {
            tokenizer: {
                root: [
                    [/[{}]/, 'delimiter.bracket'],
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                    [/[A-Z][\w\$]*/, 'type.identifier'],
                    [/"/, { token: 'string.quote', next: '@string' }],
                    // 更多规则...
                ],
                string: [
                    [/[^"]+/, 'string'],
                    [/"/, { token: 'string.quote', next: '@pop' }],
                ]
            },
            keywords: ['def', 'return', 'if', 'else', 'while', 'switch', 'case'],
        });
    }

    function handleEditorValidation(markers: any[]) {
        // model markers
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }
    return (
        <div>
            <Editor
                height="70vh"
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                beforeMount={handleEditorWillMount}
                onValidate={handleEditorValidation}
                defaultLanguage="groovy"
                defaultValue="// some comment"
            />
        </div>
    );
}
export default ManageEditor

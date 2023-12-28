import React from "react";
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

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
        monaco.languages.register({ id: 'groovy' });

        monaco.languages.setMonarchTokensProvider('groovy', {
            tokenizer: {
                root: [
                    [/\/\/.*$/, 'comment'],
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

            keywords: [
                'def', 'return', 'if', 'else', 'while', 'switch', 'case',
                'break', 'continue', 'throw', 'try', 'catch', 'finally'
            ],
        });

        const completionItemProvider: monaco.languages.CompletionItemProvider = {
            provideCompletionItems: function(model, position) {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                const suggestions = [
                    {
                        label: 'println',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'println("${1}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: '打印一行到控制台',
                        range: range, // 添加 range 属性
                    },
                    // ...其他建议项
                ];

                return { suggestions };
            },

            // 可选：实现 resolveCompletionItem
            resolveCompletionItem: function(item: any) {
                // 进一步解析 item，如添加文档注释等
                return item;
            }
        };

        monaco.languages.registerCompletionItemProvider('groovy', completionItemProvider);




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

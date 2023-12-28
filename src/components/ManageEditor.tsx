import React from "react";
import Editor, {Monaco} from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
interface Diagnostic {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: monaco.MarkerSeverity;
}
const ManageEditor: React.FC = () => {

    const createDiagnostics = (code: string): Diagnostic[] => {
        // let diagnostics: Diagnostic[] = [];
        // diagnostics.push({
        //     startLineNumber: stringStartLine,
        //     startColumn: stringStartColumn,
        //     endLineNumber: lineNum,
        //     endColumn: line.length + 1,
        //     message: '字符串未闭合。',
        //     severity: monaco.MarkerSeverity.Error,
        // });
        //
        // return diagnostics;
    };



    // 当编辑器内容变化时触发
    function handleEditorChange(value: any, event: any) {
        console.log("onMount: the value instance:", value);
        console.log("onMount: the event instance:", event);
    }

    // 编辑器挂载完成时执行，可以获取到编辑器实例和 Monaco 实例
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editor.onDidChangeModelContent(() => {
            // const code = editor.getValue();
            // const diagnostics = createDiagnostics(code);
            // monaco.editor.setModelMarkers(editor.getModel()!, 'groovy', diagnostics);
        });
    };
    // 在编辑器挂载之前执行，用于设置 Groovy 语言的语法和自动完成功能
    function handleEditorWillMount(monaco: any) {
        // 注册 Groovy 语言
        monaco.languages.register({id: 'groovy'});

        monaco.languages.setMonarchTokensProvider('groovy', {
            tokenizer: {
                root: [
                    // 多行注释
                    [/\/\*/, 'comment', '@comment'],
                    // 单行注释
                    [/\/\/.*$/, 'comment'],
                    // 注解
                    [/@\w+/, 'annotation'],
                    // GString 和三引号字符串的开始
                    [/"""/, {token: 'string', next: '@multiLineString'}],
                    // 普通字符串的开始
                    [/"/, {token: 'string', next: '@singleLineString'}],
                    // 正则表达式
                    [/\/[^\/]*\//, 'regexp'],
                    // 关键字
                    [/\b(?:abstract|assert|break|case|catch|class|const|continue|def|default|do|else|enum|extends|false|final|finally|for|goto|if|implements|import|in|instanceof|interface|native|new|null|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|true|try|volatile|while)\b/, 'keyword'],
                    // 类名和类型
                    [/[A-Z][\w\$]*/, 'type.identifier'],
                    // 数字
                    [/\d+/, 'number'],
                    // 操作符
                    [/(\==~|\=~)/, 'operator'],
                    // 闭包的开始
                    [/{/, 'delimiter.curly', '@closure'],
                ],

                comment: [
                    // 多行注释的内容
                    [/[^\/*]+/, 'comment'],
                    // 多行注释的结束
                    [/\*\//, 'comment', '@pop'],
                ],

                closure: [
                    // 闭包的结束
                    [/}/, 'delimiter.curly', '@pop'],
                    // 包含 root 规则
                    {include: 'root'}
                ],

                multiLineString: [
                    // GString 或三引号字符串的内容
                    [/[^"]+/, 'string'],
                    // GString 或三引号字符串的结束
                    [/"""/, {token: 'string', next: '@pop'}],
                ],

                singleLineString: [
                    // 字符串插值的开始
                    [/\$\{/, {token: 'delimiter.bracket', next: '@bracketCounting'}],
                    // 字符串的结束
                    [/"/, {token: 'string', next: '@pop'}],
                    // 字符串的内容
                    [/[^"]+/, 'string'],
                ],

                bracketCounting: [
                    // 插值内的大括号开始
                    [/\{/, 'delimiter.bracket', '@bracketCounting'],
                    // 插值内的大括号结束
                    [/\}/, 'delimiter.bracket', '@pop'],
                    // 包含 root 规则
                    {include: 'root'}
                ],
            },

            keywords: [
                'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const', 'continue', 'def', 'default',
                'do', 'else', 'enum', 'extends', 'false', 'final', 'finally', 'for', 'goto', 'if',
                'implements', 'import', 'in', 'instanceof', 'interface', 'native', 'new', 'null', 'package', 'private',
                'protected', 'public', 'return', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw',
                'throws', 'transient', 'true', 'try', 'volatile', 'while'
            ],
        });


        // 为 Groovy 语言添加自动完成功能
        const completionItemProvider: monaco.languages.CompletionItemProvider = {
            provideCompletionItems: function (model, position) {
                // 根据当前模型和位置提供自动完成建议
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                const suggestions: monaco.languages.CompletionItem[] = [
                    {
                        label: 'println',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'println("${1}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: '打印一行到控制台',
                        range: range,
                    },{
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:condition}; ${1:i}++) {\n\t${3}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Groovy for 循环',
                        range: range, // 确保 range 不是 undefined
                    },

                ];

                return {suggestions};
            },
            // 可选的方法，用于解析更多关于自动完成项的信息
            resolveCompletionItem: function (item: any) {
                return item;
            }
        };

        monaco.languages.registerCompletionItemProvider('groovy', completionItemProvider);
    }

    // 当编辑器内容出现错误时触发，例如语法错误
    function handleEditorValidation(markers: any[]) {
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

export default ManageEditor;

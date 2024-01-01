import React, {useEffect, useRef, useState} from 'react';
import {Modal, Button} from 'antd';
import Editor from '@monaco-editor/react';
import {compileGroovyScript} from "@/api/api.ts";
import * as monaco from 'monaco-editor';
import {D3Node} from "@/components/D3Node/D3model.ts";


interface ManageModalProps {
    clickNode: D3Node | null; // 假设 clickNode 可以为 null
    onClose: () => void; // 当模态框关闭时调用的函数
    updateScriptText: (clickNode: D3Node, newScriptText: string) => void; // 更新脚本内容的函数
}

const ManageModalEditor: React.FC<ManageModalProps> = ({clickNode, onClose, updateScriptText}) => {


    const [editorCode, setEditorCode] = useState(clickNode?.data.scriptText || '');
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (clickNode?.data.scriptText) {
            compileCode(clickNode.data.scriptText).then(r => r);
        }
    }, [clickNode]);

    const compileCode = async (code: string) => {
        const diagnostics = await compileGroovyScript(code);
        if (editorRef.current) {
            monaco.editor.setModelMarkers(editorRef.current.getModel()!, 'groovy', diagnostics);
        }
    };

    const handleCompile = async () => {
        await compileCode(editorCode);
    };

    const handleDebug = () => {

    };

    const handleSave = () => {

        if (clickNode) {
            updateScriptText(clickNode, editorCode);
        }
        onClose();
    };

    const handleSubmit = () => {

    };

    function handleEditorChange(value: string | undefined) {
        setEditorCode(value || '');
    }

    // 编辑器挂载完成时执行，可以获取到编辑器实例和 Monaco 实例
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent(async () => {
            const code = editor.getValue();
            setEditorCode(code);
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
                    [/\/[^/]*\//, 'regexp'],
                    // 关键字
                    [/\b(?:abstract|assert|break|case|catch|class|const|continue|def|default|do|else|enum|extends|false|final|finally|for|goto|if|implements|import|in|instanceof|interface|native|new|null|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|true|try|volatile|while)\b/, 'keyword'],
                    // 类名和类型
                    [/[A-Z][\w$]*/, 'type.identifier'],
                    // 数字
                    [/\d+/, 'number'],
                    // 操作符
                    [/(==~|=~)/, 'operator'],
                    // 闭包的开始
                    [/{/, 'delimiter.curly', '@closure'],
                ],

                comment: [
                    // 多行注释的内容
                    [/[^/*]+/, 'comment'],
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
                    [/}/, 'delimiter.bracket', '@pop'],
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
                    }, {
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
        <Modal
            title="Modal 1000px width"
            centered
            maskClosable={false}
            open={clickNode !== null}
            onCancel={onClose}
            width={1000}
            footer={
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    textAlign: 'left'
                }}>
                    <div>
                        <Button onClick={handleCompile}>
                            编译
                        </Button>
                        <Button type="primary" onClick={handleDebug}>
                            调试
                        </Button>
                    </div>
                    <div>
                        <Button type="primary" onClick={handleSave}>
                            暂存
                        </Button>
                        <Button type="primary" onClick={handleSubmit}>
                            提交
                        </Button>
                    </div>
                </div>
            }
        >
            <div style={{
                border: '1px solid #e1e4e8',
                background: '#f6f8fa',
                borderRadius: '4px',
                padding: '10px',
            }}>
                <Editor
                    key={clickNode ? clickNode.data.id : 'editor'}
                    height="70vh"
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    beforeMount={handleEditorWillMount}
                    onValidate={handleEditorValidation}
                    defaultLanguage="groovy"
                    defaultValue={clickNode !== null ? clickNode.data.scriptText : ''}
                />
            </div>
        </Modal>
    );
};

export default ManageModalEditor;

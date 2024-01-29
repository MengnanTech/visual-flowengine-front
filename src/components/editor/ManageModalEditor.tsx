import React, {useEffect, useRef, useState} from 'react';
import {Badge, Button, Descriptions, message, Modal, Tooltip} from 'antd';
import Editor, {Monaco} from '@monaco-editor/react';
import {compileGroovyScript, debugGroovyScript} from "@/network/api.ts";
// import * as monaco from 'monaco-editor';
//这样导入少包体积少2M
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {TreeStore} from "@/store/TreeStore.ts";
import {observer} from "mobx-react";
import {CopyFilled, EditFilled} from "@ant-design/icons";
import AutoWidthInput from "@/components/editor/AutoWidthInput.tsx";
import * as d3 from 'd3';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {registerGroovyLanguageForMonaco} from "@/components/editor/groovy-language-definition-for-monaco.ts";

// import EditorStyles from "./style/editor.module.scss";


interface ManageModalEditorProps {
    treeStore: TreeStore;
}

const ManageModalEditor: React.FC<ManageModalEditorProps> = observer(({treeStore}) => {

    const clickNode = treeStore.clickNode;

    const [title, setTitle] = useState(clickNode?.data.name || '');
    const [editorCode, setEditorCode] = useState(clickNode?.data.scriptText || '');
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const handleTitleChange = (newValue: string) => {
        setTitle(newValue); // 更新局部状态
    };


    const toggleEditing = () => {
        if (isEditing && clickNode) {
            // 如果之前处于编辑状态，现在要保存更改
            clickNode.data.name = title;
            treeStore.setClickNode(clickNode);
            d3.select(`#node-${clickNode.data.id}`).select("text").text(clickNode.data.name);
        }
        setIsEditing(!isEditing);
    };


    useEffect(() => {
        setTitle(clickNode?.data.name || '');  // 更新 title 状态
        if (clickNode?.data.scriptText) {
            compileCode(clickNode.data.scriptText).then(r => r);
        }
        // 更新标题
    }, [clickNode]);

    const compileCode = async (code: string) => {
        const diagnostics = await compileGroovyScript(code);
        //编译结果没有提示出来
        if (editorRef.current) {
            monaco.editor.setModelMarkers(editorRef.current.getModel()!, 'groovy', diagnostics);
        }
    };
    const handleCompile = async () => {
        await compileCode(editorCode);
    };

    const handleDebug = async () => {
        const res = await debugGroovyScript(editorCode);
        message.success(res);
    };

    const handleSave = () => {
        if (clickNode) {
            clickNode.data.scriptText = editorCode;
            treeStore.setClickNode(clickNode);
        }
    };

    const handleSubmit = () => {

    };

    function handleClose() {
        treeStore.setClickNode(null);
        setTitle('');
        setEditorCode('');
    }

    function handleEditorChange(value: string | undefined) {
        setEditorCode(value || '');
    }

    // 编辑器挂载完成时执行，可以获取到编辑器实例和 Monaco 实例
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
        setEditorCode(editor.getValue());
        editor.onDidChangeModelContent(async () => {
            const code = editor.getValue();
            setEditorCode(code);
        });
    };


    // 在编辑器挂载之前执行，用于设置 Groovy 语言的语法和自动完成功能
    function handleEditorWillMount(handleMonaco: Monaco) {
        // 注册 Groovy 语言
        registerGroovyLanguageForMonaco(handleMonaco);


    }

    // 当编辑器内容出现错误时触发，例如语法错误
    function handleEditorValidation(markers: any[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }


    return (
        <div>
            <Modal
                title={
                    <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Node ID">
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <span>{clickNode?.data.id}</span>
                                <Tooltip title="复制">
                                    <CopyToClipboard text={clickNode?.data.id || ''}>
                                        <Button size="small" type="link" icon={<CopyFilled style={{color: 'gray'}}/>}/>
                                    </CopyToClipboard>
                                </Tooltip>
                            </div>
                        </Descriptions.Item>

                        <Descriptions.Item label="Node Name">
                            <div style={{display: 'flex', alignItems: 'center', height: '22px'}}>
                                {isEditing ? (
                                    <AutoWidthInput
                                        value={title}
                                        onChange={handleTitleChange}
                                        onFinish={toggleEditing}
                                    />
                                ) : (
                                    <>
                                        <span style={{lineHeight: '32px'}}>{title}</span>
                                        <Button size="small" type="link" onClick={toggleEditing}
                                                style={{marginLeft: 'auto'}}>
                                            <EditFilled/>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Descriptions.Item>

                        {/* 在这里添加其他节点信息 */}
                        <Descriptions.Item label="Node Type">{clickNode?.data.nodeType}</Descriptions.Item>
                        <Descriptions.Item label="Node Status">
                            <Badge status="processing" text="Running" color="green"/>
                        </Descriptions.Item>
                        {/* 如果有更多信息，继续添加 */}
                    </Descriptions>
                }
                centered
                maskClosable={false}
                open={treeStore.clickNode !== null}
                onCancel={() => treeStore.setClickNode(null)}
                width={1000}
                footer={
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                        <div>
                            <Button onClick={handleCompile} style={{marginRight: '8px'}}>编译</Button>
                            <Button type="primary" onClick={handleDebug} style={{marginRight: '8px'}}>调试</Button>
                        </div>
                        <div>
                            <Button type="primary" onClick={handleSave} style={{marginRight: '8px'}}>暂存</Button>
                            <Button type="primary" onClick={handleSubmit} style={{marginRight: '8px'}}>提交</Button>
                            <Button type="primary" onClick={handleClose}>关闭</Button>
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
                        height="50vh"
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        beforeMount={handleEditorWillMount}
                        onValidate={handleEditorValidation}
                        defaultLanguage="groovy"
                        defaultValue={clickNode !== null ? clickNode.data.scriptText : ''}
                    />
                </div>
            </Modal>
        </div>


    );
});

export default ManageModalEditor;

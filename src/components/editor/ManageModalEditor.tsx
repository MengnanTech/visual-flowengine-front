import React, {Suspense, useEffect, useRef, useState} from 'react';
import {Badge, Button, Descriptions, message, Modal, Tooltip} from 'antd';
import {Monaco} from '@monaco-editor/react';
import {compileGroovyScript, debugGroovyScript} from "@/network/api.ts";
// import * as monaco from 'monaco-editor';
//这样导入少包体积少2M
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {TreeStore} from "@/store/TreeStore.ts";
import {observer} from "mobx-react";
import {CopyFilled, EditFilled, FullscreenExitOutlined, FullscreenOutlined} from "@ant-design/icons";
import AutoWidthInput from "@/components/editor/AutoWidthInput.tsx";
import * as d3 from 'd3';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {registerGroovyLanguageForMonaco} from "@/components/editor/style/groovy-language-definition-for-monaco.ts";

// import EditorStyles from "./style/editor.module.scss";


interface ManageModalEditorProps {
    treeStore: TreeStore;
    readonly : boolean;
}
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const ManageModalEditor: React.FC<ManageModalEditorProps> = observer(({treeStore,readonly}) => {

    const clickNode = treeStore.clickNode;

    const [title, setTitle] = useState(clickNode?.data.scriptName || '');
    const [editorCode, setEditorCode] = useState(clickNode?.data.scriptText || '');
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const handleTitleChange = (newValue: string) => {
        setTitle(newValue); // 更新局部状态
    };


    const toggleEditing = () => {
        if (isEditing && clickNode) {
            // 如果之前处于编辑状态，现在要保存更改
            clickNode.data.scriptName = title;
            treeStore.setClickNode(clickNode);
            d3.select(`#node-${clickNode.data.scriptId}`).select("text").text(clickNode.data.scriptName);
        }
        setIsEditing(!isEditing);
    };


    useEffect(() => {
        setTitle(clickNode?.data.scriptName || '');  // 更新 title 状态
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
    const [modalSize, setModalSize] = useState({ width: '90vh', height: '80vh' });
    // 是否全屏
    const [isFullScreen, setIsFullScreen] = useState(false);

    // 切换全屏状态
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        if (!isFullScreen) {
            // 全屏时使用视口宽度和高度
            setModalSize({ width: '90vw', height: '100vh' });
        } else {
            // 恢复到初始尺寸，这里你可以根据需要调整
            setModalSize({ width: '90vh', height: '80vh' });
        }
    };
    const editorHeight = isFullScreen ? 'calc(100vh - 320px)' : '50vh'; // 举例调整，需要根据实际情况微调

    return (
        <div>
            <Modal
                title={
                    <>
                        <Descriptions size="small" column={1}>
                            <Descriptions.Item label="Node ID">
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <span>{clickNode?.data.scriptId}</span>
                                    <Tooltip title="复制">
                                        <CopyToClipboard text={clickNode?.data.scriptId || ''}>
                                            <Button size="small" type="link"
                                                    icon={<CopyFilled style={{color: 'gray'}}/>}/>
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
                            <Descriptions.Item label="Node Type">{clickNode?.data.scriptType}</Descriptions.Item>
                            <Descriptions.Item label="Node Status">
                                <Badge status="processing" text="Running" color="green"/>
                            </Descriptions.Item>
                            {/* 如果有更多信息，继续添加 */}
                        </Descriptions>
                        <Button
                            type="text"
                            shape={'circle'}
                            onClick={toggleFullScreen}
                            icon={isFullScreen ? <FullscreenExitOutlined/> : <FullscreenOutlined/>}
                            style={{position: 'absolute', right: '50px', top: '13px'}}
                        />
                    </>
                }
                centered
                maskClosable={false}
                open={treeStore.clickNode !== null}
                onCancel={() => treeStore.setClickNode(null)}
                width={modalSize.width}
                style={{maxWidth: '100vw', maxHeight: '100vh', overflow: 'hidden'}}
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
                    height: editorHeight, // 使用动态计算的高度
                }}>
                    <Suspense fallback={<div>Loading Editor...</div>}>
                        <MonacoEditor
                            key={clickNode ? clickNode.data.scriptId : 'editor'}
                            height={editorHeight}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            beforeMount={handleEditorWillMount}
                            onValidate={handleEditorValidation}
                            defaultLanguage="groovy"
                            options={{
                                contextmenu: true,
                                wordWrap: 'off',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontSize: 16,
                                readOnly:readonly,

                            }}
                            defaultValue={clickNode !== null ? clickNode.data.scriptText : ''}
                        />
                    </Suspense>
                </div>
            </Modal>
        </div>


    );
});

export default ManageModalEditor;

import React, {Suspense, useEffect, useRef, useState} from 'react';
import {Badge, Button, Col, Collapse, CollapseProps, Descriptions, Form, message, Modal, Tooltip} from 'antd';
import Editor, {Monaco} from '@monaco-editor/react';
import {compileGroovyScript, debugGroovyScript} from "@/network/api.ts";
// import * as monaco from 'monaco-editor';
//这样导入少包体积少2M
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {TreeStore} from "@/store/TreeStore.ts";
import {observer} from "mobx-react";
import {
    CheckCircleFilled,

    CopyFilled,
    EditFilled,
    FullscreenExitOutlined,
    FullscreenOutlined
} from "@ant-design/icons";
import AutoWidthInput from "@/components/editor/AutoWidthInput.tsx";
import * as d3 from 'd3';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {registerGroovyLanguageForMonaco} from "@/components/editor/style/groovy-language-definition-for-monaco.ts";

import style from "@/view/engine/styles/DebugForm.module.scss";
import {DebugScriptRequest, WorkflowTaskLog} from "@/components/model/WorkflowModel.ts";

// import EditorStyles from "./style/editor.module.scss";


interface ManageModalEditorProps {
    treeStore: TreeStore;
    readonly: boolean;
}

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const ManageModalEditor: React.FC<ManageModalEditorProps> = observer(({treeStore, readonly}) => {

    const clickNode = treeStore.clickNode;


    const [title, setTitle] = useState(clickNode?.data.scriptName || '');
    const [editorCode, setEditorCode] = useState(clickNode?.data.scriptText || '');
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [modalSize, setModalSize] = useState({width: '90vh', height: '80vh'});
    // 是否全屏
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [debugValue, setDebugValue] = useState('');
    const [debugOutput, setDebugOutput] = useState<WorkflowTaskLog | ''>('');
    const [activeKey, setActiveKey] = useState('');
    const [clinkNodeChangeCount, setClinkNodeChangeCount] = useState(0);
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
        setDebugValue('')
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
        clickNode!.data.scriptText = editorCode;
        setIsDebugVisible(true);
    };

    const handleSave = () => {
        if (clickNode) {
            clickNode.data.scriptText = editorCode;
            treeStore.setClickNode(clickNode);
            message.success('暂存成功');
        }
    };
    const handleCopySuccess = () => {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 5000); // 3秒后隐藏图标
    };


    function handleClose() {
        treeStore.setClickNode(null);
        setClinkNodeChangeCount(prevCounter => prevCounter + 1);
        setTitle('');
        setEditorCode('');
    }

    function  handleEditModalClose (){
        treeStore.setClickNode(null);
        setClinkNodeChangeCount(prevCounter => prevCounter + 1);
    }

    function handleEditorChange(value: string | undefined) {
        setEditorCode(value || '');
    }

    function handleDebugJsonChange(value: string | undefined) {
        setDebugValue(value || '');
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


    // 切换全屏状态
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        if (!isFullScreen) {
            // 全屏时使用视口宽度和高度
            setModalSize({width: '90vw', height: '100vh'});
        } else {
            // 恢复到初始尺寸，这里你可以根据需要调整
            setModalSize({width: '90vh', height: '80vh'});
        }
    };
    const editorHeight = isFullScreen ? 'calc(100vh - 320px)' : '50vh'; // 举例调整，需要根据实际情况微调
    const onFinish = () => {

        let debugScriptRequest: DebugScriptRequest = {
            code: clickNode!.data.scriptText,
            inputValues: debugValue ? JSON.parse(debugValue) : {}
        }
        debugGroovyScript(debugScriptRequest).then(
            (r) => {
                r.scriptId = clickNode!.data.scriptId;
                r.scriptName = clickNode!.data.scriptName;
                setDebugOutput(r);
                setActiveKey(clickNode?.data.scriptId || '1');
            }
        )
    };

    const collapseItems: CollapseProps['items'] = [
        {
            key: clickNode?.data.scriptId || '1',
            label: "Debug Output",
            children: <MonacoEditor
                key={Math.random()}
                height={"30vh"}
                defaultLanguage="json"
                options={{
                    contextmenu: true,
                    wordWrap: 'off',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontSize: 16,
                    readOnly: readonly,

                }}
                defaultValue={debugOutput==''?'':JSON.stringify(debugOutput, null, 2)}
            />,
        },
    ];

    const handleCollapseChange = (keys: string | string[]) => {
        let newActiveKey = '';

        if (Array.isArray(keys)) {
            // 如果 keys 是数组，检查 activeKey 是否在其中，逻辑假定只处理单个面板逻辑
            newActiveKey = keys.includes(activeKey) ? '' : keys[0];
        } else {
            // 如果 keys 不是数组，直接比较
            newActiveKey = activeKey === keys ? '1' : keys;
        }

        setActiveKey(newActiveKey);
    };

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
                                        <CopyToClipboard text={clickNode?.data.scriptId || ''}
                                                         onCopy={handleCopySuccess}>
                                            <Button size="small" type="link"
                                                    icon={<CopyFilled style={{color: 'gray'}}/>}/>
                                        </CopyToClipboard>

                                    </Tooltip>
                                    {showConfirmation && (
                                        <Col>
                                            <CheckCircleFilled style={{color: '#36f33e', fontSize: '16px'}}/>
                                        </Col>
                                    )}
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
                onCancel={handleEditModalClose}
                width={modalSize.width}
                style={{maxWidth: '100vw', maxHeight: '100vh', overflow: 'hidden'}}
                footer={
                    clickNode && clickNode.data.scriptType === 'Start' ? null : (
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                            <div>
                                <Button type="primary" onClick={handleCompile}
                                        style={{marginRight: '8px'}}>编译</Button>
                                <Button type="primary" onClick={handleDebug} style={{marginRight: '8px'}}>调试</Button>
                            </div>
                            <div>
                                <Button type="primary" onClick={handleSave} style={{marginRight: '8px'}}>暂存</Button>
                                <Button type="primary" onClick={handleClose}>取消</Button>
                            </div>
                        </div>)
                }
            >
                {!(clickNode && clickNode.data.scriptType === 'Start') && (<div style={{
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
                                readOnly: readonly,

                            }}
                            defaultValue={clickNode !== null ? clickNode.data.scriptText : ''}
                        />
                    </Suspense>
                </div>)}
            </Modal>

            <Modal
                title="Debug Node"
                open={isDebugVisible}
                centered
                onCancel={() => {
                    setIsDebugVisible(false)
                    setDebugOutput('')
                    setActiveKey('')
                }}
                maskClosable={false}
                footer={null}
                width={1000}
                style={{height: '95vh'}}
            >
                <Form
                    name="Debug Node"
                    autoComplete="off"
                    layout="vertical"
                    onFinish={onFinish}
                    className={style.debugForm}
                >
                    <Form.Item
                        name="jsonInput"
                        label="JSON Content"
                    >
                        <div style={{
                            border: '1px solid #e1e4e8',
                            background: '#f6f8fa',
                            borderRadius: '4px',
                            padding: '10px',
                        }}>
                            <Editor
                                height="500px"
                                defaultLanguage="json"
                                onChange={handleDebugJsonChange}
                                key={clickNode ? clickNode.data.scriptId +clinkNodeChangeCount: 'jsonInput'}
                                defaultValue={debugValue}
                                options={{
                                    scrollBeyondLastLine: false,
                                    fontSize: 16,
                                }}
                            />
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                            Submit
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Collapse key={clickNode?.data.scriptId} onChange={handleCollapseChange} activeKey={activeKey}
                                  bordered={true} items={collapseItems}/>
                    </Form.Item>
                </Form>

            </Modal>


        </div>


    );
});

export default ManageModalEditor;

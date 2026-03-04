import React, {Suspense, useEffect, useRef, useState} from 'react';
import Editor, {Monaco} from '@monaco-editor/react';
import {compileGroovyScript, debugWorkflow} from "@/network/api.ts";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {TreeStore} from "@/store/TreeStore.ts";
import {observer} from "mobx-react";
import {
    CheckCircleFilledIcon,
    CopyFilledIcon,
    EditFilledIcon,
    FullscreenExitOutlinedIcon,
    FullscreenOutlinedIcon,
} from "@/components/ui/icons";
import AutoWidthInput from "@/components/editor/AutoWidthInput.tsx";
import * as d3 from 'd3';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {registerGroovyLanguageForMonaco} from "@/components/editor/style/groovy-language-definition-for-monaco.ts";
import {DebugRequest, WorkflowTaskLog} from "@/components/model/WorkflowModel.ts";
import {simpleGroovyFormatter} from "@/components/d3Helpers/treeHelpers.ts";
import CustomModal from "@/components/ui/CustomModal";
import CustomCollapse, {CollapseItem} from "@/components/ui/Collapse";
import {toast} from "@/components/ui/toast";

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
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [debugValue, setDebugValue] = useState('');
    const [debugOutput, setDebugOutput] = useState<WorkflowTaskLog | ''>('');
    const [activeKey, setActiveKey] = useState('');
    const [clinkNodeChangeCount, setClinkNodeChangeCount] = useState(0);

    const handleTitleChange = (newValue: string) => {
        setTitle(newValue);
    };

    const toggleEditing = () => {
        if (isEditing && clickNode) {
            clickNode.data.scriptName = title;
            treeStore.setClickNode(clickNode);
            d3.select(`#node-${clickNode.data.scriptId}`).select("text").text(clickNode.data.scriptName);
        }
        setIsEditing(!isEditing);
    };

    useEffect(() => {
        setTitle(clickNode?.data.scriptName || '');
        if (clickNode?.data.scriptText) {
            compileCode(clickNode.data.scriptText);
        }
        setDebugValue('');
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

    const handleDebug = async () => {
        clickNode!.data.scriptText = editorCode;
        setIsDebugVisible(true);
    };

    const handleSave = () => {
        if (clickNode) {
            clickNode.data.scriptText = editorCode;
            treeStore.setClickNode(clickNode);
            toast.success('暂存成功');
        }
    };

    const handleCopySuccess = () => {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 5000);
    };

    function handleClose() {
        treeStore.setClickNode(null);
        setClinkNodeChangeCount(prevCounter => prevCounter + 1);
        setTitle('');
        setEditorCode('');
    }

    function handleEditModalClose() {
        treeStore.setClickNode(null);
        setClinkNodeChangeCount(prevCounter => prevCounter + 1);
    }

    function handleEditorChange(value: string | undefined) {
        setEditorCode(value || '');
    }

    function handleDebugJsonChange(value: string | undefined) {
        setDebugValue(value || '');
    }

    let hasContextMenuBeenAdded = false;

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
        setEditorCode(editor.getValue());
        editor.onDidChangeModelContent(async () => {
            const code = editor.getValue();
            setEditorCode(code);
        });
        editor.onContextMenu((_event) => {
            if (!hasContextMenuBeenAdded) {
                editor.addAction({
                    id: 'groovy-format',
                    label: 'Format Code',
                    contextMenuGroupId: 'navigation',
                    contextMenuOrder: 1.5,
                    run: function (ed) {
                        const unformattedCode = ed.getValue();
                        const formattedCode = simpleGroovyFormatter(unformattedCode);
                        ed.setValue(formattedCode);
                    }
                });
                hasContextMenuBeenAdded = true;
            }
        });
    };

    function handleEditorWillMount(handleMonaco: Monaco) {
        registerGroovyLanguageForMonaco(handleMonaco);
    }

    function handleEditorValidation(markers: any[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        if (!isFullScreen) {
            setModalSize({width: '90vw', height: '100vh'});
        } else {
            setModalSize({width: '90vh', height: '80vh'});
        }
    };

    const editorHeight = isFullScreen ? 'calc(100vh - 320px)' : '50vh';

    const onFinish = (e: React.FormEvent) => {
        e.preventDefault();
        let debugRequest: DebugRequest = {
            scriptMetadata: {
                ...clickNode!.data,
                children: null
            },
            inputValues: debugValue ? JSON.parse(debugValue) : {}
        };
        debugWorkflow(debugRequest).then((r) => {
            const log = r["1"][0];
            log.scriptId = clickNode!.data.scriptId;
            log.scriptName = clickNode!.data.scriptName;
            setDebugOutput(log);
            setActiveKey(clickNode?.data.scriptId || '1');
        });
    };

    const collapseItems: CollapseItem[] = [
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
                defaultValue={debugOutput == '' ? '' : JSON.stringify(debugOutput, null, 2)}
            />,
        },
    ];

    const handleCollapseChange = (keys: string | string[]) => {
        let newActiveKey = '';
        if (Array.isArray(keys)) {
            newActiveKey = keys.includes(activeKey) ? '' : keys[0];
        } else {
            newActiveKey = activeKey === keys ? '1' : keys;
        }
        setActiveKey(newActiveKey);
    };

    // Descriptions-like key-value display
    const descRow = (label: string, children: React.ReactNode) => (
        <div style={{display: 'flex', alignItems: 'center', minHeight: 28, gap: 8, marginBottom: 4}}>
            <span style={{color: '#666', fontSize: 13, whiteSpace: 'nowrap', width: 90, flexShrink: 0}}>{label}</span>
            <div style={{flex: 1, minWidth: 0}}>{children}</div>
        </div>
    );

    const titleContent = (
        <div>
            {descRow("Node ID", (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span>{clickNode?.data.scriptId}</span>
                    <CopyToClipboard text={clickNode?.data.scriptId || ''} onCopy={handleCopySuccess}>
                        <span title="复制" style={{cursor: 'pointer', marginLeft: 4}}>
                            <CopyFilledIcon style={{color: 'gray', width: 14, height: 14}}/>
                        </span>
                    </CopyToClipboard>
                    {showConfirmation && (
                        <CheckCircleFilledIcon style={{color: '#36f33e', fontSize: '16px', width: 16, height: 16, marginLeft: 4}}/>
                    )}
                </div>
            ))}
            {descRow("Node Name", (
                <div style={{display: 'flex', alignItems: 'center', height: '22px'}}>
                    {isEditing ? (
                        <AutoWidthInput value={title} onChange={handleTitleChange} onFinish={toggleEditing}/>
                    ) : (
                        <>
                            <span style={{lineHeight: '32px'}}>{title}</span>
                            <span onClick={toggleEditing} style={{cursor: 'pointer', marginLeft: 'auto'}}>
                                <EditFilledIcon style={{width: 14, height: 14}}/>
                            </span>
                        </>
                    )}
                </div>
            ))}
            {descRow("Node Type", <span>{clickNode?.data.scriptType}</span>)}
            {descRow("Node Status", (
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                    <span style={{width: 8, height: 8, borderRadius: '50%', background: 'green', display: 'inline-block'}}/>
                    Running
                </span>
            ))}
            <button
                onClick={toggleFullScreen}
                style={{
                    position: 'absolute', right: 50, top: 13,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4,
                }}
            >
                {isFullScreen
                    ? <FullscreenExitOutlinedIcon style={{width: 16, height: 16}}/>
                    : <FullscreenOutlinedIcon style={{width: 16, height: 16}}/>
                }
            </button>
        </div>
    );

    const editorFooter = clickNode && clickNode.data.scriptType === 'Start' ? null : (
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
            <div style={{display: 'flex', gap: 8}}>
                <button onClick={handleCompile} style={btnStyle}>编译</button>
                <button onClick={handleDebug} style={btnStyle}>调试</button>
            </div>
            <div style={{display: 'flex', gap: 8}}>
                <button onClick={handleSave} style={btnStyle}>暂存</button>
                <button onClick={handleClose} style={btnStyle}>关闭</button>
            </div>
        </div>
    );

    return (
        <div>
            <CustomModal
                title={titleContent}
                open={treeStore.clickNode !== null}
                onCancel={handleEditModalClose}
                maskClosable={false}
                width={modalSize.width}
                footer={editorFooter}
                draggable
            >
                {!(clickNode && clickNode.data.scriptType === 'Start') && (
                    <div style={{
                        border: '1px solid #e1e4e8',
                        background: '#f6f8fa',
                        borderRadius: '4px',
                        padding: '10px',
                        height: editorHeight,
                    }}>
                        <Suspense fallback={<div>Loading Editor...</div>}>
                            {clickNode && clickNode.data.scriptType == "rule" ? (
                                <div>非rule类型或clickNode不存在时显示的内容{clickNode.data.scriptText}</div>
                            ) : (
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
                            )}
                        </Suspense>
                    </div>
                )}
            </CustomModal>

            <CustomModal
                title="Debug Node"
                open={isDebugVisible}
                onCancel={() => {
                    setIsDebugVisible(false);
                    setDebugOutput('');
                    setActiveKey('');
                }}
                maskClosable={false}
                footer={null}
                width={1000}
                style={{height: '95vh'}}
                draggable
            >
                <form onSubmit={onFinish} autoComplete="off" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div>
                        <label style={{display: 'block', marginBottom: 4, fontSize: 14}}>JSON Content</label>
                        <div style={{
                            border: '1px solid #e1e4e8',
                            background: '#f6f8fa',
                            borderRadius: '4px',
                            padding: '10px',
                        }}>
                            <Editor
                                height="300px"
                                defaultLanguage="json"
                                onChange={handleDebugJsonChange}
                                key={clickNode ? clickNode.data.scriptId + clinkNodeChangeCount : 'jsonInput'}
                                defaultValue={debugValue}
                                options={{scrollBeyondLastLine: false, fontSize: 16}}
                            />
                        </div>
                    </div>
                    <button type="submit" style={{...btnStyle, width: '100%'}}>Submit</button>
                    <CustomCollapse
                        key={clickNode?.data.scriptId}
                        onChange={handleCollapseChange}
                        activeKey={activeKey}
                        bordered={true}
                        items={collapseItems}
                    />
                </form>
            </CustomModal>
        </div>
    );
});

const btnStyle: React.CSSProperties = {
    padding: '6px 16px',
    background: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
};

export default ManageModalEditor;

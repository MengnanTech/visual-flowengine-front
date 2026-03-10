import React, {Suspense, useEffect, useRef, useState} from 'react';
import type {Monaco} from '@monaco-editor/react';
import type {editor} from 'monaco-editor';
import {compileGroovyScript, debugWorkflow} from '@/network/api.ts';
import {TreeStore} from '@/store/TreeStore.ts';
import {observer} from 'mobx-react';
import {
    CheckCircleFilledIcon,
    CopyFilledIcon,
    EditFilledIcon,
    FullscreenExitOutlinedIcon,
    FullscreenOutlinedIcon,
} from '@/components/ui/icons';
import AutoWidthInput from '@/components/editor/AutoWidthInput.tsx';
import * as d3 from 'd3';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {registerGroovyLanguageForMonaco} from '@/components/editor/style/groovy-language-definition-for-monaco.ts';
import {DebugRequest, WorkflowTaskLog} from '@/components/model/WorkflowModel.ts';
import {simpleGroovyFormatter} from '@/components/d3Helpers/treeHelpers.ts';
import CustomModal from '@/components/ui/CustomModal';
import CustomCollapse, {CollapseItem} from '@/components/ui/Collapse';
import {toast} from '@/components/ui/toast';
import {ensureMonacoSetup} from '@/components/editor/monacoSetup.ts';

interface ManageModalEditorProps {
    treeStore: TreeStore;
    readonly: boolean;
}

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const ManageModalEditor: React.FC<ManageModalEditorProps> = observer(({treeStore, readonly}) => {
    const clickNode = treeStore.clickNode;
    const [title, setTitle] = useState(clickNode?.data.scriptName || '');
    const [editorCode, setEditorCode] = useState(clickNode?.data.scriptText || '');
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const hasContextMenuBeenAdded = useRef(false);
    const [isMonacoReady, setIsMonacoReady] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isDebugVisible, setIsDebugVisible] = useState(false);
    const [modalSize, setModalSize] = useState({width: '90vh', height: '80vh'});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [debugValue, setDebugValue] = useState('');
    const [debugOutput, setDebugOutput] = useState<WorkflowTaskLog | ''>('');
    const [activeKey, setActiveKey] = useState('');

    useEffect(() => {
        if ((!clickNode && !isDebugVisible) || isMonacoReady) {
            return;
        }

        let disposed = false;

        ensureMonacoSetup().then(() => {
            if (!disposed) {
                setIsMonacoReady(true);
            }
        });

        return () => {
            disposed = true;
        };
    }, [clickNode, isDebugVisible, isMonacoReady]);

    useEffect(() => {
        setTitle(clickNode?.data.scriptName || '');
        setEditorCode(clickNode?.data.scriptText || '');
        setDebugValue('');
        setDebugOutput('');
        setActiveKey('');

        if (clickNode?.data.scriptText) {
            void compileCode(clickNode.data.scriptText);
        }
    }, [clickNode]);

    const handleTitleChange = (newValue: string) => {
        setTitle(newValue);
    };

    const toggleEditing = () => {
        if (isEditing && clickNode) {
            clickNode.data.scriptName = title;
            treeStore.setClickNode(clickNode);
            d3.select(`#node-${clickNode.data.scriptId}`).select('text').text(clickNode.data.scriptName);
        }

        setIsEditing(!isEditing);
    };

    const compileCode = async (code: string) => {
        const diagnostics = await compileGroovyScript(code);

        if (editorRef.current && monacoRef.current) {
            monacoRef.current.editor.setModelMarkers(editorRef.current.getModel()!, 'groovy', diagnostics);
        }
    };

    const handleCompile = async () => {
        await compileCode(editorCode);
    };

    const handleDebug = async () => {
        if (!clickNode) {
            return;
        }

        clickNode.data.scriptText = editorCode;
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

    const handleClose = () => {
        treeStore.setClickNode(null);
        setTitle('');
        setEditorCode('');
        setDebugValue('');
        setDebugOutput('');
        setActiveKey('');
    };

    const handleEditModalClose = () => {
        treeStore.setClickNode(null);
        setDebugValue('');
        setDebugOutput('');
        setActiveKey('');
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorCode(value || '');
    };

    const handleDebugJsonChange = (value: string | undefined) => {
        setDebugValue(value || '');
    };

    const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor) => {
        editorRef.current = editorInstance;

        editorInstance.onDidChangeModelContent(() => {
            setEditorCode(editorInstance.getValue());
        });

        editorInstance.onContextMenu(() => {
            if (hasContextMenuBeenAdded.current) {
                return;
            }

            editorInstance.addAction({
                id: 'groovy-format',
                label: 'Format Code',
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: (activeEditor) => {
                    const formattedCode = simpleGroovyFormatter(activeEditor.getValue());
                    activeEditor.setValue(formattedCode);
                },
            });

            hasContextMenuBeenAdded.current = true;
        });
    };

    const handleEditorWillMount = (handleMonaco: Monaco) => {
        monacoRef.current = handleMonaco;
        registerGroovyLanguageForMonaco(handleMonaco);
    };

    const handleEditorValidation = (markers: editor.IMarker[]) => {
        if (markers.length === 0) {
            return;
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        setModalSize(!isFullScreen ? {width: '90vw', height: '100vh'} : {width: '90vh', height: '80vh'});
    };

    const editorHeight = isFullScreen ? 'calc(100vh - 320px)' : '50vh';

    const onFinish = (event: React.FormEvent) => {
        event.preventDefault();

        if (!clickNode) {
            return;
        }

        const debugRequest: DebugRequest = {
            scriptMetadata: {
                ...clickNode.data,
                children: null,
            },
            inputValues: debugValue ? JSON.parse(debugValue) : {},
        };

        debugWorkflow(debugRequest).then((result) => {
            const log = result['1'][0];
            log.scriptId = clickNode.data.scriptId;
            log.scriptName = clickNode.data.scriptName;
            setDebugOutput(log);
            setActiveKey(clickNode.data.scriptId || '1');
        });
    };

    const collapseItems: CollapseItem[] = [
        {
            key: clickNode?.data.scriptId || '1',
            label: 'Debug Output',
            children: isMonacoReady ? (
                <Suspense fallback={<div>Loading editor...</div>}>
                    <MonacoEditor
                        height="30vh"
                        defaultLanguage="json"
                        options={{
                            contextmenu: true,
                            wordWrap: 'off',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontSize: 16,
                            readOnly: readonly,
                        }}
                        value={debugOutput === '' ? '' : JSON.stringify(debugOutput, null, 2)}
                    />
                </Suspense>
            ) : (
                <div>Loading editor...</div>
            ),
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

    const descRow = (label: string, children: React.ReactNode) => (
        <div style={{display: 'flex', alignItems: 'center', minHeight: 28, gap: 8, marginBottom: 4}}>
            <span style={{color: '#666', fontSize: 13, whiteSpace: 'nowrap', width: 90, flexShrink: 0}}>{label}</span>
            <div style={{flex: 1, minWidth: 0}}>{children}</div>
        </div>
    );

    const titleContent = (
        <div>
            {descRow('Node ID', (
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
            {descRow('Node Name', (
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
            {descRow('Node Type', <span>{clickNode?.data.scriptType}</span>)}
            {descRow('Node Status', (
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
                    <span style={{width: 8, height: 8, borderRadius: '50%', background: 'green', display: 'inline-block'}}/>
                    Running
                </span>
            ))}
            <button
                onClick={toggleFullScreen}
                style={{
                    position: 'absolute',
                    right: 50,
                    top: 13,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 4,
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
                                {clickNode && clickNode.data.scriptType === 'rule' ? (
                                    <div>非 rule 类型或 clickNode 不存在时显示的内容{clickNode.data.scriptText}</div>
                                ) : (
                                    <MonacoEditor
                                        height={editorHeight}
                                        value={editorCode}
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
                                    />
                                )}
                            </Suspense>
                        ) : (
                            <div>Loading editor...</div>
                        )}
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
                        <div
                            style={{
                                border: '1px solid #e1e4e8',
                                background: '#f6f8fa',
                                borderRadius: '4px',
                                padding: '10px',
                            }}
                        >
                            {isMonacoReady ? (
                                <Suspense fallback={<div>Loading editor...</div>}>
                                    <MonacoEditor
                                        height="300px"
                                        defaultLanguage="json"
                                        onChange={handleDebugJsonChange}
                                        value={debugValue}
                                        options={{scrollBeyondLastLine: false, fontSize: 16}}
                                    />
                                </Suspense>
                            ) : (
                                <div>Loading editor...</div>
                            )}
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

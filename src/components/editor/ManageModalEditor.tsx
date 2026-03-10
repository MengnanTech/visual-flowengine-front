import React, {Suspense, useEffect, useRef, useState} from 'react';
import type {Monaco} from '@monaco-editor/react';
import type {editor} from 'monaco-editor';
import {compileGroovyScript, debugWorkflow} from '@/network/api.ts';
import {TreeStore} from '@/store/TreeStore.ts';
import {observer} from 'mobx-react';
import * as d3 from 'd3';
import {registerGroovyLanguageForMonaco} from '@/components/editor/style/groovy-language-definition-for-monaco.ts';
import {DebugRequest, WorkflowTaskLog} from '@/components/model/WorkflowModel.ts';
import {simpleGroovyFormatter} from '@/components/d3Helpers/treeHelpers.ts';
import CustomModal from '@/components/ui/CustomModal';
import {toast} from '@/components/ui/toast';
import {ensureMonacoSetup} from '@/components/editor/monacoSetup.ts';
import EditorModalTitle from '@/components/editor/manage-modal/EditorModalTitle.tsx';
import EditorDebugModal from '@/components/editor/manage-modal/EditorDebugModal.tsx';
import EditorCodePanel from '@/components/editor/manage-modal/EditorCodePanel.tsx';
import type {CollapseItem} from '@/components/ui/Collapse';

interface ManageModalEditorProps {
    treeStore: TreeStore;
    readonly: boolean;
}

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));

const btnStyle: React.CSSProperties = {
    padding: '6px 16px',
    background: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
};

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

    const handleDebug = () => {
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

    const resetDebugState = () => {
        setDebugValue('');
        setDebugOutput('');
        setActiveKey('');
    };

    const handleClose = () => {
        treeStore.setClickNode(null);
        setTitle('');
        setEditorCode('');
        resetDebugState();
    };

    const handleEditModalClose = () => {
        treeStore.setClickNode(null);
        resetDebugState();
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
                title={(
                    <EditorModalTitle
                        clickNode={clickNode}
                        title={title}
                        isEditing={isEditing}
                        isFullScreen={isFullScreen}
                        showConfirmation={showConfirmation}
                        onTitleChange={setTitle}
                        onToggleEditing={toggleEditing}
                        onToggleFullScreen={toggleFullScreen}
                        onCopySuccess={handleCopySuccess}
                    />
                )}
                open={treeStore.clickNode !== null}
                onCancel={handleEditModalClose}
                maskClosable={false}
                width={modalSize.width}
                footer={editorFooter}
                draggable
            >
                <EditorCodePanel
                    clickNodeScriptType={clickNode?.data.scriptType}
                    clickNodeScriptText={clickNode?.data.scriptText}
                    isMonacoReady={isMonacoReady}
                    editorHeight={editorHeight}
                    editorCode={editorCode}
                    readonly={readonly}
                    onEditorChange={(value) => setEditorCode(value || '')}
                    onEditorDidMount={handleEditorDidMount}
                    onEditorWillMount={handleEditorWillMount}
                    onEditorValidate={() => {}}
                />
            </CustomModal>

            <EditorDebugModal
                open={isDebugVisible}
                isMonacoReady={isMonacoReady}
                debugValue={debugValue}
                debugOutput={debugOutput === '' ? '' : JSON.stringify(debugOutput, null, 2)}
                readonly={readonly}
                activeKey={activeKey}
                collapseItems={collapseItems}
                onCancel={() => {
                    setIsDebugVisible(false);
                    setDebugOutput('');
                    setActiveKey('');
                }}
                onSubmit={onFinish}
                onDebugJsonChange={(value) => setDebugValue(value || '')}
                onCollapseChange={handleCollapseChange}
            />
        </div>
    );
});

export default ManageModalEditor;

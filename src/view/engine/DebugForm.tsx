import React, {useState} from 'react';
import Editor from "@monaco-editor/react";
import {debugWorkflow} from "@/network/api.ts";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {DebugRequest, findNodeDataById, ScriptType, WorkflowTaskLog} from "@/components/model/WorkflowModel.ts";
import {CheckOutlinedIcon, EditOutlinedIcon} from "@/components/ui/icons";
import {toast} from "@/components/ui/toast";
import CustomCollapse, {CollapseItem} from "@/components/ui/Collapse";
import CustomTabs from "@/components/ui/Tabs";

interface DebugFormProps {
    treeChartState: TreeChartState;
}

const DebugForm: React.FC<DebugFormProps> = ({treeChartState}) => {

    const [activeTabKey, setActiveTabKey] = useState('1');
    const [editorValue, setEditorValue] = useState('');
    const [scriptId, setScriptId] = useState("1");
    const [isScriptIdEditable, setIsScriptIdEditable] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<string>('');
    const [generatedItems, setGeneratedItems] = useState<CollapseItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const toggleScriptIdEditability = () => {
        setIsScriptIdEditable((prev) => !prev);
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorValue(value || '');
    };

    const generateItemsNest = (debugResults: Record<string, WorkflowTaskLog[]>): CollapseItem[] => {
        return Object.entries(debugResults).flatMap(([step, logs]): CollapseItem[] => {
            if (logs.length > 1) {
                const scriptNames = logs.map(log => log.scriptName).join(", ");
                const children: CollapseItem[] = logs.map((log, index) => ({
                    key: `${step}-${index}`,
                    label: log.scriptType == ScriptType.End ? ScriptType.End.toString() : log.scriptName,
                    style: {backgroundColor: log.scriptRunResult == true ? '#c5f8ac' : 'inherit'},
                    children: (
                        <Editor
                            key={Math.random()}
                            height={"30vh"}
                            defaultLanguage="json"
                            options={{
                                contextmenu: true,
                                wordWrap: 'off',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontSize: 16,
                                readOnly: true,
                            }}
                            defaultValue={JSON.stringify(log, null, 2)}
                        />
                    ),
                }));

                return [{
                    key: step,
                    label: (
                        <span>
                            <span style={{color: 'red'}}>({scriptNames}){` level:${step}`}</span>
                        </span>
                    ),
                    children: <CustomCollapse size="small" defaultActiveKey={[step]} items={children}/>,
                }];
            } else if (logs.length === 1) {
                const log = logs[0];
                const label = log.scriptType == ScriptType.End ? ScriptType.End.toString() : log.scriptName;
                const content = log.scriptType === ScriptType.End ? (
                    <div><p>Status: {log.scriptRunStatus}</p></div>
                ) : (
                    <Editor
                        key={Math.random()}
                        height={"30vh"}
                        defaultLanguage="json"
                        options={{
                            contextmenu: true,
                            wordWrap: 'off',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontSize: 16,
                            readOnly: true,
                        }}
                        defaultValue={JSON.stringify(log, null, 2)}
                    />
                );
                return [{key: step, label, children: content}];
            }
            return [];
        });
    };

    const onFinish = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const formValues: Record<string, string> = {};
        formData.forEach((value, key) => {
            if (key !== 'jsonInput') formValues[key] = value as string;
        });

        const nodeData = findNodeDataById(treeChartState.currentData!.scriptMetadata!, scriptId);
        if (!nodeData) {
            toast.error('Script ID not found');
            setLoading(false);
            return;
        }

        let debugRequest: DebugRequest;
        if (activeTabKey === '1') {
            debugRequest = {scriptMetadata: nodeData, inputValues: formValues};
        } else {
            debugRequest = {scriptMetadata: nodeData, inputValues: editorValue ? JSON.parse(editorValue) : {}};
        }

        setExpandedKeys('');
        debugWorkflow(debugRequest).then(r => {
            const itemsNest = generateItemsNest(r);
            setGeneratedItems(itemsNest);
            setLoading(false);
            setTimeout(() => setExpandedKeys('1'), 100);
        }).catch(error => {
            console.error('Debug workflow failed:', error);
            toast.error('流程出现系统内部异常');
            setLoading(false);
        });
    };

    const items: CollapseItem[] = [
        {
            key: '1',
            label: 'Debug Output',
            children: <CustomCollapse size="small" defaultActiveKey="1" items={generatedItems}/>,
        }
    ];

    const handleCollapseChange = (keys: string | string[]) => {
        let newActiveKey = '';
        if (Array.isArray(keys)) {
            newActiveKey = keys.includes(expandedKeys) ? '' : keys[0];
        } else {
            newActiveKey = expandedKeys === keys ? '1' : keys;
        }
        setExpandedKeys(newActiveKey);
    };

    const tabItems = [
        {
            label: 'Form Fields',
            key: '1',
            children: (
                <div>
                    {treeChartState.currentData.workflowParameters && treeChartState.currentData.workflowParameters.map((field) => (
                        <div key={field.parameterName} style={{marginBottom: 12}}>
                            <label style={{display: 'block', marginBottom: 4, fontSize: 14}}>
                                {field.parameterName}{'  '}
                                <span style={{color: "red"}}>({field.parameterType})</span>
                            </label>
                            <input
                                name={field.parameterName}
                                placeholder={`Enter ${field.parameterName}`}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    ))}
                </div>
            ),
        },
        {
            label: 'JSON Input',
            key: '2',
            children: (
                <div style={{marginBottom: 12}}>
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
                            onChange={handleEditorChange}
                            options={{scrollBeyondLastLine: false, fontSize: 16}}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <form onSubmit={onFinish} autoComplete="off">
            <div style={{marginBottom: 12}}>
                <label style={{display: 'block', marginBottom: 4, fontSize: 14}}>Script ID</label>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <input
                        value={scriptId}
                        onChange={(e) => setScriptId(e.target.value)}
                        disabled={!isScriptIdEditable}
                        style={{
                            flex: 1,
                            padding: '6px 10px',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px 0 0 4px',
                            fontSize: 14,
                            boxSizing: 'border-box',
                        }}
                    />
                    <button
                        type="button"
                        onClick={toggleScriptIdEditability}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #d9d9d9',
                            borderLeft: 'none',
                            borderRadius: '0 4px 4px 0',
                            background: '#fafafa',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {isScriptIdEditable
                            ? <CheckOutlinedIcon style={{width: 14, height: 14}}/>
                            : <EditOutlinedIcon style={{width: 14, height: 14}}/>
                        }
                    </button>
                </div>
            </div>

            <CustomTabs items={tabItems} defaultActiveKey="1" onChange={setActiveTabKey}/>

            <div style={{marginBottom: 12}}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: loading ? '#91caff' : '#1890ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? '调试中...' : '调试'}
                </button>
            </div>

            <CustomCollapse onChange={handleCollapseChange} size="small" activeKey={expandedKeys} items={items}/>
        </form>
    );
};

export default DebugForm;

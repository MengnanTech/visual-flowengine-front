import React, {useState} from 'react';
import {Button, Col, Collapse, CollapseProps, Form, Input, message, Row, Tabs} from 'antd';
import Editor from "@monaco-editor/react";
import {debugWorkflow} from "@/network/api.ts";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {DebugRequest, findNodeDataById, WorkflowTaskLog} from "@/components/model/WorkflowModel.ts";
import {CheckOutlined, EditOutlined} from "@ant-design/icons";
import {ItemType} from "rc-collapse/es/interface";

interface DebugFormProps {
    treeChartState: TreeChartState;
}

const DebugForm: React.FC<DebugFormProps> = ({treeChartState}) => {

    const [activeTabKey, setActiveTabKey] = useState('1');
    const [editorValue, setEditorValue] = useState('');
    const [scriptId, setScriptId] = useState("1");
    const [isScriptIdEditable, setIsScriptIdEditable] = useState(false);
    // const [debugResults, setDebugResults] = useState<Record<string, WorkflowTaskLog[]>>({});
    const [expandedKeys, setExpandedKeys] = useState<string>('');
    const [generatedItems, setGeneratedItems] = useState<ItemType[]>([]);

    const [loading, setLoading] = useState<boolean>(false);


    const toggleScriptIdEditability = () => {
        setIsScriptIdEditable((prevEditable) => !prevEditable);
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorValue(value || '');
    };

    const generateItemsNest = (debugResults: Record<string, WorkflowTaskLog[]>) => {
        return Object.entries(debugResults).flatMap(([step, logs]) => {
            // 当一个步骤中有多个WorkflowTaskLog对象
            if (logs.length > 1) {
                const scriptNames = logs.map(log => log.scriptName).join(", ");
                const children = logs.map((log, index) => {

                    return {
                        key: `${step}-${index}`,
                        label: log.scriptName,
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


                            // <div>
                            //     <p>Status: {log.scriptRunStatus}</p>
                            //     <p >Result: {JSON.stringify(log.scriptRunResult)}</p>
                            //     {/* 其他需要显示的信息 */}
                            // </div>
                        ),
                    } as ItemType;
                });
                const label = (
                    <React.Fragment>
                        {`Condition: `}
                        <span style={{color: 'red'}}>({scriptNames})-{` ${step}`}</span>
                    </React.Fragment>
                );
                return [{
                    key: step,
                    label: label,
                    children: <Collapse size="small" defaultActiveKey={[step]} items={children}/>,
                } as ItemType];
            }
            // 当只有一个WorkflowTaskLog对象
            else if (logs.length === 1) {
                const log = logs[0];
                // 注意这里的逻辑，确保它符合您的要求
                const label = log.scriptRunStatus === 'End' ? 'End' : log.scriptName;

                const content = log.scriptRunStatus === 'End' ? (
                    <div>
                        <p>Status: {log.scriptRunStatus}</p>
                    </div>
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
                return [{
                    key: step,
                    label: label,
                    children: content,
                } as ItemType];
            }
            return [];
        });
    };

    const onFinish = (values: any) => {
        setLoading(true);
        const {jsonInput, ...inputValuesWithoutJsonInput} = values;

        const nodeData = findNodeDataById(treeChartState.currentData!.scriptMetadata!, scriptId);
        if (!nodeData) {
            message.error('Script ID not found').then(r => r);
            setLoading(false);
            return;
        }

        let debugRequest: DebugRequest;
        if (activeTabKey === '1') {

            debugRequest = {
                scriptMetadata: nodeData,
                inputValues: inputValuesWithoutJsonInput
            }
        } else {
            debugRequest = {
                scriptMetadata: nodeData,
                inputValues: editorValue ? JSON.parse(editorValue) : {}
            }
        }

        setExpandedKeys('');
        debugWorkflow(debugRequest).then(
            r => {

                const itemsNest = generateItemsNest(r); // 确保generateItemsNest能够接收debugResults作为参数
                setGeneratedItems(itemsNest);
                setLoading(false);
                setTimeout(
                    () => setExpandedKeys('1'),
                    100
                );

            }
        )
    };

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Debug Output',
            children: <Collapse size="small" defaultActiveKey="1" items={generatedItems}/>,
        }
    ];


    const handleCollapseChange = (keys: string | string[]) => {
        let newActiveKey = '';

        if (Array.isArray(keys)) {
            // 如果 keys 是数组，检查 activeKey 是否在其中，逻辑假定只处理单个面板逻辑
            newActiveKey = keys.includes(expandedKeys) ? '' : keys[0];
        } else {
            // 如果 keys 不是数组，直接比较
            newActiveKey = expandedKeys === keys ? '1' : keys;
        }

        setExpandedKeys(newActiveKey);
    };
    const tabItems = [
        {
            label: 'Form Fields',
            key: '1',
            children: (
                <Row gutter={16}>
                    {treeChartState.currentData.workflowParameters && treeChartState.currentData.workflowParameters.map((field) => (
                        <Col span={24} key={field.parameterName}>
                            <Form.Item
                                label={
                                    <div>
                                        {field.parameterName}{'      '}
                                        <span style={{color: "red"}}> ({field.parameterType})</span>
                                    </div>
                                }
                                name={field.parameterName}
                            >
                                <Input placeholder={`Enter ${field.parameterName}`}/>
                            </Form.Item>
                        </Col>
                    ))}

                </Row>

            ),
        },
        {
            label: 'JSON Input',
            key: '2',
            children: (
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
                            onChange={handleEditorChange}
                            options={{
                                scrollBeyondLastLine: false,
                                fontSize: 16,
                            }}
                        />
                    </div>
                </Form.Item>
            ),
        },
    ];
    return (
        <Form
            name="basic"
            autoComplete="off"
            layout="vertical"
            onFinish={onFinish}
        >
            <Form.Item label="Script ID">
                <Input
                    value={scriptId}
                    onChange={(e) => setScriptId(e.target.value)}
                    disabled={!isScriptIdEditable}
                    addonAfter={
                        isScriptIdEditable ? (
                            <CheckOutlined onClick={toggleScriptIdEditability}/>
                        ) : (
                            <EditOutlined onClick={toggleScriptIdEditability}/>
                        )
                    }
                />
            </Form.Item>

            <Tabs items={tabItems} defaultActiveKey="1" type="card" onChange={setActiveTabKey}/>
            <Form.Item>
                <Button type="primary" loading={loading} htmlType="submit" style={{width: '100%'}}>
                    调试
                </Button>
            </Form.Item>
            <Collapse  onChange={handleCollapseChange} size="small" activeKey={expandedKeys} items={items}/>

        </Form>
    );
};

export default DebugForm;

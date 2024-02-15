import React, {useState} from 'react';
import {Form, Input, Button, Tabs, Row, Col, message, CollapseProps, Collapse} from 'antd';
import Editor from "@monaco-editor/react";
import style from './styles/DebugForm.module.scss';
import {debugWorkflow} from "@/network/api.ts";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {DebugRequest, findNodeDataById, WorkflowTaskLog} from "@/components/model/WorkflowModel.ts";
import {CheckOutlined, EditOutlined} from "@ant-design/icons";
import {ItemType} from "rc-collapse/es/interface";
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));


interface DebugFormProps {
    treeChartState: TreeChartState;
}

const DebugForm: React.FC<DebugFormProps> = ({treeChartState}) => {

    const [activeTabKey, setActiveTabKey] = useState('1');
    const [editorValue, setEditorValue] = useState('');
    const [scriptId, setScriptId] = useState("1");
    const [isScriptIdEditable, setIsScriptIdEditable] = useState(false);
    const [debugResults, setDebugResults] = useState<Record<string, WorkflowTaskLog[]>>({});

    const toggleScriptIdEditability = () => {
        setIsScriptIdEditable((prevEditable) => !prevEditable);
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorValue(value || '');
    };

    const generateItemsNest = () => {
        return Object.entries(debugResults).flatMap(([step, logs]) => {
            // 当一个步骤中有多个WorkflowTaskLog对象
            if (logs.length > 1) {
                const scriptNames = logs.map(log => log.scriptName).join(", ");
                const children = logs.map((log, index) => {
                    // 根据log.scriptRunResult的值动态设置文本颜色
                    // const resultColor = log.scriptRunResult === true ? 'green' : 'inherit'; // 假设true时为绿色
                    return {
                        key: `${step}-${index}`,
                        label: log.scriptName,
                        style: {backgroundColor:  log.scriptRunResult == true ? '#c5f8ac' : 'inherit'},
                        children: (


                            <MonacoEditor
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
                        <span style={{ color: 'red' }}>({scriptNames})-{` ${step}`}</span>
                    </React.Fragment>
                );
                return [{
                    key: step,
                    label: label,
                    children: <Collapse size="small" defaultActiveKey={[step]} items={children} />,
                }as ItemType];
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
                    <MonacoEditor
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
                }as ItemType];
            }
            return [];
        });
    };

    const onFinish = (values: any) => {
        const {...inputValuesWithoutJsonInput} = values;

        const nodeData = findNodeDataById(treeChartState.currentData.scriptMetadata, scriptId);
        if (!nodeData) {
            message.error('Script ID not found').then(r => r);
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

        debugWorkflow(debugRequest).then(
            r => {
                setDebugResults(r);
            }
        )
    };

    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: 'Debug Output',
            children: <Collapse size="small" defaultActiveKey="1" items={generateItemsNest()} />,
        }
    ];

    const tabItems = [
        {
            label: 'Form Fields',
            key: '1',
            children: (
                <Row gutter={16}>
                    {treeChartState.currentData.workflowParameters.map((field) => (
                        <Col span={24} key={field.parameterName} className={style.formFieldColumn}>
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
            className={style.debugForm}
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
                <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                    Submit
                </Button>
            </Form.Item>
            <Collapse size="small" items={items} />
        </Form>
    );
};

export default DebugForm;

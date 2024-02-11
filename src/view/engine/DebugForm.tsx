import React, {useState} from 'react';
import {Form, Input, Button, Tabs, Row, Col, message} from 'antd';
import Editor from "@monaco-editor/react";
import style from './styles/DebugForm.module.scss';
import {debugWorkflow} from "@/network/api.ts";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {DebugRequest, findNodeDataById} from "@/components/model/WorkflowModel.ts";
import {CheckOutlined, EditOutlined} from "@ant-design/icons";


interface DebugFormProps {
    treeChartState: TreeChartState;
}

const DebugForm: React.FC<DebugFormProps> = ({treeChartState}) => {

    const [activeTabKey, setActiveTabKey] = useState('1');
    const [editorValue, setEditorValue] = useState('');
    const [scriptId, setScriptId] = useState("1");
    const [isScriptIdEditable, setIsScriptIdEditable] = useState(false);

    const toggleScriptIdEditability = () => {
        setIsScriptIdEditable((prevEditable) => !prevEditable);
    };

    const handleEditorChange = (value: string | undefined) => {
        setEditorValue(value || '');
    };

    const onFinish = (values: any) => {
        const {jsonInput, ...inputValuesWithoutJsonInput} = values;

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
                if (r) {
                    message.success('调试成功').then(r => r);
                } else {
                    message.error('调试失败').then(r => r);
                }
            }
        )
    };


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
        </Form>
    );
};

export default DebugForm;

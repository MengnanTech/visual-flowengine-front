import React, {useState} from 'react';
import {Form, Input, Button, Tabs, Row, Col, message} from 'antd';
import Editor from "@monaco-editor/react";
import style from './styles/DebugForm.module.scss';
import {debugWorkflow} from "@/network/api.ts";
import {TreeChartState} from "@/components/D3Node/NodeModel.ts";
import {DebugRequest} from "@/components/model/WorkflowModel.ts";


interface DebugFormProps {
    treeChartState: TreeChartState;
}

const DebugForm: React.FC<DebugFormProps> = ({treeChartState}) => {

    const [activeTabKey, setActiveTabKey] = useState('1');

    const onFinish = (values: any) => {
        console.log('Success:', values);
        const { jsonInput, ...inputValuesWithoutJsonInput } = values;
        let debugRequest: DebugRequest;
        if (activeTabKey === '1') {

            debugRequest = {
                scriptMetadata: treeChartState.currentData.scriptMetadata,
                inputValues: inputValuesWithoutJsonInput
            }
        } else  {
            debugRequest = {
                scriptMetadata: treeChartState.currentData.scriptMetadata,
                inputValues: JSON.parse(jsonInput)
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
                                    <div >
                                        {field.parameterName}{'      '}
                                        <span style={{color:"red"}}> ({field.parameterType})</span>
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
                    <Editor
                        height="500px"
                        defaultLanguage="json"
                        options={{
                            scrollBeyondLastLine: false,
                            fontSize: 16,
                        }}
                    />
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

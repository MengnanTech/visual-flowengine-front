
import React from 'react';
import { Descriptions, Input, Select, Button, Space, Collapse } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { DataTypes } from '@/components/d3Helpers/treeHelpers.ts';
import { WorkflowMetadata, Parameter } from '@/components/model/WorkflowModel.ts';
import styles from '../styles/ArrangeIndex.module.scss';

interface WorkflowDetailsProps {
  treeData: WorkflowMetadata;
  isEditMode: boolean;
  editedPurpose: string;
  setEditedPurpose: (value: string) => void;
  editedParameters: Parameter[];
  setEditedParameters: (value: Parameter[]) => void;
  editedRemark: string;
  setEditedRemark: (value: string) => void;
  toggleEditMode: () => void;
}

const WorkflowDetails: React.FC<WorkflowDetailsProps> = ({
  treeData,
  isEditMode,
  editedPurpose,
  setEditedPurpose,
  editedParameters,
  setEditedParameters,
  editedRemark,
  setEditedRemark,
  toggleEditMode,
}) => {
  const descriptionsItems = [
    {
      key: 'workflowId',
      label: 'Workflow ID',
      children: <div className={styles.workflowId}>{treeData.workflowId}</div>,
    },
    {
      key: 'workflowName',
      label: 'Workflow Name',
      children: <div className={styles.workflowName}>{treeData.workflowName}</div>,
    },
    {
      key: 'purpose',
      label: 'Purpose',
      children: isEditMode ? (
        <Input value={editedPurpose} onChange={(e) => setEditedPurpose(e.target.value)} />
      ) : (
        editedPurpose
      ),
    },
    {
      key: 'workflowParameters',
      label: 'Parameters',
      children: isEditMode ? (
        <div>
          {editedParameters.map((param, index) => (
            <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Input
                placeholder="Parameter Name"
                value={param.parameterName}
                onChange={(e) => {
                  const newParams = [...editedParameters];
                  newParams[index].parameterName = e.target.value;
                  setEditedParameters(newParams);
                }}
              />
              <Select
                value={param.parameterType}
                onChange={(value) => {
                  const newParams = [...editedParameters];
                  newParams[index].parameterType = value;
                  setEditedParameters(newParams);
                }}
                options={DataTypes.map((type) => ({ value: type, label: type }))}
                style={{ width: 120 }}
              />
              <MinusCircleOutlined onClick={() => {
                const newParams = [...editedParameters];
                newParams.splice(index, 1);
                setEditedParameters(newParams);
              }} />
            </Space>
          ))}
          <Button
            type="dashed"
            onClick={() => setEditedParameters([...editedParameters, { parameterName: '', parameterType: 'String' }])}
            block
            icon={<PlusOutlined />}
          >
            Add Parameter
          </Button>
        </div>
      ) : (
        editedParameters.map((param, index) => (
          <div key={index}>{`${param.parameterName}: ${param.parameterType}`}</div>
        ))
      ),
    },
    {
      key: 'remark',
      label: 'Remark',
      span: 2,
      children: isEditMode ? (
        <Input.TextArea value={editedRemark} onChange={(e) => setEditedRemark(e.target.value)} />
      ) : (
        editedRemark
      ),
    },
  ];

  const collapseItems = [
    {
      key: treeData.workflowId,
      label: (
        <div style={{ fontSize: '18px', paddingLeft: '20px' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>{treeData.workflowName}</span>
          <span style={{ color: 'red' }}>(ID: {treeData.workflowId})</span>
        </div>
      ),
      children: (
        <Descriptions
          title="Workflow Details"
          bordered
          size="small"
          items={descriptionsItems}
          extra={<Button type="primary" onClick={toggleEditMode}>{isEditMode ? 'Save' : 'Edit'}</Button>}
        />
      ),
    },
  ];

  return <Collapse bordered={false} size="small" expandIconPosition="end" items={collapseItems} />;
};

export default WorkflowDetails;


import React from 'react';
import { Modal, Form, Input, Button, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { DataTypes } from '@/components/d3Helpers/treeHelpers.ts';
import { WorkflowCreateRequest } from '@/components/model/WorkflowModel.ts';

interface AddWorkflowModalProps {
  isModalVisible: boolean;
  handleModalSubmit: (values: WorkflowCreateRequest) => void;
  handleModalCancel: () => void;
}

const AddWorkflowModal: React.FC<AddWorkflowModalProps> = ({
  isModalVisible,
  handleModalSubmit,
  handleModalCancel,
}) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    handleModalSubmit(values as WorkflowCreateRequest);
    form.resetFields();
  };

  return (
    <Modal
      title="Add Workflow"
      open={isModalVisible}
      onOk={form.submit}
      onCancel={handleModalCancel}
      okText="Submit"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="workflowName"
          label="Workflow Name"
          rules={[{ required: true, message: 'Please input the workflow name!' }]}
        >
          <Input placeholder="Enter workflow name" />
        </Form.Item>
        <Form.Item
          name="workflowPurpose"
          label="Workflow Purpose"
          rules={[{ required: true, message: 'Please input the purpose of the workflow!' }]}
        >
          <Input placeholder="Describe the purpose and use case of the workflow" />
        </Form.Item>
        <Form.List name="workflowParameters">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'parameterName']}
                    rules={[{ required: true, message: 'Missing parameter name' }]}
                  >
                    <Input placeholder="Parameter Name" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'parameterType']}
                    rules={[{ required: true, message: 'Missing parameter type' }]}
                  >
                    <Select options={DataTypes.map((type) => ({ value: type, label: type }))} style={{ width: 120 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Parameter
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item name="remark" label="Remark">
          <Input.TextArea placeholder="Detailed remark content" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddWorkflowModal;


import { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  ListWorkflow,
  getWorkflowMetadata,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '@/network/api';
import {
  MenuItemsIdAndName,
  WorkflowMetadata,
  WorkflowCreateRequest,
} from '@/components/model/WorkflowModel.ts';

export const useWorkflow = (
  isEditMode: boolean,
  setIsEditMode: (isEditMode: boolean) => void
) => {
  const [menuItems, setMenuItems] = useState<MenuItemsIdAndName[]>([]);
  const [treeData, setTreeData] = useState<WorkflowMetadata | null>(null);
  const [keyValue, setKeyValue] = useState<string>('');

  const fetchMenuItems = async () => {
    try {
      const workflowMetadata = await ListWorkflow();
      setMenuItems(workflowMetadata);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleMenuClick = async (e: any) => {
    if (e.key === keyValue) {
      return;
    }
    if (e.key === undefined) {
      message.error('Menu item key is undefined');
      return;
    }
    if (isEditMode) {
      setIsEditMode(false);
    }
    setKeyValue(e.key);
    const workflowMetadata = await getWorkflowMetadata(Number(e.key));
    setTreeData(workflowMetadata);
  };

  const handleCreateWorkflow = async (values: WorkflowCreateRequest) => {
    try {
      await createWorkflow(values);
      await fetchMenuItems();
    } catch (error) {
      message.error('Failed to create workflow');
    }
  };

  const handleUpdateWorkflow = async (workflowId: number, data: Partial<WorkflowMetadata>) => {
    try {
      const updatedData = { ...treeData, ...data, workflowId };
      const result = await updateWorkflow(updatedData as WorkflowMetadata);
      setTreeData(result);
      await fetchMenuItems();
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    try {
      await deleteWorkflow(workflowId);
      setTreeData(null);
      await fetchMenuItems();
      message.success('删除成功');
    } catch (err: any) {
      message.error(`删除失败: ${err.message}`);
    }
  };

  const resetWorkflow = () => {
    setTreeData(null);
    setKeyValue('');
  };

  return {
    menuItems,
    treeData,
    keyValue,
    setTreeData,
    handleMenuClick,
    handleCreateWorkflow,
    handleUpdateWorkflow,
    handleDeleteWorkflow,
    resetWorkflow,
  };
};

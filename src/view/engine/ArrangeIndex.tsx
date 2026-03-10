import React, {Suspense, useEffect, useRef, useState} from 'react';

import {TreeStore} from '@/store/TreeStore';
import styles from './styles/ArrangeIndex.module.scss';
import {
    MenuItemsIdAndName,
    WorkflowCreateRequest,
    WorkflowMetadata,
} from '@/components/model/WorkflowModel.ts';
import {
    createWorkflow,
    deleteWorkflow,
    getWorkflowMetadata,
    ListWorkflow,
    updateWorkflow,
} from '@/network/api.ts';

import Sidebar from './sidebar/Sidebar';
import NewWorkflowModal from './sidebar/NewWorkflowModal';
import {toast} from '@/components/ui/toast';

const TreeChart = React.lazy(() => import('./TreeChart'));

const ArrangeIndex: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItemsIdAndName[]>([]);
    const [treeData, setTreeData] = useState<WorkflowMetadata | null>(null);
    const [siderWidth, setSiderWidth] = useState(280);
    const [keyValue, setKeyValue] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const treeStoreRef = useRef<TreeStore | null>(null);

    if (!treeStoreRef.current) {
        treeStoreRef.current = new TreeStore();
    }

    const treeStore = treeStoreRef.current;

    const fetchMenuItems = async () => {
        try {
            const workflowMetadata = await ListWorkflow();
            setMenuItems(workflowMetadata);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const handleSelect = async (item: MenuItemsIdAndName) => {
        const key = String(item.workflowId);
        if (key === keyValue) return;
        setKeyValue(key);
        try {
            const workflowMetadata = await getWorkflowMetadata(item.workflowId);
            setTreeData(workflowMetadata);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleRename = async (id: number, newName: string) => {
        try {
            await updateWorkflow({workflowId: id, workflowName: newName});
            setKeyValue('');
            setTreeData(null);
            await fetchMenuItems();
        } catch (err: any) {
            toast.error(`重命名失败: ${err.message}`);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteWorkflow(id);
            setTreeData(null);
            await fetchMenuItems();
            toast.success('删除成功');
        } catch (err: any) {
            toast.error(`删除失败: ${err.message}`);
        }
    };

    const handleCreateWorkflow = async (data: WorkflowCreateRequest) => {
        await createWorkflow(data);
        await fetchMenuItems();
        setIsModalVisible(false);
    };

    const handleLogoClick = () => {
        setTreeData(null);
        setKeyValue('');
    };

    useEffect(() => {
        treeStore.setSiderWidth(siderWidth);
    }, [siderWidth, treeStore]);

    useEffect(() => {
        treeStore.setTreeData(treeData);
    }, [treeData, treeStore]);

    return (
        <div className={styles.layout}>
            <Sidebar
                width={siderWidth}
                onWidthChange={setSiderWidth}
                items={menuItems}
                selectedKey={keyValue}
                onSelect={handleSelect}
                onAddWorkflow={() => setIsModalVisible(true)}
                onRename={handleRename}
                onDelete={handleDelete}
                onLogoClick={handleLogoClick}
            />

            <div className={styles.contentArea} style={{marginLeft: siderWidth}}>
                <div className={styles.treeContainer}>
                    <Suspense fallback={<div>Loading...</div>}>
                        {treeData ? (
                            <TreeChart
                                treeStore={treeStore}
                                initialData={treeData}
                                updateTreeData={setTreeData}
                            />
                        ) : (
                            <div className={styles.placeholder}>
                                <span>请选择左侧列表中的一个工作流查看详情</span>
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>

            {isModalVisible && (
                <NewWorkflowModal
                    onSubmit={handleCreateWorkflow}
                    onClose={() => setIsModalVisible(false)}
                />
            )}
        </div>
    );
};

export default ArrangeIndex;

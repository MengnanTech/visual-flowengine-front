import React, {Suspense, useEffect, useMemo, useRef, useState} from 'react';
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
    const [drawerWidth, setDrawerWidth] = useState(320);
    const [keyValue, setKeyValue] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isWorkflowDrawerOpen, setIsWorkflowDrawerOpen] = useState(false);
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

    const currentWorkflowName = useMemo(() => {
        return menuItems.find((item) => String(item.workflowId) === keyValue)?.workflowName || '未选择流程';
    }, [keyValue, menuItems]);

    const handleSelect = async (item: MenuItemsIdAndName) => {
        const key = String(item.workflowId);
        if (key === keyValue) {
            setIsWorkflowDrawerOpen(false);
            return;
        }

        setKeyValue(key);
        try {
            const workflowMetadata = await getWorkflowMetadata(item.workflowId);
            setTreeData(workflowMetadata);
            setIsWorkflowDrawerOpen(false);
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
        setIsWorkflowDrawerOpen(true);
    };

    const handleLogoClick = () => {
        setTreeData(null);
        setKeyValue('');
        setIsWorkflowDrawerOpen(false);
    };

    useEffect(() => {
        treeStore.setSiderWidth(0);
    }, [treeStore]);

    useEffect(() => {
        treeStore.setTreeData(treeData);
    }, [treeData, treeStore]);

    return (
        <div className={styles.layout}>
            <div className={styles.contentArea}>
                <div className={styles.globalToolbar}>
                    <div className={styles.toolbarGroup}>
                        <button className={styles.toolbarButton} onClick={() => setIsWorkflowDrawerOpen(true)}>
                            Workflows
                        </button>
                        <button className={styles.toolbarButtonSecondary} onClick={() => setIsModalVisible(true)}>
                            + New Workflow
                        </button>
                    </div>

                    <div className={styles.workflowBadge}>
                        <span className={styles.workflowBadgeLabel}>Current</span>
                        <strong>{currentWorkflowName}</strong>
                    </div>
                </div>

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
                                <span>先打开左上角工作流列表，再选择一个流程开始编辑。</span>
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>

            {isWorkflowDrawerOpen && (
                <div className={styles.drawerBackdrop} onClick={() => setIsWorkflowDrawerOpen(false)}>
                    <div className={styles.drawerShell}>
                        <Sidebar
                            floating
                            showCreateButton={false}
                            width={drawerWidth}
                            onWidthChange={setDrawerWidth}
                            items={menuItems}
                            selectedKey={keyValue}
                            onSelect={handleSelect}
                            onAddWorkflow={() => setIsModalVisible(true)}
                            onRename={handleRename}
                            onDelete={handleDelete}
                            onLogoClick={handleLogoClick}
                        />
                    </div>
                </div>
            )}

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

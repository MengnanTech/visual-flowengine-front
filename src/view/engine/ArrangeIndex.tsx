import React, {Suspense, useEffect, useMemo, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {
    Col,
    Dropdown,
    Input,
    MenuProps,
    Modal,
    Popover,
    Row,
    Slider,
} from 'antd';
import {
    EnvironmentOutlined,
    SettingFilled,
    SettingOutlined
} from '@ant-design/icons';
import {TreeStore} from '@/store/TreeStore';
import styles from './styles/ArrangeIndex.module.scss';
import logo from '@/assets/logo/logo.jpeg';
import {
    WorkflowMetadata
} from "@/components/model/WorkflowModel.ts";
import WorkflowDetails from './components/WorkflowDetails';
import AddWorkflowModal from './components/AddWorkflowModal';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useUIState } from '@/hooks/useUIState';
import { Parameter } from '@/components/model/WorkflowModel.ts';

const TreeChart = React.lazy(() => import('./TreeChart'));

const ArrangeIndex: React.FC = () => {
    const {
        siderWidth,
        setSiderWidth,
        isModalVisible,
        setIsModalVisible,
        popoverVisible,
        setPopoverVisible,
        isMenuDropdownVisible,
        setIsMenuDropdownVisible,
        singleDropdownVisible,
        editingKey,
        setEditingKey,
        updateCounter,
        forceUpdateTreeChart,
        isEditMode,
        toggleEditMode,
        handleVisibleChange,
    } = useUIState();

    const {
        menuItems,
        treeData,
        setTreeData,
        handleMenuClick,
        handleCreateWorkflow,
        handleUpdateWorkflow,
        handleDeleteWorkflow,
        resetWorkflow,
    } = useWorkflow(isEditMode, toggleEditMode);


    const [editedPurpose, setEditedPurpose] = useState('');
    const [editedParameters, setEditedParameters] = useState<Parameter[]>([]);
    const [editedRemark, setEditedRemark] = useState('');

    useEffect(() => {
        if (treeData) {
            setEditedPurpose(treeData.workflowPurpose || '');
            setEditedParameters(treeData.workflowParameters || []);
            setEditedRemark(treeData.remark || '');
        }
    }, [treeData]);

    const handleToggleEditMode = async () => {
        if (isEditMode) {
            const filteredParameters = editedParameters.filter(param => param.parameterName.trim() !== '');
            const updatedData = {
                workflowPurpose: editedPurpose,
                workflowParameters: filteredParameters,
                remark: editedRemark,
            };
            await handleUpdateWorkflow(treeData!.workflowId, updatedData);
        }
        toggleEditMode();
    };

    const menuData = menuItems.map((item) => ({
        key: item.workflowId,
        name: item.workflowName,
        icon: <EnvironmentOutlined/>,
        path: `/${item.workflowId}`,
    } as unknown as MenuDataItem));

    const treeStore = useMemo(() => {
        return new TreeStore().setSiderWidth(siderWidth).setTreeData(treeData);


    }, [treeData]);

    const handlePressEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const workflowId = Number(isMenuDropdownVisible?.key);
        await handleUpdateWorkflow(workflowId, { workflowName: value });
        setEditingKey(null);
    };


    const items: MenuProps['items'] = [
        {
            key: '1',
            label: <div>Rename</div>,
            onClick: () => {
                if (isMenuDropdownVisible) {
                    setEditingKey(Number(isMenuDropdownVisible.key));
                }
                setIsMenuDropdownVisible(undefined);
            }
        },
        {
            key: '2',
            label: <div>Delete</div>,
            onClick: () => {
                if (isMenuDropdownVisible?.key) {
                    const keyToDelete = Number(isMenuDropdownVisible.key);
                    Modal.confirm({
                        title: '确认删除',
                        content: '您确定要删除这个工作流吗？此操作无法撤销。',
                        okText: '确认',
                        okType: 'danger',
                        cancelText: '取消',
                        onOk: () => handleDeleteWorkflow(keyToDelete),
                    });
                }
            }
        }
    ];
    const handleSettingClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation(); // 阻止事件冒泡
        // 这里是点击 SettingOutlined 图标后要执行的逻辑
    };

    return (
        <ProLayout
            siderWidth={siderWidth}
            logo={logo}
            title="可视化流程引擎"
            token={{

                sider: {
                    // colorMenuBackground: '#F9F9F9',
                }
            }}

            menuItemRender={(item, dom) => (
                <div
                    className={styles.menuItemContainer}
                    onClick={() => handleMenuClick(item)}
                >
                    {editingKey === Number(item.key) ? (
                        // 如果当前菜单项正在被编辑，渲染一个输入框
                        <Input defaultValue={item.name} onPressEnter={handlePressEnter}
                               onClick={(e) => handleSettingClick(e)}/>
                    ) : (
                        <div>
                            {dom}
                            <Dropdown
                                onOpenChange={flag => handleVisibleChange(item, flag)}
                                menu={{items}}
                                trigger={['click']}
                            >
                                <div
                                    className={`${styles.menuIcons} ${isMenuDropdownVisible && singleDropdownVisible[Number(item.key)]?.visible ? styles.iconVisible : ''}`}
                                    onClick={(e) => handleSettingClick(e)}
                                >
                                    <SettingOutlined/>
                                </div>
                            </Dropdown>
                        </div>
                    )}
                </div>
            )}

            actionsRender={() => [
                <div className={styles.maskDiv}>
                    <button
                        key={Math.random()}
                        className={styles.circleButton}
                        onClick={() => setIsModalVisible(true)}
                    >
                        +
                    </button>
                </div>
            ]}
            avatarProps={{
                icon: <Popover title="菜单栏宽度" placement="rightBottom" open={popoverVisible}
                               content={<div style={{ width: '230px' }}>
                                   <Row gutter={[16, 16]} style={{ padding: '5px' }}>
                                       <Col span={24}>
                                           <div style={{ marginBottom: '10px' }}>
                                               <Slider
                                                   min={-130}
                                                   max={300}
                                                   defaultValue={0}
                                                   onChange={(value) => setSiderWidth(320 + value)}
                                               />
                                           </div>
                                       </Col>
                                   </Row>
                               </div>
                               }>
                    <SettingFilled className={styles.popoverIcon}/>
                </Popover>,
                style: {backgroundColor: '#7b7c7b'},
                size: 'large',
                onClick: () => {
                    setPopoverVisible(!popoverVisible);
                },
            }}
            menuDataRender={() => menuData}
            onMenuHeaderClick={resetWorkflow}
        >
            <AddWorkflowModal
                isModalVisible={isModalVisible}
                handleModalSubmit={handleCreateWorkflow}
                handleModalCancel={() => setIsModalVisible(false)}
            />
            <PageContainer
                tabProps={{
                    type: 'card',
                    hideAdd: true,
                }}
                ghost={true}
                token={{
                    paddingInlinePageContainerContent: 0,
                    paddingBlockPageContainerContent: 0,
                }}
            >
                <div>
                    {treeData && (
                        <>
                            <WorkflowDetails
                                treeData={treeData}
                                isEditMode={isEditMode}
                                editedPurpose={editedPurpose}
                                setEditedPurpose={setEditedPurpose}
                                editedParameters={editedParameters}
                                setEditedParameters={setEditedParameters}
                                editedRemark={editedRemark}
                                setEditedRemark={setEditedRemark}
                                toggleEditMode={handleToggleEditMode}
                            />
                            <Suspense fallback={<div>Loading...</div>}>
                                <TreeChart
                                    key={`${treeData.workflowId}-${updateCounter}`}
                                    treeStore={treeStore}
                                    initialData={treeData}
                                    updateTreeData={setTreeData}
                                    forceUpdateTreeChart={forceUpdateTreeChart}
                                />
                            </Suspense>
                        </>
                    )}
                </div>
                {!treeData && (
                    <div style={{marginLeft: '20px', marginTop: '65px'}}>
                        <span style={{color: 'red', marginRight: '5px'}}>←</span> {/* 红色箭头指向左边 */}
                        <span>请选择左侧列表中的一个节点查看详情。</span>
                    </div>
                )}

            </PageContainer>
        </ProLayout>
    );
};

export default ArrangeIndex;

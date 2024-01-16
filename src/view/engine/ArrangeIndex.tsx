import React, {useEffect, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {Collapse, CollapseProps, Descriptions, Form, Input, Modal, message, Button} from 'antd';
import {EnvironmentOutlined, SettingOutlined} from '@ant-design/icons';
import TreeChart from './TreeChart';
import {TreeStore} from '@/store/TreeStore';
import {NodeData} from '@/components/D3Node/NodeModel';
import styles from './styles/ArrangeIndex.module.scss';
import {
    createInitialData,
    createInitialData2,
    items,
} from '@/components/d3Helpers/D3mock.tsx';

import {ProColumns, ProTable} from '@ant-design/pro-table';
import {TableRowSelection} from "antd/es/table/interface";


interface MenuItem {
    key: string;
    label: string;
}

const tabList = [
    {
        key: 'tab1',
        tab: 'Run log',
    },
    {
        key: 'tab2',
        tab: 'Editor',
    },
    // 你可以根据需要添加更多的标签页
];

interface WorkflowListItem {
    key: number;
    workflowName: string;
    creator: string;
    createdAt: string;
    status: string;
    lastModified: string;
    // 可以根据需要添加其他字段
}


const ArrangeIndex: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [treeData, setTreeData] = useState<NodeData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuDataItem | null>(
        null
    );
    const [keyValue, setKeyValue] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workflowForm] = Form.useForm();

    const [activeTabKey, setActiveTabKey] = useState<string>('');
    const conditionalTabList = selectedMenuItem ? tabList : [];
    const [data, setData] = useState<WorkflowListItem[]>([]);
    const [selectedRows, setSelectedRows] = useState<WorkflowListItem[]>([]);

    useEffect(() => {
        // 模拟从 API 获取数据
        const fetchData = async () => {
            // 模拟 API 调用
            const result = [
                {
                    'key': 1,
                    'workflowName': 'Order Fulfillment',
                    'creator': 'Julia',
                    'createdAt': '2024-07-09',
                    'status': 'Active',
                    'lastModified': '2024-10-07'
                },
                {
                    'key': 2,
                    'workflowName': 'Customer Feedback',
                    'creator': 'Alice',
                    'createdAt': '2024-09-23',
                    'status': 'Pending',
                    'lastModified': '2024-11-27'
                },
                {
                    'key': 3,
                    'workflowName': 'Product Launch',
                    'creator': 'Alice',
                    'createdAt': '2024-12-23',
                    'status': 'Completed',
                    'lastModified': '2024-01-23'
                },
                {
                    'key': 4,
                    'workflowName': 'Equipment Maintenance',
                    'creator': 'Julia',
                    'createdAt': '2024-04-17',
                    'status': 'Pending',
                    'lastModified': '2024-09-12'
                },
                {
                    'key': 5,
                    'workflowName': 'Customer Feedback',
                    'creator': 'Charlie',
                    'createdAt': '2024-11-04',
                    'status': 'Completed',
                    'lastModified': '2024-12-11'
                },
                {
                    'key': 6,
                    'workflowName': 'Expense Reporting',
                    'creator': 'Frank',
                    'createdAt': '2024-06-05',
                    'status': 'Inactive',
                    'lastModified': '2024-09-22'
                },
                {
                    'key': 7,
                    'workflowName': 'User Onboarding',
                    'creator': 'Julia',
                    'createdAt': '2024-12-13',
                    'status': 'Failed',
                    'lastModified': '2024-05-03'
                },
                {
                    'key': 8,
                    'workflowName': 'Event Planning',
                    'creator': 'Hannah',
                    'createdAt': '2024-09-20',
                    'status': 'Active',
                    'lastModified': '2024-02-21'
                },
                {
                    'key': 9,
                    'workflowName': 'Data Processing',
                    'creator': 'Charlie',
                    'createdAt': '2024-07-23',
                    'status': 'Pending',
                    'lastModified': '2024-08-17'
                },
                {
                    'key': 10,
                    'workflowName': 'Customer Feedback',
                    'creator': 'Charlie',
                    'createdAt': '2024-10-06',
                    'status': 'Inactive',
                    'lastModified': '2024-10-23'
                }
                // ... 更多数据
            ];
            setData(result);
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Fetch menu items when the component mounts
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                // const response = await fetch('/api/menu-items'); // Replace with your actual API endpoint
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                // const data: MenuItem[] = await response.json();
                const mockMenuItems: MenuItem[] = [
                    {
                        key: 'uuid1',
                        label: 'it.task-service.flow.custReminderGeneration',
                    },
                    {
                        key: 'uuid2',
                        label: 'reminderEventHandler',
                    },
                ];

                setMenuItems(mockMenuItems);
            } catch (err: any) {
                message.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems().then((r) => r);
    }, []);

    function handleEdit(record: WorkflowListItem) {
        message.success('Workflow edited successfully!' + record.workflowName).then(r  =>r);
    }

    function handleDelete(record: WorkflowListItem) {

        message.success('Workflow deleted successfully!' + record.workflowName).then(r  =>r);
    }


    const actionsColumn: ProColumns<WorkflowListItem> = {
        title: 'Actions',
        dataIndex: 'actions', // 使用一个虚拟的 dataIndex，不需要在数据源中有对应的字段
        width: 150,
        render: (_, record) => (
            <>
                <Button onClick={() => handleEdit(record)}>Edit</Button>
                <Button onClick={() => handleDelete(record)}>Delete</Button>
            </>
        ),
    };

    const columns: ProColumns<WorkflowListItem>[] = [
        {
            title: 'Workflow Name',
            dataIndex: 'workflowName',
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
        },
        {
            title: 'Status',
            dataIndex: 'status',
        },
        {
            title: 'Last Modified',
            dataIndex: 'lastModified',
        },
        // ... 可以添加更多列
        actionsColumn, // 将操作列添加到列定义中
    ];

    const handleMenuClick = async (e: MenuDataItem) => {

        if (e.key === keyValue) {
            setKeyValue(e.key);
            return;
        }
        if (e.key === undefined) {
            // 处理 key 为 undefined 的情况
            message.error('Menu item key is undefined');
            return; // 直接返回，不执行后续逻辑
        }
        setKeyValue(e.key);
        setSelectedMenuItem(e);

        try {
            // setLoading(true);
            // const response = await fetch(`/api/tree-data/${e.key}`); // Replace with your actual API endpoint
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            // const data: NodeData = await response.json();
            interface MockApiDataType {
                [key: string]: NodeData; // 定义索引签名
            }

            const mockApiData: MockApiDataType = {
                'uuid1': createInitialData(),
                'uuid2': createInitialData2(),
                // ...其他数据
            };
            const newData = mockApiData[e.key];

            setTreeData(newData);

        } catch (err: any) {
            message.error(err.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    const menuData = menuItems.map((item) => ({
        key: item.key,
        name: item.label,
        icon: <EnvironmentOutlined/>,
        path: `/${item.key}`,
    }));

    const handleMenuSettingClick = (e: MenuDataItem) => {
        message.success(e.name);
    };
    const collapseItems: CollapseProps['items'] = [
        {
            key: '1',
            label: selectedMenuItem === null ? '' : selectedMenuItem.name,
            children: <Descriptions layout="vertical" items={items}/>,
        },
    ];

    const handleAddWorkflowClick = () => {
        setIsModalVisible(true);
    };

    const handleModalSubmit = () => {
        workflowForm
            .validateFields()
            .then((values) => {
                console.log(values); // 这里处理表单数据
                setIsModalVisible(false);
                workflowForm.resetFields();
                message.success('Workflow added successfully!');
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };
    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // 处理标签页切换
    const onTabChange = (key: string) => {
        console.log('选中的标签页:', key);
        setActiveTabKey(key);
    };

    const rowSelection: TableRowSelection<WorkflowListItem> = {
        onChange: (_selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows);
        },
        selectedRowKeys: selectedRows.map((row) => row.key),

        getCheckboxProps: (record) => ({
            disabled: record.status === 'Inactive', // 根据需要禁用复选框
        }),
    };

    return (
        <ProLayout
            logo={'src/assets/logo/logo.jpeg'}
            title="可视化流程引擎"
            menuItemRender={(item, dom) => (
                <div
                    className={styles.menuItemContainer}
                    onClick={() => handleMenuClick(item)}
                >
                    {dom}
                    <div
                        className={styles.menuIcons}
                        onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            handleMenuSettingClick(item);
                        }}
                    >
                        <SettingOutlined className={styles.icon}/>
                    </div>
                </div>
            )}
            actionsRender={() => [
                <div className={styles.maskDiv}>
                    <button
                        key="1"
                        className={styles.circleButton}
                        onClick={handleAddWorkflowClick}
                    >
                        +
                    </button>
                </div>
            ]}
            avatarProps={{
                src: 'src/assets/logo/logo.jpeg', // 您的头像图片路径
                size: 'large',
                // 如果您想要头像点击事件:
                onClick: () => {
                    message.info('Avatar clicked').then((r) => r);
                },
            }}
            menuDataRender={() => menuData}
            onMenuHeaderClick={() => {
                message.info('菜单头部被点击').then((r) => r);
            }}
            onPageChange={() => {
                // 页面变化时，如清除选中的菜单项
            }}
        >
            <Modal
                title="Add Workflow"
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={handleModalCancel}
                okText="Submit"
                cancelText="Cancel"
            >
                <Form form={workflowForm} layout="vertical">
                    <Form.Item
                        name="workflowName"
                        label="Workflow Name"
                        rules={[{required: true, message: 'Please input the workflow name!'}]}
                    >
                        <Input placeholder="Enter workflow name"/>
                    </Form.Item>
                    <Form.Item
                        name="decisionDescription"
                        label="Decision Description"
                        rules={[{required: true, message: 'Please input the decision description!'}]}
                    >
                        <Input.TextArea placeholder="Enter decision description"/>
                    </Form.Item>
                </Form>
            </Modal>
            <PageContainer
                // content={ <Collapse bordered={false} items={collapseItems}/>}

                extra={[
                    <Button key="3"> 不确定用途</Button>,
                    <Button key="2"> 不确定用途</Button>,
                    <Button key="1" type="primary">
                        不确定用途
                    </Button>,
                ]}
                tabList={conditionalTabList}
                onTabChange={onTabChange}
                token={{
                    paddingInlinePageContainerContent: 0,
                }}
                // content={
                //     <div
                //         style={{
                //             marginLeft: '20px',
                //         }}
                //     >
                //         {/* 这里放入PageContainer的内容 */}
                //         <Descriptions layout="vertical" items={items}/>
                //     </div>
                // }
                title={
                    <>
                        {selectedMenuItem && (
                            <>
                                <div style={{marginLeft: '20px'}}>
                                    {/*{selectedMenuItem.name}*/}
                                    <Collapse bordered={false} items={collapseItems}/>
                                </div>
                            </>
                        )}
                    </>
                }
            >
                {(activeTabKey === 'tab1' || activeTabKey === '') && selectedMenuItem && (
                    // 这里是第一个标签页的内容
                    <ProTable<WorkflowListItem>
                        columns={columns}
                        dataSource={data}
                        rowKey="key"
                        search={{}}
                        rowSelection={rowSelection}
                        // 可以添加其他 ProTable 的属性和配置
                    />
                )}

                {activeTabKey === 'tab2' && selectedMenuItem && treeData && (
                    // 这里是第二个标签页的内容
                    <div className={styles.treeChartContainer}>
                        <TreeChart
                            key={selectedMenuItem.key}
                            treeStore={new TreeStore()}
                            initialData={treeData}
                        />
                    </div>
                )}


                {!selectedMenuItem && (
                    <div style={{marginLeft: '20px', marginTop: '15px'}}>
                        请选择左侧列表中的一个节点查看详情。
                    </div>
                )}
            </PageContainer>
        </ProLayout>
    );
};

export default ArrangeIndex;

import React, {useEffect, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {Collapse, CollapseProps, Descriptions, Form, Input, Modal, message} from 'antd';
import {EnvironmentOutlined, SettingOutlined} from '@ant-design/icons';
import TreeChart from './TreeChart';
import {TreeStore} from '@/store/TreeStore';
import {NodeData} from '@/components/D3Node/NodeModel';
import styles from './styles/ArrangeIndex.module.scss';
import {
    createInitialData,
    createInitialData2,
    items, MenuItem, mockMenuItems,
} from '@/components/d3Helpers/D3mock.tsx';

import logo from '@/assets/logo/logo.jpeg';



//https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs/loader.js 网络环境不好。这里会报错。
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

    // const [activeTabKey, setActiveTabKey] = useState<string>('');
    // const [data, setData] = useState<WorkflowListItem[]>([]);
    // const [selectedRows, setSelectedRows] = useState<WorkflowListItem[]>([]);
    //

    // const conditionalTabList = selectedMenuItem ? tabList : [];
    //
    // useEffect(() => {
    //     // 模拟从 API 获取数据
    //     const fetchData = async () => {
    //         // 模拟 API 调用
    //
    //         setData(result);
    //     };
    //
    //     fetchData();
    // }, []);

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
                setMenuItems(mockMenuItems);
            } catch (err: any) {
                message.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems().then((r) => r);
    }, []);


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

    return (
        <ProLayout
            logo={logo}
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
                src: logo, // 您的头像图片路径
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
                // breadcrumb={'none'}
                // extra={[
                //     <Button key="3"> 不确定用途</Button>,
                //     <Button key="2"> 不确定用途</Button>,
                //     <Button key="1" type="primary">
                //         运行workflow
                //     </Button>,
                // ]}

                // tabActiveKey={activeTabKey}
                tabProps={{
                    type: 'card',
                    hideAdd: true,
                }}
                ghost={true}
                token={{
                    paddingInlinePageContainerContent: 0,
                    paddingBlockPageContainerContent: 0,
                }}
                content={
                    <div
                        style={{
                            // marginLeft: '20px',
                        }}
                    >
                        {/* 这里放入PageContainer的内容 */}
                        <Collapse bordered={false} items={collapseItems}/>
                    </div>
                }
                // title={<> 3瓦大大我打的大晚上大大21</>}
            >
                {selectedMenuItem && treeData && (
                    // 这里是第二个标签页的内容
                    <div className={styles.treeChartContainer}>
                        <TreeChart
                            key={Math.random()}
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

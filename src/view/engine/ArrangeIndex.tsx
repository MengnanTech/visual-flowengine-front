import React, {useEffect, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {
    Collapse,
    CollapseProps,
    Descriptions,
    Form,
    Input,
    Modal,
    Space,
    message,
    Button,
    Select
} from 'antd';
import {EnvironmentOutlined, MinusCircleOutlined, PlusOutlined, SettingOutlined} from '@ant-design/icons';
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

const javaTypes = [
    'Object', // 可以让用户输入自定义的类名
    'String',
    'Integer',
    'Long',
    'Short',
    'Double',
    'Float',
    'Boolean',
    'Byte',
    'Character',
    'BigDecimal',
    'BigInteger',
    'Date', // 用于日期
    'LocalDate', // Java 8 新增的用于日期的类
    'LocalDateTime', // Java 8 新增的用于日期和时间的类
    'ZonedDateTime', // Java 8 新增的用于带时区的日期和时间的类
    'Instant', // Java 8 新增的用于时间戳
    'List', // 如 List<String>
    'Set', // 如 Set<Integer>
    'Map', // 如 Map<String, Object>
    'Queue', // 如 Queue<Double>
    'Deque', // 如 ArrayDeque, LinkedList
    'Array', // 如 String[], int[]

];

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
                // workflowForm.resetFields();
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
                    {/* 工作流名称、目的和备注的表单项保持不变 */}
                    <Form.Item
                        name="workflowName"
                        label="Workflow Name"
                        tooltip= '建议用连贯的文字或者英文,考虑用下划线、横线和 " . " 英文句点分割'

                        rules={[{required: true, message: 'Please input the workflow name!'}]}
                    >
                        <Input placeholder="Enter workflow name"/>
                    </Form.Item>
                    <Form.Item
                        name="Purpose"
                        label=" workflow 用途"
                        tooltip="简明扼要描述使用场景和作用"
                        rules={[{required: true, message: 'Please input the purpose of the workflow!'}]}
                    >
                        <Input placeholder="Describe the purpose and use case of the workflow"/>
                    </Form.Item>


                    <Form.Item
                        required
                        label="定义workflow 输入参数"
                        tooltip="只是定义,不会增加代码的逻辑。只是文字性描述,规范使用"
                    >
                        {/* 这里使用Form.List，不再额外嵌套Form.Item */}
                        <Form.List
                            name="parameters"
                            rules={[
                                {
                                    validator: async (_, parameters) => {
                                        if (!parameters || parameters.length < 1) {
                                            return Promise.reject(new Error('至少需要一个入参定义'));
                                        }
                                    },
                                },
                            ]}
                        >
                            {(fields, {add, remove}, {errors}) => (
                                <>
                                    {fields.map(({key, name, ...restField}) => (
                                        <Space key={key} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'parameterType']}

                                                rules={[{required: true, message: 'Missing parameter type'}]}
                                            >
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    placeholder="Select or type a type"
                                                    optionFilterProp="children"
                                                    style={{width: 160}}
                                                    options={javaTypes.map(type => ({value: type, label: type}))}
                                                    filterOption={(input: string, option?: {
                                                        label: string;
                                                        value: string
                                                    }) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >

                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'parameterName']}

                                                rules={[{required: true, message: 'Missing parameter name'}]}
                                            >
                                                <Input placeholder="Parameter Name"/>
                                            </Form.Item>

                                            <MinusCircleOutlined onClick={() => remove(name)}/>
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined/>}>
                                            Add Parameter
                                        </Button>
                                    </Form.Item>
                                    {/* 在这里显示Form.List相关的错误消息 */}
                                    <Form.ErrorList errors={errors}/>
                                </>
                            )}
                        </Form.List>
                        <Form.Item
                            name="remarks"
                            label="备注"
                        >
                            <Input.TextArea placeholder="详细备注内容"/>
                        </Form.Item>
                    </Form.Item>


                </Form>


            </Modal>
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
                content={
                    selectedMenuItem && <Collapse bordered={false} items={collapseItems}/>
                }
            >
                {selectedMenuItem && treeData && (
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

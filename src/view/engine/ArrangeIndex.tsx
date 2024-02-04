import React, {Suspense, useEffect, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {
    Button,
    Col,
    Collapse,
    CollapseProps,
    Descriptions,
    Form,
    Input,
    message,
    Modal,
    Popover,
    Row,
    Select,
    Slider,
    Space,
} from 'antd';
import {
    EnvironmentOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    SettingFilled,
    SettingOutlined
} from '@ant-design/icons';

import {TreeStore} from '@/store/TreeStore';
import {NodeData} from '@/components/D3Node/NodeModel';
import styles from './styles/ArrangeIndex.module.scss';
import {items, workflowMetadata1,} from '@/components/d3Helpers/D3mock.tsx';

import logo from '@/assets/logo/logo.jpeg';
import {javaTypes} from "@/components/d3Helpers/treeHelpers.ts";
import {createWorkflow, ListWorkflow} from "@/network/api.ts";
import {WorkflowCreateRequest, WorkflowMetadata} from "@/components/workflow/model/WorkflowModel.ts";

const TreeChart = React.lazy(() => import('./TreeChart'));


const ArrangeIndex: React.FC = () => {

    const [menuItems, setMenuItems] = useState<WorkflowMetadata[]>([]);
    const [treeData, setTreeData] = useState<NodeData | null>(null);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuDataItem | null>(
        null
    );
    const [siderWidth, setSiderWidth] = useState(320);
    const [keyValue, setKeyValue] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workflowForm] = Form.useForm();

    useEffect(() => {
        // Fetch menu items when the component mounts
        const fetchMenuItems = async () => {
            try {
                let workflowMetadata = await ListWorkflow();
                if (workflowMetadata == null || workflowMetadata.length <= 1) {
                    setMenuItems(workflowMetadata1)
                } else {
                    setMenuItems(workflowMetadata);
                }

            } catch (err: any) {
                message.error(err.message);
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
            message.error('Menu item key is undefined');
            return;
        }
        setKeyValue(e.key);
        setSelectedMenuItem(e);
        let newVar = menuItems.find(item => item.workflowName == e.key)
        setTreeData(newVar!.scriptMetadata);
    };

    const menuData = menuItems.map((item) => ({
        key: item.workflowName,
        name: item.workflowName,
        icon: <EnvironmentOutlined/>,
        path: `/${item.workflowName}`,
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
            .then(async (values) => {
                await createWorkflow(values as WorkflowCreateRequest);
                let workflowMetadata = await ListWorkflow();
                setMenuItems(workflowMetadata);
                setIsModalVisible(false);
                workflowForm.resetFields();
            })
        ;
    };
    const handleModalCancel = () => {
        setIsModalVisible(false);
    };
    const onChange = (newValue: number) => {
        setSiderWidth(320 + newValue);
    };
    return (
        <ProLayout
            siderWidth={siderWidth}
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
                        key={Math.random()}
                        className={styles.circleButton}
                        onClick={handleAddWorkflowClick}
                    >
                        +
                    </button>
                </div>
            ]}
            avatarProps={{
                icon: <Popover placement="rightBottom" trigger="click" content={<div
                    style={{width: '230px' , backgroundColor:'#fafafa'}}> {/* 增加了宽度控制，确保内容不会太拥挤 */}
                    <Row gutter={[16, 16]} style={{padding: '5px'}}> {/* 添加了内边距和行间距 */}
                        <Col span={24}>
                            <div style={{marginBottom: '10px'}}> {/* 为Slider添加了底部外边距 */}
                                <Slider
                                    min={-130}
                                    max={300}
                                    defaultValue={0}
                                    onChange={onChange}
                                />
                            </div>
                        </Col>
                        {/* 可以在这里添加更多的设置项 */}
                    </Row>
                </div>} title="菜单栏宽度">
                    <SettingFilled/>
                </Popover>,
                style: {backgroundColor: '#7b7c7b'},
                size: 'large',
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
                        tooltip='建议用连贯的文字或者英文,考虑用下划线、横线和 " . " 英文句点分割'

                        rules={[{required: true, message: 'Please input the workflow name!'}]}
                    >
                        <Input placeholder="Enter workflow name"/>
                    </Form.Item>
                    <Form.Item
                        name="workflowDescription"
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
                            name="workflowParameters"
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
                            name="remark"
                            label="备注"
                            tooltip="可选,对工作流的详细描述"
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
                <Suspense fallback={<div>Loading...</div>}>
                    {selectedMenuItem && treeData && (
                        <div className={styles.treeChartContainer}>
                            <TreeChart
                                key={Math.random()}
                                treeStore={new TreeStore().setSiderWidth(siderWidth)}
                                initialData={treeData}
                            />
                        </div>
                    )}
                    {/* 其他条件渲染的组件 */}
                </Suspense>
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

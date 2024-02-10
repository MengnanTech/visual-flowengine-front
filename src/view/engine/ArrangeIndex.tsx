import React, {Suspense, useEffect, useMemo, useState} from 'react';
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

import styles from './styles/ArrangeIndex.module.scss';
import {generateMockMenuItemList, items,} from '@/components/d3Helpers/D3mock.tsx';

import logo from '@/assets/logo/logo.jpeg';
import {javaTypes} from "@/components/d3Helpers/treeHelpers.ts";
import {createWorkflow, deleteWorkflow, getWorkflowMetadata, ListWorkflow} from "@/network/api.ts";
import {
    MenuItemsIdAndName,
    WorkflowCreateRequest,
    WorkflowMetadata
} from "@/components/workflow/model/WorkflowModel.ts";

const TreeChart = React.lazy(() => import('./TreeChart'));


const ArrangeIndex: React.FC = () => {

    const [menuItems, setMenuItems] = useState<MenuItemsIdAndName[]>([]);
    const [treeData, setTreeData] = useState<WorkflowMetadata | null>(null);

    const [siderWidth, setSiderWidth] = useState(320);
    const [keyValue, setKeyValue] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workflowForm] = Form.useForm();
    const [popoverVisible, setPopoverVisible] = useState(false);
    useEffect(() => {
        // Fetch menu items when the component mounts
        const fetchMenuItems = async () => {
            try {
                const workflowMetadata = await ListWorkflow();
                if (workflowMetadata == null || workflowMetadata.length <= 0) {
                    setMenuItems(generateMockMenuItemList());
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
        const workflowMetadata = await getWorkflowMetadata(Number(e.key));
        setTreeData(workflowMetadata);
    };

    const menuData = menuItems.map((item) => ({
        key: item.workflowId,
        name: item.workflowName,
        icon: <EnvironmentOutlined/>,
        path: `/${item.workflowId}`,
    } as unknown as MenuDataItem));

    const handleMenuSettingClick = async (e: MenuDataItem) => {
        await deleteWorkflow(Number(e.key));

    };
    const collapseItems: CollapseProps['items'] = [
        {
            key: treeData === null ? '' : treeData!.workflowId,
            label: treeData === null ? '' : treeData!.workflowName,
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
                const workflowMetadata = await ListWorkflow();
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

    const treeStore = useMemo(() => {
        console.log('treeStore');
        return new TreeStore().setSiderWidth(siderWidth).setTreeData(treeData);


    }, [treeData]);
    // 内部数据改变时，重新渲染


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
                            handleMenuSettingClick(item).then(r => r);
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
                icon: <Popover title="菜单栏宽度" placement="rightBottom" open={popoverVisible}
                               content={<div style={{
                                   width: '230px',
                                   backgroundColor: '#fafafa'//好像没什么效果
                               }}> {/* 增加了宽度控制，确保内容不会太拥挤 */}
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
            onMenuHeaderClick={() => {
                message.info('菜单头部被点击').then((r) => r);
            }}
            onPageChange={() => {
                // message.info('页面切换').then((r) => r);
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

                    treeData && <Collapse bordered={false} items={collapseItems}/>
                }
            >
                <Suspense fallback={<div>Loading...</div>}>
                    {treeData && (
                        <div className={styles.treeChartContainer}>
                            <TreeChart
                                key={Math.random()}
                                treeStore={treeStore}
                                initialData={treeData}
                                updateTreeData={setTreeData}
                            />
                        </div>
                    )}
                </Suspense>
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

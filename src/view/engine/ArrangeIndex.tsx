import React, {Suspense, useEffect, useMemo, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {
    Button,
    Col,
    Collapse,
    CollapseProps,
    Descriptions,
    DescriptionsProps,
    Dropdown,
    Form,
    Input,
    MenuProps,
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
import logo from '@/assets/logo/logo.jpeg';
import {DataTypes} from "@/components/d3Helpers/treeHelpers.ts";
import {createWorkflow, deleteWorkflow, getWorkflowMetadata, ListWorkflow, updateWorkflow} from "@/network/api.ts";
import {
    MenuItemsIdAndName,
    Parameter,
    WorkflowCreateRequest,
    WorkflowMetadata
} from "@/components/model/WorkflowModel.ts";

const TreeChart = React.lazy(() => import('./TreeChart'));

interface DropdownVisibleState {
    [key: number]: { visible: boolean; data: any };
}

const ArrangeIndex: React.FC = () => {

    const [menuItems, setMenuItems] = useState<MenuItemsIdAndName[]>([]);
    const [treeData, setTreeData] = useState<WorkflowMetadata | null>(null);

    const [siderWidth, setSiderWidth] = useState(320);
    const [keyValue, setKeyValue] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workflowForm] = Form.useForm();
    const [popoverVisible, setPopoverVisible] = useState(false);
    // 内部数据改变时，重新渲染
    const [isMenuDropdownVisible, setIsMenuDropdownVisible] = useState<MenuDataItem>();
    const [singleDropdownVisible, setSingleDropdownVisible] = useState<DropdownVisibleState>({});
    const [editingKey, setEditingKey] = useState<number | null>(null);
    const [updateCounter, setUpdateCounter] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);


    // 添加状态以跟踪可编辑字段的值
    const [editedPurpose, setEditedPurpose] = useState('');
    const [editedParameters, setEditedParameters] = useState<Parameter[]>([]);
    const [editedRemark, setEditedRemark] = useState('');

    useEffect(() => {
        if (treeData) {
            console.log('workflowPurpose:', treeData.workflowPurpose);
            setEditedPurpose(treeData.workflowPurpose || '');
            setEditedParameters(treeData.workflowParameters || []);
            setEditedRemark(treeData.remark || '');
        }
    }, [treeData]);


    const toggleEditMode = async () => {
        if (isEditMode) {
            // 如果当前是编辑模式，点击则保存数据
            try {
                let updatedData: WorkflowMetadata = {
                    workflowId: treeData!.workflowId,
                    workflowPurpose: editedPurpose,
                    workflowParameters: editedParameters,
                    remark: editedRemark,
                };
                await updateWorkflow(updatedData); // 假设这是更新 API
                // 更新成功后，可以重新获取数据或直接更新本地状态
                message.success('更新成功');
            } catch (error) {
                message.error('更新失败');
            }
        }
        setIsEditMode(!isEditMode);
    };


    const forceUpdateTreeChart = () => {
        setUpdateCounter(prevCounter => prevCounter + 1);
    };
    const fetchMenuItems = async () => {
        try {
            const workflowMetadata = await ListWorkflow();
            setMenuItems(workflowMetadata);
        } catch (err: any) {
            message.error(err.message);
        }
    };

    useEffect(() => {
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

    const descriptionsItems: DescriptionsProps['items'] = useMemo(() => {
        if (!treeData) return [];


        // 构造包含所有必要信息的描述项数组
        return [
            {
                key: 'workflowId',
                label: 'Workflow ID',
                contentStyle: {width: '320px'},

                children: <div className={styles.workflowId}>{treeData.workflowId}</div>,
            },
            {
                key: 'workflowName',
                label: 'Workflow Name',
                contentStyle: {width: '380px'},
                children: <div className={styles.workflowName}>{treeData.workflowName}</div>,
            },
            {
                key: 'purpose',
                label: 'Purpose',
                labelStyle: {width: '50px'},
                children: isEditMode ? (
                    <Input
                        defaultValue={editedPurpose}
                        onChange={(e) => setEditedPurpose(e.target.value)}
                    />
                ) : (
                    editedPurpose
                ),
                // 类似地更新其他字段的配置
            },

            {
                key: 'workflowParameters',
                label: 'Parameters',
                children: isEditMode ? (
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {/*justify-content: space-between;*/}
                        {/*align-items: center;*/}
                        {/*margin-bottom: 4px;*/}
                        {editedParameters.map((param, index) => (
                            <Space key={index} style={{
                                width: '350px',
                                display: 'flex',
                                marginBottom: '4px',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }} align="start">
                                <Input
                                    value={param.parameterName}
                                    onChange={(e) => {
                                        const newParams = [...editedParameters];
                                        newParams[index].parameterName = e.target.value;
                                        setEditedParameters(newParams);
                                    }}
                                    style={{width: '150px'}}
                                />
                                <Select
                                    value={param.parameterType}
                                    onChange={(value) => {
                                        const newParams = [...editedParameters];
                                        newParams[index].parameterType = value;
                                        setEditedParameters(newParams);
                                    }}
                                    options={DataTypes.map((type) => ({
                                        value: type, label: type
                                    }))}
                                    style={{width: '150px'}}
                                />
                                <MinusCircleOutlined
                                    onClick={() => {
                                        const newParams = [...editedParameters];
                                        newParams.splice(index, 1);
                                        setEditedParameters(newParams);
                                    }}
                                />
                            </Space>
                        ))}
                        <Button
                            type="dashed"
                            onClick={() => {
                                setEditedParameters([...editedParameters, {parameterName: '', parameterType: ''}]);
                            }}
                            block
                            icon={<PlusOutlined/>}
                        >
                            Add Parameter
                        </Button>
                    </div>
                ) : (
                    editedParameters.map((param, index) => (
                        <div key={index} className={styles.parameterItem}>
                            <Input
                                defaultValue={param.parameterName}
                                className={styles.parameterNameInput}
                                disabled={!isEditMode}
                                // 可以添加 onChange 事件来处理输入变化
                            />
                            <Select
                                defaultValue={param.parameterType}
                                disabled={!isEditMode}

                                className={styles.parameterTypeSelect}
                                options={DataTypes.map((type) => (
                                    {value: type, label: type}
                                ))}
                            >
                            </Select>
                        </div>
                    ))
                ),
            }
            ,

            {
                key: 'remark',
                label: 'Remark',
                span: 2,
                // style: {height: '50px', overflow: 'hidden'},
                children: isEditMode ? (

                    <div style={{position: 'relative', height: '100%', width: '100%' , top: -20}}>
                        <Input.TextArea
                            defaultValue={editedRemark}
                            onChange={(e) => setEditedRemark(e.target.value)}
                            style={{
                                position: 'absolute',
                                top: 0, // 根据需要调整
                                left: 0, // 根据需要调整
                                height: '80px', // 初始高度
                                width: '100%', // 宽度调整为100%以填满容器
                                maxHeight: '100px',
                                overflow: 'auto' // 超出初始高度时显示滚动条
                            }}
                        />
                    </div>

                ) : (
                    <div className={styles.remarkContent}>{editedRemark}</div>
                ),
            },


        ];
    }, [treeData, isEditMode, editedPurpose, editedRemark, editedParameters]);


    const collapseItems: CollapseProps['items'] = useMemo(() => {
        if (!treeData) return [];

        // 使用 useMemo 钩子来优化性能，仅在 treeData 发生变化时重新计算 collapseItems
        return [
            {
                key: treeData.workflowId, // 确保 key 是字符串
                label: (
                    <div style={{fontSize: '18px', paddingLeft: '20px'}}>
                        <span style={{marginRight: '10px', fontWeight: 'bold'}}>
                          {treeData.workflowName}
                        </span>
                        <span style={{color: 'red'}}>
                          (ID: {treeData.workflowId})
                        </span>
                    </div>
                ),
                children: (
                    <Descriptions
                        title="Workflow Details"
                        bordered // 启用边框模式
                        size="small" // 设定尺寸为小
                        style={{userSelect: 'text'}}
                        items={descriptionsItems} // 使用动态生成的描述项
                        // contentStyle={{width:'80vh'}} // 限制内容的最大宽度
                        //

                        labelStyle={{width: '140px'}} // 限制标签的最大宽度

                        extra={
                            <Button type="primary" onClick={toggleEditMode}>
                                {isEditMode ? 'Save' : 'Edit'}
                            </Button>
                        }

                    />
                ),
            },
        ];
    }, [treeData, descriptionsItems, isEditMode]); // 依赖于 treeData 和 descriptionsItems，确保在这些依赖更新时重新计算

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
        return new TreeStore().setSiderWidth(siderWidth).setTreeData(treeData);


    }, [treeData]);

// 更新 handleVisibleChange 函数以处理编辑状态
    const handleVisibleChange = (item: MenuDataItem, flag: boolean) => {
        setIsMenuDropdownVisible(item); // 更新全局状态
        setSingleDropdownVisible(prev => ({
            ...prev,
            [Number(item.key)]: {
                visible: flag,
                data: item,
            },
        }));
    };
    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value

        let request: WorkflowMetadata = {
            workflowId: Number(isMenuDropdownVisible?.key),
            workflowName: value
        }

        updateWorkflow(request)
            .then(
                () => {
                    setKeyValue('');
                    setEditingKey(null);
                    setTreeData(null);
                    fetchMenuItems().then((r) => r);
                }
            )
    };


    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div>
                    Rename
                </div>
            ),
            onClick: () => {

                // 设置当前正在编辑的菜单项
                if (isMenuDropdownVisible) {
                    setEditingKey(Number(isMenuDropdownVisible.key));
                }
                setIsMenuDropdownVisible(undefined);
            }
        },
        {
            key: '2',
            label: (
                <div>
                    Delete
                </div>
            ),
            onClick: () => {
                if (isMenuDropdownVisible?.key) {
                    const keyToDelete = Number(isMenuDropdownVisible.key);
                    Modal.confirm({
                        title: '确认删除',
                        content: '您确定要删除这个工作流吗？此操作无法撤销。',
                        okText: '确认',
                        okType: 'danger',
                        cancelText: '取消',
                        onOk: () => {
                            deleteWorkflow(keyToDelete).then(() => {
                                // 更新UI
                                setIsMenuDropdownVisible(undefined);
                                setTreeData(null);
                                fetchMenuItems().then(r => r);
                                message.success('删除成功');
                            }).catch((err) => {
                                // 处理删除过程中的错误
                                message.error(`删除失败: ${err.message}`);
                            });
                        },
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

                // sider:{
                //     colorTextMenuSelected: '#da1678',
                // }
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
                        name="workflowPurpose"
                        label=" workflow 用途"
                        tooltip="简明扼要描述使用场景和作用"
                        rules={[{required: true, message: 'Please input the purpose of the workflow!'}]}
                    >
                        <Input placeholder="Describe the purpose and use case of the workflow"/>
                    </Form.Item>


                    <Form.Item
                        // required
                        label="定义workflow 输入参数"
                        tooltip="只是定义,不会增加代码的逻辑。只是文字性描述,规范使用"
                    >
                        {/* 这里使用Form.List，不再额外嵌套Form.Item */}
                        <Form.List
                            name="workflowParameters"
                            // rules={[
                            //     {
                            //         validator: async (_, parameters) => {
                            //             if (!parameters || parameters.length < 1) {
                            //                 return Promise.reject(new Error('至少需要一个入参定义'));
                            //             }
                            //         },
                            //     },
                            // ]}
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
                                                    options={DataTypes.map((type) => (
                                                        {value: type, label: type}
                                                    ))}
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

                    treeData &&
                    <Collapse bordered={false} size={"small"} style={{userSelect: 'text'}} expandIconPosition='end'
                              items={collapseItems}/>
                }
            >
                <Suspense fallback={<div>Loading...</div>}>
                    {treeData && (
                        <TreeChart
                            key={`${treeData.workflowId}-${updateCounter}`}
                            treeStore={treeStore}
                            initialData={treeData}
                            updateTreeData={setTreeData}
                            forceUpdateTreeChart={forceUpdateTreeChart}
                        />
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

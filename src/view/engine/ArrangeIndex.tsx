import React, {useEffect, useState} from 'react';
import ProLayout, {MenuDataItem, PageContainer} from '@ant-design/pro-layout';
import {Button, Collapse, CollapseProps, Descriptions, DescriptionsProps, message} from 'antd';
import {EnvironmentOutlined, PlusOutlined} from '@ant-design/icons';
import TreeChart from './TreeChart';
import {TreeStore} from '@/store/TreeStore';
import {NodeData} from '@/components/D3Node/NodeModel';
import styles from './styles/ArrangeIndex.module.scss'


// import logo from 'src/assets/logo/logo.jpeg'; // 您的logo路径

interface MenuItem {
    key: string;
    label: string;
}

const initialData: NodeData = {
    "id": "1",
    "name": "Root",
    "nodeType": "nodeType",
    "scriptText": "开始节点定义好入参数",
    "nodeDesc": "nodeDesc",
    "children": [
        {
            "id": "root123",
            "name": "Child 1冲冲冲",
            "nodeType": "nodeType",
            "scriptText": "root123scriptText是",
            "nodeDesc": "nodeDesc",
        },
        {
            "id": "root369",
            "name": "Child 2诸葛",
            "nodeType": "nodeType",
            "scriptText": "scriptText",
            "nodeDesc": "nodeDesc",
            "children": [
                {
                    "id": "root456",
                    "name": "Grandchild 2-1",
                    "nodeType": "nodeType",
                    "scriptText": "Grandchild 2-1scriptText收到",
                    "nodeDesc": "nodeDesc",
                },
                {
                    "id": "root789",
                    "name": "Grandchild 2-2收到",
                    "nodeType": "nodeType",
                    "scriptText": "Grandchild 2-2scriptTextv啊",
                    "nodeDesc": "nodeDesc",
                },
                {
                    "id": "c61c9d6a-e9a9-4894-bd1a-cce8f7a16be3",
                    "name": "New Node355100",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText",
                    "nodeDesc": "nodeDesc"
                },
                {
                    "id": "256f8cf4-db66-4c06-bce0-da7044538ec8",
                    "name": "New Node892100",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText",
                    "nodeDesc": "nodeDesc"
                }
            ]
        },
        {
            "id": "root857",
            "name": "Child 3",
            "nodeType": "nodeType",
            "scriptText": "scriptText",
            "nodeDesc": "nodeDesc"
        }
    ]
};
const initialData2: NodeData = {
    "id": "initialData2",
    "name": "initialData2",
    "nodeType": "initialData2",
    "scriptText": "initialData2",
    "nodeDesc": "initialData2",
    "children": [
        {
            "id": "root123",
            "name": "Child 1冲冲冲",
            "nodeType": "nodeType",
            "scriptText": "root123scriptText是",
            "nodeDesc": "nodeDesc",
        },
        {
            "id": "root369",
            "name": "Child 2诸葛",
            "nodeType": "nodeType",
            "scriptText": "scriptText",
            "nodeDesc": "nodeDesc",
            "children": [
                {
                    "id": "root456",
                    "name": "Grandchild 2-1",
                    "nodeType": "nodeType",
                    "scriptText": "Grandchild 2-1scriptText收到",
                    "nodeDesc": "nodeDesc",
                },
                {
                    "id": "root789",
                    "name": "Grandchild 2-2收到",
                    "nodeType": "nodeType",
                    "scriptText": "Grandchild 2-2scriptTextv啊",
                    "nodeDesc": "nodeDesc",
                },
                {
                    "id": "c61c9d6a-e9a9-4894-bd1a-cce8f7a16be3",
                    "name": "New Node355100",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText",
                    "nodeDesc": "nodeDesc"
                },
                {
                    "id": "256f8cf4-db66-4c06-bce0-da7044538ec8",
                    "name": "New Node892100",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText",
                    "nodeDesc": "nodeDesc"
                }
            ]
        },
        {
            "id": "root857",
            "name": "Child 3",
            "nodeType": "nodeType",
            "scriptText": "scriptText",
            "nodeDesc": "nodeDesc"
        }
    ]
};
const items: DescriptionsProps['items'] = [
    {
        key: '1',
        label: 'UserName',
        children: 'Zhou Maomao',
    },
    {
        key: '2',
        label: 'Telephone',
        children: '1810000000',
    },
    {
        key: '3',
        label: 'Live',
        children: 'Hangzhou, Zhejiang',
    },
    {
        key: '4',
        label: 'Address',
        span: 2,
        children: 'No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China',
    },
    {
        key: '5',
        label: 'Remark',
        children: 'empty',
    },
];
const collapseItems: CollapseProps['items'] = [
    {
        key: '1',
        label: '简介标题',
        children: <Descriptions title="User Info" layout="vertical" items={items}/>
    }
];
const ArrangeIndex: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [treeData, setTreeData] = useState<NodeData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [treeChartKey, setTreeChartKey] = useState<number>(0);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuDataItem | null>(null);

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
                        key: '1',
                        label: 'it.task-service.flow.custReminderGeneration',
                    },
                    {
                        key: '2',
                        label: 'reminderEventHandler',
                    }
                ];

                setMenuItems(mockMenuItems);
            } catch (err: any) {
                message.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems().then(r => r);
    }, []);

    const handleMenuClick = async (e: MenuDataItem) => {
        if (e.key === undefined) {
            // 处理 key 为 undefined 的情况
            message.error("Menu item key is undefined");
            return; // 直接返回，不执行后续逻辑
        }
        setSelectedMenuItem(e);
        setTreeChartKey(prevKey => prevKey + 1);
        try {
            setLoading(true);
            // const response = await fetch(`/api/tree-data/${e.key}`); // Replace with your actual API endpoint
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            // const data: NodeData = await response.json();
            interface MockApiDataType {
                [key: string]: NodeData; // 定义索引签名
            }

            const mockApiData: MockApiDataType = {
                "1": {...initialData},
                "2": {...initialData2},
                // ...其他数据
            };
            const newData = mockApiData[e.key];

            setTreeData(newData);

        } catch (err: any) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    const menuData = menuItems.map(item => ({
        key: item.key,
        name: item.label,
        icon: <EnvironmentOutlined/>, // 假设每个菜单项都使用这个图标
        path: `/${item.key}`,
    }));


    return (
        <ProLayout

            logo={"src/assets/logo/logo.jpeg"}
            title="可视化流程引擎"
            menuItemRender={(item, dom) => (
                <span onClick={() => handleMenuClick(item)}>
                    {dom}
                  </span>
            )}
            actionsRender={() => [
                <Button key="1" type="primary"  className={styles.responsiveButton} icon={<PlusOutlined/>}>新增</Button>,
            ]}
            avatarProps={{
                src: 'src/assets/logo/logo.jpeg', // 您的头像图片路径
                size: 'large',
                // 如果您想要头像点击事件:
                onClick: () => {
                    message.info('Avatar clicked').then(r => r)
                },
            }}
            menuDataRender={() => menuData}
            onMenuHeaderClick={() => {
                message.info('菜单头部被点击').then(r => r)
            }}
            onPageChange={() => {
                // 页面变化时，如清除选中的菜单项
            }}


        >
            <PageContainer title={selectedMenuItem && (
                <div className={styles.collapseContainer}>
                    <Collapse bordered={false} items={collapseItems}/>
                </div>

            )}>

                {/* 页面内容 */}
                {selectedMenuItem && treeData && (
                    <>
                    <div className={styles.treeChartContainer}>
                            <TreeChart key={treeChartKey} treeStore={new TreeStore()} initialData={treeData}/>
                        </div>
                    </>
                )}
                {!selectedMenuItem && (
                    <div>请选择左侧列表中的一个节点查看详情。</div>
                )}
            </PageContainer>
        </ProLayout>
    );
};

export default ArrangeIndex;

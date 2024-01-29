import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {CollapseProps, Descriptions, DescriptionsProps} from "antd";


export function createInitialData(): NodeData  {
    return {
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
                "children": [
                    {
                        "id": "c00b92b0-00f8-4999-b5a0-c0bab728ca20",
                        "name": "结束节点",
                        "nodeType": "End",
                        "nodeDesc": "",
                        "scriptText": ""
                    }
                ]
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
                        "nodeDesc": "nodeDesc"
                    },
                    {
                        "id": "root789",
                        "name": "Grandchild 2-2收到",
                        "nodeType": "nodeType",
                        "scriptText": "Grandchild 2-2scriptTextv啊",
                        "nodeDesc": "nodeDesc"
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
    }

}
export function createInitialData2(): NodeData  {
    return {
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
    }

};
export const items: DescriptionsProps['items'] = [
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
export const collapseItems: CollapseProps['items'] = [
    {
        key: '1',
        label: '简介标题',
        children: <Descriptions layout="vertical" items={items}/>
}
];


export interface MenuItem {
    key: string;
    label: string;
}
export const mockMenuItems: MenuItem[] = [
    {
        key: 'uuid1',
        label: 'it.task-service.flow.custReminderGeneration',
    },
    {
        key: 'uuid2',
        label: 'reminderEventHandler',
    },
];
export     const result = [
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

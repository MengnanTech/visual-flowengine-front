import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {CollapseProps, Descriptions, DescriptionsProps} from "antd";


export function createInitialData(): NodeData  {
    return {
        "id": "1",
        "name": "Root",
        "nodeType": "Start",
        "scriptText": "开始节点定义好入参数",
        "nodeDesc": "nodeDesc",
        "children": [
            {
                "id": "root123",
                "name": "root123",
                "nodeType": "nodeType",
                "scriptText": "root123scriptText是",
                "nodeDesc": "nodeDesc",
                "children": [
                    {
                        "id": "c00b92b0-00f8-4999-b5a0-c0bab728ca20",
                        "name": "End",
                        "nodeType": "End",
                        "nodeDesc": "",
                        "scriptText": ""
                    }
                ]
            },
            {
                "id": "root369",
                "name": "root369",
                "nodeType": "nodeType",
                "scriptText": "scriptText",
                "nodeDesc": "nodeDesc",
                "children": [
                    {
                        "id": "root456",
                        "name": "root456",
                        "nodeType": "nodeType",
                        "scriptText": "Grandchild 2-1scriptText收到",
                        "nodeDesc": "nodeDesc"
                    },
                    {
                        "id": "root789",
                        "name": "root789",
                        "nodeType": "nodeType",
                        "scriptText": "Grandchild 2-2scriptTextv啊",
                        "nodeDesc": "nodeDesc"
                    },
                    {
                        "id": "root110",
                        "name": "root110",
                        "nodeType": "nodeType",
                        "scriptText": "scriptText",
                        "nodeDesc": "nodeDesc"
                    },
                    {
                        "id": "root120",
                        "name": "root120",
                        "nodeType": "nodeType",
                        "scriptText": "scriptText",
                        "nodeDesc": "nodeDesc"
                    }
                ]
            },
            {
                "id": "root857",
                "name": "root857",
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
        "nodeType": "Start",
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
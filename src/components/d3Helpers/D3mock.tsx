import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {CollapseProps, Descriptions, DescriptionsProps} from "antd";


export function createInitialData(): NodeData  {
    return {
        "scriptId": "1",
        "scriptName": "Root",
        "scriptType": "Start",
        "scriptText": "开始节点定义好入参数",
        "scriptDesc": "nodeDesc",
        "children": [
            {
                "scriptId": "root123",
                "scriptName": "root123",
                "scriptType": "nodeType",
                "scriptText": "root123scriptText是",
                "scriptDesc": "nodeDesc",
                "children": [
                    {
                        "scriptId": "c00b92b0-00f8-4999-b5a0-c0bab728ca20",
                        "scriptName": "End",
                        "scriptType": "End",
                        "scriptDesc": "",
                        "scriptText": ""
                    }
                ]
            },
            {
                "scriptId": "root369",
                "scriptName": "root369",
                "scriptType": "nodeType",
                "scriptText": "scriptText",
                "scriptDesc": "nodeDesc",
                "children": [
                    {
                        "scriptId": "root456",
                        "scriptName": "root456",
                        "scriptType": "nodeType",
                        "scriptText": "Grandchild 2-1scriptText收到",
                        "scriptDesc": "nodeDesc"
                    },
                    {
                        "scriptId": "root789",
                        "scriptName": "root789",
                        "scriptType": "nodeType",
                        "scriptText": "Grandchild 2-2scriptTextv啊",
                        "scriptDesc": "nodeDesc"
                    },
                    {
                        "scriptId": "root110",
                        "scriptName": "root110",
                        "scriptType": "nodeType",
                        "scriptText": "scriptText",
                        "scriptDesc": "nodeDesc"
                    },
                    {
                        "scriptId": "root120",
                        "scriptName": "root120",
                        "scriptType": "nodeType",
                        "scriptText": "scriptText",
                        "scriptDesc": "nodeDesc"
                    }
                ]
            },
            {
                "scriptId": "root857",
                "scriptName": "root857",
                "scriptType": "nodeType",
                "scriptText": "scriptText",
                "scriptDesc": "nodeDesc"
            }
        ]
    }

}
export function createInitialData2(): NodeData  {
    return {
        "scriptId": "initialData2",
        "scriptName": "initialData2",
        "scriptType": "Start",
        "scriptText": "initialData2",
        "scriptDesc": "initialData2",
        "children": [
            {
                "scriptId": "root123",
                "scriptName": "Child 1冲冲冲",
                "scriptType": "nodeType",
                "scriptText": "root123scriptText是",
                "scriptDesc": "nodeDesc",
            },
            {
                "scriptId": "root369",
                "scriptName": "Child 2诸葛",
                "scriptType": "nodeType",
                "scriptText": "scriptText",
                "scriptDesc": "nodeDesc",
                "children": [
                    {
                        "scriptId": "root456",
                        "scriptName": "Grandchild 2-1",
                        "scriptType": "nodeType",
                        "scriptText": "Grandchild 2-1scriptText收到",
                        "scriptDesc": "nodeDesc",
                    },
                    {
                        "scriptId": "root789",
                        "scriptName": "Grandchild 2-2收到",
                        "scriptType": "nodeType",
                        "scriptText": "Grandchild 2-2scriptTextv啊",
                        "scriptDesc": "nodeDesc",
                    },
                    {
                        "scriptId": "c61c9d6a-e9a9-4894-bd1a-cce8f7a16be3",
                        "scriptName": "New Node355100",
                        "scriptType": "nodeType",
                        "scriptText": "scriptText",
                        "scriptDesc": "nodeDesc"
                    },
                    {
                        "scriptId": "256f8cf4-db66-4c06-bce0-da7044538ec8",
                        "scriptName": "New Node892100",
                        "scriptType": "nodeType",
                        "scriptText": "scriptText",
                        "scriptDesc": "nodeDesc"
                    }
                ]
            },
            {
                "scriptId": "root857",
                "scriptName": "Child 3",
                "scriptType": "nodeType",
                "scriptText": "scriptText",
                "scriptDesc": "nodeDesc"
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
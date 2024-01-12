import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {CollapseProps, Descriptions, DescriptionsProps} from "antd";


export const initialData: NodeData = {
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
export const initialData2: NodeData = {
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
        children: <Descriptions title="User Info" layout="vertical" items={items}/>
}
];
import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {CollapseProps, Descriptions, DescriptionsProps} from "antd";
import {WorkflowMetadata} from "@/components/workflow/model/WorkflowModel.ts";


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

export const workflowMetadata1 = [{
    "workflowName": "mockMenuItems", "scriptMetadata": {
        scriptId: "1",
        scriptName: "Start",
        scriptText: '',
        scriptType: "Start",
        scriptDesc: "mockMenuItems",
        children: [{
            "scriptId": "1",
            "scriptName": "Start",
            "scriptText": "",
            "scriptType": "Start",
            "scriptDesc": "mockMenuItems",
            "children": [
                {
                    "scriptId": "4c022341-ad9a-4ba9-bc00-8abdc412664f",
                    "scriptName": "New Script Node52100",
                    "scriptType": "Script",
                    "scriptDesc": "",
                    "scriptText": "",
                    "children": [
                        {
                            "scriptId": "33c93947-3da6-4ca8-82a5-9f98cae54083",
                            "scriptName": "New Script Node26100",
                            "scriptType": "Script",
                            "scriptDesc": "",
                            "scriptText": "",
                            "children": [
                                {
                                    "scriptId": "aebdf65c-40b1-4b97-b65d-5354f3680951",
                                    "scriptName": "New Node44100",
                                    "scriptType": "Condition",
                                    "scriptDesc": "",
                                    "scriptText": "",
                                    "children": [
                                        {
                                            "scriptId": "1f2ebb88-1981-4cc2-8a64-a93c81ffb33d",
                                            "scriptName": "",
                                            "scriptType": "End",
                                            "scriptDesc": "",
                                            "scriptText": ""
                                        }
                                    ]
                                },
                                {
                                    "scriptId": "e9a469fd-4960-47ee-8cb8-98669b8cf8e8",
                                    "scriptName": "New Node76100",
                                    "scriptType": "Condition",
                                    "scriptDesc": "",
                                    "scriptText": "",
                                    "children": [
                                        {
                                            "scriptId": "e7eb51de-9fc4-4fd0-b216-8cc2f49eefeb",
                                            "scriptName": "",
                                            "scriptType": "End",
                                            "scriptDesc": "",
                                            "scriptText": ""
                                        }
                                    ]
                                },
                                {
                                    "scriptId": "abed862d-b264-439a-aeea-1045bb99b75e",
                                    "scriptName": "New Node6100",
                                    "scriptType": "Condition",
                                    "scriptDesc": "",
                                    "scriptText": "",
                                    "children": [
                                        {
                                            "scriptId": "ef05653c-8930-4dd7-ab62-21cc913a6096",
                                            "scriptName": "",
                                            "scriptType": "End",
                                            "scriptDesc": "",
                                            "scriptText": ""
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "scriptId": "11d9d54f-f8d1-4f90-a1a5-d80f53781284",
                    "scriptName": "New Node88100",
                    "scriptType": "Condition",
                    "scriptDesc": "",
                    "scriptText": "",
                    "children": [
                        {
                            "scriptId": "f206b5dc-00bf-4be3-ba28-255cd74386cf",
                            "scriptName": "New Script Node43100",
                            "scriptType": "Script",
                            "scriptDesc": "",
                            "scriptText": "",
                            "children": [
                                {
                                    "scriptId": "fca9415a-8ca9-4379-bac6-2000b4e24620",
                                    "scriptName": "New Script Node31100",
                                    "scriptType": "Script",
                                    "scriptDesc": "",
                                    "scriptText": "",
                                    "children": []
                                }
                            ]
                        }
                    ]
                }
            ]
        }] as NodeData[]
    }
} as WorkflowMetadata];
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
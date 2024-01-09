import React from "react";
import TreeChart from "./TreeChart.js";
import {TreeStore} from "@/store/TreeStore.ts";
import {NodeData} from "@/components/D3Node/NodeModel.ts";

const Arrange: React.FC = () => {


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
                "children": [{
                    "id": "root456", "name": "Grandchild 2-1",
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
                }]
            },
            {
                "id": "root857", "name": "Child 3", "nodeType": "nodeType",
                "scriptText": "scriptText",
                "nodeDesc": "nodeDesc"
            }]
    };
    return (
        <div style={{backgroundColor: "#f1f0dc"}}>
            <TreeChart treeStore={new TreeStore()} initialData={initialData} />
        </div>
    );
}
export default Arrange

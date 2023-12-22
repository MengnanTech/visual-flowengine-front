import React from "react";
import TreeChart, {NodeData} from "./TreeChart.js";

const Index: React.FC = () => {


    const initialData: NodeData = {

        "id": "1",
        "name": "Root",
        "nodeType": "nodeType",
        "scriptText": "scriptText",
        "children": [
            {
                "id": "root123",
                "name": "Child 1",
                "nodeType": "nodeType",
                "scriptText": "scriptText"
            },
            {
                "id": "root369",
                "name": "Child 2",
                "nodeType": "nodeType",
                "scriptText": "scriptText",
                "children": [{
                    "id": "root456", "name": "Grandchild 2-1",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText"
                },
                {
                    "id": "root789",
                    "name": "Grandchild 2-2",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText"
                },
                {
                    "id": "c61c9d6a-e9a9-4894-bd1a-cce8f7a16be3",
                    "name": "New Node355100",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText"
                },
                {
                    "id": "256f8cf4-db66-4c06-bce0-da7044538ec8",
                    "name": "New Node892100",
                    "nodeType": "nodeType",
                    "scriptText": "scriptText"
                }]
            },
            {
                "id": "root857", "name": "Child 3", "nodeType": "nodeType",
                "scriptText": "scriptText"
            }]
    };
    return (
        <div style={{backgroundColor: "#f1f0dc"}}>
            <h1>workflow index</h1>
            <TreeChart {...initialData}/>

        </div>
    );
}
export default Index

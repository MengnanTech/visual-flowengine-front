import * as monaco from "monaco-editor";
import {NodeData} from "@/components/D3Node/NodeModel.ts";




export interface WorkflowCreateRequest {
    workflowName: string;
    workflowDescription: string;
    workflowParameters: Parameter[];
    remark: string;
}

export interface Parameter {
    parameterName: string;
    parameterType: string;
}
export interface MenuItemsIdAndName {
    workflowId: number;
    workflowName: string;
}

export interface WorkflowMetadata {
    workflowId: number;
    workflowName: string;
    workflowParameters: Parameter[];
    workflowDescription: string;
    remark: string;
    scriptMetadata: NodeData;
}

export const findNodeDataById = (node: NodeData, scriptId: string): NodeData | undefined => {
    if (node.scriptId === scriptId) {
        return node;
    }
    if (node.children) {
        for (const child of node.children) {
            const found = findNodeDataById(child, scriptId);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};

export enum ScriptType {
    Start,
    Script,
    Condition,
    Decision,
    Fork,
    Join,
    End
}

export interface Diagnostic {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: monaco.MarkerSeverity;
}
export interface DebugRequest{
    scriptMetadata:NodeData;
    inputValues:any
}

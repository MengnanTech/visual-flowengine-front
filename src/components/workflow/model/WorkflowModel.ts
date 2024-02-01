import * as monaco from "monaco-editor";
import {NodeData} from "@/components/D3Node/NodeModel.ts";




export interface WorkflowCreateRequest {
    workflowName: string;
    workflowDescription: string;
    remark: string;
}

export interface WorkflowMetadata {
    workflowName: string;
    workflowDescription: string;
    remark: string;
    scriptMetadata: NodeData;
}


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
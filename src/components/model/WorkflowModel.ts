import * as monaco from "monaco-editor";
import {NodeData} from "@/components/D3Node/NodeModel.ts";


export interface WorkflowCreateRequest {
    workflowName: string;
    workflowDescription: string;
    workflowParameters: Parameter[];
    remark: string;
}

// private Map<String, Object> inputValues;
// private String code;
export interface DebugScriptRequest {
    code: string;
    inputValues: any;
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
    workflowName?: string;
    workflowParameters?: Parameter[];
    workflowPurpose?: string | null;
    remark?: string | null;
    scriptMetadata?: NodeData | null;
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
    Rule,
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

export interface DebugRequest {
    scriptMetadata: NodeData;
    inputValues: any
}

export type ScriptRunStatus = 'Start' | 'End' | 'Success' | 'Error';

export interface WorkflowTaskLog {
    scriptId: string;
    scriptName: string;
    scriptType: ScriptType;

    beforeRunBinding: Record<string, any>;
    afterRunBinding: Record<string, any>;
    scriptRunStatus: ScriptRunStatus;
    scriptRunResult: any;
    scriptRunTime: Date;
    scriptRunError: string;
}
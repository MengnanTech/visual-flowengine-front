import HTTP from "@/network/HTTP.ts";
import {
    DebugRequest, DebugScriptRequest,
    Diagnostic,
    MenuItemsIdAndName,
    WorkflowCreateRequest,
    WorkflowMetadata, WorkflowTaskLog
} from "@/components/model/WorkflowModel.ts";


export async function compileGroovyScript(code: string): Promise<Diagnostic[]> {
    try {

        const response = await HTTP.post(window.compileScriptApiPath, JSON.stringify({code: code}));
        if (response) {
            return response;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}

export async function createWorkflow(workflowCreateRequest: WorkflowCreateRequest): Promise<WorkflowMetadata> {
    return await HTTP.post(window.createWorkflowApiPath, JSON.stringify(workflowCreateRequest));
}


export async function ListWorkflow(): Promise<MenuItemsIdAndName[]> {
    return await HTTP.get(window.listWorkflowsApiPath);
}

export async function deleteWorkflow(workflowId: number): Promise<any> {
    return await HTTP.delete(`${window.deleteWorkflowApiPath}?workflowId=${workflowId}`);
}

export async function updateWorkflow(workflowMetadata: WorkflowMetadata): Promise<WorkflowMetadata> {
    return await HTTP.put(window.updateWorkflowApiPath, JSON.stringify(workflowMetadata));
}

export async function updateWorkflowName(workflowId: number, workflowName: string): Promise<WorkflowMetadata> {
    return await HTTP.put(`${window.updateWorkflowNameApiPath}?workflowId=${workflowId}&workflowName=${workflowName}`, null);
}

export async function debugGroovyScript(debugScriptRequest: DebugScriptRequest): Promise<WorkflowTaskLog> {
    return await HTTP.post(window.runGroovyScriptApiPath, JSON.stringify(debugScriptRequest));
}

export async function getWorkflowMetadata(workflowId: number): Promise<WorkflowMetadata> {
    return await HTTP.get(`${window.getWorkflowMetadataApiPath}?workflowId=${workflowId}`);
}

export async function debugWorkflow(debugRequest: DebugRequest): Promise<WorkflowTaskLog[]> {
    return await HTTP.post(`${window.debugWorkflowApiPath}`, JSON.stringify(debugRequest));
}


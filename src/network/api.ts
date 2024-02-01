import HTTP from "@/network/HTTP.ts";
import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {Diagnostic, WorkflowCreateRequest, WorkflowMetadata} from "@/components/workflow/model/WorkflowModel.ts";



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
    try {

        return await HTTP.post(window.createWorkflowApiPath, JSON.stringify(workflowCreateRequest));
    } catch (error) {
        throw error;
    }
}

export async function deleteWorkflow(workflowName: string): Promise<any> {
    try {
        return await HTTP.delete(`${window.deleteWorkflowApiPath}?workflowName=${encodeURIComponent(workflowName)}`); // 如果你添加了 delete 方法
    } catch (error) {
        throw error;
    }
}

export async function updateWorkflow(workflowMetadata: NodeData): Promise<WorkflowMetadata> {
    try {
        return await HTTP.put(window.updateWorkflowApiPath, JSON.stringify(workflowMetadata));
    } catch (error) {
        throw error;
    }
}

export async function debugGroovyScript(code: string): Promise<any> {
    try {
        return  await HTTP.post(window.runGroovyScriptApiPath, JSON.stringify({code: code}));
    } catch (error) {
        throw error;
    }
}

export async function getWorkflowMetadata(workflowName: string): Promise<WorkflowMetadata> {
    try {
        const urlWithParams = `${window.getWorkflowMetadataApiPath}?workflowName=${encodeURIComponent(workflowName)}`;

        return  await HTTP.get(urlWithParams);
    } catch (error) {
        throw error;
    }
}


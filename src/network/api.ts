import HTTP from "@/network/HTTP.ts";
import {
    DebugRequest,
    Diagnostic,
    MenuItemsIdAndName,
    WorkflowCreateRequest,
    WorkflowMetadata,
    WorkflowTaskLog
} from "@/components/model/WorkflowModel.ts";
import {
    mockCompileGroovyScript,
    mockCreateWorkflow,
    mockDeleteWorkflow,
    mockDebugWorkflow,
    mockGetWorkflowMetadata,
    mockListWorkflow,
    mockUpdateWorkflow
} from "@/network/mock-data.ts";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function compileGroovyScript(code: string): Promise<Diagnostic[]> {
    if (USE_MOCK) return mockCompileGroovyScript(code);
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
    if (USE_MOCK) return mockCreateWorkflow(workflowCreateRequest);
    return await HTTP.post(window.createWorkflowApiPath, JSON.stringify(workflowCreateRequest));
}


export async function ListWorkflow(): Promise<MenuItemsIdAndName[]> {
    if (USE_MOCK) return mockListWorkflow();
    return await HTTP.get(window.listWorkflowsApiPath);
}

export async function deleteWorkflow(workflowId: number): Promise<any> {
    if (USE_MOCK) return mockDeleteWorkflow(workflowId);
    return await HTTP.delete(`${window.deleteWorkflowApiPath}?workflowId=${workflowId}`);
}

export async function updateWorkflow(workflowMetadata: WorkflowMetadata): Promise<WorkflowMetadata> {
    if (USE_MOCK) return mockUpdateWorkflow(workflowMetadata);
    return await HTTP.put(window.updateWorkflowApiPath, JSON.stringify(workflowMetadata));
}

export async function getWorkflowMetadata(workflowId: number): Promise<WorkflowMetadata> {
    if (USE_MOCK) return mockGetWorkflowMetadata(workflowId);
    return await HTTP.get(`${window.getWorkflowMetadataApiPath}?workflowId=${workflowId}`);
}

export async function debugWorkflow(debugRequest: DebugRequest): Promise<Record<string, WorkflowTaskLog[]>> {
    if (USE_MOCK) return mockDebugWorkflow(debugRequest);
    return await HTTP.post(`${window.debugWorkflowApiPath}`, JSON.stringify(debugRequest));
}

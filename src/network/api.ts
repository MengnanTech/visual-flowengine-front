import * as monaco from "monaco-editor";
import HTTP from "@/network/HTTP.ts";
import {NodeData} from "@/components/D3Node/NodeModel.ts";
import {createInitialData} from "@/components/d3Helpers/D3mock.tsx";


export interface Diagnostic {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    severity: monaco.MarkerSeverity;
}

export async function compileGroovyScript(code: string): Promise<Diagnostic[]> {
    try {

        const response = await HTTP.post( window.compileScriptApiPath, JSON.stringify({code: code}));
        // const response = await HTTP.post( window.runGroovyScriptApiPath, JSON.stringify({code: code}));
        if (response) {
            return response;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error compiling groovy script:", error);
        return [];
    }
}

export async function getWorkflowMetadata(workflowName: string): Promise<NodeData | string> {
    try {
        const response = await HTTP.get(`/api/engine/groovyScript/${workflowName}`);
        if (response) {
            return response;
        } else {
            return createInitialData();
        }
    } catch (error) {
        console.error("Error fetching script:", error);
        return '';
    }
}


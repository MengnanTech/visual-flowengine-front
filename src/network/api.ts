import * as monaco from "monaco-editor";
import HTTP from "@/network/HTTP.ts";


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
        const response = await HTTP.post('/api/engine/groovyScript/compile', code);
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

export async function getScript(scriptName: string): Promise<Diagnostic[]> {
    try {
        const response = await HTTP.get(`/api/engine/groovyScript/${scriptName}`);
        if (response) {
            return response;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching script:", error);
        return [];
    }
}


import * as monaco from "monaco-editor";



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
        const response = await fetch('/api/engine/compileGroovyScript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: code
        });

        if (!response.ok) {
            console.error("HTTP error:", response.status, response.statusText);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error("Network error:", error);
        return [];
    }
}


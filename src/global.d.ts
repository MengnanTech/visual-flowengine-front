// global.d.ts

export {}; // 确保 TypeScript 把这个文件当作一个模块

declare global {
    interface Window {
        compileScriptApiPath: string;
        executeWorkflowApiPath: string;
        debugWorkflowApiPath: string;
        createWorkflowApiPath: string;
        deleteWorkflowApiPath: string;
        updateWorkflowApiPath: string;
        updateWorkflowNameApiPath: string;
        listWorkflowsApiPath: string;
        getWorkflowMetadataApiPath: string;
    }
}

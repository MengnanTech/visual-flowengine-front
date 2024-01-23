// global.d.ts

export {}; // 确保 TypeScript 把这个文件当作一个模块

declare global {
    interface Window {
        COMPILE_GROOVY_SCRIPT: string;
        CREATE_WORKFLOW: string;
        DELETE_WORKFLOW: string;
        LIST_WORKFLOWS: string;
        RUN_GROOVY_SCRIPT: string;
        GET_WORKFLOW_METADATA: string;
    }
}

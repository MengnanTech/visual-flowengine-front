export interface WorkflowListItem {
    key: number;
    workflowName: string;
    creator: string;
    createdAt: string;
    status: string;
    lastModified: string;
    // 可以根据需要添加其他字段
}

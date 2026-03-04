import {MenuItemsIdAndName, WorkflowMetadata, WorkflowTaskLog, ScriptType, Diagnostic} from "@/components/model/WorkflowModel.ts";
import {NodeData} from "@/components/D3Node/NodeModel.ts";

// ========== 示例工作流树结构 ==========

const sampleTree1: NodeData = new NodeData(
    "start-1", "开始节点", "", "Start", "工作流入口",
    [
        new NodeData(
            "script-1", "数据校验", `
// 校验输入参数
def name = binding.get("name")
if (name == null || name.trim().isEmpty()) {
    throw new Exception("name 参数不能为空")
}
return ["valid": true, "name": name]
`.trim(), "Script", "校验输入数据是否合法",
            [
                new NodeData(
                    "condition-1", "条件判断", `
def valid = binding.get("valid")
return valid == true
`.trim(), "Condition", "根据校验结果决定分支",
                    [
                        new NodeData(
                            "script-2", "业务处理", `
def name = binding.get("name")
def result = "Hello, " + name + "! 欢迎使用工作流引擎。"
return ["message": result]
`.trim(), "Script", "核心业务逻辑处理",
                            [
                                new NodeData("end-1", "结束节点", "", "End", "工作流出口")
                            ]
                        ),
                        new NodeData(
                            "script-3", "错误处理", `
return ["error": "数据校验失败", "code": 400]
`.trim(), "Script", "处理校验失败的情况",
                            [
                                new NodeData("end-2", "异常结束", "", "End", "异常退出")
                            ]
                        )
                    ]
                )
            ]
        )
    ]
);

const sampleTree2: NodeData = new NodeData(
    "start-2", "开始", "", "Start", "订单处理入口",
    [
        new NodeData(
            "script-10", "查询订单", `
def orderId = binding.get("orderId")
// 模拟查询订单
return ["orderId": orderId, "amount": 99.9, "status": "pending"]
`.trim(), "Script", "根据ID查询订单信息",
            [
                new NodeData(
                    "script-11", "计算折扣", `
def amount = binding.get("amount")
def discount = amount > 100 ? 0.9 : 1.0
return ["finalAmount": amount * discount]
`.trim(), "Script", "根据金额计算折扣",
                    [
                        new NodeData("end-10", "完成", "", "End", "订单处理完成")
                    ]
                )
            ]
        )
    ]
);

// ========== Mock 数据存储 ==========

let nextId = 100;
const workflowStore: Map<number, WorkflowMetadata> = new Map([
    [1, {
        workflowId: 1,
        workflowName: "示例工作流 - Hello World",
        workflowParameters: [
            {parameterName: "name", parameterType: "String"}
        ],
        workflowPurpose: "演示基本的工作流功能，包含条件分支和脚本节点",
        remark: "这是一个 Mock 数据生成的示例工作流",
        scriptMetadata: sampleTree1,
    }],
    [2, {
        workflowId: 2,
        workflowName: "订单处理流程",
        workflowParameters: [
            {parameterName: "orderId", parameterType: "String"},
            {parameterName: "userId", parameterType: "String"}
        ],
        workflowPurpose: "模拟订单查询与折扣计算",
        remark: "Mock 示例 - 订单处理",
        scriptMetadata: sampleTree2,
    }],
]);

// ========== Mock API 实现 ==========

/** 模拟网络延迟 */
function delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function mockListWorkflow(): Promise<MenuItemsIdAndName[]> {
    await delay(200);
    return Array.from(workflowStore.values()).map(w => ({
        workflowId: w.workflowId,
        workflowName: w.workflowName || "",
    }));
}

export async function mockGetWorkflowMetadata(workflowId: number): Promise<WorkflowMetadata> {
    await delay(300);
    const wf = workflowStore.get(workflowId);
    if (!wf) {
        throw new Error(`Workflow ${workflowId} not found`);
    }
    // 返回深拷贝避免引用问题
    return JSON.parse(JSON.stringify(wf));
}

export async function mockCreateWorkflow(request: {
    workflowName: string;
    workflowDescription: string;
    workflowParameters: any[];
    remark: string;
}): Promise<WorkflowMetadata> {
    await delay(400);
    const id = ++nextId;
    const metadata: WorkflowMetadata = {
        workflowId: id,
        workflowName: request.workflowName,
        workflowParameters: request.workflowParameters || [],
        workflowPurpose: request.workflowDescription,
        remark: request.remark,
        scriptMetadata: new NodeData(
            `start-${id}`, "开始节点", "", "Start", "工作流入口",
            [new NodeData(`end-${id}`, "结束节点", "", "End", "工作流出口")]
        ),
    };
    workflowStore.set(id, metadata);
    return JSON.parse(JSON.stringify(metadata));
}

export async function mockUpdateWorkflow(workflowMetadata: WorkflowMetadata): Promise<WorkflowMetadata> {
    await delay(300);
    workflowStore.set(workflowMetadata.workflowId, workflowMetadata);
    return JSON.parse(JSON.stringify(workflowMetadata));
}

export async function mockDeleteWorkflow(workflowId: number): Promise<any> {
    await delay(200);
    workflowStore.delete(workflowId);
    return {success: true};
}

export async function mockCompileGroovyScript(_code: string): Promise<Diagnostic[]> {
    await delay(500);
    // Mock: 总是返回编译成功（无错误）
    return [];
}

export async function mockDebugWorkflow(debugRequest: {
    scriptMetadata: NodeData;
    inputValues: any;
}): Promise<Record<string, WorkflowTaskLog[]>> {
    await delay(800);

    // 递归收集所有节点，模拟执行日志
    const logs: WorkflowTaskLog[] = [];
    const collectNodes = (node: NodeData) => {
        logs.push({
            scriptId: node.scriptId,
            scriptName: node.scriptName,
            scriptType: ScriptType.Script,
            beforeRunBinding: debugRequest.inputValues || {},
            afterRunBinding: {...(debugRequest.inputValues || {}), _result: "mock_success"},
            scriptRunStatus: "Success",
            scriptRunResult: {mockResult: true, message: `${node.scriptName} 执行完成`},
            scriptRunTime: new Date(),
            scriptRunError: "",
        });
        if (node.children) {
            // 只走第一条分支
            collectNodes(node.children[0]);
        }
    };

    collectNodes(debugRequest.scriptMetadata);

    return {"default": logs};
}

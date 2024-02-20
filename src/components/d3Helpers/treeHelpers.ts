import {D3Node, NodeData} from "@/components/D3Node/NodeModel.ts";
import {v4 as uuid} from "uuid";


export const centerTree = (rootNode: D3Node, width: number, height: number) => {

    let maxDepth = 0;

    // 遍历所有节点以找到最大深度
    rootNode.each(d => {
        if (d.depth > maxDepth) maxDepth = d.depth;
    });

    console.log('maxDepth', maxDepth);
    // 设定基础平移量
    let baseTranslateX = 50; // 从左侧开始的默认边距

    // 根据树的深度动态调整水平方向的平移量
    if (maxDepth < 5) {
        // 如果树的深度较小，增加水平方向的平移量，使树稍微向右偏移
        baseTranslateX = width / 4; // 例如，可以设置为视图宽度的1/4
    } else if (maxDepth >= 5 && maxDepth < 10) {
        // 中等深度的树，适当减少平移量
        baseTranslateX = width / 8; // 视图宽度的1/8
    }
    // 对于更深的树，保持baseTranslateX为初始值，即从左侧开始布局

    // 计算垂直方向上的平移量以垂直居中根节点
    const translateY = height / 2 - rootNode.x;

    // 返回计算出的平移量
    return [baseTranslateX, translateY];
};
export const GenerateUUID = () => {
    return uuid();
}
export const END_NODE_LENGTH = 200;

export const findNodeDataById = (nodes: NodeData[], scriptId: string): NodeData | undefined => {
    for (const node of nodes) {
        if (node.scriptId === scriptId) {
            return node;
        }
        if (node.children) {
            const foundInChildren = findNodeDataById(node.children, scriptId);
            if (foundInChildren) return foundInChildren;
        }
    }
    return undefined;
};

export const config = {
    "link1": '#DADADA',
    "link2": '#A3A3A3',
    "circle": '#2196F3',
    "ruleCircle": '#FFC107',
    "pageContainerLockBackgroundColor":"#F5F5F5",
    "pageContainerUnLockBackgroundColor":"#eee"
}
export const DataTypes = [
    'Object',
    'String',
    'Integer',
    'Long',
    'Short',
    'Double',
    'Float',
    'Boolean',
    'Byte',
    'Character',
    'BigDecimal',
    'BigInteger',
    'Date',
    'LocalDate',
    'LocalDateTime',
    'ZonedDateTime',
    'Instant',
    'List',
    'Set',
    'Map',
    'Queue',
    'Deque',
    'Array',
];





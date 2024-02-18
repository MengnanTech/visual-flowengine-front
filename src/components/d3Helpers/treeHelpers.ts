import {D3Node, NodeData} from "@/components/D3Node/NodeModel.ts";
import {v4 as uuid} from "uuid";


export const centerTree = (rootNode: D3Node, width: number, height: number) => {
    let x0 = Infinity;
    let x1 = -x0;
    let y0 = Infinity;
    let y1 = -y0;
    // 计算树的边界
    rootNode.each((d) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
        if (d.y > y1) y1 = d.y;
        if (d.y < y0) y0 = d.y;
    });
    // 计算树的中心位置
    const scaleX = (x1 - x0) / 2 + x0;
    const scaleY = (y1 - y0) / 2 + y0;
    // 计算平移量
    const translateX = width / 2 - scaleY;
    const translateY = height / 2 - scaleX;
    // 如果树的大小是奇数，对齐到30像素网格
    const offsetX = (x1 - x0) % 2 === 0 ? 0 : 30;
    // 调整每个节点的位置
    rootNode.each((d) => {
        d.x += offsetX;
    });
    // 返回平移量
    return [translateX, translateY];
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





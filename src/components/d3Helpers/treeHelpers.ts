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
    const translateX = width / 2 - scaleY ;
    const translateY = height / 2 - scaleX ;
    // 如果树的大小是奇数，对齐到30像素网格
    const offsetX = (x1 - x0) % 2 === 0 ? 0 : 30;
    // 调整每个节点的位置
    rootNode.each((d) => {
        d.x += offsetX;
    });
    // 返回平移量
    return [translateX, translateY];
};
export const GenerateUUID =()=> {
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

export interface DataType {
    type: string;
    color: string;
}

export const DataTypes: DataType[] = [
    { type: 'Object', color: '#69c0ff' }, // 浅蓝
    { type: 'String', color: '#95de64' }, // 清新绿
    { type: 'Integer', color: '#bc91f1' }, // 柔和橙
    { type: 'Long', color: '#b7eb8f' }, // 草绿
    { type: 'Short', color: '#ffd666' }, // 暖黄
    { type: 'Double', color: '#ffc069' }, // 橙黄
    { type: 'Float', color: '#ff7875' }, // 柔红
    { type: 'Boolean', color: '#5cdbd3' }, // 天蓝
    { type: 'Byte', color: '#ff9c6e' }, // 浅蓝
    { type: 'Character', color: '#ff85c0' }, // 粉红
    { type: 'BigDecimal', color: '#597ef7' }, // 中蓝
    { type: 'BigInteger', color: '#7318e3' }, // 紫色
    { type: 'Date', color: '#ffadd2' }, // 浅粉
    { type: 'LocalDate', color: '#d3adf7' }, // 浅紫
    { type: 'LocalDateTime', color: '#d9d9d9' }, // 灰色
    { type: 'ZonedDateTime', color: '#ffc53d' }, // 亮黄
    { type: 'Instant', color: '#73d13d' }, // 绿色
    { type: 'List', color: '#36cfc9' }, // 青色
    { type: 'Set', color: '#40a9ff' }, // 蔚蓝
    { type: 'Map', color: '#ffec3d' }, // 亮黄
    { type: 'Queue', color: '#ff7a45' }, // 橘色
    { type: 'Deque', color: '#ffa940' }, // 橙色
    { type: 'Array', color: '#bae637' }, // 柠檬绿
];



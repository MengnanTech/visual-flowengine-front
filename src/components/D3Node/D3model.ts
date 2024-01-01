import * as d3 from "d3";

export interface NodeData {
    id: string;
    name: string;
    scriptText: string;
    nodeType: string;
    children?: NodeData[];
}

export interface D3Node extends d3.HierarchyNode<NodeData> {
    relativeX: number;
    relativeY: number;
    x: number;
    y: number;
    depth: number;
    height: number;

    previousX?: number;
    previousY?: number;
}

export interface D3Link extends d3.HierarchyLink<NodeData> {
    source: D3Node;
    target: D3Node;
    parent?: {
        x: number;
        y: number;
    }
    x?: number;
    y?: number;
}

import * as d3 from "d3";
import {TreeStore} from "@/store/TreeStore.ts";
import {makeObservable} from "mobx";
import {WorkflowMetadata} from "@/components/model/WorkflowModel.ts";

export class NodeData {
    scriptId: string;
    scriptName: string;
    scriptText: string;
    scriptType: string;
    scriptDesc: string;
    children?: NodeData[]|null;

    constructor(id: string, name: string, scriptText: string, nodeType: string, nodeDesc: string,children?: NodeData[]) {
        makeObservable(this);
        this.scriptId = id;
        this.scriptName = name;
        this.scriptText = scriptText;
        this.scriptType = nodeType;
        this.scriptDesc = nodeDesc;
        this.children = children;
    }
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
    needTransition?: boolean;
}

export interface TreeChartState {
    gRef: d3.Selection<any, any, any, any>;
    rootNode: D3Node;
    svgRef: SVGSVGElement;
    treeLayout: d3.TreeLayout<NodeData>;
    closestNodeRef:D3Node | null;
    treeStore: TreeStore;
    currentData: WorkflowMetadata;
}

import {action, makeAutoObservable} from "mobx";
import * as d3 from 'd3';
import {D3Node} from "@/components/D3Node/NodeModel.ts";
export class TreeStore {
    // treeData: WorkflowMetadata | null = null;
    draggingNode: D3Node | null = null;
    menuNode: D3Node | null = null;
    clickNode: D3Node | null = null;
    menuPosition: { x: number; y: number } | null = null;
    currentTransform: d3.ZoomTransform | null = null;
    siderWidth: number = 320;

    constructor() {
        makeAutoObservable(this);
    }

    @action
    setSiderWidth(siderWidth: number) {
        this.siderWidth = siderWidth;
        return this
    }

    // @action
    // setTreeData(treeData: WorkflowMetadata | null) {
    //     this.treeData = treeData;
    //     return this
    // }

    @action
    setCurrentMenu(menuPosition: { x: number; y: number } | null) {
        this.menuPosition = menuPosition;
    }

    @action
    setDraggingNode(node: D3Node | null) {
        this.draggingNode = node;
    }


    @action
    setMenuNode(node: D3Node | null) {
        this.menuNode = node;
    }

    @action
    setClickNode(d: D3Node | null) {
        this.clickNode = d;
    }

    @action
    setCurrentTransform(d: d3.ZoomTransform | null) {
        this.currentTransform = d;
    }
}

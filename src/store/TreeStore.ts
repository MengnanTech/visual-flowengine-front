import {action, makeAutoObservable} from "mobx";
// import * as d3 from 'd3';
import {D3Node} from "@/components/D3Node/D3model.ts";

export class TreeStore {
    rootNode: D3Node | null = null;
    // selectedNode: D3Node | null = null;
    // menuVisible: boolean = false;
    menuPosition: { x: number; y: number } | null = null;

    constructor() {
        makeAutoObservable(this);
    }


    @action
    setCurrentMenu(menuPosition: { x: number; y: number } | null) {
        this.menuPosition = menuPosition;
    }


}

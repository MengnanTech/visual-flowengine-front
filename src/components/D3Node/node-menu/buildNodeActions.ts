import type {NodeAction} from '@/components/D3Node/node-menu/NodeMenuPopup.tsx';

interface BuildNodeActionsParams {
    isEndNodeType: boolean;
    isStartNodeType: boolean;
    nextNodeIsEnd: boolean;
    hasChildren: boolean;
    hasEndChildNode: boolean;
    icons: {
        scriptIcon: string;
        conditionIcon: string;
        ruleIcon: string;
        endIcon: string;
        replaceIcon: string;
        deleteIcon: string;
        deleteTreeIcon: string;
        dragIcon: string;
    };
    handlers: {
        addScriptNode: () => void;
        addConditionNode: () => void;
        addRuleNode: () => void;
        addEndNode: () => void;
        replaceNode: () => void;
        deleteNode: () => void;
        deleteTree: () => void;
        dragNode: () => void;
    };
}

export function buildNodeActions({
    isEndNodeType,
    isStartNodeType,
    nextNodeIsEnd,
    hasChildren,
    hasEndChildNode,
    icons,
    handlers,
}: BuildNodeActionsParams): NodeAction[] {
    return [
        {
            icon: icons.scriptIcon,
            label: '添加代码节点',
            nodeType: 'Script',
            disabled: isEndNodeType,
            action: handlers.addScriptNode,
        },
        {
            icon: icons.conditionIcon,
            label: '条件节点',
            nodeType: 'Condition',
            disabled: isEndNodeType || (hasChildren && nextNodeIsEnd),
            action: handlers.addConditionNode,
        },
        {
            icon: icons.ruleIcon,
            label: '规则节点',
            nodeType: 'Rule',
            disabled: isEndNodeType || (hasChildren && nextNodeIsEnd),
            action: handlers.addRuleNode,
        },
        {
            icon: icons.endIcon,
            label: '结束节点',
            nodeType: 'End',
            disabled: hasChildren || isEndNodeType,
            action: handlers.addEndNode,
        },
        {
            icon: icons.replaceIcon,
            label: '被顶替',
            nodeType: 'Replace',
            disabled: isStartNodeType || hasEndChildNode || isEndNodeType,
            action: handlers.replaceNode,
        },
        {
            icon: icons.deleteIcon,
            label: '删除当前节点',
            nodeType: 'Delete',
            disabled: isStartNodeType,
            action: handlers.deleteNode,
        },
        {
            icon: icons.deleteTreeIcon,
            label: '删除节点树',
            nodeType: 'DeleteTree',
            disabled: isEndNodeType || isStartNodeType,
            action: handlers.deleteTree,
        },
        {
            icon: icons.dragIcon,
            label: '拖拽节点',
            nodeType: 'drag',
            disabled: isEndNodeType || isStartNodeType,
            action: handlers.dragNode,
        },
    ];
}

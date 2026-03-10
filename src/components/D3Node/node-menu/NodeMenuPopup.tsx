import React from 'react';
import NodeMenuStyles from '@/components/D3Node/styles/D3node.module.scss';

export interface NodeAction {
    icon: string;
    label: string;
    nodeType?: string;
    disabled?: boolean;
    action: () => void;
}

interface NodeMenuPopupProps {
    actions: NodeAction[];
    left: number;
    top: number;
}

const NodeMenuPopup: React.FC<NodeMenuPopupProps> = ({actions, left, top}) => {
    return (
        <div style={{position: 'absolute', left, top, zIndex: 100}}>
            <div className={NodeMenuStyles.nodePopup}>
                {actions.map((action, index) => (
                    <div
                        key={`${action.label}-${index}`}
                        className={`${NodeMenuStyles.node} ${action.disabled ? NodeMenuStyles.disabled : ''}`}
                        onClick={!action.disabled ? action.action : undefined}
                    >
                        <img style={{width: '24px', height: '24px'}} src={action.icon} alt={action.label}/>
                        <span className={NodeMenuStyles.nodeLabel}>{action.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NodeMenuPopup;

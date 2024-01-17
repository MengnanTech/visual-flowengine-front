import React from 'react';
import { Menu } from 'antd';
import styles from './styles/ContextMenu.module.scss';
interface ContextMenuProps {
    x: number;
    y: number;
    options: { label: string; action: () => void }[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
    return (
        <div className={styles.contextMenu} style={{ top: y, left: x }}>
            <Menu
                onClick={onClose}
                items={options.map((option, index) => ({
                    key: index,
                    label: option.label,
                    onClick: option.action
                }))}
            />

        </div>
    );
};

export default ContextMenu;

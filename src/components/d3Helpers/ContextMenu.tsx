import React from 'react';
import { Menu } from 'antd';

interface ContextMenuProps {
    x: number;
    y: number;
    options: { label: string; action: () => void }[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
    return (
        <div style={{ position: 'absolute', top: y, left: x, zIndex: 100 }}>
            <Menu onClick={onClose}>
                {options.map((option, index) => (
                    <Menu.Item key={index} onClick={option.action}>
                        {option.label}
                    </Menu.Item>
                ))}
            </Menu>
        </div>
    );
};

export default ContextMenu;

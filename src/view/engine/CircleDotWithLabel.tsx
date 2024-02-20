import React from 'react';
import { CloseCircleOutlined } from "@ant-design/icons";

interface CircleDotWithLabelProps {
    color: string;
    label: string;
    onRemove?: () => void;
}

const CircleDotWithLabel: React.FC<CircleDotWithLabelProps> = ({ color, label, onRemove }) => {
    const isRemovable = color !== 'grey';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: color,
                position: 'relative'
            }}>
                {isRemovable && <CloseCircleOutlined
                    style={{ color: 'red', position: 'absolute', top: '-10px', right: '-10px', cursor: 'pointer' }}
                    onClick={onRemove} />}
            </div>
            {/* 使用 title 属性提供简单的hover提示 */}
            <span title={label} style={{ fontSize: '10px', marginTop: '4px', maxWidth: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
            </span>
        </div>
    );
};

export default CircleDotWithLabel;

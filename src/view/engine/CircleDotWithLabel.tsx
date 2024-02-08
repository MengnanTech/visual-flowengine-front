import React from 'react';
import { CloseCircleOutlined } from "@ant-design/icons";

interface CircleDotWithLabelProps {
    color: string;
    label: string;
    onRemove?: () => void;
}

const CircleDotWithLabel: React.FC<CircleDotWithLabelProps> = ({ color, label, onRemove }) => {
    // 只有当颜色不是灰色时才显示删除图标
    const isRemovable = color !== 'grey'; // 或者您用来表示灰色状态的确切颜色代码

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: color, position: 'relative' }}>
                {isRemovable && <CloseCircleOutlined style={{ color: 'red', position: 'absolute', top: '-10px', right: '-10px', cursor: 'pointer' }} onClick={onRemove} />}
            </div>
            <span style={{ fontSize: '10px', marginTop: '4px' }}>{label}</span>
        </div>
    );
};

export default CircleDotWithLabel;

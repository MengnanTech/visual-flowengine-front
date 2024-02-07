import React from 'react';
import {CloseCircleOutlined} from "@ant-design/icons";

interface CircleDotWithLabelProps {
    color: string;
    label: string;
    onRemove?: () => void;
}

const CircleDotWithLabel : React.FC<CircleDotWithLabelProps> = ({ color, label, onRemove }) => {
    // const [hover, setHover] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color, position: 'relative' }}>
                <CloseCircleOutlined style={{ color: 'red', position: 'absolute', top: '-10px', right: '-10px' }} onClick={onRemove} />
            </div>
            <span style={{ fontSize: '10px', marginTop: '4px' }}>{label}</span>
        </div>
    );
};

export default CircleDotWithLabel;

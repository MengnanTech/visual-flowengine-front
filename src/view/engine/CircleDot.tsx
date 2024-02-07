import React, { useState } from 'react';
import { Button } from 'antd';
import {CloseOutlined} from "@ant-design/icons";

const CircleDot = ({ color = 'green', onRemove }) => {
    const [hover, setHover] = useState(false);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                cursor: 'pointer',
                width: '30px', // 放大圆点的尺寸
                height: '30px', // 放大圆点的尺寸
                borderRadius: '50%',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'transform 0.3s ease', // 平滑放大效果
                transform: hover ? 'scale(1.1)' : 'scale(1)' // 悬浮时放大
            }}
        >

                <div
                    onClick={onRemove}
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        cursor: 'pointer',
                    }}
                >
                    <Button shape="circle" size="small" icon={<CloseOutlined />} />
                </div>

        </div>
    );
};

export default CircleDot;

import React from 'react';
import { Button } from 'antd';


interface ModalFooterProps {
    clickNode: any; // 根据实际情况定义类型
    setClickNode: (node: any) => void; // 同上，根据实际情况定义
}

const ModalFooter: React.FC<ModalFooterProps> = ({ clickNode, setClickNode }) => {
    const handleCompile = () => {
        console.log("编译", clickNode);
        setClickNode(null)
    };

    const handleDebug = () => {
        console.log("调试", clickNode);
        setClickNode(null)
    };

    const handleSave = () => {
        console.log("暂存", clickNode);
        setClickNode(null)
    };

    const handleSubmit = () => {
        console.log("提交", clickNode);
        setClickNode(null)
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            textAlign: 'left'
        }}>
            <div>
                <Button onClick={handleCompile}>
                    编译
                </Button>
                <Button type="primary" onClick={handleDebug}>
                    调试
                </Button>
            </div>
            <div>
                <Button type="primary" onClick={handleSave}>
                    暂存
                </Button>
                <Button type="primary" onClick={handleSubmit}>
                    提交
                </Button>
            </div>
        </div>
    );
};

export default ModalFooter;

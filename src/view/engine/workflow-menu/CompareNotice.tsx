import React from 'react';
import CircleDotWithLabel from '@/view/engine/CircleDotWithLabel.tsx';

interface CompareLine {
    content: string;
    label: string;
}

interface CompareNoticeProps {
    visible: boolean;
    compareLines: CompareLine[] | null;
    onCompare: () => void;
    onClear: () => void;
    onHide: () => void;
    onRemove: (index: number) => void;
}

const CompareNotice: React.FC<CompareNoticeProps> = ({
    visible,
    compareLines,
    onCompare,
    onClear,
    onHide,
    onRemove,
}) => {
    if (!visible || compareLines === null) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            padding: '12px 16px',
            width: 290,
        }}>
            <div style={{fontWeight: 500, marginBottom: 8}}>点击红点对比代码</div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12}}>
                {compareLines.length > 0 ? (
                    <CircleDotWithLabel color="green" label={compareLines[0].label} onRemove={() => onRemove(0)}/>
                ) : (
                    <CircleDotWithLabel color="grey" label=""/>
                )}
                {compareLines.length > 1 ? (
                    <CircleDotWithLabel color="green" label={compareLines[1].label} onRemove={() => onRemove(1)}/>
                ) : (
                    <CircleDotWithLabel color="grey" label=""/>
                )}
            </div>
            <div style={{display: 'flex', gap: 8}}>
                <button
                    onClick={onCompare}
                    disabled={compareLines.length < 2}
                    style={{
                        padding: '4px 12px',
                        background: compareLines.length < 2 ? '#d9d9d9' : '#1890ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: compareLines.length < 2 ? 'not-allowed' : 'pointer',
                    }}
                >
                    开始对比
                </button>
                <button
                    onClick={onClear}
                    style={{padding: '4px 12px', background: '#f0f0f0', border: 'none', borderRadius: 4, cursor: 'pointer'}}
                >
                    清空
                </button>
                <button
                    onClick={onHide}
                    style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#999'}}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default CompareNotice;

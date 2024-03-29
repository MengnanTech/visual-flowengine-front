import React, {useEffect, useRef, useState} from 'react';
import {Input} from 'antd';

interface AutoWidthInputProps {
    value: string;
    onChange: (value: string) => void;
    onFinish: () => void;
}

const AutoWidthInput: React.FC<AutoWidthInputProps> = ({value, onChange, onFinish}) => {
    const inputRef = useRef<any>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const extraSpace = 90; // 额外空间保持固定
    const [inputWidth, setInputWidth] = useState(0);
    useEffect(() => {
        let spanWidth = spanRef.current?.offsetWidth || 0

        if (spanWidth < 80) {
            spanWidth = 80;
        }
        setInputWidth(spanWidth);
    }, [value]);
    useEffect(() => {
        // 当组件渲染或更新时，自动聚焦到输入框
        inputRef.current.focus();
    }, []);
    // 确保初始化时添加额外空间
    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (inputRef.current && inputRef.current instanceof HTMLElement && !inputRef.current.contains(event.target)) {
                onFinish();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [inputRef, onFinish]);

    return (
        <div style={{display: 'inline-block', padding: '2px'}}>
            <span ref={spanRef} style={{position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap'}}>
                {value}
            </span>
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPressEnter={onFinish}
                onBlur={onFinish}
                style={{
                    width: `${inputWidth + extraSpace}px`,
                    lineHeight: '10px', // 这里确保行高与div的高度一致
                    verticalAlign: 'middle' // 垂直居中对齐
                }}
            />


        </div>
    );
};

export default AutoWidthInput;

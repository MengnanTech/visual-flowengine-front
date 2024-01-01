import React, {useState, useRef, useLayoutEffect, useEffect} from 'react';
import { Input } from 'antd';

interface AutoWidthInputProps {
    value: string;
    onChange: (value: string) => void;
    onFinish: () => void;
}

const AutoWidthInput: React.FC<AutoWidthInputProps> = ({ value, onChange, onFinish }) => {
    const inputRef = useRef<any>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const [inputWidth, setInputWidth] = useState<number>(0);


    useEffect(() => {
        const spanWidth = spanRef.current?.offsetWidth || 0;
        setInputWidth(spanWidth + 100);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (inputRef.current && !inputRef.current.input.contains(event.target)) {
                onFinish();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [inputRef, onFinish]);
    return (
        <div style={{ display: 'inline-block', padding: '2px' }}>
            <span ref={spanRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' }}>
                {value}
            </span>
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPressEnter={onFinish}
                onBlur={onFinish}
                style={{ width: inputWidth }}
            />
        </div>
    );
};

export default AutoWidthInput;

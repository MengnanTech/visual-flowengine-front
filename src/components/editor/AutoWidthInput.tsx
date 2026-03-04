import React, {useEffect, useRef, useState} from 'react';

interface AutoWidthInputProps {
    value: string;
    onChange: (value: string) => void;
    onFinish: () => void;
}

const AutoWidthInput: React.FC<AutoWidthInputProps> = ({value, onChange, onFinish}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const extraSpace = 90;
    const [inputWidth, setInputWidth] = useState(0);

    useEffect(() => {
        let spanWidth = spanRef.current?.offsetWidth || 0;
        if (spanWidth < 80) {
            spanWidth = 80;
        }
        setInputWidth(spanWidth);
    }, [value]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: {target: any}) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                onFinish();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onFinish]);

    return (
        <div style={{display: 'inline-block', padding: '2px'}}>
            <span ref={spanRef} style={{position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap'}}>
                {value}
            </span>
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onFinish();
                }}
                onBlur={onFinish}
                style={{
                    width: `${inputWidth + extraSpace}px`,
                    lineHeight: '10px',
                    verticalAlign: 'middle',
                    padding: '4px 8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    outline: 'none',
                    fontSize: '14px',
                }}
            />
        </div>
    );
};

export default AutoWidthInput;

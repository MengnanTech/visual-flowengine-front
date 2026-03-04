import React, {useEffect, useState} from 'react';
import styles from './Collapse.module.scss';

export interface CollapseItem {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

interface CollapseProps {
    items: CollapseItem[];
    activeKey?: string | string[];
    defaultActiveKey?: string | string[];
    onChange?: (keys: string | string[]) => void;
    size?: 'small' | 'default';
    bordered?: boolean;
}

const toArray = (val?: string | string[]): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
};

const CustomCollapse: React.FC<CollapseProps> = ({
    items,
    activeKey,
    defaultActiveKey,
    onChange,
    size = 'default',
    bordered = true,
}) => {
    const [internalKeys, setInternalKeys] = useState<string[]>(toArray(defaultActiveKey));

    const activeKeys = activeKey !== undefined ? toArray(activeKey) : internalKeys;

    useEffect(() => {
        if (activeKey !== undefined) {
            setInternalKeys(toArray(activeKey));
        }
    }, [activeKey]);

    const toggleKey = (key: string) => {
        let newKeys: string[];
        if (activeKeys.includes(key)) {
            newKeys = activeKeys.filter(k => k !== key);
        } else {
            newKeys = [...activeKeys, key];
        }

        if (activeKey === undefined) {
            setInternalKeys(newKeys);
        }
        onChange?.(newKeys);
    };

    return (
        <div className={`${styles.collapse} ${!bordered ? styles.collapseNoBorder : ''}`}>
            {items.map((item) => {
                const isOpen = activeKeys.includes(item.key);
                return (
                    <div key={item.key} className={styles.item} style={item.style}>
                        <div
                            className={`${styles.header} ${size === 'small' ? styles.headerSmall : ''}`}
                            onClick={() => toggleKey(item.key)}
                        >
                            <span className={`${styles.arrow} ${isOpen ? styles.arrowExpanded : ''}`}>
                                ▶
                            </span>
                            <span className={styles.label}>{item.label}</span>
                        </div>
                        {isOpen && (
                            <div className={styles.content}>
                                <div className={`${styles.contentInner} ${size === 'small' ? styles.contentInnerSmall : ''}`}>
                                    {item.children}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CustomCollapse;

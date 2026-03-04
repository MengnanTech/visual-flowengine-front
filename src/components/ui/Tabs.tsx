import React, {useState} from 'react';
import styles from './Tabs.module.scss';

export interface TabItem {
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
}

interface TabsProps {
    items: TabItem[];
    defaultActiveKey?: string;
    onChange?: (key: string) => void;
}

const CustomTabs: React.FC<TabsProps> = ({items, defaultActiveKey, onChange}) => {
    const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key || '');

    const handleTabClick = (key: string) => {
        setActiveKey(key);
        onChange?.(key);
    };

    const activeItem = items.find(item => item.key === activeKey);

    return (
        <div className={styles.tabs}>
            <div className={styles.tabList}>
                {items.map((item) => (
                    <div
                        key={item.key}
                        className={`${styles.tab} ${item.key === activeKey ? styles.tabActive : ''}`}
                        onClick={() => handleTabClick(item.key)}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
            <div className={styles.tabContent}>
                {activeItem?.children}
            </div>
        </div>
    );
};

export default CustomTabs;

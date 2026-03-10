import React from 'react';
import {QuestionCircleOutlinedIcon} from '@/components/ui/icons';

interface GithubConfirmModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const GithubConfirmModal: React.FC<GithubConfirmModalProps> = ({
    open,
    onConfirm,
    onCancel,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1002,
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 8,
                    padding: '20px 24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    maxWidth: 320,
                }}
                onClick={(event) => event.stopPropagation()}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16}}>
                    <QuestionCircleOutlinedIcon style={{color: '#7cb25d', width: 18, height: 18}}/>
                    <span>前往 GitHub 查看官方文档？</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                    <button onClick={onCancel} style={{padding: '4px 12px', background: '#f0f0f0', border: 'none', borderRadius: 4, cursor: 'pointer'}}>
                        No
                    </button>
                    <button onClick={onConfirm} style={{padding: '4px 12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}>
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GithubConfirmModal;

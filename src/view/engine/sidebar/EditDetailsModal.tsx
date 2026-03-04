import React, {useEffect, useState} from 'react';
import styles from './styles/Modal.module.scss';
import {Parameter, WorkflowMetadata} from '@/components/model/WorkflowModel.ts';
import {DataTypes} from '@/components/d3Helpers/treeHelpers.ts';

interface EditDetailsModalProps {
    treeData: WorkflowMetadata;
    onSave: (data: WorkflowMetadata) => Promise<void>;
    onClose: () => void;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({treeData, onSave, onClose}) => {
    const [purpose, setPurpose] = useState(treeData.workflowPurpose || '');
    const [parameters, setParameters] = useState<Parameter[]>(treeData.workflowParameters || []);
    const [remark, setRemark] = useState(treeData.remark || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const filteredParams = parameters.filter(p => p.parameterName.trim() !== '');
            await onSave({
                workflowId: treeData.workflowId,
                workflowPurpose: purpose,
                workflowParameters: filteredParams,
                remark: remark,
            });
            onClose();
        } catch {
            // error handled by parent
        } finally {
            setSaving(false);
        }
    };

    const addParameter = () => {
        setParameters([...parameters, {parameterName: 'NewParam', parameterType: 'String'}]);
    };

    const removeParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const updateParameter = (index: number, field: keyof Parameter, value: string) => {
        const newParams = [...parameters];
        newParams[index] = {...newParams[index], [field]: value};
        setParameters(newParams);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.title}>
                    Edit Workflow Details — {treeData.workflowName}
                    <span style={{color: '#e53e3e', fontSize: 14, marginLeft: 8}}>
                        (ID: {treeData.workflowId})
                    </span>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Purpose</label>
                    <input
                        className={styles.input}
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Workflow purpose"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Parameters</label>
                    {parameters.map((param, index) => (
                        <div key={index} className={styles.paramRow}>
                            <input
                                className={styles.input}
                                value={param.parameterName}
                                onChange={(e) => updateParameter(index, 'parameterName', e.target.value)}
                                placeholder="Parameter name"
                            />
                            <select
                                className={styles.select}
                                value={param.parameterType}
                                onChange={(e) => updateParameter(index, 'parameterType', e.target.value)}
                            >
                                {DataTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <button
                                className={styles.removeBtn}
                                onClick={() => removeParameter(index)}
                                title="Remove parameter"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <button className={styles.addParamBtn} onClick={addParameter}>
                        + Add Parameter
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Remark</label>
                    <textarea
                        className={styles.textarea}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Remark"
                    />
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles.btnDefault}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditDetailsModal;

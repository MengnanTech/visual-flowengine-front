import React, {useEffect, useState} from 'react';
import styles from './styles/Modal.module.scss';
import {WorkflowCreateRequest, Parameter} from '@/components/model/WorkflowModel.ts';
import {DataTypes} from '@/components/d3Helpers/treeHelpers.ts';

interface NewWorkflowModalProps {
    onSubmit: (data: WorkflowCreateRequest) => void;
    onClose: () => void;
}

const NewWorkflowModal: React.FC<NewWorkflowModalProps> = ({onSubmit, onClose}) => {
    const [workflowName, setWorkflowName] = useState('');
    const [workflowPurpose, setWorkflowPurpose] = useState('');
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [remark, setRemark] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!workflowName.trim()) {
            newErrors.workflowName = 'Please input the workflow name!';
        }
        if (!workflowPurpose.trim()) {
            newErrors.workflowPurpose = 'Please input the purpose of the workflow!';
        }
        // Validate parameters
        parameters.forEach((p, i) => {
            if (!p.parameterType) {
                newErrors[`paramType_${i}`] = 'Missing parameter type';
            }
            if (!p.parameterName.trim()) {
                newErrors[`paramName_${i}`] = 'Missing parameter name';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit({
            workflowName: workflowName.trim(),
            workflowDescription: workflowPurpose.trim(),
            workflowParameters: parameters,
            remark: remark.trim(),
        });
    };

    const addParameter = () => {
        setParameters([...parameters, {parameterName: '', parameterType: 'String'}]);
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
                <div className={styles.title}>Add Workflow</div>

                <div className={styles.field}>
                    <label className={`${styles.label} ${styles.required}`}>Workflow Name</label>
                    <div className={styles.tooltip}>建议用连贯的文字或者英文，考虑用下划线、横线和 "." 英文句点分割</div>
                    <input
                        className={styles.input}
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Enter workflow name"
                    />
                    {errors.workflowName && <div className={styles.error}>{errors.workflowName}</div>}
                </div>

                <div className={styles.field}>
                    <label className={`${styles.label} ${styles.required}`}>Workflow 用途</label>
                    <div className={styles.tooltip}>简明扼要描述使用场景和作用</div>
                    <input
                        className={styles.input}
                        value={workflowPurpose}
                        onChange={(e) => setWorkflowPurpose(e.target.value)}
                        placeholder="Describe the purpose and use case of the workflow"
                    />
                    {errors.workflowPurpose && <div className={styles.error}>{errors.workflowPurpose}</div>}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>定义 Workflow 输入参数</label>
                    <div className={styles.tooltip}>只是定义，不会增加代码的逻辑。只是文字性描述，规范使用</div>
                    {parameters.map((param, index) => (
                        <div key={index} className={styles.paramRow}>
                            <select
                                className={styles.select}
                                value={param.parameterType}
                                onChange={(e) => updateParameter(index, 'parameterType', e.target.value)}
                            >
                                <option value="" disabled>Select type</option>
                                {DataTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <input
                                className={styles.input}
                                value={param.parameterName}
                                onChange={(e) => updateParameter(index, 'parameterName', e.target.value)}
                                placeholder="Parameter Name"
                            />
                            <button
                                className={styles.removeBtn}
                                onClick={() => removeParameter(index)}
                                title="Remove parameter"
                            >
                                &times;
                            </button>
                            {(errors[`paramType_${index}`] || errors[`paramName_${index}`]) && (
                                <div className={styles.error}>
                                    {errors[`paramType_${index}`] || errors[`paramName_${index}`]}
                                </div>
                            )}
                        </div>
                    ))}
                    <button className={styles.addParamBtn} onClick={addParameter}>
                        + Add Parameter
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>备注</label>
                    <div className={styles.tooltip}>可选，对工作流的详细描述</div>
                    <textarea
                        className={styles.textarea}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="详细备注内容"
                    />
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles.btnDefault}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewWorkflowModal;

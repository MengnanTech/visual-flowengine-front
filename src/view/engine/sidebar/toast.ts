const TOAST_DURATION = 2500;

function createToast(text: string, type: 'success' | 'error') {
    const el = document.createElement('div');
    const bg = type === 'success' ? '#52c41a' : '#e53e3e';
    Object.assign(el.style, {
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        color: '#fff',
        padding: '8px 20px',
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: '9999',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'opacity 0.3s',
        opacity: '0',
    });
    el.textContent = text;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.opacity = '1';
    });

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
    }, TOAST_DURATION);
}

export const toast = {
    success: (text: string) => createToast(text, 'success'),
    error: (text: string) => createToast(text, 'error'),
};

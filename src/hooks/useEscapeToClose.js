import { useEffect } from 'react';

export function useEscapeToClose(isOpen, onClose) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);
}


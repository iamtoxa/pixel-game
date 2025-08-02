import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import Icon from '../Icon';
import styles from './AlertMessage.module.scss';

interface IProps {
    open?: boolean;
    onClose?: () => void;
    autoHideDuration?: number;
    icon?: string;
}

const AlertMessage: React.FC<React.PropsWithChildren<IProps>> = ({
    open,
    onClose,
    autoHideDuration = 2000,
    children,
    icon
}) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            if (autoHideDuration && onClose) {
                timerRef.current = setTimeout(() => {
                    setVisible(false);
                    setTimeout(onClose, 200); // дождаться анимации
                }, autoHideDuration);
            }
        } else {
            setVisible(false);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [open, autoHideDuration, onClose]);

    if (!open && !visible) return null;

    return ReactDOM.createPortal(
        <div className={styles.alertMessageWrapper}>
            <div className={styles.alertMessage + ' ' + (visible ? styles.show : styles.hide)}>
                <div className={styles.content}>
                    {icon && (
                        <Icon
                            src={icon}
                            className='w-5 h-5 shrink-0 !text-[#8FA479]'
                        />
                    )}
                    <span>{children}</span>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AlertMessage;
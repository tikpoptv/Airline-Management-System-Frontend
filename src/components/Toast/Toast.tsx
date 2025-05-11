import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>
        {type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
      </div>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeButton} onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
}; 
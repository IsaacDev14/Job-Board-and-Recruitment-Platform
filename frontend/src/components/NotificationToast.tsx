// src/components/NotificationToast.tsx
import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
  duration?: number; // Optional duration in milliseconds, default to 3000 (3 seconds)
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onDismiss, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? FaCheckCircle : FaTimesCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg text-white
        ${bgColor} transition-all duration-300 ease-out transform translate-x-0`}
    >
      <Icon className="mr-3" />
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-4 text-white hover:text-gray-100">
        <FaTimes />
      </button>
    </div>
  );
};

export default NotificationToast;
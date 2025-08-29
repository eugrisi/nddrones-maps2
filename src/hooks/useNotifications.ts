import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}; 
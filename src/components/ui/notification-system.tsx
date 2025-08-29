import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationComponent: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close se não for persistente
    if (!notification.persistent && notification.duration) {
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, notification.duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(autoCloseTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [notification.duration, notification.persistent]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/90 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50/90 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-blue-50/90 border-blue-500 text-blue-800`;
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 w-96 p-4 rounded-lg transition-all duration-300 z-50
        ${getStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemove
}) => {
  return (
    <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 80}px)`,
            zIndex: 50 - index
          }}
        >
          <NotificationComponent
            notification={notification}
            onClose={onRemove}
          />
        </div>
      ))}
    </div>
  );
};

// Hook para gerenciar notificações
export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Limitar a 5 notificações simultâneas
    setNotifications(prev => prev.slice(-5));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}; 
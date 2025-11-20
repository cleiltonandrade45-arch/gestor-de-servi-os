
import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationStyles = (type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-between transition-all duration-300 ease-in-out transform`}
          style={{ minWidth: '250px' }}
        >
          <span>{notification.message}</span>
          <button onClick={() => removeNotification(notification.id)} className="ml-4 text-white hover:text-gray-200 focus:outline-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification;

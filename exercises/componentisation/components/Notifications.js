import React from 'react';

const Notifications = ({ notifications, onMarkAsRead }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 border-l-4 ${
                  notification.read ? 'border-gray-300 bg-gray-50' : 'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between">
                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <button 
                      className="text-blue-500 text-xs hover:text-blue-700"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.date).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 
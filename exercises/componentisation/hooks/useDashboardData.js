import { useState, useEffect } from 'react';

const useDashboardData = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        
        // Fetch recent users
        const usersResponse = await fetch('/api/users/recent');
        const usersData = await usersResponse.json();
        
        // Fetch popular products
        const productsResponse = await fetch('/api/products/popular');
        const productsData = await productsResponse.json();
        
        // Fetch notifications
        const notificationsResponse = await fetch('/api/notifications');
        const notificationsData = await notificationsResponse.json();
        
        setStats(statsData);
        setRecentUsers(usersData);
        setPopularProducts(productsData);
        setNotifications(notificationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return {
    stats,
    recentUsers,
    popularProducts,
    notifications,
    loading,
    error,
    markNotificationAsRead
  };
};

export default useDashboardData; 
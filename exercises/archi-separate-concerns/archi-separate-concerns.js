// Architecture Understanding & Separation of Concerns Exercise
//
// This component violates proper architecture principles by:
// 1. Mixing data fetching, business logic, and UI rendering all in one place
// 2. Performing multiple responsibilities within a single component
// 3. Lacking proper separation between API calls, data processing, and UI
// 4. Containing both data fetching and state updates for unrelated features
//
// Your task: Refactor this component by:
// 1. Separating API calls into a dedicated service
// 2. Breaking down the UI into smaller, focused components
// 3. Properly separating business logic from presentation
// 4. Creating a proper architecture with clear separation of concerns

import React, { useState, useEffect } from 'react';
import OrderSummary from './components/OrderSummary';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import { orderService } from './services/orderService';

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customerEmails, setCustomerEmails] = useState([]);
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.fetchOrders();
        setOrders(data);
        
        // Calculate total revenue
        const revenue = data.reduce((sum, order) => sum + order.total, 0);
        setTotalRevenue(revenue);
        
        // Extract customer emails
        const emails = [...new Set(data.map(order => order.customerEmail))];
        setCustomerEmails(emails);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'completed') return order.status === 'completed';
    if (filter === 'processing') return order.status === 'processing';
    if (filter === 'shipped') return order.status === 'shipped';
    return true;
  });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'total') {
      return b.total - a.total;
    }
    return 0;
  });
  
  // Handle order actions
  const handleSendReminder = async (orderId) => {
    try {
      await orderService.sendReminderEmail(orderId);
      alert('Reminder email sent successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleMarkShipped = async (orderId) => {
    try {
      await orderService.markOrderAsShipped(orderId);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'shipped' } : order
      ));
      alert('Order marked as shipped');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>
      
      <OrderSummary
        totalOrders={orders.length}
        totalRevenue={totalRevenue}
        uniqueCustomers={customerEmails.length}
      />
      
      <OrderFilters
        filter={filter}
        sortBy={sortBy}
        onFilterChange={setFilter}
        onSortChange={setSortBy}
      />
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <OrderList
          orders={sortedOrders}
          onSendReminder={handleSendReminder}
          onMarkShipped={handleMarkShipped}
        />
      )}
    </div>
  );
};

export default OrdersDashboard;

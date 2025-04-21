import React, { useState, useEffect, useMemo } from 'react';
import OrderSummary from './OrderSummary';
import OrderFilters from './OrderFilters';
import OrderList from './OrderList';
import { orderService, Order } from '../services/orderService';

const OrdersDashboard: React.FC = () => {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');

  // Data fetching
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.fetchOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Business logic for data processing
  const { totalRevenue, uniqueCustomers } = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const customers = new Set(orders.map(order => order.email)).size;
    return { totalRevenue: revenue, uniqueCustomers: customers };
  }, [orders]);

  // Business logic for filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    // Filter orders
    const filtered = orders.filter(order => {
      if (filter === 'all') return true;
      return order.status === filter;
    });

    // Sort orders
    return [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      } else if (sortBy === 'total') {
        return b.totalAmount - a.totalAmount;
      }
      return 0;
    });
  }, [orders, filter, sortBy]);

  // Business logic for order actions
  const handleSendReminder = async (orderId: number) => {
    try {
      await orderService.sendReminderEmail(orderId);
      // Optionally show a success message or update UI
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
    }
  };

  const handleMarkShipped = async (orderId: number) => {
    try {
      const updatedOrder = await orderService.markOrderAsShipped(orderId);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark order as shipped');
    }
  };

  // UI rendering
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>
      
      <OrderSummary
        totalOrders={orders.length}
        totalRevenue={totalRevenue}
        uniqueCustomers={uniqueCustomers}
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
          orders={filteredAndSortedOrders}
          onSendReminder={handleSendReminder}
          onMarkShipped={handleMarkShipped}
        />
      )}
    </div>
  );
};

export default OrdersDashboard; 
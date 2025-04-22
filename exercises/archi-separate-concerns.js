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

// Simple API object with direct fetch calls
const api = {
  fetchOrders: () => fetch('/api/orders').then(res => res.json()),
  sendReminder: (id) => fetch(`/api/orders/${id}/send-reminder`, { method: 'POST' }).then(res => res.json()),
  markShipped: (id) => fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'shipped' })
  }).then(res => res.json())
};

// Constants
const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800'
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'completed', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' }
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Sort by Date' },
  { value: 'total', label: 'Sort by Total' }
];

// Error codes
const ERROR_CODES = {
  FETCH_ORDERS_FAILED: 'FETCH_ORDERS_FAILED',
  SEND_REMINDER_FAILED: 'SEND_REMINDER_FAILED',
  MARK_SHIPPED_FAILED: 'MARK_SHIPPED_FAILED',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS'
};

// Utility functions
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

// Simple UI Components
function Select({ value, onChange, options }) {
  return (
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-md"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function DashboardHeader({ orders, revenue, customers }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-2">Dashboard Summary</h2>
      <p>Total Orders: {orders}</p>
      <p>Total Revenue: {formatCurrency(revenue)}</p>
      <p>Unique Customers: {customers}</p>
    </div>
  );
}

function OrderFilters({ filter, onFilterChange, sort, onSortChange }) {
  return (
    <div className="mb-6 flex gap-4">
      <Select value={filter} onChange={onFilterChange} options={FILTER_OPTIONS} />
      <Select value={sort} onChange={onSortChange} options={SORT_OPTIONS} />
    </div>
  );
}

function OrderStatus({ status }) {
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function OrderActions({ id, status, onReminder, onShip }) {
  return (
    <div className="space-x-4">
      <button onClick={() => onReminder(id)} className="text-indigo-600 hover:text-indigo-900">
        Send Reminder
      </button>
      {status !== 'shipped' && (
        <button onClick={() => onShip(id)} className="text-green-600 hover:text-green-900">
          Mark Shipped
        </button>
      )}
    </div>
  );
}

function OrderTable({ orders, onReminder, onShip }) {
  if (!orders.length) {
    return <p className="text-center py-4">No orders found</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orders.map(order => (
          <tr key={order.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm">#{order.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {order.customerName}<br/>{order.customerEmail}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(order.date)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <OrderStatus status={order.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatCurrency(order.total)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <OrderActions 
                id={order.id}
                status={order.status}
                onReminder={onReminder}
                onShip={onShip}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Error handling utility
function handleError(error, code) {
  console.error(`[${code}] ${error.message}`);
  return { ok: false, code, error: error.message };
}

// Order Service Class
class OrderService {
  constructor(api) {
    this.api = api;
  }

  async fetchOrders() {
    try {
      const { data, ok } = await this.api.fetchOrders();
      if (!ok) throw new Error('Failed to fetch orders');
      return { ok: true, data };
    } catch (error) {
      return handleError(error, ERROR_CODES.FETCH_ORDERS_FAILED);
    }
  }

  async sendReminder(orderId) {
    try {
      const { ok } = await this.api.sendReminder(orderId);
      if (!ok) throw new Error('Failed to send reminder');
      return { ok: true };
    } catch (error) {
      return handleError(error, ERROR_CODES.SEND_REMINDER_FAILED);
    }
  }

  async markAsShipped(orderId) {
    try {
      const { ok } = await this.api.markShipped(orderId);
      if (!ok) throw new Error('Failed to mark order as shipped');
      return { ok: true };
    } catch (error) {
      return handleError(error, ERROR_CODES.MARK_SHIPPED_FAILED);
    }
  }

  calculateMetrics(orders) {
    return orders.reduce((acc, order) => ({
      totalOrders: acc.totalOrders + 1,
      totalRevenue: acc.totalRevenue + order.total,
      customerEmails: acc.customerEmails.add(order.customerEmail)
    }), {
      totalOrders: 0,
      totalRevenue: 0,
      customerEmails: new Set()
    });
  }

  filterOrders(orders, filter) {
    return orders.filter(order => filter === 'all' || order.status === filter);
  }

  sortOrders(orders, sortBy) {
    return [...orders].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      return b.total - a.total;
    });
  }
}

// Initialize service
const orderService = new OrderService(api);

function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Processed data
  const filteredOrders = orderService.filterOrders(orders, filter);
  const sortedOrders = orderService.sortOrders(filteredOrders, sortBy);
  const metrics = orderService.calculateMetrics(orders);
  
  const dashboardMetrics = {
    totalOrders: metrics.totalOrders,
    totalRevenue: metrics.totalRevenue,
    uniqueCustomers: metrics.customerEmails.size
  };

  // Event handlers
  async function handleFetchOrders() {
    try {
      setLoading(true);
      setError(null);
      const { ok, data, code, error } = await orderService.fetchOrders();
      if (!ok) {
        setError({ code, message: error });
        return;
      }
      setOrders(data);
    } catch (err) {
      setError({ code: ERROR_CODES.FETCH_ORDERS_FAILED, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReminder(id) {
    const { ok, code, error } = await orderService.sendReminder(id);
    if (!ok) {
      alert(`Failed to send reminder: ${error}`);
      return;
    }
    alert('Reminder sent');
  }

  async function handleShipOrder(id) {
    const { ok, code, error } = await orderService.markAsShipped(id);
    if (!ok) {
      alert(`Failed to mark order as shipped: ${error}`);
      return;
    }
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === id ? { ...order, status: 'shipped' } : order
      )
    );
    alert('Order marked as shipped');
  }

  // Effects
  useEffect(() => {
    handleFetchOrders();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        <p className="font-semibold">Error: {error.code}</p>
        <p>{error.message}</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>
      
      <DashboardHeader 
        orders={dashboardMetrics.totalOrders}
        revenue={dashboardMetrics.totalRevenue}
        customers={dashboardMetrics.uniqueCustomers}
      />
      
      <OrderFilters 
        filter={filter}
        onFilterChange={setFilter}
        sort={sortBy}
        onSortChange={setSortBy}
      />
      
      <OrderTable 
        orders={sortedOrders}
        onReminder={handleSendReminder}
        onShip={handleShipOrder}
      />
    </div>
  );
}

export default OrdersDashboard;

import React from 'react';
import { Order } from '../services/orderService';

interface OrderFiltersProps {
  filter: Order['status'] | 'all';
  sortBy: 'date' | 'total';
  onFilterChange: (value: Order['status'] | 'all') => void;
  onSortChange: (value: 'date' | 'total') => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filter,
  sortBy,
  onFilterChange,
  onSortChange,
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <select
        value={filter}
        onChange={(e) => onFilterChange(e.target.value as Order['status'] | 'all')}
        className="px-4 py-2 border border-gray-300 rounded-md"
      >
        <option value="all">All Orders</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'date' | 'total')}
        className="px-4 py-2 border border-gray-300 rounded-md"
      >
        <option value="date">Sort by Date</option>
        <option value="total">Sort by Total</option>
      </select>
    </div>
  );
};

export default OrderFilters; 
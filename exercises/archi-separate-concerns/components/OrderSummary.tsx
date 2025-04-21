import React from 'react';

interface OrderSummaryProps {
  totalOrders: number;
  totalRevenue: number;
  uniqueCustomers: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalOrders,
  totalRevenue,
  uniqueCustomers,
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-2">Dashboard Summary</h2>
      <p className="mb-1">Total Orders: {totalOrders}</p>
      <p className="mb-1">Total Revenue: ${totalRevenue.toFixed(2)}</p>
      <p>Unique Customers: {uniqueCustomers}</p>
    </div>
  );
};

export default OrderSummary; 
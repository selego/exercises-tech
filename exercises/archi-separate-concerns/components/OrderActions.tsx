import React from 'react';
import { Order } from '../services/orderService';

interface OrderActionsProps {
  orderId: number;
  status: Order['status'];
  onSendReminder: (orderId: number) => void;
  onMarkShipped: (orderId: number) => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  orderId,
  status,
  onSendReminder,
  onMarkShipped,
}) => {
  return (
    <div className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button
        onClick={() => onSendReminder(orderId)}
        className="text-indigo-600 hover:text-indigo-900 mr-4"
      >
        Send Reminder
      </button>
      {status !== 'shipped' && (
        <button
          onClick={() => onMarkShipped(orderId)}
          className="text-green-600 hover:text-green-900"
        >
          Mark Shipped
        </button>
      )}
    </div>
  );
};

export default OrderActions; 
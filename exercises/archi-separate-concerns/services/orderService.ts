// Service layer for handling all API calls related to order management
import axios, { AxiosError } from 'axios';

// Base URL for the API endpoints
const API_BASE_URL = 'https://api.example.com';

// Type definitions for the data models
export interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed';
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  email: string;
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

// Custom error class for API-related errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API errors consistently
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new ApiError(
      axiosError.response?.data?.message || 'An API error occurred',
      axiosError.response?.status,
      error
    );
  }
  throw new ApiError('An unexpected error occurred', undefined, error);
};

// Service object containing all API methods
export const orderService = {
  // Fetch all orders with optional filtering
  async fetchOrders(status?: Order['status']): Promise<Order[]> {
    try {
      const url = status 
        ? `${API_BASE_URL}/orders?status=${status}`
        : `${API_BASE_URL}/orders`;
      const response = await axios.get<Order[]>(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Send a reminder email for a specific order
  async sendReminderEmail(orderId: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/orders/${orderId}/reminder`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update order status to shipped
  async markOrderAsShipped(orderId: number): Promise<Order> {
    try {
      const response = await axios.put<Order>(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: 'shipped' }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get details of a specific order
  async getOrderDetails(orderId: number): Promise<Order> {
    try {
      const response = await axios.get<Order>(`${API_BASE_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}; 
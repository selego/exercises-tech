// Separation of Concerns for Service Files Exercise
//
// This service file mixes general utility functions with business logic:
// 1. Contains both general API service functions and specific business operations
// 2. Mixes authentication logic with data fetching
// 3. Includes UI-related logic (alerts, redirects) within the service layer
// 4. Has inconsistent error handling patterns
//
// Your task: Refactor this to:
// 1. Separate general-purpose API functions from business logic
// 2. Remove UI-related code from the service layer
// 3. Create a clean, reusable service structure
// 4. Implement consistent error handling

// src/services/userService.js
import { setToken, removeToken } from '../utils/auth';

// Base API service for general HTTP operations
class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }
}

// User service for business logic
class UserService {
  constructor() {
    this.api = new ApiService();
  }

  async login(email, password) {
    const { data, error } = await this.api.post('/auth/login', { email, password });
    
    if (error) {
      return { success: false, error };
    }

    // Store token and user data
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return { success: true, user: data.user };
  }

  async register(userData) {
    const { data, error } = await this.api.post('/auth/register', userData);
    
    if (error) {
      return { success: false, error };
    }

    return { success: true, user: data };
  }

  async getUserProfile() {
    const { data, error } = await this.api.get('/user/profile');
    
    if (error) {
      return { success: false, error };
    }

    return { success: true, user: data };
  }

  async updateUserProfile(profileData) {
    const { data, error } = await this.api.put('/user/profile', profileData);
    
    if (error) {
      return { success: false, error };
    }

    // Update stored user data
    const currentUser = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...profileData
    }));

    return { success: true, user: data };
  }

  logout() {
    removeToken();
    localStorage.removeItem('user');
    return { success: true };
  }
}

// Export a singleton instance of the user service
export const userService = new UserService();

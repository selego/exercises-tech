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

// General API service mixed with specific authentication logic
const api = {
  baseUrl: '/api',
  
  // Makes a GET request to the API
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API GET error:', error);
      alert('Failed to fetch data. Please try again.'); // UI logic in service layer
      return null;
    }
  },
  
  // Makes a POST request to the API
  async post(endpoint, body) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API POST error:', error);
      return { error: error.message };
    }
  },
  
  // Makes a PUT request to the API
  async put(endpoint, body) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data.message);
        return { ok: false, data };
      }
      
      return { ok: true, data };
    } catch (error) {
      console.error('API PUT error:', error);
      return { ok: false, error: error.message };
    }
  }
};

// User login - business logic mixed with authentication
export const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store token in localStorage
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // UI-related logic in service
    if (data.user.isAdmin) {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    // UI alert in service method
    alert(`Login failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// User register
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.error) {
    alert(`Registration failed: ${response.error}`); // UI logic
    return { success: false, error: response.error };
  }
  
  // Automatically log the user in
  return await login(userData.email, userData.password);
};

// Get user profile
export const getUserProfile = async () => {
  const data = await api.get('/user/profile');
  
  if (!data) {
    return null;
  }
  
  return data;
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  const result = await api.put('/user/profile', profileData);
  
  if (result.ok) {
    // UI alert in service
    alert('Profile updated successfully!');
    
    // Update stored user data
    const currentUser = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...profileData
    }));
    
    return { success: true, user: result.data };
  } else {
    alert(`Failed to update profile: ${result.error}`);
    return { success: false, error: result.error };
  }
};

// Logout user
export const logout = () => {
  removeToken();
  localStorage.removeItem('user');
  
  // UI/routing logic in service
  window.location.href = '/login';
};

export default {
  login,
  register,
  getUserProfile,
  updateUserProfile,
  logout
};

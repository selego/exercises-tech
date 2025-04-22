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

// src/services/apiService.js
import { setToken, removeToken } from '../utils/auth';

// Error codes for consistent error handling
const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  BAD_REQUEST: 'BAD_REQUEST',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND'
};

// Base API service class for handling HTTP requests
class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      
      if (!response.ok) {
        return { ok: false, code: this._getErrorCode(response.status), data };
      }
      
      return { ok: true, data };
    } catch (error) {
      return { ok: false, code: ERROR_CODES.SERVER_ERROR, error: error.message };
    }
  }

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
        return { ok: false, code: this._getErrorCode(response.status), data };
      }
      
      return { ok: true, data };
    } catch (error) {
      return { ok: false, code: ERROR_CODES.SERVER_ERROR, error: error.message };
    }
  }

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
        return { ok: false, code: this._getErrorCode(response.status), data };
      }
      
      return { ok: true, data };
    } catch (error) {
      return { ok: false, code: ERROR_CODES.SERVER_ERROR, error: error.message };
    }
  }

  _getErrorCode(status) {
    switch (status) {
      case 400:
        return ERROR_CODES.BAD_REQUEST;
      case 401:
        return ERROR_CODES.UNAUTHORIZED;
      case 404:
        return ERROR_CODES.USER_NOT_FOUND;
      default:
        return ERROR_CODES.SERVER_ERROR;
    }
  }
}

// User service for handling user-specific operations
class UserService {
  constructor(apiService) {
    this.api = apiService;
  }

  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    
    if (!response.ok) {
      return response;
    }
    
    setToken(response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return { ok: true, data: response.data.user };
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    
    if (!response.ok) {
      return response;
    }
    
    return this.login(userData.email, userData.password);
  }

  async getUserProfile() {
    return this.api.get('/user/profile');
  }

  async updateUserProfile(profileData) {
    const response = await this.api.put('/user/profile', profileData);
    
    if (response.ok) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...profileData
      }));
    }
    
    return response;
  }

  logout() {
    removeToken();
    localStorage.removeItem('user');
  }
}

// Initialize services
const apiService = new ApiService();
const userService = new UserService(apiService);

export { apiService, userService, ERROR_CODES };
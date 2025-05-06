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
import { removeToken, setToken } from '../utils/auth';

// General API service mixed with specific authentication logic
const api = {
  constructor() {
    this.token = "";
  },

  getToken() {
    return this.token;
  },

  setToken(token) {
    this.token = token;
  },

  baseUrl: '/api',

  
  
  // Makes a GET request to the API
  get(endpoint) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          mode: "cors",
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
        });

        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  },
  
  // Makes a POST request to the API
  async post(endpoint, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          mode: "cors",
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });

        const res = await response.json();
        if (response.status !== 200) {
          return reject(res);
        }
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  },
  
  // Makes a PUT request to the API
  async put(endpoint, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          mode: "cors",
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", Authorization: `JWT ${this.token}` },
          body: typeof body === "string" ? body : JSON.stringify(body),
        });

        const res = await response.json();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  },
};

const API = new api();
export default API;




// In controller Auth.js
// User login - business logic mixed with authentication
export const login = async (email, password) => {
  try {
    const {data, ok} = await api.post('/api/auth/login', {
      email,
      password
    });
        
    if (!ok) throw new Error(data.message || 'Login failed')
    
    // Store token in localStorage
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { success: true, user: data.user };
  } catch (error) {
    // UI alert in service method
    return { success: false, error: error.message };
  }
};

// User register
export const register = async (userData) => {
  const {data, ok} = await api.post('/auth/register', {userData});
  
  if (data.error) {
    return { success: false, error: data.error };
  }
  
  // Automatically log the user in
  return await login(userData.email, userData.password);
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
  logout
};

import { useState, useEffect } from 'react';
import api from '../services/api';

const HealthCheck = () => {
  const [health, setHealth] = useState({
    status: 'checking',
    message: 'Checking server health...'
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        setHealth({
          status: response.status === 'ok' ? 'healthy' : 'unhealthy',
          message: response.status === 'ok' ? 'Server is healthy' : 'Server is not responding properly'
        });
        setError(null);
      } catch (err) {
        setHealth({
          status: 'error',
          message: 'Failed to connect to server'
        });
        setError(err.message);
      }
    };

    checkHealth();
  }, []);

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'unhealthy':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Server Health Check</h2>
      <div className="flex items-center space-x-4">
        <div className={`px-4 py-2 rounded-full ${getStatusColor()}`}>
          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </div>
        <p className="text-gray-600">{health.message}</p>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default HealthCheck; 
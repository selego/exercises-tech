import React from 'react';
import HealthCheck from '../components/HealthCheck';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your App
        </h1>
        <p className="text-xl text-gray-600">
          This is a modern full-stack application boilerplate.
        </p>
      </div>
      <HealthCheck />
    </div>
  );
};

export default Home; 
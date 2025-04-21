import React from 'react';

export const SearchFilters = ({ filters, handleFilterChange, allowFiltering }) => {
  if (!allowFiltering) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <select 
        name="category"
        value={filters.category}
        onChange={handleFilterChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="home">Home & Garden</option>
      </select>
      
      <input 
        type="number" 
        name="minPrice"
        value={filters.minPrice}
        onChange={handleFilterChange}
        placeholder="Min Price" 
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <input 
        type="number" 
        name="maxPrice"
        value={filters.maxPrice}
        onChange={handleFilterChange}
        placeholder="Max Price" 
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="flex items-center">
        <input 
          type="checkbox" 
          id="inStock"
          name="inStock"
          checked={filters.inStock}
          onChange={handleFilterChange}
          className="mr-2 h-5 w-5 text-blue-600" 
        />
        <label htmlFor="inStock" className="text-gray-700">In Stock Only</label>
      </div>
    </div>
  );
}; 
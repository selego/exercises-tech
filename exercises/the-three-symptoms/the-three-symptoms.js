import React from 'react';
import { useProductSearch } from './useProductSearch';
import { SearchFilters } from './SearchFilters';
import { ProductList } from './ProductList';
import { Pagination } from './Pagination';

const ProductSearch = ({ 
  initialQuery = '', 
  showRatings = true, 
  allowFiltering = true, 
  sortOptions = ['relevance', 'price-low', 'price-high'],
  saveSearchState = true
}) => {
  const {
    products,
    loading,
    error,
    query,
    setQuery,
    filters,
    handleFilterChange,
    page,
    setPage,
    sortBy,
    setSortBy
  } = useProductSearch({ initialQuery, saveSearchState });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <input 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Search products..." 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <SearchFilters 
        filters={filters}
        handleFilterChange={handleFilterChange}
        allowFiltering={allowFiltering}
      />
      
      <div className="mb-6">
        <select 
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map(option => (
            <option key={option} value={option}>
              {option === 'relevance' ? 'Relevance' : 
               option === 'price-low' ? 'Price: Low to High' : 
               option === 'price-high' ? 'Price: High to Low' : option}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <ProductList 
          products={products}
          showRatings={showRatings}
        />
      )}
      
      <Pagination 
        page={page}
        setPage={setPage}
      />
    </div>
  );
};

export default ProductSearch; 
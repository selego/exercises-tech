// The 3 Complexity Symptoms Exercise
//
// This component exhibits all three symptoms of complexity:
// 
// 1. Unknown Unknowns: Incomplete error handling in data fetching
//    - API errors are not properly handled
//    - Network failures aren't properly communicated to users
//
// 2. Cognitive Load: Too many responsibilities in one component
//    - Mixing UI, data fetching, filtering, sorting, and business logic
//    - Complex calculations and transformations
//    - Difficult to understand the data flow
//
// 3. Change Amplification: Tight coupling between different concerns
//    - Changes to one feature might affect others
//    - UI, data fetching, and business logic are intertwined
//
// Your task: Refactor this component to address these symptoms by:
// 1. Improving error handling for better predictability
// 2. Breaking down the component to reduce cognitive load
// 3. Decoupling functionality to reduce change amplification
// 4. Applying proper separation of concerns

import React, { useCallback, useEffect, useMemo, useState } from 'react';

const ProductSearch = ({ 
  initialQuery = '', 
  showRatings = true, 
  allowFiltering = true, 
  sortOptions = ['relevance', 'price-low', 'price-high'],
  saveSearchState = true
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  
  // Complex fetch function with unknown unknowns (no proper error handling)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const {data, ok} = await api.get(`/api/products/search`, {
          q: query,
          page: page,
          sort: sortBy,
          ...filters
      });
      if (!ok) return toast.error("Failed to fetch products");

        setProducts(data.products);
        setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Search error:', err.err);
    }
  };
  
  // High cognitive load with complex memoization
  const categorizedProducts = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});
  
  
  // Effect with change amplification risk
  useEffect(() => {
    if (query.length > 0) {
      fetchProducts();
    }
  }, [fetchProducts, query]);
  
  // Local storage effect causing change amplification

  const debouncedSaveSearchState = debounce(() => {
    if (saveSearchState) {
      localStorage.setItem('lastSearchQuery', query);
      localStorage.setItem('lastSearchFilters', JSON.stringify(filters));
    }
  }, 1000);


  useEffect(() => {
    debouncedSaveSearchState();
    return () => debouncedSaveSearchState.cancel();
  }, [query, filters]); 

  useEffect(() => {
    return () => {
      if (saveSearchState) {
        localStorage.removeItem('lastSearchQuery');
        localStorage.removeItem('lastSearchFilters');
      }
    };
  }, [saveSearchState]);

  // Complex handler with conditional logic
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFilters(prev => ({
      ...prev,
      [name]: newValue,
    }));
    setPage(1); // Reset page when filters change
  };

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
      
      {allowFiltering && (
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
      )}
      
      <div className="mb-6">
        <select 
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map(option => (
            <SortOption key={option} option={option} />
          ))}
        </select>
      </div>
      
      
      <ProductList 
        categorizedProducts={categorizedProducts}
        showRatings={showRatings}
        loading={loading}
        error={error} 
      />
      
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 mx-1 bg-gray-100 text-gray-700 rounded-md">
          Page {page}
        </span>
        <button 
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductSearch;



const SortOption = ({ option }) => {
  let label = option; // Default to the option value itself
  if (option === 'relevance') label = 'Relevance'
  if (option === 'price-low') label = 'Price: Low to High'
  if (option === 'price-high') label = 'Price: High to Low';
  return <option value={option}>{label}</option>;
};


const ProductList = ({ categorizedProducts, showRatings, loading, error }) => {

  if (loading){
    return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )}
  
  if (error) {
    return (
    <div className="text-red-500 text-center py-4">{error}</div>
  ) }

  return (
    <div>
      {Object.entries(categorizedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                  {showRatings && (
                    <div className="flex mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )}

  

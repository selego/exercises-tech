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

import React, { useState, useEffect } from 'react';

// Simple error codes
const ERRORS = {
  SERVER: 'SERVER_ERROR',
  NETWORK: 'NETWORK_ERROR'
};

// Simple API client
const api = {
  async search(params) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/products/search?${query}`);
      const data = await response.json();
      return { data: data.products || [], ok: true };
    } catch (error) {
      return { ok: false, error: ERRORS.SERVER };
    }
  }
};

// Custom hook for search state
const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  
  return {
    query,
    setQuery,
    page,
    setPage,
    sortBy,
    setSortBy
  };
};

// Custom hook for filter state
const useFilters = () => {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return { filters, handleFilterChange };
};

// Custom hook for product fetching
const useProducts = (query, page, sortBy, filters) => {
  const [state, setState] = useState({
    products: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) return;

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, ok, error } = await api.search({
        q: query,
        page,
        sort: sortBy,
        ...filters
      });

      setState({
        products: ok ? data : [],
        loading: false,
        error: ok ? null : error
      });
    };

    fetchProducts();
  }, [query, page, sortBy, filters]);

  return state;
};

// Simple search input component
const SearchInput = ({ value, onChange }) => (
  <input 
    type="text" 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    placeholder="Search products..." 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

// Simple sort selector component
const SortSelector = ({ value, onChange, options }) => (
  <select 
    value={value}
    onChange={e => onChange(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {options.map(option => (
      <option key={option} value={option}>
        {option === 'relevance' ? 'Relevance' : 
         option === 'price-low' ? 'Price: Low to High' : 
         'Price: High to Low'}
      </option>
    ))}
  </select>
);

// Simple pagination component
const Pagination = ({ page, onPageChange }) => (
  <div className="flex justify-center mt-8">
    <button 
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
    >
      Previous
    </button>
    <span className="px-4 py-2 mx-1 bg-gray-100 text-gray-700 rounded-md">
      Page {page}
    </span>
    <button 
      onClick={() => onPageChange(page + 1)}
      className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-md"
    >
      Next
    </button>
  </div>
);

// Rating stars component
const RatingStars = ({ rating }) => (
  <div className="flex mb-2">
    {[1, 2, 3, 4, 5].map(star => (
      <span 
        key={star} 
        className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
      >
        ★
      </span>
    ))}
  </div>
);

// Product image component
const ProductImage = ({ src, alt }) => (
  <img 
    src={src} 
    alt={alt} 
    className="w-full h-48 object-cover"
  />
);

// Product details component
const ProductDetails = ({ name, price }) => (
  <>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">
      {name}
    </h3>
    <p className="text-gray-600 mb-2">
      ${price.toFixed(2)}
    </p>
  </>
);

// Add to cart button component
const AddToCartButton = () => (
  <button 
    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full transition-colors"
    onClick={() => console.log('Add to cart clicked')}
  >
    Add to Cart
  </button>
);

// Simplified product card
const ProductCard = ({ product, showRatings }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
    <ProductImage src={product.image} alt={product.name} />
    <div className="p-4">
      <ProductDetails name={product.name} price={product.price} />
      {showRatings && <RatingStars rating={product.rating} />}
      <AddToCartButton />
    </div>
  </div>
);

// Category selector component
const CategorySelector = ({ value, onChange }) => (
  <select 
    name="category"
    value={value}
    onChange={onChange}
    className="px-4 py-2 border border-gray-300 rounded-md"
  >
    <option value="">All Categories</option>
    <option value="electronics">Electronics</option>
    <option value="clothing">Clothing</option>
    <option value="home">Home & Garden</option>
  </select>
);

// Price range inputs component
const PriceRangeInputs = ({ minPrice, maxPrice, onChange }) => (
  <>
    <input 
      type="number"
      name="minPrice"
      value={minPrice}
      onChange={onChange}
      placeholder="Min Price"
      className="px-4 py-2 border border-gray-300 rounded-md"
    />
    <input 
      type="number"
      name="maxPrice"
      value={maxPrice}
      onChange={onChange}
      placeholder="Max Price"
      className="px-4 py-2 border border-gray-300 rounded-md"
    />
  </>
);

// Stock filter component
const StockFilter = ({ checked, onChange }) => (
  <label className="flex items-center cursor-pointer">
    <input 
      type="checkbox"
      name="inStock"
      checked={checked}
      onChange={onChange}
      className="mr-2"
    />
    <span className="text-gray-700">In Stock Only</span>
  </label>
);

// Simplified filters section
const ProductFilters = ({ filters, onFilterChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <CategorySelector 
      value={filters.category}
      onChange={onFilterChange}
    />
    <PriceRangeInputs 
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      onChange={onFilterChange}
    />
    <StockFilter 
      checked={filters.inStock}
      onChange={onFilterChange}
    />
  </div>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="text-red-500 text-center py-4">
    {message}
  </div>
);

// Search header section
const SearchHeader = ({ 
  query, 
  onQueryChange, 
  sortBy, 
  onSortChange,
  sortOptions,
  filters,
  onFilterChange,
  allowFiltering 
}) => (
  <>
    <div className="mb-6">
      <SearchInput 
        value={query}
        onChange={onQueryChange}
      />
    </div>

    {allowFiltering && (
      <ProductFilters 
        filters={filters}
        onFilterChange={onFilterChange}
      />
    )}

    <div className="mb-6">
      <SortSelector 
        value={sortBy}
        onChange={onSortChange}
        options={sortOptions}
      />
    </div>
  </>
);

// Product grid component
const ProductGrid = ({ products, showRatings }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {products.map(product => (
      <ProductCard 
        key={product.id}
        product={product}
        showRatings={showRatings}
      />
    ))}
  </div>
);

// Main content area
const MainContent = ({ loading, error, products, showRatings }) => {
  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return <ProductGrid products={products} showRatings={showRatings} />;
};

// Main ProductSearch component - now much simpler
const ProductSearch = ({ 
  initialQuery = '', 
  showRatings = true, 
  allowFiltering = true, 
  sortOptions = ['relevance', 'price-low', 'price-high']
}) => {
  const search = useSearch(initialQuery);
  const { filters, handleFilterChange } = useFilters();
  const { products, loading, error } = useProducts(
    search.query,
    search.page,
    search.sortBy,
    filters
  );

  return (
    <div className="container mx-auto p-4">
      <SearchHeader 
        query={search.query}
        onQueryChange={search.setQuery}
        sortBy={search.sortBy}
        onSortChange={search.setSortBy}
        sortOptions={sortOptions}
        filters={filters}
        onFilterChange={handleFilterChange}
        allowFiltering={allowFiltering}
      />

      <MainContent 
        loading={loading}
        error={error}
        products={products}
        showRatings={showRatings}
      />

      <Pagination 
        page={search.page}
        onPageChange={search.setPage}
      />
    </div>
  );
};

export default ProductSearch;
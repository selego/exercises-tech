import { useState, useCallback, useEffect } from 'react';

export const useProductSearch = ({ initialQuery = '', saveSearchState = true }) => {
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page);
    params.append('sort', sortBy);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false) params.append(key, value);
    });
    
    try {
      const response = await fetch(`/api/products/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.products) {
        throw new Error('Invalid response format: products array missing');
      }
      
      setProducts(data.products);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, page, sortBy, filters]);

  useEffect(() => {
    if (query.length > 0) {
      fetchProducts();
    }
  }, [fetchProducts, query]);

  useEffect(() => {
    if (saveSearchState) {
      localStorage.setItem('lastSearchQuery', query);
      localStorage.setItem('lastSearchFilters', JSON.stringify(filters));
    }
    return () => {
      if (saveSearchState) {
        localStorage.removeItem('lastSearchQuery');
        localStorage.removeItem('lastSearchFilters');
      }
    };
  }, [query, filters, saveSearchState]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPage(1);
  };

  return {
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
  };
}; 
import React, { useMemo } from 'react';

const ProductCard = ({ product, showRatings }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
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
);

export const ProductList = ({ products, showRatings }) => {
  const categorizedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
  }, [products]);

  return (
    <div>
      {Object.entries(categorizedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                showRatings={showRatings} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 
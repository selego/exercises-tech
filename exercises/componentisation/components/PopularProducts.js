import React from 'react';

const PopularProducts = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Popular Products</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="flex items-center">
              <div className="h-12 w-12 rounded overflow-hidden bg-gray-100">
                <img src={product.image || 'https://via.placeholder.com/48'} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {product.sales} sales
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularProducts; 
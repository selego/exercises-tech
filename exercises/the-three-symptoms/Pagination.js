import React from 'react';

export const Pagination = ({ page, setPage }) => (
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
); 
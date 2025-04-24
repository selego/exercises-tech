// KISS Principle Exercise
//
// This component violates the KISS principle in several ways:
// - It uses unnecessary abstractions (useCallback, useMemo)
// - It has complex state management that's hard to follow
// - It mixes concerns between data fetching, processing, and UI rendering
//
// Your task: Simplify this component by:
// 1. Removing unnecessary abstractions 
// 2. Streamlining the data fetching
// 3. Making the code more straightforward
// 4. Keeping the existing functionality and Tailwind styling

import React, { useState, useEffect } from 'react';

const UserStatistics = ({ userId, preferences }) => {
  const [data, setData] = useState({ user: null, transactions: [], isLoading: true });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, transactionResponse] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/transactions?userId=${userId}`)
        ]);
        
        const [userData, transactionData] = await Promise.all([
          userResponse.json(),
          transactionResponse.json()
        ]);
        
        if (userData.ok && transactionData.ok) {
          setData({ user: userData.data, transactions: transactionData.data, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchData();
  }, [userId]);
  
  const { user, transactions, isLoading } = data;
  
  // Calculate metrics directly
  const averageSpend = transactions.length 
    ? (transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toFixed(2)
    : '0';
    
  const topCategory = transactions.length
    ? Object.entries(
        transactions.reduce((map, t) => {
          map[t.category] = (map[t.category] || 0) + 1;
          return map;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
    : 'None';
    
  const userTier = user?.totalSpent > 10000 ? 'Platinum' : user?.totalSpent > 5000 ? 'Gold' : 'Silver';
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className={`bg-${preferences?.darkMode ? 'gray-800' : 'white'} shadow-lg rounded-lg p-6 m-4 transition-all duration-300 ${preferences?.animations ? 'animate-fade-in' : ''}`}>
      <h3 className={`text-${preferences?.darkMode ? 'white' : 'gray-800'} font-bold text-xl mb-4`}>User Statistics</h3>
      <div className={`text-${preferences?.darkMode ? 'gray-300' : 'gray-600'}`}>
        <p className="mb-2">Average Spend: {preferences?.currencySymbol || '$'}{averageSpend}</p>
        <p className="mb-2">Top Category: {topCategory}</p>
        <p className="mb-2">User Tier: 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            userTier === 'Platinum' ? 'bg-purple-200 text-purple-800' : 
            userTier === 'Gold' ? 'bg-yellow-200 text-yellow-800' : 
            'bg-gray-200 text-gray-800'
          }`}>
            {userTier}
          </span>
        </p>
      </div>
    </div>
  );
};

export default UserStatistics;

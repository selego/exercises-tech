// KIS Principle Exercise
//
// This component violates the KIS principle in several ways:
// - It uses unnecessary abstractions (useCallback, useMemo)
// - It has complex state management that's hard to follow
// - It mixes concerns between data fetching, processing, and UI rendering
//
// Your task: Simplify this component by:
// 1. Removing unnecessary abstractions 
// 2. Streamlining the data fetching
// 3. Making the code more straightforward
// 4. Keeping the existing functionality and Tailwind styling

import React, { useEffect, useMemo, useState } from 'react';

const UserStatistics = ({ userId, preferences }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const fetchUserResponse = async (userId) => {
    try {
      setIsLoading(true);
      const {ok,data} = await api.get(`/api/users/${userId}`);
      if (!ok) return toast.error(data.message || 'Failed to fetch user data');
      setUser(data);
    }
    catch (error) {
      setIsLoading(false);
      capture(error);
      alert(`Error: ${error.message}`);
    }
  }

  const fetchTransactionsResponse = async (userId) => {
    try {
      setIsLoading(true);
      const {ok,data} = await api.get(`/api/transactions?userId=${userId}`);
      if (!ok) return toast.error(data.message || 'Failed to fetch transactions');
      setTransactions(data);
    }
    catch (error) {
      setIsLoading(false);
      capture(error);
      alert(`Error: ${error.message}`);
    }
  }

  
  useEffect(() => {
    fetchUserResponse();
    fetchTransactionsResponse();
  }, [userId]);
  
  const userMetrics = () => {
    if (!transactions.length) return { averageSpend: 0, topCategory: 'None', userTier: 'Silver' };
    
    const averageSpend = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
    const frequencyMap = transactions.reduce((map, t) => {
      map[t.category] = (map[t.category] || 0) + 1;
      return map;
    }, {});
    const topCategory = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  
      let userTier = 'Silver';
      if (user?.totalSpent > 10000) userTier = 'Platinum'; 
      if (user?.totalSpent > 5000) userTier = 'Gold';
  
    return {
      averageSpend: averageSpend.toFixed(2),
      topCategory,
      userTier,
    };
  };

      if (isLoading) {
       return (
        <div className={`bg-${preferences?.darkMode ? 'gray-800' : 'white'} shadow-lg rounded-lg p-6 m-4 transition-all duration-300 ${preferences?.animations ? 'animate-fade-in' : ''}`}>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )
    }
      return (
        <div className={`bg-${preferences?.darkMode ? 'gray-800' : 'white'} shadow-lg rounded-lg p-6 m-4 transition-all duration-300 ${preferences?.animations ? 'animate-fade-in' : ''}`}>
          <h3 className={`text-${preferences?.darkMode ? 'white' : 'gray-800'} font-bold text-xl mb-4`}>User Statistics</h3>
            <div className={`text-${preferences?.darkMode ? 'gray-300' : 'gray-600'}`}>
              <p className="mb-2">Average Spend: {preferences?.currencySymbol || '$'}{userMetrics.averageSpend}</p>
              <p className="mb-2">Top Category: {userMetrics.topCategory}</p>
              <p className="mb-2">User Tier: 
                <UserTier userTier={userMetrics.userTier} />
              </p>
            </div>
          </div>
        )
  };


  const UserTier = ({ userTier }) => {
    let statusClass = "bg-gray-200 text-gray-800";
    if (userTier === "Platinum") statusClass = "bg-purple-200 text-purple-800";
    if (userTier === "Gold") statusClass = "bg-yellow-200 text-yellow-800";
      return( 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${statusClass}`}>
          {userTier}
        </span>)
  }

export default UserStatistics;

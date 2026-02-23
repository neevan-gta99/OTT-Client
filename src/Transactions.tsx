import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './redux/store';
import Navbar from './Navbar';
import { fetchTransactionsData } from './redux/features/userAuthSlice';

const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    coinsTransactions, 
    videoTransactions, 
    userData,
    loading,
    transactionsLoaded 
  } = useSelector((state: RootState) => state.userAuth);

  // // ✅ Fetch data if not loaded
  // useEffect(() => {
  //   if (userData?.userName && !transactionsLoaded) {
  //     dispatch(fetchTransactionsData({ 
  //       username: userData.userName, 
  //       offset: 0 
  //     }));
  //   }
  // }, [userData?.userName, transactionsLoaded, dispatch]);

  // ✅ Group transactions by date
  const groupByDate = (transactions: any[]) => {
    return transactions.reduce((groups: any, transaction) => {
      // Extract date from time string (e.g., "2026-02-23T10:30:00Z" -> "23 Feb 2026")
      const dateObj = new Date(transaction.time);
      const date = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push({
        ...transaction,
        dateObj, // Store for sorting
        time: dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      return groups;
    }, {});
  };

  // ✅ Sort dates in descending order
  const sortDatesDesc = (dates: string[]) => {
    return dates.sort((a, b) => {
      const dateA = new Date(a.split(' ').reverse().join('-')).getTime();
      const dateB = new Date(b.split(' ').reverse().join('-')).getTime();
      return dateB - dateA;
    });
  };

  const coinGroups = groupByDate(coinsTransactions);
  const videoGroups = groupByDate(videoTransactions);

  const sortedCoinDates = sortDatesDesc(Object.keys(coinGroups));
  const sortedVideoDates = sortDatesDesc(Object.keys(videoGroups));

  if (loading && !transactionsLoaded) {
    return (
      <>
        <Navbar data={userData} />
        <div className="loading-spinner">Loading transactions...</div>
      </>
    );
  }

  return (
    <>
      <Navbar data={userData} />
      <div className="transactions-container">
        <h1 className="transactions-title">Transaction History</h1>
        <div className="transactions-grid">
          {/* Left Section - Coins Purchased */}
          <div className="transaction-section">
            <div className="section-header coin-header">
              <h2>🪙 Coins Purchased ({coinsTransactions.length})</h2>
            </div>
            <div className="section-content">
              {sortedCoinDates.map((date) => (
                <div key={date} className="date-group">
                  <div className="date-heading">{date}</div>
                  {coinGroups[date].map((transaction: any, index: number) => (
                    <div key={`${transaction.orderId}-${index}`} className="transaction-card">
                      <div className="transaction-row">
                        <div className="transaction-info">
                          <div className="transaction-title">+{transaction.coins} Coins</div>
                          <div className="transaction-details">
                            <span>💳 {transaction.paymentMethod || 'Unknown'}</span>
                            <span>⏱️ {transaction.time}</span>
                          </div>
                          {transaction.description && (
                            <div className="transaction-desc">{transaction.description}</div>
                          )}
                        </div>
                        <span className={`status-badge ${transaction.status}`}>
                          {transaction.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {coinsTransactions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🪙</div>
                  <p>No coin purchases yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Video Purchased */}
          <div className="transaction-section">
            <div className="section-header video-header">
              <h2>🎬 Video Purchased ({videoTransactions.length})</h2>
            </div>
            <div className="section-content">
              {sortedVideoDates.map((date) => (
                <div key={date} className="date-group">
                  <div className="date-heading">{date}</div>
                  {videoGroups[date].map((transaction: any, index: number) => (
                    <div key={`${transaction.videoId}-${index}`} className="transaction-card">
                      <div className="transaction-row">
                        <div className="transaction-info">
                          <div className="transaction-title">{transaction.videoTitle}</div>
                          <div className="transaction-details">
                            <span>🆔 {transaction.videoId}</span>
                            <span>⏱️ {transaction.time}</span>
                          </div>
                        </div>
                        <div className="transaction-right">
                          <span className={`transaction-amount debit`}>-{transaction.coins} 🪙</span>
                          {transaction.status === 'failed' && (
                            <span className="status-badge failed">Failed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              
              {videoTransactions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🎬</div>
                  <p>No video purchases yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Info (optional - for debugging) */}
        {/* <div className="pagination-info">
          <p>Coins: {coinsTransactions.length} transactions</p>
          <p>Videos: {videoTransactions.length} transactions</p>
        </div> */}
      </div>
    </>
  );
};

export default Transactions;
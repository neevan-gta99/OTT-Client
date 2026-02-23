import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './redux/store';
import Navbar from './Navbar';
import { fetchTransactionsData } from './redux/features/userAuthSlice';
import { BASE_URL } from './config/apiconfig';

const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [updateKey, setUpdateKey] = useState(0);
  
  // Refs for intersection observers
  const coinsObserverRef = useRef<IntersectionObserver | null>(null);
  const videosObserverRef = useRef<IntersectionObserver | null>(null);
  const coinsTriggerRef = useRef<HTMLDivElement | null>(null);
  const videosTriggerRef = useRef<HTMLDivElement | null>(null);
  
  // Flag to prevent multiple triggers
  const isCoinsLoadingRef = useRef(false);
  const isVideosLoadingRef = useRef(false);
  
  // Separate loading states for each section
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  // Pagination states
  const [coinsOffset, setCoinsOffset] = useState(1);
  const [videosOffset, setVideosOffset] = useState(1);
  const [hasMoreCoins, setHasMoreCoins] = useState(true);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  
  // Local state for appended data
  const [localCoinsTransactions, setLocalCoinsTransactions] = useState<any[]>([]);
  const [localVideoTransactions, setLocalVideoTransactions] = useState<any[]>([]);

  const {
    coinsTransactions,
    videoTransactions,
    userData,
    loading,
    transactionsLoaded
  } = useSelector((state: RootState) => state.userAuth);

  // Initialize local state with Redux data
  useEffect(() => {
    if (coinsTransactions.length > 0) {
      setLocalCoinsTransactions(coinsTransactions);
      setCoinsOffset(1);
    }
    if (videoTransactions.length > 0) {
      setLocalVideoTransactions(videoTransactions);
      setVideosOffset(1);
    }
  }, [coinsTransactions, videoTransactions]);

  // Fetch initial transactions if not loaded
  useEffect(() => {
    if (userData?.userName && !transactionsLoaded && !loading) {
      console.log("📥 Fetching initial transactions...");
      dispatch(fetchTransactionsData({ 
        username: userData.userName, 
        offset: 0 
      }));
    }
  }, [userData?.userName, transactionsLoaded, loading, dispatch]);

  // Debug state changes
  useEffect(() => {
    console.log("🔄 Transactions updated:", {
      coins: localCoinsTransactions.length,
      videos: localVideoTransactions.length,
      coinsOffset,
      videosOffset,
      hasMoreCoins,
      hasMoreVideos
    });
    setUpdateKey(prev => prev + 1);
  }, [localCoinsTransactions.length, localVideoTransactions.length, coinsOffset, videosOffset, hasMoreCoins, hasMoreVideos]);

  // ✅ Load More Coins - Separate API (memoized with useCallback)
  const loadMoreCoins = useCallback(async () => {
    if (!userData?.userName || !hasMoreCoins || loadingCoins || isCoinsLoadingRef.current) return;
    
    console.log(`💰 Loading more coins with offset: ${coinsOffset}`);
    setLoadingCoins(true);
    isCoinsLoadingRef.current = true;
    
    try {
      const res = await fetch(`${BASE_URL}/api/users/get-more-coins`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: userData.userName,
          offset: coinsOffset,
          limit: 3
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Append new coins transactions
        setLocalCoinsTransactions(prev => [...prev, ...data.coinsTransactions]);
        
        // Update pagination
        setHasMoreCoins(data.pagination.hasMore);
        setCoinsOffset(prev => prev + 1);
        
        console.log(`✅ Loaded ${data.coinsTransactions.length} more coins. Has more: ${data.pagination.hasMore}`);
      }
    } catch (err) {
      console.error("Error loading more coins:", err);
    } finally {
      setLoadingCoins(false);
      isCoinsLoadingRef.current = false;
    }
  }, [userData?.userName, hasMoreCoins, coinsOffset]);

  // ✅ Load More Videos - Separate API (memoized with useCallback)
  const loadMoreVideos = useCallback(async () => {
    if (!userData?.userName || !hasMoreVideos || loadingVideos || isVideosLoadingRef.current) return;
    
    console.log(`🎬 Loading more videos with offset: ${videosOffset}`);
    setLoadingVideos(true);
    isVideosLoadingRef.current = true;
    
    try {
      const res = await fetch(`${BASE_URL}/api/users/get-more-videos`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: userData.userName,
          offset: videosOffset,
          limit: 3
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Append new video transactions
        setLocalVideoTransactions(prev => [...prev, ...data.videoTransactions]);
        
        // Update pagination
        setHasMoreVideos(data.pagination.hasMore);
        setVideosOffset(prev => prev + 1);
        
        console.log(`✅ Loaded ${data.videoTransactions.length} more videos. Has more: ${data.pagination.hasMore}`);
      }
    } catch (err) {
      console.error("Error loading more videos:", err);
    } finally {
      setLoadingVideos(false);
      isVideosLoadingRef.current = false;
    }
  }, [userData?.userName, hasMoreVideos, videosOffset]);

  // ✅ Setup Intersection Observer for Coins - ONLY ONCE
  useEffect(() => {
    // Cleanup previous observer
    if (coinsObserverRef.current) {
      coinsObserverRef.current.disconnect();
    }

    coinsObserverRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Only trigger if element is visible, has more data, and not loading
        if (entry.isIntersecting && hasMoreCoins && !loadingCoins && !isCoinsLoadingRef.current) {
          console.log("👀 Coins section scrolled, loading more...");
          loadMoreCoins();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px'  // Increased margin
      }
    );

    // Observe if trigger exists
    if (coinsTriggerRef.current) {
      coinsObserverRef.current.observe(coinsTriggerRef.current);
    }

    return () => {
      if (coinsObserverRef.current) {
        coinsObserverRef.current.disconnect();
      }
    };
  // ✅ REMOVED coinsTriggerRef.current from dependencies
  }, [hasMoreCoins, loadingCoins, loadMoreCoins]);

  // ✅ Setup Intersection Observer for Videos - ONLY ONCE
  useEffect(() => {
    // Cleanup previous observer
    if (videosObserverRef.current) {
      videosObserverRef.current.disconnect();
    }

    videosObserverRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Only trigger if element is visible, has more data, and not loading
        if (entry.isIntersecting && hasMoreVideos && !loadingVideos && !isVideosLoadingRef.current) {
          console.log("👀 Videos section scrolled, loading more...");
          loadMoreVideos();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px'
      }
    );

    // Observe if trigger exists
    if (videosTriggerRef.current) {
      videosObserverRef.current.observe(videosTriggerRef.current);
    }

    return () => {
      if (videosObserverRef.current) {
        videosObserverRef.current.disconnect();
      }
    };
  // ✅ REMOVED videosTriggerRef.current from dependencies
  }, [hasMoreVideos, loadingVideos, loadMoreVideos]);

  // Group transactions by date
  const groupByDate = (transactions: any[]) => {
    return transactions.reduce((groups: any, transaction) => {
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
        dateObj,
        time: dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      return groups;
    }, {});
  };

  const sortDatesDesc = (dates: string[]) => {
    return dates.sort((a, b) => {
      const dateA = new Date(a.split(' ').reverse().join('-')).getTime();
      const dateB = new Date(b.split(' ').reverse().join('-')).getTime();
      return dateB - dateA;
    });
  };

  const coinGroups = groupByDate(localCoinsTransactions);
  const videoGroups = groupByDate(localVideoTransactions);

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
      <div className="transactions-container" key={updateKey}>
        <h1 className="transactions-title">Transaction History</h1>

        <div className="transactions-grid">
          
          {/* Left Section - Coins Purchased */}
          <div className="transaction-section">
            <div className="section-header coin-header">
              <h2>🪙 Coins Purchased ({localCoinsTransactions.length})</h2>
            </div>
            <div className="section-content">
              {sortedCoinDates.map((date) => (
                <div key={date} className="date-group">
                  <div className="date-heading">{date}</div>
                  {coinGroups[date].map((transaction: any, index: number) => (
                    <div key={`${transaction.orderId}-${index}-${updateKey}`} className="transaction-card">
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
              
              {localCoinsTransactions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🪙</div>
                  <p>No coin purchases yet</p>
                </div>
              )}

              {/* Scroll Trigger for Coins - always present but observed conditionally */}
              <div 
                ref={coinsTriggerRef}
                className="scroll-trigger"
                style={{ height: '20px', width: '100%' }}
              />

              {/* Loading indicator for coins */}
              {loadingCoins && (
                <div className="loading-more">Loading more coins...</div>
              )}

              {/* No more data message */}
              {!hasMoreCoins && localCoinsTransactions.length > 0 && (
                <div className="no-more-data">No more coin transactions</div>
              )}
            </div>
          </div>

          {/* Right Section - Video Purchased */}
          <div className="transaction-section">
            <div className="section-header video-header">
              <h2>🎬 Video Purchased ({localVideoTransactions.length})</h2>
            </div>
            <div className="section-content">
              {sortedVideoDates.map((date) => (
                <div key={date} className="date-group">
                  <div className="date-heading">{date}</div>
                  {videoGroups[date].map((transaction: any, index: number) => (
                    <div key={`${transaction.videoId}-${index}-${updateKey}`} className="transaction-card">
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
              
              {localVideoTransactions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🎬</div>
                  <p>No video purchases yet</p>
                </div>
              )}

              {/* Scroll Trigger for Videos - always present but observed conditionally */}
              <div 
                ref={videosTriggerRef}
                className="scroll-trigger"
                style={{ height: '20px', width: '100%' }}
              />

              {/* Loading indicator for videos */}
              {loadingVideos && (
                <div className="loading-more">Loading more videos...</div>
              )}

              {/* No more data message */}
              {!hasMoreVideos && localVideoTransactions.length > 0 && (
                <div className="no-more-data">No more video transactions</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transactions;
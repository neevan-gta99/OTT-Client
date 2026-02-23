import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";
import { BASE_URL } from '../../config/apiconfig.ts';
import type { RootState } from '../store.ts';


interface CoinTransaction {
    orderId: string;
    paymentId: string;
    paymentMethod: string;
    coins: number;
    status: 'success' | 'failed';
    description: string;
    time: string;
}

interface VideoTransaction {
    coins: number;
    status: 'success' | 'failed';
    videoTitle: string;
    videoId: string;
    time: string
}

interface UserData {
    userName: string;
    fullName: string;
    email: string;
    coins: number;
    accessibleVideosIds?: string[];
}

interface PaginationInfo {
    hasMore: boolean;
    nextOffset: number | null;
    total: number;
}

interface UserAuthState {
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    userData: UserData | null;
    coinsTransactions: CoinTransaction[];
    videoTransactions: VideoTransaction[];
    currentOffset: number;
    hasMoreTransactions: boolean;
    transactionsLoaded: boolean;
    loginTimestamp: number | null;
    pagination: {                    // ✅ Sirf ek baar
        coins: PaginationInfo;
        videos: PaginationInfo;
    };
}

const initialState: UserAuthState = {
    isAuthenticated: false,
    loading: false,
    error: null,
    userData: null,
    coinsTransactions: [],
    videoTransactions: [],
    currentOffset: 0,
    hasMoreTransactions: true,
    transactionsLoaded: false,
    loginTimestamp: null,
    pagination: {
        coins: {
            hasMore: true,
            nextOffset: 1,
            total: 0
        },
        videos: {
            hasMore: true,
            nextOffset: 1,
            total: 0
        }
    },
};

export const logoutUserSession = createAsyncThunk(
    'userAuth/logoutUserSession',
    async (_, { dispatch }) => {
        try {
            const res = await fetch(`${BASE_URL}/api/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                dispatch(logoutUser());
            } else {
                dispatch(logoutUser());
            }
        } catch (err) {
            console.error("Logout error:", err);
            dispatch(logoutUser());
        }
    }
);

export const fetchUserData = createAsyncThunk(
    'userAuth/fetchUserData',
    async (username: string, { rejectWithValue }) => {
        try {
            if (!username) {
                return rejectWithValue('Username is required');
            }

            const res = await fetch(`${BASE_URL}/api/users/all-data`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username })
            });

            if (!res.ok) {
                return rejectWithValue('Failed to fetch user data');
            }

            const data = await res.json();
            return data.userData ?? data;

        } catch (err) {
            return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
        }
    }
);


export const fetchTransactionsData = createAsyncThunk(
    'userAuth/fetchTransactionsData',
    async ({ username, offset = 0 }: { username: string; offset?: number }, { rejectWithValue, getState }) => {
        try {
            if (!username) {
                return rejectWithValue('Username is required');
            }

            const state = getState() as RootState;
            const currentTransactions = state.userAuth.coinsTransactions;

            if (offset === 0 && currentTransactions.length > 0) {
                return {
                    coinsTransactions: currentTransactions,
                    videoTransactions: state.userAuth.videoTransactions,
                    pagination: state.userAuth.pagination,
                    fromCache: true
                };
            }

            const res = await fetch(`${BASE_URL}/api/users/transactions-data`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    offset,
                    limit: 3
                })
            });

            if (!res.ok) {
                return rejectWithValue('Failed to fetch transactions data');
            }

            const data = await res.json();

            console.log("Data Aa gaya==>>", data)

            return {
                coinsTransactions: data.coinsTransactions || [],
                videoTransactions: data.videoTransactions || [],
                pagination: {
                    coins: {
                        hasMore: data.pagination?.coins?.hasMore ?? true,
                        nextOffset: data.pagination?.coins?.nextOffset ?? offset + 1,
                        total: data.pagination?.coins?.totalOverall ?? 0
                    },
                    videos: {
                        hasMore: data.pagination?.videos?.hasMore ?? true,
                        nextOffset: data.pagination?.videos?.nextOffset ?? offset + 1,
                        total: data.pagination?.videos?.totalOverall ?? 0
                    }
                },
                fromCache: false
            };

        } catch (err) {
            return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
        }
    }
);


const userAuthSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.isAuthenticated = false;
            state.userData = null;
            state.loginTimestamp = null;
            state.error = null;
            state.coinsTransactions = [];
            state.videoTransactions = [];
            state.currentOffset = 0;
            state.hasMoreTransactions = true;
            state.transactionsLoaded = false;
        },
        setLoginSession: (
            state,
            action: PayloadAction<{ timestamp: number; userData: UserData }>
        ) => {
            state.loginTimestamp = action.payload.timestamp;
            state.userData = action.payload.userData;
            state.isAuthenticated = true;
            state.error = null;
        },
        updateUserCoins: (state, action: PayloadAction<number>) => {
            if (state.userData) {
                state.userData.coins = action.payload;
            }
        },
        resetTransactions: (state) => {
            state.coinsTransactions = [];
            state.videoTransactions = [];
            state.transactionsLoaded = false;
            state.pagination = {
                coins: { hasMore: true, nextOffset: 1, total: 0 },
                videos: { hasMore: true, nextOffset: 1, total: 0 }
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logoutUserSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUserSession.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(logoutUserSession.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.userData = null;
                state.loginTimestamp = null;
            })
            .addCase(fetchTransactionsData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactionsData.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload.fromCache) {
                    return;
                }

                if (action.meta.arg.offset === 0) {
                    state.coinsTransactions = action.payload.coinsTransactions;
                    state.videoTransactions = action.payload.videoTransactions;
                    state.transactionsLoaded = true;

                    if (action.payload.pagination) {
                        state.pagination = {
                            coins: {
                                hasMore: action.payload.pagination.coins.hasMore,
                                nextOffset: action.payload.pagination.coins.nextOffset,
                                total: action.payload.pagination.coins.total
                            },
                            videos: {
                                hasMore: action.payload.pagination.videos.hasMore,
                                nextOffset: action.payload.pagination.videos.nextOffset,
                                total: action.payload.pagination.videos.total
                            }
                        };

                        state.hasMoreTransactions = action.payload.pagination.coins.hasMore;
                        state.currentOffset = action.payload.pagination.coins.nextOffset || 0;
                    }
                }

                state.error = null;
            })
            .addCase(fetchTransactionsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { logoutUser, setLoginSession, updateUserCoins, resetTransactions } = userAuthSlice.actions;
export default userAuthSlice.reducer;
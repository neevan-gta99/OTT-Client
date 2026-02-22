import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";
import { BASE_URL } from '../../config/apiconfig.ts';

interface UserData {
  userName: string;
  fullName: string;
  email: string;
  coins: number;
  accessibleVideosIds?: string[];
}

interface UserAuthState {
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    userData: UserData | null;
    loginTimestamp: number | null;
}

const initialState: UserAuthState = {
    isAuthenticated: false,
    loading: false,
    error: null,
    userData: null,
    loginTimestamp: null,
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
                // Even if API fails, logout locally
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

const userAuthSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        logoutUser: (state) => {
            state.isAuthenticated = false;
            state.userData = null;
            state.loginTimestamp = null;
            state.error = null;
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
        }
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
            });
    }
});

export const { logoutUser, setLoginSession, updateUserCoins } = userAuthSlice.actions;
export default userAuthSlice.reducer;
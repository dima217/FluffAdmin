import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isSuper: boolean;
  userId: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isSuper: false,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      
      // Декодируем JWT чтобы получить isSuper и userId
      try {
        const payload = JSON.parse(atob(action.payload.access.split('.')[1]));
        state.isSuper = payload.isSuper || false;
        state.userId = payload.sub || null;
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isSuper = false;
      state.userId = null;
    },
  },
});

export const { setTokens, logout } = authSlice.actions;
export default authSlice.reducer;

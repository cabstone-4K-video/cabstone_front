import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AuthTokenState from "../types/AuthToken.type";


export const TOKEN_TIME_OUT = 600 * 1000; // 백엔드 토큰이랑 맞추기

const initialState: AuthTokenState = {
  authenticated: false,
  accessToken: null,
  expireTime: null,
}

export const jwtSlice = createSlice({
  name : 'authToken',
  initialState,
  reducers : {
    setToken: (state, action: PayloadAction<string>) => {
      state.authenticated = true;
      state.accessToken = action.payload;
      state.expireTime = new Date().getTime() + TOKEN_TIME_OUT;
    },
    deleteToken: (state) => {
      state.authenticated = false;
      state.accessToken = null;
      state.expireTime = null;
    },
  }
})


export const { setToken, deleteToken } = jwtSlice.actions;

export default jwtSlice.reducer;
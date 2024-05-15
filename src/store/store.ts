import { configureStore } from "@reduxjs/toolkit";
import connectionInfoReducer from './connectionSlice';
import tokenReducer from './jwtSlice';

export const store = configureStore({
	reducer : {
		connectionInfo : connectionInfoReducer,
		authToken: tokenReducer,
	}
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
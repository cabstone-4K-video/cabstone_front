import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ConnectionInfo from "../types/connectionInfo.type";

const initialState: ConnectionInfo = {
    userName: '',
    videoDevice: '',
    audioDevice: '',
    roomName: ''
}

export const ConnectionInfoSlice = createSlice({
    name: 'connectionInfo',
    initialState,
    reducers: {
        updateConnectionInfo: (state, action: PayloadAction<Partial<ConnectionInfo>>) => {
            return { ...state, ...action.payload };
        }
    }
});

export const { updateConnectionInfo } = ConnectionInfoSlice.actions;
export default ConnectionInfoSlice.reducer;

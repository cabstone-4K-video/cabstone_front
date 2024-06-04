import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ConnectionInfo from '../types/connectionInfo.type';

const initialState: ConnectionInfo = {
  userName: '',
  videoDevice: '',
  audioDevice: '',
  roomName: '',
  microphoneEnabled: true,
  cameraEnabled: true,
};

export const connectionInfoSlice = createSlice({
  name: 'connectionInfo',
  initialState,
  reducers: {
    updateConnectionInfo: (state, action: PayloadAction<Partial<ConnectionInfo>>) => {
      return { ...state, ...action.payload };
    },
    toggleMicrophone: (state) => {
      state.microphoneEnabled = !state.microphoneEnabled;
    },
    toggleCamera: (state) => {
      state.cameraEnabled = !state.cameraEnabled;
    },
  },
});

export const { updateConnectionInfo, toggleMicrophone, toggleCamera } = connectionInfoSlice.actions;
export default connectionInfoSlice.reducer;

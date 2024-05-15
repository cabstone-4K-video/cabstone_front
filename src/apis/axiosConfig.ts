import axios from 'axios';
import { store } from '../store/store';  // Redux 스토어를 임포트합니다.

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
    config => {
        const state = store.getState();
        const token = state.authToken.accessToken;  // Redux 스토어에서 토큰을 가져옵니다.
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 설정 (선택사항: 토큰 만료 시 처리 등)
axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response.status === 401) {
            // 로그아웃 처리 또는 토큰 갱신 로직을 추가할 수 있습니다.
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create an Axios instance with a base URL and default headers
const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

//토큰을 포함한 요청일 때의 인터셉터
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

//에러 처리를 위한 인터셉터
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('API call error:', error);
    return Promise.reject(error);
  }
);

export default instance;

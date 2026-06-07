import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { authClient } from './auth-client';

export const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
});

// Auto-inject JWT token if it exists in localStorage or cookies
AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = authClient.getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-redirect to login when JWT expires or is invalid
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        authClient.resetSession();
        // Prevent infinite reload loops on the login page itself
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

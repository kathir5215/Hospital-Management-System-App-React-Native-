import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.46:8081',
  withCredentials: true,
});
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.response === 401 || error.response === 403) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
    }
    return Promise.reject(error);
  },
);
export default api;

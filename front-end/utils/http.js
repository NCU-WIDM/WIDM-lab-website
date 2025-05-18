import axios from 'axios';

let store;

export const injectStore = (_store) => {
  store = _store;
};

export const defaultHttp = axios.create();
const http = axios.create();

http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default http;

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // If the request was a mutation (POST, PUT, DELETE), clear all local API caches
    if (['post', 'put', 'delete', 'patch'].includes(response.config.method?.toLowerCase() || '')) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const originalGet = api.get;

api.get = async function (url: string, config?: any) {
  const skipCache = Boolean(config?.skipCache);

  if (skipCache) {
    // Pass skipCache to the backend via query parameter
    const newConfig = { ...config };
    newConfig.params = { ...newConfig.params, skipCache: 'true' };
    return originalGet.call(this, url, newConfig);
  }

  const cacheKey = `api_cache_${url}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    // Return cached data immediately
    return Promise.resolve({
      data: JSON.parse(cachedData),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
      request: {}
    } as any);
  }

  // First time fetching data (cache miss)
  const response: any = await originalGet.call(this, url, config);
  if (response.status >= 200 && response.status < 300) {
    localStorage.setItem(cacheKey, JSON.stringify(response.data));
  }
  return response;
};

export default api;

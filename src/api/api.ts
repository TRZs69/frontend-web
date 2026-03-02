import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
const originalGet = api.get;

api.get = async function (url: string, config?: any) {
  const cacheKey = `api_cache_${url}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    // Silently fetch in the background to update the cache for next time
    originalGet.call(this, url, config)
      .then((response: any) => {
        if (response.status >= 200 && response.status < 300) {
          localStorage.setItem(cacheKey, JSON.stringify(response.data));
        }
      })
      .catch((err) => console.error("Silent cache update failed:", err));

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

import env from '@/utils/env';
import axios from 'axios';

const AUTH_API_BASE_URL = env.AUTH_API_BASE_URL;
const RAG_API_BASE_URL = env.RAG_API_BASE_URL;
const ACCESS_TOKEN = env.ACCESS_TOKEN;

// Axios instance for secured requests
const secureClient = axios.create({
  baseURL: RAG_API_BASE_URL?.concat('/api/v1'),
});

// Axios instance for unsecured requests
const openClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    'Accept-Language': 'fr',
  },
});

secureClient.interceptors.request.use(async (config) => {
  if (ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return config;
});

export { openClient, secureClient };

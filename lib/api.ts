import env from '@/utils/env';
import axios from 'axios';

const API_BASE_URL = env.RAG_API_BASE_URL;

// Axios instance for unsecured requests
const openClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept-Language': 'fr',
  },
});

export { API_BASE_URL, openClient };

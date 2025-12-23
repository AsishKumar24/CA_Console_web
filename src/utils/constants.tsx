// Use VITE_ prefix for environment variables as required by Vite
// The fallback "http://localhost:3000" ensures local dev works even without a .env file
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
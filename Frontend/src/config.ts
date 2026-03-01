/**
 * Central API configuration for the frontend.
 * Uses environment variable VITE_API_URL if provided, else defaults to local development.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default API_URL;

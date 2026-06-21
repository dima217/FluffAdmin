// API Configuration — single source of truth for backend URLs
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://backend-production-9803a.up.railway.app";

export const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL ??
  "https://media-service-5zxp-production.up.railway.app";

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  mediaBaseUrl: MEDIA_BASE_URL,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
} as const;

export const getBaseUrl = (): string => API_BASE_URL;

export const getMediaBaseUrl = (): string => MEDIA_BASE_URL;

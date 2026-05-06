// API Configuration
export const API_CONFIG = {
  // Development
  baseUrl: "http://10.188.8.195:3000",

  mediaBaseUrl: "http://10.188.8.195:3002",

  // Timeouts
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
};

export const getBaseUrl = (): string => API_CONFIG.baseUrl;

export const getMediaBaseUrl = (): string => API_CONFIG.mediaBaseUrl;

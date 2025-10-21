// API configuration with fallback
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || window.location.origin;
};

export const API_URL = getApiUrl();

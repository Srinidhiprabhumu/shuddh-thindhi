// API configuration - use same origin for monolithic deployment
export const getApiUrl = (): string => {
  // In production (Render), frontend and backend are on same domain
  return window.location.origin;
};

export const API_URL = getApiUrl();

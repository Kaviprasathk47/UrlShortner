// Centralized API base URL — set VITE_API_BASE_URL in frontend/.env
const configuredUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

if (!configuredUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not set. Copy frontend/.env.example to frontend/.env",
  );
}

export const API_BASE_URL = configuredUrl;

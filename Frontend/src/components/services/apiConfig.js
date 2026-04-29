const fallbackApi = "http://localhost:8000";

const trimmedApi = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = trimmedApi && trimmedApi.length > 0 ? trimmedApi : fallbackApi;

const trimmedSocket = import.meta.env.VITE_SOCKET_URL?.trim();
export const SOCKET_URL = trimmedSocket && trimmedSocket.length > 0 ? trimmedSocket : API_BASE_URL;

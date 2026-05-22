/** Production API (override with VITE_API_BASE_URL). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'https://api.shikkhasomoy.com';

/** Secure announcements WebSocket (override with VITE_WS_ANNOUNCE_URL). */
export const WS_ANNOUNCE_URL =
  import.meta.env.VITE_WS_ANNOUNCE_URL?.trim() || 'wss://api.shikkhasomoy.com/ws/announce';

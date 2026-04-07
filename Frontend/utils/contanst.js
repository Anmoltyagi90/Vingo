export const SERVER_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://vingo-w4jv.onrender.com/";

export const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_URL || SERVER_BASE;

export const SERVER_URI = `${SERVER_BASE}/api/v1/auth`;

export const SERVER_USER = `${SERVER_BASE}/api/v1/user`;

export const SERVER_SHOP = `${SERVER_BASE}/api/v1/shop`;

export const SERVER_ITEM = `${SERVER_BASE}/api/v1/item`;

export const SERVER_ORDER = `${SERVER_BASE}/api/v1/order`;



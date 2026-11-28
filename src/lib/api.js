// Thin client for the FastAPI backend (Buyer-track-back). In dev, /api is proxied by Vite to :8000.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';
const TOKEN_KEY = 'buyertrack.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = t => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(status, field, message) { super(message); this.status = status; this.field = field; }
}

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) headers.Authorization = 'Bearer ' + t;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (e) {
    throw new ApiError(0, null, 'Сервер недоступен — проверьте, что бэкенд запущен');
  }
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const er = json.error || {}; throw new ApiError(res.status, er.field || null, er.message || 'Ошибка сервера'); }
  return json;
}

const api = {
  register: b => req('POST', '/auth/register', b),
  login: b => req('POST', '/auth/login', b),
  logout: () => req('POST', '/auth/logout'),
  data: () => req('GET', '/data'),
  loadDemo: () => req('POST', '/demo'),
  clearData: () => req('DELETE', '/data'),
  createOrder: b => req('POST', '/orders', b),
  updateOrder: (id, b) => req('PUT', '/orders/' + encodeURIComponent(id), b),
  patchOrder: (id, b) => req('PATCH', '/orders/' + encodeURIComponent(id), b),
  deleteOrder: id => req('DELETE', '/orders/' + encodeURIComponent(id)),
  regenToken: id => req('POST', '/orders/' + encodeURIComponent(id) + '/token'),
  addFile: (id, b) => req('POST', '/orders/' + encodeURIComponent(id) + '/files', b),
  removeFile: (id, fid) => req('DELETE', '/orders/' + encodeURIComponent(id) + '/files/' + fid),
  createShip: b => req('POST', '/shipments', b),
  updateShip: (id, b) => req('PUT', '/shipments/' + encodeURIComponent(id), b),
  deleteShip: id => req('DELETE', '/shipments/' + encodeURIComponent(id)),
  addEvent: (id, b) => req('POST', '/shipments/' + encodeURIComponent(id) + '/events', b),
  assign: (id, itemIds) => req('POST', '/shipments/' + encodeURIComponent(id) + '/items', { itemIds }),
  unassign: itemIds => req('POST', '/items/unassign', { itemIds }),
  track: token => req('GET', '/track/' + encodeURIComponent(token)),
};

export default api;

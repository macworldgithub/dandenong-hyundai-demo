type JwtPayload = {
  exp?: number;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function decodeJwtPayload(token: string): JwtPayload | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getTokenExpiryMs(token: string) {
  const payload = decodeJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
}

export function isTokenExpired(token: string, now = Date.now()) {
  const expiresAt = getTokenExpiryMs(token);
  return expiresAt !== null && expiresAt <= now;
}

export function expireCurrentSession() {
  clearStoredSession();
  window.dispatchEvent(new Event('auth-expired'));
}

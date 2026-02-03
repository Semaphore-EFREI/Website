// Lightweight API helper targeting the real backend.
const API_BASE_URL = 'https://semaphore.deway.fr';

let authToken = null;

const defaultHeaders = {
  'Content-Type': 'application/json'
};

function buildUrl(path, params) {
  if (!params) return `${API_BASE_URL}${path}`;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === undefined || entry === null) return;
        searchParams.append(key, String(entry));
      });
      return;
    }
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
}

function buildHeaders(includeAuth = true) {
  return includeAuth && authToken
    ? { ...defaultHeaders, Authorization: `Bearer ${authToken}` }
    : { ...defaultHeaders };
}

function redactPayload(data) {
  if (!data || typeof data !== 'object') return data;
  const copy = JSON.parse(JSON.stringify(data));
  const redactKeys = ['password', 'refresh_token', 'refreshToken', 'token', 'access_token', 'accessToken'];
  redactKeys.forEach((key) => {
    if (copy[key]) copy[key] = '[redacted]';
  });
  return copy;
}

function summarizeBody(body) {
  if (body === null || body === undefined) return body;
  try {
    if (typeof body === 'string') return body; // log full string body
    return JSON.stringify(body);
  } catch (_e) {
    return '[unserializable body]';
  }
}

async function request(path, { method = 'GET', data, params, skipAuth = false } = {}) {
  const url = buildUrl(path, params);
  const startedAt = Date.now();
  const redactedData = redactPayload(data);
  const headers = buildHeaders(!skipAuth);
  let response;
  let parsedBody = null;
  let bodyLog = null;
  let attemptedRefresh = false;

  try {
    const execute = async () => {
      response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        bodyLog = await response.text();
        // Try refresh once on 401/403
        if (!attemptedRefresh && (response.status === 401 || response.status === 403)) {
          attemptedRefresh = true;
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            // Retry once with new token
            return execute();
          }
        }
        throw new Error(bodyLog || `Request failed with status ${response.status}`);
      }

      if (response.status === 204) {
        parsedBody = {};
        return parsedBody;
      }

      if (contentType && contentType.includes('application/json')) {
        parsedBody = await response.json();
        return parsedBody;
      }

      bodyLog = await response.text();
      parsedBody = {};
      return parsedBody;
    };

    return await execute();
  } finally {
    // Minimal structured log for backend visibility
    console.log('[API]', {
      method,
      url,
      status: response?.status,
      durationMs: Date.now() - startedAt,
      params,
      data: redactedData,
      body: summarizeBody(parsedBody ?? bodyLog)
    });
  }
}

function setAuthToken(token) {
  authToken = token;
}

function clearAuthToken() {
  authToken = null;
}

async function tryRefreshToken() {
  try {
    const { useAuthStore } = await import('./auth');
    const auth = useAuthStore();
    if (!auth?.refreshToken) return false;
    await auth.refreshTokens();
    if (auth.token) setAuthToken(auth.token);
    return Boolean(auth.token);
  } catch (error) {
    console.warn('[API] refresh failed', error?.message || error);
    return false;
  }
}

export { request, setAuthToken, clearAuthToken };

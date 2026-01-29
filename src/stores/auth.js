import { defineStore } from 'pinia';
import { request, setAuthToken, clearAuthToken } from './apiClient';

const STORAGE_KEYS = {
  token: 'auth_token',
  refresh: 'auth_refresh_token',
  user: 'auth_user'
};

function loadPersistedState() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refresh);
  const userRaw = localStorage.getItem(STORAGE_KEYS.user);
  const user = userRaw ? JSON.parse(userRaw) : null;
  if (token) setAuthToken(token);
  return { token, refreshToken, user };
}

function persistSession({ token, refreshToken, user }) {
  if (token) localStorage.setItem(STORAGE_KEYS.token, token);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refresh);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...loadPersistedState(),
    token: loadPersistedState().token,
    refreshToken: loadPersistedState().refreshToken,
    user: loadPersistedState().user,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isStudent: (state) => state.user?.role === 'student' || state.user?.userType === 'student',
    isTeacher: (state) => state.user?.role === 'teacher' || state.user?.userType === 'teacher',
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.userType === 'admin',
    isDev: (state) => state.user?.role === 'dev' || state.user?.userType === 'dev',
    authHeader: (state) => (state.token ? { Authorization: `Bearer ${state.token}` } : {})
  },
  actions: {
    async hydrate() {
      if (this.token) {
        setAuthToken(this.token);
        if (!this.user) {
          try {
            await this.fetchCurrentUser();
          } catch (_e) {
            // swallow; fetchCurrentUser will set error
          }
        }
      }
    },

    async login({ email, password }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/auth/login', { method: 'POST', data: { email, password } });
        const token = response.access_token ?? response.token;
        if (!token) throw new Error('Missing access token');
        this.token = token;
        this.refreshToken = response.refresh_token ?? response.refreshToken ?? null;
        setAuthToken(this.token);
        await this.fetchCurrentUser();
        persistSession({ token: this.token, refreshToken: this.refreshToken, user: this.user });
        return this.user;
      } catch (err) {
        this.error = err.message || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return null;
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/auth/me`, { method: 'GET' });
        // /auth/me returns user fields directly; fallback to wrapped payloads
        this.user = response.user ?? response ?? this.user;
        persistSession({ token: this.token, refreshToken: this.refreshToken, user: this.user });
        return this.user;
      } catch (err) {
        this.error = err.message || 'Unable to fetch user';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async refreshTokens() {
      if (!this.refreshToken) return null;
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/auth/refresh', { method: 'POST', data: { refresh_token: this.refreshToken } });
        const token = response.token ?? response.access_token ?? this.token;
        if (!token) throw new Error('Missing access token');
        this.token = token;
        this.refreshToken = response.refresh_token ?? response.refreshToken ?? this.refreshToken;
        setAuthToken(this.token);
        persistSession({ token: this.token, refreshToken: this.refreshToken, user: this.user });
        return { token: this.token, refreshToken: this.refreshToken };
      } catch (err) {
        this.error = err.message || 'Unable to refresh token';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.error = null;
      clearAuthToken();
      clearSession();
    }
  }
});

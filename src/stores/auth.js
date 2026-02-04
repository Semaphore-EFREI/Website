import { defineStore } from 'pinia';
import { request, setAuthToken, clearAuthToken } from './apiClient';

const STORAGE_KEYS = {
  token: 'auth_token',
  refresh: 'auth_refreshToken',
  user: 'auth_user'
};

function normalizeToken(raw) {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value || value.toLowerCase() === 'null' || value.toLowerCase() === 'undefined') return null;
  return value;
}

function loadPersistedState() {
  const token = normalizeToken(localStorage.getItem(STORAGE_KEYS.token));
  const refreshToken = normalizeToken(localStorage.getItem(STORAGE_KEYS.refresh));
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

const persisted = loadPersistedState();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: persisted.token,
    refreshToken: persisted.refreshToken,
    user: persisted.user,
    hydrated: false,
    loading: false,
    error: null,
    isRefreshing: false,
    refreshPromise: null
  }),
  getters: {
    hasToken: (state) => Boolean(normalizeToken(state.token)),
    isAuthenticated: (state) => {
      const tokenOk = Boolean(normalizeToken(state.token))
      const hasUserId = Boolean(state.user?.id || state.user?._id)
      return tokenOk && hasUserId
    },
    isStudent: (state) => state.user?.role === 'student' || state.user?.userType === 'student',
    isTeacher: (state) => state.user?.role === 'teacher' || state.user?.userType === 'teacher',
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.userType === 'admin',
    isDev: (state) => state.user?.role === 'dev' || state.user?.userType === 'dev',
    canAccessAdmin: (state) => {
      const role = String(state.user?.role || state.user?.userType || '').toLowerCase()
      return role === 'admin' || role === 'dev'
    },
    authHeader: (state) => (state.token ? { Authorization: `Bearer ${state.token}` } : {})
  },
  actions: {
    async hydrate() {
      if (!this.token) {
        this.hydrated = true;
        return;
      }

      setAuthToken(this.token);

      try {
        await this.fetchCurrentUser();
      } catch (_e) {
        // swallow; fetchCurrentUser will set error
      } finally {
        this.hydrated = true;
      }
    },

    async login({ email, password }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/auth/login', {
          method: 'POST',
          data: { email, password },
          skipAuth: true,
          retryOnAuthFailure: false
        });
        const token = response.accessToken ?? response.token;
        if (!token) throw new Error('Missing access token');
        this.token = token;
        this.refreshToken = response.refreshToken ?? null;
        setAuthToken(this.token);
        await this.fetchCurrentUser();
        
        // Vérifier que l'utilisateur est admin
        const userRole = String(this.user?.role || this.user?.userType || '').toLowerCase();
        const isAllowed = userRole === 'admin' || userRole === 'dev';
        if (!isAllowed) {
          this.logout();
          throw new Error('Access denied: Admin access required');
        }
        
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
        this.hydrated = true;
      }
    },

    async refreshTokens() {
      // Prevent concurrent refresh attempts
      if (this.isRefreshing && this.refreshPromise) {
        return this.refreshPromise;
      }

      if (!this.refreshToken) {
        console.warn('[Auth] No refresh token available');
        return null;
      }

      this.isRefreshing = true;
      this.loading = true;
      this.error = null;

      // Store the current refreshToken to use
      const currentRefreshToken = this.refreshToken;

      this.refreshPromise = (async () => {
        try {
          const response = await request('/auth/refresh', {
            method: 'POST',
            data: { refreshToken: currentRefreshToken },
            skipAuth: true,
            retryOnAuthFailure: false
          });
          
          const newToken = response.token ?? response.accessToken;
          const newRefreshToken = response.refreshToken;

          if (!newToken) {
            throw new Error('Missing access token in refresh response');
          }

          // CRITICAL: Always update refreshToken if provided by server
          // If server doesn't provide a new refreshToken, log warning and logout
          if (!newRefreshToken) {
            console.error('[Auth] Server did not return a new refreshToken, logging out');
            this.logout();
            throw new Error('Server did not return a new refreshToken');
          }

          this.token = newToken;
          this.refreshToken = newRefreshToken;
          setAuthToken(this.token);
          persistSession({ token: this.token, refreshToken: this.refreshToken, user: this.user });
          
          console.log('[Auth] Token refreshed successfully');
          return { token: this.token, refreshToken: this.refreshToken };
        } catch (err) {
          console.error('[Auth] Token refresh failed:', err.message);
          this.error = err.message || 'Unable to refresh token';
          // Clear auth state on refresh failure to prevent reuse of invalid token
          this.logout();
          throw err;
        } finally {
          this.loading = false;
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      })();

      return this.refreshPromise;
    },

    async logout() {
      try {
        // Appel API logout si on a un token
        if (this.token) {
          await request('/auth/logout', { method: 'POST' }).catch(() => {
            // Ignore les erreurs de logout API (on déconnecte localement quand même)
          });
        }
      } finally {
        // Nettoyage local de la session
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.error = null;
        clearAuthToken();
        clearSession();
      }
    }
  }
});

import { defineStore } from 'pinia';
import { request } from './apiClient';
import { useAuthStore } from './auth';

const ROLE_LABELS = {
  student: 'Étudiant',
  teacher: 'Enseignant',
  admin: 'Admin'
};

const ROLE_PLURAL = {
  student: 'students',
  teacher: 'teachers',
  admin: 'admins'
};

const ROLE_SINGULAR = {
  student: 'student',
  teacher: 'teacher',
  admin: 'admin'
};

function toRoleKey(role) {
  const value = (role || '').toString().toLowerCase();
  if (['étudiant', 'etudiant', 'student'].includes(value)) return 'student';
  if (['enseignant', 'teacher'].includes(value)) return 'teacher';
  if (['admin', 'administrateur', 'administrator'].includes(value)) return 'admin';
  return null;
}

function toRoleLabel(roleKey) {
  return ROLE_LABELS[roleKey] || roleKey || '';
}

function resolveSchoolId(explicitSchoolId) {
  if (explicitSchoolId) return explicitSchoolId;
  const auth = useAuthStore();
  return auth?.user?.schoolId ?? auth?.user?.school_id ?? auth?.user?.school?.id ?? null;
}

function normalizeUser(raw, explicitRoleKey) {
  const roleKey = toRoleKey(explicitRoleKey || raw?.role || raw?.userType || raw?.type) || 'student';
  const id = raw?.id ?? raw?.userId ?? raw?._id ?? raw?.uuid ?? raw?.identifier ?? null;
  const firstName = raw?.firstName ?? raw?.firstname ?? raw?.givenName ?? '';
  const lastName = raw?.lastName ?? raw?.lastname ?? raw?.familyName ?? '';
  const email = raw?.email ?? raw?.mail ?? '';
  const name = (raw?.name || `${firstName} ${lastName}`.trim() || email || `#${id}`).trim();
  const profilePicture = raw?.profilePicture ?? raw?.avatar ?? '';
  const rawGroups = raw?.groups ?? raw?.groupNames ?? raw?.classes ?? raw?.classrooms ?? [];
  const groups = Array.isArray(rawGroups)
    ? rawGroups.filter((g) => !String(g).startsWith('single-'))
    : [];

  return {
    ...raw,
    id,
    roleKey,
    role: toRoleLabel(roleKey),
    firstName,
    lastName,
    name,
    email,
    profilePicture,
    groups
  };
}

function extractList(response, key) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response[key])) return response[key];
  return [];
}

function isDifferent(nextVal, currentVal) {
  if (nextVal === undefined) return false;
  if (nextVal === null && currentVal === null) return false;
  const left = typeof nextVal === 'object' ? JSON.stringify(nextVal) : nextVal;
  const right = typeof currentVal === 'object' ? JSON.stringify(currentVal) : currentVal;
  return left !== right;
}

function singularPath(roleKey, id) {
  return `/${ROLE_SINGULAR[roleKey]}/${id}`;
}

function pluralPath(roleKey, schoolId) {
  return `/${ROLE_PLURAL[roleKey]}/${schoolId}`;
}

function creationPath(roleKey) {
  return `/${ROLE_SINGULAR[roleKey]}`;
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    filters: {
      role: null,
      search: ''
    }
  }),
  getters: {
    count: (state) => state.users.length,
    byId: (state) => (id) => state.users.find((u) => String(u.id) === String(id)),
    byRole: (state) => (role) => state.users.filter((u) => u.role === role),
    filtered: (state) => {
      return state.users.filter((u) => {
        const matchRole = state.filters.role ? u.role === state.filters.role : true;
        const matchSearch = state.filters.search
          ? (u.name || '').toLowerCase().includes(state.filters.search.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(state.filters.search.toLowerCase())
          : true;
        return matchRole && matchSearch;
      });
    }
  },
  actions: {
    setFilters(partial) {
      this.filters = { ...this.filters, ...partial };
    },

    upsertUser(user) {
      const idx = this.users.findIndex((u) => u.id === user.id);
      if (idx >= 0) this.users.splice(idx, 1, user);
      else this.users.push(user);
    },

    async fetchUsers(params = {}) {
      const schoolId = resolveSchoolId(params.schoolId ?? params.school_id);
      if (!schoolId) {
        this.error = 'Identifiant établissement manquant';
        throw new Error('Missing school id');
      }

      this.loading = true;
      this.error = null;
      try {
        const [studentsRes, teachersRes, adminsRes] = await Promise.all([
          request(pluralPath('student', schoolId), { method: 'GET' }),
          request(pluralPath('teacher', schoolId), { method: 'GET' }),
          request(pluralPath('admin', schoolId), { method: 'GET' })
        ]);

        const nextUsers = [
          ...extractList(studentsRes, 'students').map((u) => normalizeUser(u, 'student')),
          ...extractList(teachersRes, 'teachers').map((u) => normalizeUser(u, 'teacher')),
          ...extractList(adminsRes, 'admins').map((u) => normalizeUser(u, 'admin'))
        ];

        this.users = nextUsers;
        return this.users;
      } catch (err) {
        this.error = err.message || 'Unable to fetch users';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsersBatch(ids = []) {
      const uniqueIds = Array.from(new Set((ids || []).map((id) => String(id || '').trim()).filter(Boolean)));
      if (!uniqueIds.length) return [];

      const missingIds = uniqueIds.filter((id) => !this.users.find((u) => String(u.id) === id));
      if (!missingIds.length) {
        return this.users.filter((u) => uniqueIds.includes(String(u.id)));
      }

      this.loading = true;
      this.error = null;
      try {
        const response = await request('/users/batch', { method: 'GET', params: { id: missingIds } });
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.users)
            ? response.users
            : [];
        const normalized = list.map((u) => normalizeUser(u, u?.userType || u?.role));
        normalized.forEach((u) => this.upsertUser(u));
        return normalized;
      } catch (err) {
        this.error = err.message || 'Unable to fetch users batch';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserById(id, role) {
      this.loading = true;
      this.error = null;

      const roleFromState = this.users.find((u) => String(u.id) === String(id))?.roleKey;
      const roleKey = toRoleKey(role || roleFromState);
      const rolesToTry = roleKey ? [roleKey] : ['student', 'teacher', 'admin'];
      let lastError = null;

      for (const key of rolesToTry) {
        try {
          const response = await request(singularPath(key, id), { method: 'GET' });
          const user = normalizeUser(response.user ?? response[key] ?? response, key);
          this.upsertUser(user);
          return user;
        } catch (err) {
          lastError = err;
        }
      }

      this.error = lastError?.message || 'Unable to fetch user';
      this.loading = false;
      throw lastError || new Error('Unable to fetch user');
    },

    async fetchUserProfile(id, role) {
      this.loading = true;
      this.error = null;

      const roleFromState = this.users.find((u) => String(u.id) === String(id))?.roleKey;
      const roleKey = toRoleKey(role || roleFromState) || 'student';
      let lastError = null;

      try {
        const response = await request(`${singularPath(roleKey, id)}?include=groups`, { method: 'GET' });
        const user = normalizeUser(response.user ?? response[roleKey] ?? response, roleKey);
        
        if (user.groups && Array.isArray(user.groups) && user.groups.length > 0) {
          const filteredGroupIds = user.groups.filter(
            (groupId) => !String(groupId).startsWith('single-')
          );
          
          const groupsWithNames = await Promise.all(
            filteredGroupIds.map(async (groupId) => {
              try {
                const groupResponse = await request(`/studentGroup/${groupId}`, { method: 'GET' });
                const groupName = groupResponse.name || groupResponse.studentGroup?.name || groupId;
                // Filter out groups whose name starts with 'single-'
                if (String(groupName).startsWith('single-')) {
                  return null;
                }
                return groupName;
              } catch (err) {
                console.error(`Unable to fetch group ${groupId}:`, err);
                return null;
              }
            })
          );
          user.groups = groupsWithNames.filter(Boolean);
        } else {
          user.groups = [];
        }
        
        this.upsertUser(user);
        this.loading = false;
        return user;
      } catch (err) {
        lastError = err;
        this.error = lastError?.message || 'Unable to fetch user profile';
        this.loading = false;
        throw lastError || new Error('Unable to fetch user profile');
      }
    },

    async createUser(payload) {
      // userType allows differentiating the API route from admin "role" payload field
      const roleKey = toRoleKey(payload.userType || payload.role) || 'student';
      const schoolId = resolveSchoolId(payload.schoolId ?? payload.school_id);
      this.loading = true;
      this.error = null;

      try {
        const { userType, id, userId, _id, ...body } = payload; // id must not be sent on create

        const response = await request(creationPath(roleKey), {
          method: 'POST',
          data: body
        });
        const user = normalizeUser(response.user ?? response[ROLE_SINGULAR[roleKey]] ?? response, roleKey);
        this.upsertUser(user);
        return user;
      } catch (err) {
        this.error = err.message || 'Unable to create user';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id, updates) {
      const existing = this.users.find((u) => String(u.id) === String(id)) || {};
      const existingRole = existing.roleKey;
      const roleKey = toRoleKey(updates.userType || updates.role || existingRole) || existingRole || 'student';
      this.loading = true;
      this.error = null;

      try {
        const { userType, ...body } = updates;

        const patchPayload = {};

        Object.keys(body).forEach((key) => {
          const value = body[key];
          if (value === undefined) return;
          if (key === 'password' && !value) return; // don't send empty password
          const currentVal = existing[key];
          if (isDifferent(value, currentVal)) {
            patchPayload[key] = value;
          }
        });

        // No changes detected -> return existing
        if (Object.keys(patchPayload).length === 0) {
          return existing;
        }

        const response = await request(singularPath(roleKey, id), {
          method: 'PATCH',
          data: patchPayload
        });
        const user = normalizeUser(response.user ?? response[ROLE_SINGULAR[roleKey]] ?? response, roleKey);
        this.upsertUser(user);
        return user;
      } catch (err) {
        this.error = err.message || 'Unable to update user';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id, role) {
      const roleKey = toRoleKey(role || this.users.find((u) => String(u.id) === String(id))?.roleKey) || 'student';
      this.loading = true;
      this.error = null;

      try {
        await request(singularPath(roleKey, id), { method: 'DELETE' });
        const targetId = String(id);
        this.users = this.users.filter((u) => String(u.id) !== targetId);
      } catch (err) {
        this.error = err.message || 'Unable to delete user';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  }
});

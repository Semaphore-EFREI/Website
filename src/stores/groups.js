import { defineStore } from 'pinia';
import { request } from './apiClient';
import { useAuthStore } from './auth';

function resolveSchoolId(explicitSchoolId) {
  if (explicitSchoolId) return explicitSchoolId;
  const auth = useAuthStore();
  return auth?.user?.schoolId ?? auth?.user?.school_id ?? auth?.user?.school?.id ?? null;
}

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: [],
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id) => state.groups.find((g) => String(g.id) === String(id)),
    studentsOf: (state) => (id) => state.groups.find((g) => String(g.id) === String(id))?.studentIds ?? []
  },
  actions: {
    async fetchGroups(params = {}) {
      const schoolId = resolveSchoolId(params.schoolId ?? params.school_id);
      if (!schoolId) {
        this.error = 'Identifiant établissement manquant';
        throw new Error('Missing school id');
      }
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/studentGroups/${schoolId}`, { method: 'GET'});
        const items = Array.isArray(response.items) ? response.items : Array.isArray(response) ? response : [];
        this.groups = items;
        return this.groups;
      } catch (err) {
        this.error = err.message || 'Unable to fetch groups';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchGroup(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/studentGroup/${id}`, { method: 'GET' });
        const group = response.group ?? null;
        if (!group) throw new Error('Group not found');
        const index = this.groups.findIndex((g) => String(g.id) === String(group.id));
        if (index >= 0) this.groups.splice(index, 1, group);
        else this.groups.push(group);
        return group;
      } catch (err) {
        this.error = err.message || 'Unable to fetch group';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createGroup(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/studentGroup', { method: 'POST', data: payload });
        const group = response.group;
        if (!group) throw new Error('Group creation failed');
        this.groups.push(group);
        return group;
      } catch (err) {
        this.error = err.message || 'Unable to create group';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateGroup(id, updates) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/studentGroup/${id}`, { method: 'PATCH', data: updates });
        const group = response.group;
        if (!group) throw new Error('Group update failed');
        const index = this.groups.findIndex((g) => String(g.id) === String(group.id));
        if (index >= 0) this.groups.splice(index, 1, group);
        return group;
      } catch (err) {
        this.error = err.message || 'Unable to update group';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteGroup(id) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/studentGroup/${id}`, { method: 'DELETE' });
        this.groups = this.groups.filter((g) => String(g.id) !== String(id));
      } catch (err) {
        this.error = err.message || 'Unable to delete group';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async assignStudents(groupId, studentIds) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/studentGroup/${groupId}/students`, { method: 'POST', data: { studentIds } });
        const group = this.byId(groupId);
        if (group) {
          const unique = new Set([...(group.studentIds ?? []), ...studentIds.map(Number)]);
          group.studentIds = Array.from(unique);
        }
      } catch (err) {
        this.error = err.message || 'Unable to assign students';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async removeStudents(groupId, studentIds) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/studentGroup/${groupId}/students`, { method: 'DELETE', data: { studentIds } });
        const group = this.byId(groupId);
        if (group) {
          group.studentIds = (group.studentIds ?? []).filter((id) => !studentIds.map(Number).includes(id));
        }
      } catch (err) {
        this.error = err.message || 'Unable to remove students';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

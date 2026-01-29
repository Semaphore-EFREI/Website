import { defineStore } from 'pinia';
import { request } from './apiClient';
import { useAuthStore } from './auth';

function resolveSchoolId(explicitSchoolId) {
  if (explicitSchoolId) return explicitSchoolId;
  const auth = useAuthStore();
  return auth?.user?.schoolId ?? auth?.user?.school_id ?? auth?.user?.school?.id ?? null;
}

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [],
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id) => state.rooms.find((room) => room.id === Number(id))
  },
  actions: {
    async fetchRooms(params = {}) {
      const schoolId = resolveSchoolId(params.schoolId ?? params.school_id);
      if (!schoolId) {
        this.error = 'Identifiant établissement manquant';
        throw new Error('Missing school id');
      }

      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/classrooms/${schoolId}`, { method: 'GET', params });
        const items = Array.isArray(response.items) ? response.items : Array.isArray(response) ? response : [];
        this.rooms = items;
        return this.rooms;
      } catch (err) {
        this.error = err.message || 'Unable to fetch rooms';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createRoom(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/classroom', { method: 'POST', data: payload });
        const room = response.room;
        if (!room) throw new Error('Room creation failed');
        this.rooms.push(room);
        return room;
      } catch (err) {
        this.error = err.message || 'Unable to create room';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateRoom(id, updates) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/classroom/${id}`, { method: 'PATCH', data: updates });
        const room = response.room;
        if (!room) throw new Error('Room update failed');
        const index = this.rooms.findIndex((r) => r.id === room.id);
        if (index >= 0) this.rooms.splice(index, 1, room);
        return room;
      } catch (err) {
        this.error = err.message || 'Unable to update room';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteRoom(id) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/classroom/${id}`, { method: 'DELETE' });
        this.rooms = this.rooms.filter((r) => r.id !== Number(id));
      } catch (err) {
        this.error = err.message || 'Unable to delete room';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

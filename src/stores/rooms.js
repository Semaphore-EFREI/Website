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
    async fetchRoom(id, params = {}) {
      if (!id) throw new Error('Missing room id');
      this.loading = true;
      this.error = null;
      try {
        const query = { include: 'beacons', ...params };
        const response = await request(`/classroom/${id}`, { method: 'GET', params: query });
        const room = response?.room ?? response?.classroom ?? response;
        if (!room) throw new Error('Room not found');
        const idx = this.rooms.findIndex((r) => String(r.id) === String(room.id));
        if (idx >= 0) this.rooms.splice(idx, 1, room);
        else this.rooms.push(room);
        return room;
      } catch (err) {
        this.error = err.message || 'Unable to fetch room';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchRooms(params = {}) {
      const schoolId = resolveSchoolId(params.schoolId ?? params.school_id);
      if (!schoolId) {
        this.error = 'Identifiant établissement manquant';
        throw new Error('Missing school id');
      }

      const { schoolId: _s, school_id: _sid, ...rest } = params;
      const query = { include: 'beacons', ...rest };

      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/classrooms/${schoolId}`, { method: 'GET', params: query });
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
        const body = { name: payload?.name };
        const response = await request('/classroom', { method: 'POST', data: body });
        const room = response?.room ?? response?.classroom ?? response;
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
        const payload = {name: updates?.name };
        const response = await request(`/classroom/${id}`, { method: 'PATCH', data: payload });
        const room = response?.room ?? response?.classroom ?? response;
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
        const targetId = String(id);
        this.rooms = this.rooms.filter((r) => String(r.id) !== targetId);
      } catch (err) {
        this.error = err.message || 'Unable to delete room';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

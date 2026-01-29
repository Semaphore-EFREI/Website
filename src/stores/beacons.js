import { defineStore } from 'pinia';
import { request } from './apiClient';

export const useBeaconsStore = defineStore('beacons', {
  state: () => ({
    beacons: [],
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id) => state.beacons.find((t) => t.id === Number(id)),
    byLabel: (state) => (label) => state.beacons.filter((t) => t.label.toLowerCase().includes(label.toLowerCase()))
  },
  actions: {
    async fetchBeacons() {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/beacons', { method: 'GET' });
        this.beacons = Array.isArray(response.items) ? response.items : [];
        return this.beacons;
      } catch (err) {
        this.error = err.message || 'Unable to fetch beacons';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchBeacon(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/beacon/${id}`, { method: 'GET' });
        const beacon = response.beacon ?? null;
        if (!beacon) throw new Error('Beacon not found');
        const index = this.beacons.findIndex((t) => t.id === beacon.id);
        if (index >= 0) this.beacons.splice(index, 1, beacon);
        else this.beacons.push(beacon);
        return beacon;
      } catch (err) {
        this.error = err.message || 'Unable to fetch beacon';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createBeacon(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/beacon', { method: 'POST', data: payload });
        const beacon = response.beacon;
        if (!beacon) throw new Error('Beacon creation failed');
        this.beacons.push(beacon);
        return beacon;
      } catch (err) {
        this.error = err.message || 'Unable to create beacon';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateBeacon(id, updates) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/beacon/${id}`, { method: 'PATCH', data: updates });
        const beacon = response.beacon;
        if (!beacon) throw new Error('Beacon update failed');
        const index = this.beacons.findIndex((t) => t.id === beacon.id);
        if (index >= 0) this.beacons.splice(index, 1, beacon);
        return beacon;
      } catch (err) {
        this.error = err.message || 'Unable to update beacon';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteBeacon(id) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/beacon/${id}`, { method: 'DELETE' });
        this.beacons = this.beacons.filter((t) => t.id !== Number(id));
      } catch (err) {
        this.error = err.message || 'Unable to delete beacon';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async assignBeaconToClass(beaconId, classId) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/beacon/${beaconId}/classroom`, { method: 'POST', data: { "classroomId": classId } });
      } catch (err) {
        this.error = err.message || 'Unable to assign beacon to class';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async removeBeaconFromClass(beaconId, classId) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/beacon/${beaconId}/classroom`, { method: 'DELETE', data: { "classroomId": classId } });
      } catch (err) {
        this.error = err.message || 'Unable to remove beacon from class';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

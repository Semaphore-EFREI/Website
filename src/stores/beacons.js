import { defineStore } from 'pinia';
import { request } from './apiClient';

export const useBeaconsStore = defineStore('beacons', {
  state: () => ({
    beacons: [],
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id) => state.beacons.find((t) => String(t.id) === String(id)),
    byLabel: (state) => (label) => state.beacons.filter((t) => (t.label || '').toLowerCase().includes(label.toLowerCase()))
  },
  actions: {
    async fetchBeacons(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/beacons', { method: 'GET', params });

        const parsed = (() => {
          if (Array.isArray(response)) return response;
          if (typeof response === 'string') {
            try {
              const maybeJson = JSON.parse(response);
              if (Array.isArray(maybeJson)) return maybeJson;
              if (Array.isArray(maybeJson?.items)) return maybeJson.items;
            } catch (_e) {
              return [];
            }
          }
          if (Array.isArray(response?.items)) return response.items;
          return [];
        })();

        this.beacons = parsed.map((b, index) => ({
          ...b,
          label: b.label || b.name || `${b.serialNumber ?? ''}` || `Balise ${index + 1}`
        }));
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
        const beacon = response.beacon ?? response ?? null;
        if (!beacon) throw new Error('Beacon not found');
        const normalized = { ...beacon, label: beacon.label || beacon.name || `${beacon.serialNumber ?? ''}` };
        const index = this.beacons.findIndex((t) => String(t.id) === String(normalized.id));
        if (index >= 0) this.beacons.splice(index, 1, beacon);
        else this.beacons.push(normalized);
        return normalized;
      } catch (err) {
        this.error = err.message || 'Unable to fetch beacon';
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
        await request(`/beacon/${beaconId}/classroom/${classId}`, { method: 'DELETE' });
      } catch (err) {
        this.error = err.message || 'Unable to remove beacon from class';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

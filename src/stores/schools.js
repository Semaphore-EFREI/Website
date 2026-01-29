import { defineStore } from 'pinia';
import { request } from './apiClient';

export const useSchoolsStore = defineStore('schools', {
  state: () => ({
    schools: [],
    selectedSchoolId: null,
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id) => state.schools.find((s) => String(s.id) === String(id)),
    selectedSchool: (state) => state.schools.find((s) => String(s.id) === String(state.selectedSchoolId)) || null
  },
  actions: {
    selectSchool(id) {
      this.selectedSchoolId = id;
    },

    async fetchSchools() {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/schools', { method: 'GET' });
        const items = Array.isArray(response.items) ? response.items : Array.isArray(response) ? response : [];
        this.schools = items;
        if (!this.selectedSchoolId && this.schools.length) this.selectedSchoolId = this.schools[0].id;
        return this.schools;
      } catch (err) {
        this.error = err.message || 'Unable to fetch schools';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchSchool(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/school/${id}`, { method: 'GET' });
        const school = response.school ?? response ?? null;
        if (!school) throw new Error('School not found');
        const index = this.schools.findIndex((s) => String(s.id) === String(school.id));
        if (index >= 0) this.schools.splice(index, 1, school);
        else this.schools.push(school);
        return school;
      } catch (err) {
        this.error = err.message || 'Unable to fetch school';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createSchool(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/school', { method: 'POST', data: payload });
        const school = response.school ?? response;
        if (!school) throw new Error('School creation failed');
        this.schools.push(school);
        return school;
      } catch (err) {
        this.error = err.message || 'Unable to create school';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSchoolName(id, newname) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/school/${id}`, { method: 'PATCH', data: { name: newname } });
        const school = response.school ?? response;
        if (!school) throw new Error('School name update failed');
        const index = this.schools.findIndex((s) => String(s.id) === String(school.id));
        if (index >= 0) this.schools.splice(index, 1, school);
        return school;
      } catch (err) {
        this.error = err.message || 'Unable to update school name';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSchoolPreferences(id, updates) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/school/${id}/preferences`, { method: 'PATCH', data: updates });
        const school = response.school ?? response ?? { id };
        const index = this.schools.findIndex((s) => String(s.id) === String(school.id));
        if (index >= 0) this.schools.splice(index, 1, school);
        else if (school.id) this.schools.push(school);
        return school;
      } catch (err) {
        this.error = err.message || 'Unable to update school preferences';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteSchool(id) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/school/${id}`, { method: 'DELETE' });
        this.schools = this.schools.filter((s) => String(s) !== String(id));
        if (String(this.selectedSchoolId) === String(id)) this.selectedSchoolId = this.schools[0]?.id ?? null;
      } catch (err) {
        this.error = err.message || 'Unable to delete school';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

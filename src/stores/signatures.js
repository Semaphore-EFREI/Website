import { defineStore } from 'pinia';
import { request } from './apiClient';

export const useSignaturesStore = defineStore('signatures', {
  state: () => ({
    signatures: [],
    loading: false,
    error: null
  }),
  getters: {
    byCourse: (state) => (courseId) => state.signatures.filter((s) => s.courseId === Number(courseId)),
    byId: (state) => (id) => state.signatures.find((s) => s.id === Number(id)),
    byStudent: (state) => (studentId) => state.signatures.filter((s) => s.studentId === Number(studentId))
  },
  actions: {
    async fetchSignatures(courseId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/course/${courseId}?include=signatures`, { method: 'GET' });
        this.signatures = Array.isArray(response.signature.items) ? response.signature.items : [];
        return this.byCourse(courseId);
      } catch (err) {
        this.error = err.message || 'Unable to fetch signatures';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async addSignature(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/signature', { method: 'POST', data: payload });
        const signature = response.signature;
        if (!signature) throw new Error('Signature creation failed');
        this.signatures.push(signature);
        return signature;
      } catch (err) {
        this.error = err.message || 'Unable to add signature';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateSignature(id, updates) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/signature/${id}`, { method: 'PATCH', data: updates });
        const signature = response.signature;
        if (!signature) throw new Error('Signature update failed');
        const index = this.signatures.findIndex((s) => s.id === signature.id);
        if (index >= 0) this.signatures.splice(index, 1, signature);
        return signature;
      } catch (err) {
        this.error = err.message || 'Unable to update signature';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async removeSignature(id) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/signature/${id}`, { method: 'DELETE' });
        this.signatures = this.signatures.filter((s) => s.id !== Number(id));
      } catch (err) {
        this.error = err.message || 'Unable to delete signature';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

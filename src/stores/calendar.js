import { defineStore } from 'pinia';
import { request } from './apiClient';

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    courses: [],
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id) => state.courses.find((c) => String(c.id) === String(id)),
    byDate: (state) => (dateIso) => state.courses.filter((c) => (c.start || '').slice(0, 10) === dateIso),
    byClass: (state) => (classId) => state.courses.filter((c) => String(c.classId) === String(classId)),
    byTeacher: (state) => (teacherId) => state.courses.filter((c) => String(c.teacherId) === String(teacherId))
  },
  actions: {
    async fetchCourses(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/courses', { method: 'GET', params });

        const parsed = (() => {
          if (Array.isArray(response)) return response;
          if (typeof response === 'string') {
            try {
              const maybeJson = JSON.parse(response);
              if (Array.isArray(maybeJson)) return maybeJson;
              if (maybeJson?.items && Array.isArray(maybeJson.items)) return maybeJson.items;
            } catch (_e) {
              return [];
            }
          }
          if (response?.items && Array.isArray(response.items)) return response.items;
          return [];
        })();

        this.courses = parsed;
        return this.courses;
      } catch (err) {
        this.error = err.message || 'Unable to fetch courses';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchCourse(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/course/${id}`, {
          method: 'GET'
        });
        const course = (() => {
          if (response?.course) return response.course;
          if (typeof response === 'string') {
            try {
              const parsed = JSON.parse(response);
              if (parsed?.course) return parsed.course;
              return parsed;
            } catch (_e) {
              return null;
            }
          }
          return response || null;
        })();

        if (!course) throw new Error('Course not found');
        const index = this.courses.findIndex((c) => String(c.id) === String(course.id));
        if (index >= 0) this.courses.splice(index, 1, course);
        else this.courses.push(course);
        return course;
      } catch (err) {
        this.error = err.message || 'Unable to fetch course';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createCourse(payload) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request('/course', { method: 'POST', data: payload });
        const course = (() => {
          if (response?.course) return response.course;
          if (typeof response === 'string') {
            try {
              return JSON.parse(response);
            } catch (_e) {
              return null;
            }
          }
          return response || null;
        })();

        if (!course || !course.id) throw new Error('Course creation failed');
        this.courses.push(course);
        return course;
      } catch (err) {
        this.error = err.message || 'Unable to create course';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCourse(id, updates) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request(`/course/${id}`, { method: 'PATCH', data: updates });
        const course = response.course || response;
        if (!course) throw new Error('Course update failed');
        const index = this.courses.findIndex((c) => c.id === course.id);
        if (index >= 0) this.courses.splice(index, 1, course);
        return course;
      } catch (err) {
        this.error = err.message || 'Unable to update course';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCourse(id) {
      this.loading = true;
      this.error = null;
      try {
        await request(`/course/${id}`, { method: 'DELETE' });
        this.courses = this.courses.filter((c) => String(c.id) !== String(id));
      } catch (err) {
        this.error = err.message || 'Unable to delete course';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

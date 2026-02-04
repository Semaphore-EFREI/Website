<template>
  <div class="calendrier-page">
    <div class="calendrier-header">
      <picture>
        <source
          type="image/avif"
          srcset="../assets/images/calendrier_background-w640.avif 640w,
                  ../assets/images/calendrier_background-w960.avif 960w,
                  ../assets/images/calendrier_background-w1280.avif 1280w,
                  ../assets/images/calendrier_background-w1920.avif 1920w,
                  ../assets/images/calendrier_background-w2560.avif 2560w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcset="../assets/images/calendrier_background-w640.webp 640w,
                  ../assets/images/calendrier_background-w960.webp 960w,
                  ../assets/images/calendrier_background-w1280.webp 1280w,
                  ../assets/images/calendrier_background-w1920.webp 1920w,
                  ../assets/images/calendrier_background-w2560.webp 2560w"
          sizes="100vw"
        />
        <img
          src="../assets/images/calendrier_background-w1280.webp"
          alt="background"
          class="header-bg"
          decoding="async"
          fetchpriority="high"
        />
      </picture>

      <div class="header-buttons">
        <button class="btn-new-course" @click="goToNewCourse">
          <img src="../assets/images/plus-sign.svg" alt="plus" class="plus-icon" />Nouveau cours
        </button>
        <button class="btn-calendar" @click.prevent="openCalendar" aria-label="Ouvrir le sélecteur de date">
          <img src="../assets/images/calendrier_black.svg" alt="calendrier" />
          <input
            ref="dateInput"
            type="date"
            class="hidden-date-input"
            :value="inputDateValue"
            @change="onDateChange"
          />
        </button>
      </div>
      <div class="header-content">
        <img src="../assets/images/calendrier.svg" alt="calendrier" class="calendar-icon" />
        <h1 class="header-title">Calendrier</h1>
      </div>
    </div>

    <div class="calendrier-all">
      <div class="calendrier-content">

        <div class="day-selector">
          <span class="current-day">{{ formattedDate }}</span>
          <div class="arrow-container">
            <button class="arrow-btn" @click="previousDay">
              <img src="../assets/images/arrow-left.svg" alt="arrow left" class="arrow" />
            </button>
            <button class="arrow-btn" @click="nextDay">
              <img src="../assets/images/arrow-right.svg" alt="arrow right" class="arrow" />
            </button>
          </div>
        </div>

        <div class="schedule-container">
          <div v-for="hour in displayHours" :key="hour" class="hour-section">
            <div class="hour-label">{{ hour }}</div>
            <div class="blocks-row">
              <div
                v-for="block in getBlocksForHour(hour)"
                :key="block.id"
                class="class-block"
                :class="block.status"
                @click="openCourse(block.id)"
              >
                <div class="block-title">{{ block.subject }}</div>
                <div class="time-room">
                  <div class="block-time">{{ block.startTime }}-{{ block.endTime }}</div>
                  <div class="block-room">{{ block.room }}</div>
                </div>
                <div class="block-teacher">{{ block.teacher.join(', ') }}</div>
                <div class="block-container">
                  <div class="block-group">{{ block.group }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="legend-color finished"></div>
            <span>Le cours est terminé</span>
          </div>
          <div class="legend-item">
            <div class="legend-color finished-absent"></div>
            <span>Le cours est terminé, mais l'enseignant n'a pas validé sa présence</span>
          </div>
          <div class="legend-item">
            <div class="legend-color started"></div>
            <span>Le cours a débuté</span>
          </div>
          <div class="legend-item">
            <div class="legend-color started-absent"></div>
            <span>Le cours a débuté, mais l'enseignant n'a pas encore validé sa présence</span>
          </div>
          <div class="legend-item">
            <div class="legend-color planned"></div>
            <span>Le cours n'a pas encore eu lieu</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useCalendarStore } from '../stores';

export default {
  data() {
    return {
      selectedDate: new Date(),
      hours: ['8h00', '9h10', '10h20', '11h30', '12h40', '13h40', '14h50', '16h00', '17h10', '18h20', '19h30']
    }
  },
  computed: {
    formattedDate() {
      const day = this.selectedDate.getDate();
      const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      const month = monthNames[this.selectedDate.getMonth()];
      const ordinal = day === 1 ? 'er' : '';
      return `${day}${ordinal} ${month}`;
    },
    inputDateValue() {
      const year = this.selectedDate.getFullYear();
      const month = `${this.selectedDate.getMonth() + 1}`.padStart(2, '0');
      const day = `${this.selectedDate.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    filteredClasses() {
      const key = this.dateKey(this.selectedDate);
      return this.normalizedCourses.filter(c => c.day === key);
    },
    ...mapState(useCalendarStore, ['courses']),
    normalizedCourses() {
      return this.courses.map(course => this.normalizeCourse(course));
    },
    displayHours() {
      const dynamicHours = [...new Set(this.filteredClasses.map((c) => c.startTime).filter(Boolean))];
      const merged = [...this.hours, ...dynamicHours];
      const parsed = merged
        .map((h) => {
          const [hour, minute] = h.replace('h', ' ').split(' ').filter(Boolean);
          const hh = Number(hour);
          const mm = Number(minute || '0');
          if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
          return { raw: `${hh}h${`${mm}`.padStart(2, '0')}`, hh, mm };
        })
        .filter(Boolean);

      const seen = new Set();
      const sorted = parsed
        .sort((a, b) => (a.hh === b.hh ? a.mm - b.mm : a.hh - b.hh))
        .filter(({ raw }) => {
          if (seen.has(raw)) return false;
          seen.add(raw);
          return true;
        })
        .map(({ raw }) => raw);

      return sorted;
    }
  },
  created() {
    // Initialize to today by default
    this.selectedDate = new Date();
    
    // Si une date est passée en query parameter, utiliser cette date
    if (this.$route.query.date) {
      const dateStr = this.$route.query.date;
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        this.selectedDate = new Date(year, month, day);
      }
    }
    
    this.refreshCoursesForSelectedDate().catch(() => {});
  },
  methods: {
    ...mapActions(useCalendarStore, ['fetchCourses']),
    previousDay() {
      const next = new Date(this.selectedDate);
      next.setDate(next.getDate() - 1);
      this.selectedDate = next;
      this.refreshCoursesForSelectedDate();
    },
    nextDay() {
      const next = new Date(this.selectedDate);
      next.setDate(next.getDate() + 1);
      this.selectedDate = next;
      this.refreshCoursesForSelectedDate();
    },
    openCalendar() {
      const input = this.$refs.dateInput;
      if (!input) return;
      if (input.showPicker) {
        input.showPicker();
      } else {
        input.click();
      }
    },
    onDateChange(event) {
      const value = event.target.value;
      if (!value) return;
      this.selectedDate = new Date(`${value}T00:00:00`);
      this.refreshCoursesForSelectedDate();
    },
    getBlocksForHour(hour) {
      return this.filteredClasses.filter(c => c.startTime === hour);
    },
    openCourse(id) {
      this.$router.push({ name: 'CalendrierDetail', params: { id } });
    },
    goToNewCourse() {
      this.$router.push({ name: 'NouveauCours' });
    },
    getFirstCourseDate() {
      const first = this.courses[0];
      if (!first) return null;
      const normalized = this.normalizeCourse(first);
      return this.parseDay(normalized.day);
    },
    parseDay(dayStr) {
      if (!dayStr || typeof dayStr !== 'string') return null;
      const parts = dayStr.split('/');
      if (parts.length !== 3) return null;
      const [day, month, year] = parts.map((p) => Number(p));
      if ([day, month, year].some((n) => Number.isNaN(n))) return null;
      const d = new Date(year, month - 1, day);
      return Number.isNaN(d.getTime()) ? null : d;
    },
    dateKey(date) {
      const day = `${date.getDate()}`.padStart(2, '0');
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    toDateParam(date) {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const day = `${date.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    async refreshCoursesForSelectedDate() {
      const target = this.selectedDate instanceof Date ? this.selectedDate : new Date();
      const day = this.toDateParam(target);
      try {
        await this.fetchCourses({
          from: day,
          to: day,
          include: ['classrooms', 'signatures', 'teachers', 'studentGroups']
        });
      } catch (_err) {
        // Errors are handled in store; keep UI responsive
      }
    },
    normalizeCourse(course) {
      if (!course) {
        return { id: null, subject: '', startTime: '', endTime: '', day: '', room: '', teacher: [], group: '', status: '' };
      }

      const toDate = (value) => {
        if (value === null || value === undefined) return null;
        if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
        if (typeof value === 'number') {
          const ms = value < 1e12 ? value * 1000 : value; // support seconds timestamps
          const d = new Date(ms);
          return Number.isNaN(d.getTime()) ? null : d;
        }
        if (typeof value === 'string') {
          const numeric = Number(value);
          if (!Number.isNaN(numeric)) return toDate(numeric);
          const d = new Date(value);
          return Number.isNaN(d.getTime()) ? null : d;
        }
        return null;
      };

      const toDayTime = (dateObj) => {
        if (!dateObj) return { day: '', time: '' };
        const hours = `${dateObj.getHours()}`; // no leading zero so it matches '8h00' keys
        const minutes = `${dateObj.getMinutes()}`.padStart(2, '0');
        return {
          day: this.dateKey(dateObj),
          time: `${hours}h${minutes}`
        };
      };

      const startDate = toDate(course.start || course.startDate || course.date);
      const endDate = toDate(course.end || course.endDate);

      const startInfo = toDayTime(startDate);
      const endInfo = toDayTime(endDate);

      const teacherRaw = Array.isArray(course.teachers)
        ? course.teachers
        : Array.isArray(course.teacher)
          ? course.teacher
          : Array.isArray(course.teachersId)
            ? course.teachersId
            : Array.isArray(course.teacherIds)
              ? course.teacherIds
              : course.teacher
                ? [course.teacher]
                : course.teacherId
                  ? [course.teacherId]
                  : [];

      const teacherNames = teacherRaw
        .map((t) => {
          if (typeof t === 'object' && t !== null) {
            const fullName = [t.firstName || t.firstname, t.lastName || t.lastname].filter(Boolean).join(' ').trim();
            const candidate = t.name || fullName;
            const userId = t.id || t.userId || t.teacherId;
            return candidate || userId || '';
          }
          return t;
        })
        .map((name) => String(name || '').trim())
        .filter(Boolean);

      const roomName = course.room
        || course.roomName
        || course.classroom
        || (Array.isArray(course.classrooms) ? course.classrooms[0]?.name : '');

      const groupNames = (() => {
        if (Array.isArray(course.studentGroups)) {
          return course.studentGroups
            .map((g) => {
              if (typeof g === 'object' && g !== null) return g.name || g.title || g.label || g.id || '';
              return g;
            })
            .map((name) => String(name || '').trim())
            .filter((name) => name && !name.startsWith('single-'));
        }

        const fallback = course.group || course.className || '';
        const cleanFallback = String(fallback || '').trim();
        return cleanFallback && !cleanFallback.startsWith('single-') ? [cleanFallback] : [];
      })();

      const singleStudentIds = (() => {
        const singlesFromGroups = Array.isArray(course.studentGroups)
          ? course.studentGroups
              .map((g) => {
                if (typeof g === 'object' && g !== null) return g.id || g.name || g.title || g.label || '';
                return g;
              })
              .map((id) => String(id || '').trim())
              .filter((id) => id.startsWith('single-'))
              .map((id) => id.replace(/^single-/, ''))
              .filter(Boolean)
          : [];

        const singlesFromSolo = Array.isArray(course.soloStudents)
          ? course.soloStudents
              .map((s) => {
                if (typeof s === 'object' && s !== null) return s.id || s.userId || s.studentId || '';
                return s;
              })
              .map((id) => String(id || '').trim())
              .filter(Boolean)
          : [];

        return [...new Set([...singlesFromGroups, ...singlesFromSolo])];
      })();

      const singlesLabel = singleStudentIds.length ? 'Étudiants variés' : '';

      const groupName = (() => {
        if (groupNames.length && singlesLabel) return `${groupNames.join(', ')} · ${singlesLabel}`;
        if (groupNames.length) return groupNames.join(', ');
        return singlesLabel;
      })();

      let status = course.status || 'planned';
      if (!course.status && startDate && endDate) {
        const now = Date.now();
        const hasTeacherSig = Array.isArray(course.signature)
          ? course.signature.some(
              (sig) =>
                sig &&
                (sig.teacher || sig.teacherId || sig.type === 'teacher') &&
                (sig.status === 'signed' || sig.status === 'present' || sig.status === 'late')
            )
          : false;
        if (now > endDate.getTime()) status = hasTeacherSig ? 'finished' : 'finished-absent';
        else if (now >= startDate.getTime()) status = hasTeacherSig ? 'started' : 'started-absent';
      }

      return {
        id: course.id,
        subject: course.subject || course.title || course.name || 'Cours',
        startTime: course.startTime || startInfo.time,
        endTime: course.endTime || endInfo.time,
        day: course.day || startInfo.day,
        room: roomName || '',
        teacher: teacherNames,
        group: groupName || '',
        status
      };
    }
  }
}
</script>


<style scoped src="../assets/calendrier.css"></style>

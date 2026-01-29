<template>
  <div class="calendrier-page">
    <div class="calendrier-header">
      <img src="../assets/images/calendrier_background.svg" alt="background" class="header-bg" />
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
          <div v-for="hour in hours" :key="hour" class="hour-section">
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
import classesData from '../assets/json/classes.json';

export default {
  data() {
    return {
      selectedDate: new Date(),
      hours: ['8h00', '9h10', '10h20', '11h30', '12h40', '13h40', '14h50', '16h00', '17h10', '18h20','19h30'],
      // Sample class data
      classes: classesData

    }
  },
  mounted() {
    // Si une date est passée en query parameter, utiliser cette date
    if (this.$route.query.date) {
      const dateStr = this.$route.query.date;
      // Parse date string in format DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        this.selectedDate = new Date(year, month, day);
      }
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
      return this.classes.filter(c => c.day === key);
    }
  },
  methods: {
    previousDay() {
      this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1));
    },
    nextDay() {
      this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1));
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
    dateKey(date) {
      const day = `${date.getDate()}`.padStart(2, '0');
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
}
</script>


<style scoped src="../assets/calendrier.css"></style>
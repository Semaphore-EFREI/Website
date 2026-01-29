<template>
  <main class="edit-user-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <div>
          <h1 class="edit-title">{{ getTitle() }}</h1>
        </div>
      </div>
      <button
        class="save-btn"
        type="button"
        @click="createCourse"
        :disabled="isCreateDisabled"
        :title="courseSettings.disableCourseModification ? 'La modification des cours est désactivée dans les paramètres.' : ''"
      >
        <img src="../assets/images/plus-sign-white.svg" alt="Ajouter" class="plus-icon" /> Créer
      </button>
    </header>

    <section class="form-grid">
      <label class="field-group-name">
            <input
              v-model="course.name"
              class="name-input"
              type="text"
              name="course-name"
              placeholder="Nom"
            />
      </label>
      <section class="form-card">
            <div class="section-title-row-first">
            <h2 class="section-title">Informations générales</h2>
            </div>
            <label class="field-group">
                <span class="field-label">Date</span>
                <div class="input-with-icon">
                  <input
                    ref="dateText"
                    v-model="course.date"
                    class="text-input"
                    type="text"
                    name="course-date"
                    placeholder="31/02/2026"
                    inputmode="numeric"
                  />
                  <button type="button" class="icon-btn" @click="openNativePicker('date')">
                    <img src="../assets/images/calendrier_black.svg" alt="Calendrier" />
                  </button>
                  <input ref="dateNative" type="date" class="native-picker" @change="onNativeDateChange" />
                </div>
            </label>
            <div class="field-grid">
                <label class="field-group">
                    <span class="field-label">Début</span>
                    <div class="input-with-icon">
                      <input
                        ref="startText"
                        v-model="course.startTime"
                        class="text-input"
                        type="text"
                        name="course-start"
                        placeholder="08h00"
                        inputmode="numeric"
                      />
                      <button type="button" class="icon-btn" @click="openNativePicker('start')">
                        <img src="../assets/images/time.svg" alt="Heure" />
                      </button>
                      <input ref="startNative" type="time" class="native-picker" @change="onNativeTimeChange('start', $event)" />
                    </div>
                </label>
                <label class="field-group">
                    <span class="field-label">Fin</span>
                    <div class="input-with-icon">
                      <input
                        ref="endText"
                        v-model="course.endTime"
                        class="text-input"
                        type="text"
                        name="course-end"
                        placeholder="10h00"
                        inputmode="numeric"
                      />
                      <button type="button" class="icon-btn" @click="openNativePicker('end')">
                        <img src="../assets/images/time.svg" alt="Heure" />
                      </button>
                      <input ref="endNative" type="time" class="native-picker" @change="onNativeTimeChange('end', $event)" />
                    </div>
                </label>
            </div>

            <label class="field-group">
            <span class="field-label">Salle</span>
            <div class="input-with-icon">
              <input
                class="text-input select-like"
                :class="{ 'is-empty': !hasSelectedRooms }"
                name="course-room"
                type="text"
                :value="selectedRoomsLabel"
                placeholder="Choisir des salles"
                readonly
                @click="openRoomModal"
              />
              <button type="button" class="icon-btn" @click="openRoomModal">
              </button>
            </div>
            </label>
      </section>

      <section class="form-card">
        <div class="section-title-row">
          <h2 class="section-title">Enseignants</h2>
          <button class="role-add-btn" type="button" @click="openTeacherModal">
            <img src="../assets/images/plus-sign-black.svg" alt="Ajouter" class="plus-icon" />
          </button>
        </div>
        <div class="pill-grid" v-if="teachers.length">
          <article v-for="teacher in teachers" :key="teacher" class="pill-card">
            <div class="pill-name">{{ teacher }}</div>
            <button type="button" class="pill-remove" @click="removeTeacher(teacher)">
                <img src="../assets/images/remove.svg" alt="Remove" class="remove-icon" />
            </button>
          </article>
        </div>
        <div v-else class="empty-placeholder">Aucun enseignant</div>
      </section>

      <section class="form-card">
        <div class="section-title-row">
          <h2 class="section-title">Étudiants</h2>
          <button class="role-add-btn" type="button" @click="openStudentModal">
            <img src="../assets/images/plus-sign-black.svg" alt="Ajouter" class="plus-icon" />
          </button>
        </div>
        <div class="pill-grid" v-if="students.length">
          <article v-for="student in students" :key="student" class="pill-card">
            <div class="pill-name">{{ student }}</div>
            <button type="button" class="pill-remove" @click="removeStudent(student)">
                <img src="../assets/images/remove.svg" alt="Remove" class="remove-icon" />
            </button>
          </article>
        </div>
        <div v-else class="empty-placeholder">Aucun groupe d'étudiants</div>
      </section>

      <div v-if="showTeacherModal" class="select-modal" @click.self="closeTeacherModal">
        <div class="select-modal__panel">
          <header class="select-modal__header">
            <div class="header-row">
                <div class="header-back-container">
                    <button class="modal-back" type="button"  @click="closeTeacherModal">
                        <img src="../assets/images/arrow-left.svg" alt="Retour" />
                    </button>
                </div>
                <div class="header-save-container">
                    <button class="modal-save" type="button"  @click="validateTeacherSelection">
                        <img src="../assets/images/check-white.svg" alt="Valider" />
                    </button>
                </div>
            </div>
            <h3>Attribuer un enseignant</h3>
            <div class="modal-search">
              <div class="modal-search-input-wrapper">
                <input
                  v-model="teacherSearch"
                  type="search"
                  placeholder="Marc DUPONT"
                  class="text-input modal-search-input"
                />
                <button class="modal-search-icon" type="button" aria-label="Rechercher">
                  <img src="../assets/images/search.svg" alt="" />
                </button>
              </div>
            </div>
          </header>
          <div class="select-modal__grid">
            <div class="select-modal__group">
                <p>Groupes</p>
                <div class="select-modal__pillgrid">
                    <button
                    v-for="teacher in filteredTeacherOptions"
                    :key="teacher"
                    type="button"
                    class="select-pill"
                    :class="{ active: teacherDraft.includes(teacher) }"
                    @click="toggleTeacherDraft(teacher)"
                    >
                    <span>{{ teacher }}</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showStudentModal" class="select-modal" @click.self="closeStudentModal">
        <div class="select-modal__panel">
          <header class="select-modal__header">
            <div class="header-row">
                <div class="header-back-container">
                    <button class="modal-back" type="button"  @click="closeStudentModal">
                        <img src="../assets/images/arrow-left.svg" alt="Retour" />
                    </button>
                </div>
                <div class="header-save-container">
                    <button class="modal-save" type="button"  @click="validateStudentSelection">
                        <img src="../assets/images/check-white.svg" alt="Valider" />
                    </button>
                </div>
            </div>
            <h3>Attribuer des étudiants</h3>
            <div class="modal-search">
              <div class="modal-search-input-wrapper">
                <input
                  v-model="studentSearch"
                  type="search"
                  placeholder="Marc DUPONT"
                  class="text-input modal-search-input"
                />
                <button class="modal-search-icon" type="button" aria-label="Rechercher">
                  <img src="../assets/images/search.svg" alt="" />
                </button>
              </div>
            </div>
          </header>
          <div class="select-modal__grid">
            <div class="select-modal__group">
                <p>Groupes</p>
                <div class="select-modal__pillgrid">
                    <button
                    v-for="student in filteredGroupOptions"
                    :key="student"
                    type="button"
                    class="select-pill"
                    :class="{ active: studentDraft.includes(student) }"
                    @click="toggleStudentDraft(student)"
                    >
                    <span>{{ student }}</span>
                    </button>
                </div>
            </div>
            <div class="select-modal__group">
                <p>Etudiants</p>
                <div class="select-modal__pillgrid">
                    <button
                    v-for="student in filteredStudentOptions"
                    :key="student"
                    type="button"
                    class="select-pill"
                    :class="{ active: studentDraft.includes(student) }"
                    @click="toggleStudentDraft(student)"
                    >
                    <span>{{ student }}</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRoomModal" class="select-modal" @click.self="closeRoomModal">
        <div class="select-modal__panel">
          <header class="select-modal__header">
            <div class="header-row">
                <div class="header-back-container">
                    <button class="modal-back" type="button"  @click="closeRoomModal">
                        <img src="../assets/images/arrow-left.svg" alt="Retour" />
                    </button>
                </div>
                <div class="header-save-container">
                    <button class="modal-save" type="button"  @click="validateRoomSelection">
                        <img src="../assets/images/check-white.svg" alt="Valider" />
                    </button>
                </div>
            </div>
            <h3>Attribuer une salle</h3>
            <div class="modal-search">
              <div class="modal-search-input-wrapper">
                <input
                  v-model="roomSearch"
                  type="search"
                  placeholder="A 001"
                  class="text-input modal-search-input"
                />
                <button class="modal-search-icon" type="button" aria-label="Rechercher">
                  <img src="../assets/images/search.svg" alt="" />
                </button>
              </div>
            </div>
          </header>
          <div class="select-modal__grid">
            <div class="select-modal__group">
                <p>Salles</p>
                <div class="select-modal__pillgrid">
                    <button
                    v-for="room in filteredRoomOptions"
                    :key="room.id"
                    type="button"
                    class="select-pill"
                    :class="{ active: roomDraft.includes(room.id) }"
                    @click="toggleRoomDraft(room.id)"
                    >
                    <span>{{ room.name }}</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useCalendarStore, useUsersStore, useGroupsStore, useRoomsStore, useAuthStore } from '../stores'

const SETTINGS_STORAGE_KEY = 'ecole-settings'

export default {
  name: 'NouveauCours',
  data() {
    return {
      course: {
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        rooms: []
      },
      rooms: [],
      teachers: [],
      students: [],
      showTeacherModal: false,
      showStudentModal: false,
      showRoomModal: false,
      teacherDraft: [],
      studentDraft: [],
      roomDraft: [],
      teacherSearch: '',
      studentSearch: '',
      roomSearch: '',
      originCourseId: null,
      sequence: 3,
      courseSettings: {
        disableCourseModification: false
      }
    }
  },
  computed: {
    ...mapState(useUsersStore, ['users']),
    ...mapState(useGroupsStore, ['groups']),
    ...mapState(useRoomsStore, { roomOptions: 'rooms' }),
    ...mapState(useAuthStore, { currentUser: 'user' }),
    teacherOptions() {
      return this.users
        .filter(user => ['teacher', 'Enseignant'].includes(user.role))
        .map(user => user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim())
        .filter(Boolean)
        .sort()
    },
    filteredTeacherOptions() {
      const q = this.teacherSearch.trim().toLowerCase()
      return this.teacherOptions.filter(name => !q || name.toLowerCase().includes(q))
    },
    groupOptions() {
      return this.groups.map(g => g.name).filter(Boolean).sort()
    },
    filteredGroupOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.groupOptions.filter(name => !q || name.toLowerCase().includes(q))
    },
    studentOptions() {
      return this.users
        .filter(user => ['student', 'Étudiant'].includes(user.role))
        .map(user => user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim())
        .filter(Boolean)
        .sort()
    },
    filteredStudentOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.studentOptions.filter(name => !q || name.toLowerCase().includes(q))
    },
    filteredRoomOptions() {
      const q = this.roomSearch.trim().toLowerCase()
      return (this.roomOptions || [])
        .map(room => ({ id: room.id ?? room, name: room.name ?? room }))
        .filter(room => room.name)
        .filter(room => !q || room.name.toLowerCase().includes(q))
    },
    selectedRoomsLabel() {
      const byId = new Map((this.roomOptions || []).map(r => [r.id ?? r, r.name ?? r]))
      return this.course.rooms
        .map(id => byId.get(id) || id)
        .filter(Boolean)
        .join(', ')
    },
    hasSelectedRooms() {
      return this.course.rooms.length > 0
    },
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
    isFormValid() {
      const { name, date, startTime, endTime, rooms } = this.course
      return [name, date, startTime, endTime].every(val => (val || '').trim().length > 0) && rooms.length > 0
    },
    isCreateDisabled() {
      return this.courseSettings.disableCourseModification || !this.isFormValid
    }
  },
  async created() {
    this.originCourseId = this.$route.query.courseId || null
    this.loadSettings()
    await Promise.all([
      this.fetchUsers().catch(() => {}),
      this.fetchGroups({ schoolId: this.schoolId }).catch(() => {}),
      this.fetchRooms().catch(() => {})
    ])
    await this.prefillFromRoute()
  },
  methods: {
    ...mapActions(useCalendarStore, {
      createCourseAction: 'createCourse',
      updateCourseAction: 'updateCourse',
      fetchCourseAction: 'fetchCourse'
    }),
    ...mapActions(useUsersStore, ['fetchUsers']),
    ...mapActions(useGroupsStore, ['fetchGroups']),
    ...mapActions(useRoomsStore, ['fetchRooms']),
    goBack() {
      if (this.originCourseId) {
        this.$router.push({ name: 'CalendrierDetail', params: { id: this.originCourseId } })
        return
      }
      this.$router.push({ name: 'Calendrier' })
    },
    getTitle() {
      return this.originCourseId ? 'Modification Cours' : 'Nouveau Cours'
    },
    createCourse() {
      if (this.courseSettings.disableCourseModification) return
      this.saveCourse()
    },
    async saveCourse() {
      const { date: startEpoch, endDate: endEpoch } = this.buildEpochDates()
      const payload = {
        id: this.course.id || this.generateCourseId(),
        name: this.course.name,
        date: startEpoch,
        endDate: endEpoch,
        startTime: this.course.startTime,
        endTime: this.course.endTime,
        rooms: this.course.rooms,
        teachers: this.teachers,
        groups: this.students,
        isOnline: false,
        signatureClosingDelay: 15,
        signatureClosed: false,
        school: this.schoolId
      }

      try {
        if (this.originCourseId) {
          await this.updateCourseAction(this.originCourseId, payload)
        } else {
          await this.createCourseAction(payload)
        }
        this.goBack()
      } catch (error) {
        console.error('Unable to save course', error)
      }
    },
    openNativePicker(type) {
      const refMap = {
        date: 'dateNative',
        start: 'startNative',
        end: 'endNative'
      }
      const target = this.$refs[refMap[type]]
      if (!target) return
      if (target.showPicker) {
        target.showPicker()
      } else {
        target.click()
      }
    },
    onNativeDateChange(event) {
      const value = event.target.value
      if (!value) {
        this.course.date = ''
        return
      }
      const [year, month, day] = value.split('-')
      this.course.date = `${day}/${month}/${year}`
    },
    onNativeTimeChange(type, event) {
      const value = event.target.value
      if (!value) {
        this.course[`${type}Time`] = ''
        return
      }
      const [hour, minute] = value.split(':')
      this.course[`${type}Time`] = `${hour}h${minute}`
    },
    openTeacherModal() {
      this.teacherDraft = [...this.teachers]
      this.teacherSearch = ''
      this.showTeacherModal = true
    },
    closeTeacherModal() {
      this.showTeacherModal = false
    },
    toggleTeacherDraft(name) {
      if (this.teacherDraft.includes(name)) {
        this.teacherDraft = this.teacherDraft.filter(t => t !== name)
      } else {
        this.teacherDraft = [...this.teacherDraft, name]
      }
    },
    validateTeacherSelection() {
      this.teachers = [...this.teacherDraft]
      this.closeTeacherModal()
    },
    removeTeacher(name) {
      this.teachers = this.teachers.filter(t => t !== name)
    },
    openStudentModal() {
      this.studentDraft = [...this.students]
      this.studentSearch = ''
      this.showStudentModal = true
    },
    closeStudentModal() {
      this.showStudentModal = false
    },
    toggleStudentDraft(group) {
      if (this.studentDraft.includes(group)) {
        this.studentDraft = this.studentDraft.filter(g => g !== group)
      } else {
        this.studentDraft = [...this.studentDraft, group]
      }
    },
    validateStudentSelection() {
      this.students = [...this.studentDraft]
      this.closeStudentModal()
    },
    removeStudent(group) {
      this.students = this.students.filter(g => g !== group)
    },
    async prefillFromRoute() {
      const courseId = this.$route.query.courseId
      if (!courseId) return
      try {
        const found = await this.fetchCourseAction(courseId)
        if (!found) return
        const normalized = this.normalizeCourse(found)
        this.course.name = normalized.name
        this.course.date = normalized.date
        this.course.startTime = normalized.startTime
        this.course.endTime = normalized.endTime
        this.course.rooms = normalized.rooms
        this.teachers = normalized.teachers
        this.students = normalized.groups

        this.teacherDraft = [...this.teachers]
        this.studentDraft = [...this.students]
        this.roomDraft = [...this.course.rooms]
      } catch (error) {
        console.error('Unable to prefill course', error)
      }
    },
    openRoomModal() {
      this.roomDraft = [...this.course.rooms]
      this.roomSearch = ''
      this.showRoomModal = true
    },
    closeRoomModal() {
      this.showRoomModal = false
    },
    toggleRoomDraft(roomId) {
      if (this.roomDraft.includes(roomId)) {
        this.roomDraft = this.roomDraft.filter(r => r !== roomId)
      } else {
        this.roomDraft = [...this.roomDraft, roomId]
      }
    },
    validateRoomSelection() {
      this.course.rooms = [...this.roomDraft]
      this.closeRoomModal()
    },
    parseRooms(value) {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(v => (typeof v === 'object' ? v.id ?? v.name ?? v : v)).filter(Boolean)
      }
      return String(value)
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)
    },
    buildEpochDates() {
      const parseDate = (dStr) => {
        if (!dStr) return null
        const [day, month, year] = dStr.split('/').map(part => Number(part))
        if (!day || !month || !year) return null
        return { day, month: month - 1, year }
      }

      const parseTime = (tStr) => {
        if (!tStr) return { hour: 0, minute: 0 }
        const clean = tStr.replace('h', ':')
        const [h, m] = clean.split(':').map(part => Number(part))
        return { hour: Number.isFinite(h) ? h : 0, minute: Number.isFinite(m) ? m : 0 }
      }

      const dateParts = parseDate(this.course.date)
      const startParts = parseTime(this.course.startTime)
      const endParts = parseTime(this.course.endTime)

      const toEpoch = (parts, time) => {
        if (!parts) return null
        const d = new Date(parts.year, parts.month, parts.day, time.hour, time.minute, 0, 0)
        const ms = d.getTime()
        return Number.isNaN(ms) ? null : Math.floor(ms / 1000)
      }

      const date = toEpoch(dateParts, startParts)
      const endDate = toEpoch(dateParts, endParts)
      return { date, endDate }
    },
    generateCourseId() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
      }
      const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
      return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`
    },
    normalizeCourse(course) {
      if (!course) return {
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        rooms: [],
        teachers: [],
        groups: []
      }

      const toDateString = (value) => {
        if (!value) return ''
        const d = new Date(value)
        if (Number.isNaN(d.getTime())) return value
        const day = `${d.getDate()}`.padStart(2, '0')
        const month = `${d.getMonth() + 1}`.padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
      }

      const toTimeString = (value) => {
        if (!value) return ''
        if (value.includes('h')) return value
        const [hour, minute] = value.split(':')
        if (!hour || !minute) return value
        return `${hour.padStart(2, '0')}h${minute.padStart(2, '0')}`
      }

      return {
        id: course.id,
        name: course.name || course.subject || '',
        date: course.date || course.day || toDateString(course.start || course.startDate || ''),
        startTime: course.startTime || toTimeString(course.start?.split('T')[1]?.slice(0,5) || ''),
        endTime: course.endTime || toTimeString(course.end?.split('T')[1]?.slice(0,5) || ''),
        rooms: this.parseRooms(course.rooms || course.room),
        teachers: Array.isArray(course.teacher) ? course.teacher : course.teacher ? [course.teacher] : [],
        groups: Array.isArray(course.group) ? course.group : course.group ? [course.group] : []
      }
    },
    loadSettings() {
      if (typeof localStorage === 'undefined') return
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        // Force booleans to avoid legacy string values keeping the button disabled
        const disableCourseModification = parsed.disableCourseModification
        const normalizedDisable = disableCourseModification === true || disableCourseModification === 'true'
        this.courseSettings = {
          ...this.courseSettings,
          ...parsed,
          disableCourseModification: normalizedDisable
        }
        // Persist back normalized values so future reads stay clean
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.courseSettings))
      } catch (error) {
        console.error('Impossible de charger les paramètres', error)
      }
    }
  }
}
</script>

<style scoped src="../assets/nouveau-cours.css"></style>

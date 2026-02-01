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
        <img src="../assets/images/plus-sign-white.svg" alt="Ajouter" class="plus-icon" /> {{ saveButtonLabel }}
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
import { request } from '../stores/apiClient'

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
      teacherIds: [],
      studentIds: [],
      groupIds: [],
      showTeacherModal: false,
      showStudentModal: false,
      showRoomModal: false,
      teacherDraft: [],
      studentDraft: [],
      roomDraft: [],
      originalAssignments: {
        rooms: [],
        teachers: [],
        students: [],
        groups: []
      },
      originalCourse: null,
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
    saveButtonLabel() {
      return this.originCourseId ? 'Sauvegarder' : 'Créer'
    },
    isFormValid() {
      const { name, date, startTime, endTime, rooms } = this.course
      const clean = (val) => String(val ?? '').trim()
      return [name, date, startTime, endTime].every(val => clean(val).length > 0) && rooms.length > 0
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
    ...mapActions(useUsersStore, ['fetchUsers', 'fetchUserById']),
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
      const assignments = {
        rooms: this.course.rooms,
        teachers: this.teacherIds,
        students: this.studentIds,
        groups: this.groupIds
      }

      const payload = {
        name: this.course.name,
        date: startEpoch,
        endDate: endEpoch,
        classroomsId: assignments.rooms,
        teachersId: assignments.teachers,
        studentsId: assignments.students,
        studentGroupsId: assignments.groups
      }

      try {
        if (this.originCourseId) {
          await this.saveEdits(this.originCourseId, { ...payload, id: this.originCourseId })
          this.goBack()
          return
        } else {
          const created = await this.createCourseAction({
            ...payload
          })
          if (created?.id) {
            await this.syncAssignments(created.id, assignments)
          }
          const targetDate = (this.course?.date || '').trim()
          this.$router.push({ name: 'Calendrier', query: targetDate ? { date: targetDate } : {} })
          return
        }
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
      const ids = new Set()
      this.teachers.forEach((name) => {
        const user = this.users.find((u) => u.roleKey === 'teacher' && u.name === name)
        ids.add(user?.id || name)
      })
      this.teacherIds = [...ids]
      this.closeTeacherModal()
    },
    removeTeacher(name) {
      this.teachers = this.teachers.filter(t => t !== name)
      this.teacherIds = this.teacherIds.filter((id) => {
        const user = this.users.find((u) => String(u.id) === String(id))
        return user ? user.name !== name : true
      })
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
      const studentIdSet = new Set()
      const groupIdSet = new Set()
      this.students.forEach((label) => {
        const group = this.groups.find((g) => g.name === label)
        if (group) {
          groupIdSet.add(group.id)
          return
        }
        const user = this.users.find((u) => u.roleKey === 'student' && u.name === label)
        if (user) {
          studentIdSet.add(user.id)
        } else {
          // fallback keep label as id if unknown
          studentIdSet.add(label)
        }
      })
      this.studentIds = [...studentIdSet]
      this.groupIds = [...groupIdSet]
      this.closeStudentModal()
    },
    removeStudent(group) {
      this.students = this.students.filter(g => g !== group)
      const groupEntry = this.groups.find((g) => g.name === group)
      if (groupEntry) {
        this.groupIds = this.groupIds.filter((id) => String(id) !== String(groupEntry.id))
      } else {
        this.studentIds = this.studentIds.filter((id) => {
          const user = this.users.find((u) => String(u.id) === String(id))
          return user ? user.name !== group : true
        })
      }
    },
    async prefillFromRoute() {
      const courseId = this.$route.query.courseId
      if (!courseId) return
      try {
        const found = await this.fetchCourseAction(courseId)
        if (!found) return
        const normalized = this.normalizeCourse(found)
        this.course.id = normalized.id || courseId
        this.course.name = normalized.name
        this.course.date = normalized.date
        this.course.startTime = normalized.startTime
        this.course.endTime = normalized.endTime
        this.course.rooms = normalized.rooms
        this.teacherIds = [...normalized.teachers]
        this.studentIds = [...normalized.groups]
        this.groupIds = [...normalized.groupIds]

        this.teachers = await this.resolveTeacherNames(this.teacherIds)
        this.students = await this.resolveStudentNames(this.studentIds)

        this.teacherDraft = [...this.teachers]
        this.studentDraft = [...this.students]
        this.roomDraft = [...this.course.rooms]
        this.originalAssignments = {
          rooms: [...this.course.rooms],
          teachers: [...this.teacherIds],
          students: [...this.studentIds],
          groups: [...this.groupIds]
        }
        const originalDate = this.toEpochSafe(found.start || found.startDate || found.date)
        const originalEnd = this.toEpochSafe(found.end || found.endDate)
        this.originalCourse = {
          id: courseId,
          name: normalized.name,
          date: originalDate,
          endDate: originalEnd
        }
      } catch (error) {
        console.error('Unable to prefill course', error)
      }
    },
    async resolveTeacherNames(ids) {
      const uniqueIds = Array.isArray(ids)
        ? ids.map((v) => String(v)).filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i)
        : []

      const missing = uniqueIds.filter((id) => !this.users.find((u) => String(u.id) === id))
      for (const id of missing) {
        await this.fetchUserById(id, 'teacher').catch(() => {})
      }
      return uniqueIds
        .map((id) => {
          const user = this.users.find((u) => String(u.id) === id)
          return user?.name || id
        })
        .filter(Boolean)
    },
    async resolveStudentNames(ids) {
      const uniqueIds = Array.isArray(ids)
        ? ids.map((v) => String(v)).filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i)
        : []

      const missing = uniqueIds.filter((id) => !this.users.find((u) => String(u.id) === id))
      for (const id of missing) {
        await this.fetchUserById(id, 'student').catch(() => {})
      }
      return uniqueIds
        .map((id) => {
          const user = this.users.find((u) => String(u.id) === id)
          return user?.name || id
        })
        .filter(Boolean)
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
    toEpochSafe(value) {
      if (value === null || value === undefined) return null
      const num = Number(value)
      if (Number.isNaN(num)) return null
      return num >= 1e12 ? Math.floor(num / 1000) : num
    },
    normalizeCourse(course) {
      if (!course) return {
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        rooms: [],
        teachers: [],
        groups: [],
        groupIds: []
      }

      const toDateString = (value) => {
        if (!value && value !== 0) return ''
        const ms = Number(value) < 1e12 ? Number(value) * 1000 : Number(value)
        const d = new Date(ms)
        if (Number.isNaN(d.getTime())) return ''
        const day = `${d.getDate()}`.padStart(2, '0')
        const month = `${d.getMonth() + 1}`.padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
      }

      const toTimeString = (value) => {
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes('h')) return value
        const ms = Number(value) < 1e12 ? Number(value) * 1000 : Number(value)
        const d = new Date(ms)
        if (Number.isNaN(d.getTime())) return ''
        const hours = `${d.getHours()}`.padStart(2, '0')
        const minutes = `${d.getMinutes()}`.padStart(2, '0')
        return `${hours}h${minutes}`
      }

      const normalizePeople = (list) => {
        if (!list) return []
        const arr = Array.isArray(list) ? list : [list]
        return arr
          .map((item) => {
            if (typeof item === 'object' && item !== null) {
              const fullName = [item.firstName || item.firstname, item.lastName || item.lastname].filter(Boolean).join(' ').trim()
              return item.name || fullName || item.id || ''
            }
            return item
          })
          .map((val) => String(val || '').trim())
          .filter(Boolean)
      }

      const startSource = course.start ?? course.startDate ?? course.date ?? null
      const endSource = course.end ?? course.endDate ?? null
      const rooms = this.parseRooms(course.rooms || course.room || (Array.isArray(course.classrooms) ? course.classrooms.map(r => r.id ?? r.name ?? r) : []))

      const normalizeUsers = (list) => {
        if (!list) return []
        const arr = Array.isArray(list) ? list : [list]
        return arr
          .map((item) => {
            if (typeof item === 'object' && item !== null) {
              return item.id ?? item.userId ?? item.teacherId ?? item.studentId ?? item.name ?? ''
            }
            return item
          })
          .map((val) => String(val || '').trim())
          .filter(Boolean)
      }

      const studentIds = Array.isArray(course.students)
        ? course.students.map((s) => s?.id ?? s?.studentId ?? s?.userId ?? s)
        : []
      const groupIds = Array.isArray(course.studentGroups)
        ? course.studentGroups.map((g) => g?.id ?? g)
        : []

      return {
        id: course.id,
        name: String(course.name || course.subject || '').trim(),
        date: toDateString(startSource),
        startTime: toTimeString(startSource),
        endTime: toTimeString(endSource),
        rooms,
        teachers: normalizeUsers(course.teachers || course.teacher),
        groups: normalizeUsers(studentIds),
        groupIds: normalizeUsers(groupIds)
      }
    },
    normalizeList(list) {
      return Array.isArray(list) ? list.map((item) => String(item)).filter(Boolean) : []
    },
    async saveEdits(courseId, payload) {
      const updates = {}
      const toSeconds = (val) => {
        if (val === null || val === undefined) return null
        const num = Number(val)
        if (Number.isNaN(num)) return null
        return num >= 1e12 ? Math.floor(num / 1000) : num
      }

      const originalDate = toSeconds(this.originalCourse?.date)
      const originalEndDate = toSeconds(this.originalCourse?.endDate)

      const dateChanged = payload.date !== null && payload.date !== undefined && payload.date !== originalDate
      const endChanged = payload.endDate !== null && payload.endDate !== undefined && payload.endDate !== originalEndDate

      if (payload.name && payload.name !== this.originalCourse?.name) updates.name = payload.name
      if (dateChanged || endChanged) {
        updates.date = payload.date
        updates.endDate = payload.endDate
      }

      if (Object.keys(updates).length > 0) {
        await this.updateCourseAction(courseId, updates)
        this.originalCourse = {
          ...this.originalCourse,
          ...updates
        }
      }

      const assignments = {
        rooms: payload.classroomsId || payload.rooms || [],
        teachers: payload.teachersId || payload.teachers || [],
        students: payload.studentsId || payload.students || [],
        groups: payload.studentGroupsId || payload.groups || []
      }

      await this.syncAssignments(courseId, assignments)
    },
    async syncAssignments(courseId, payload) {
      if (!courseId) return
      const currentRooms = this.normalizeList(payload.rooms)
      const currentTeachers = this.normalizeList(payload.teachers)
      const currentStudents = this.normalizeList(payload.students)
      const currentGroups = this.normalizeList(payload.groups)

      const initialRooms = this.normalizeList(this.originalAssignments.rooms)
      const initialTeachers = this.normalizeList(this.originalAssignments.teachers)
      const initialStudents = this.normalizeList(this.originalAssignments.students)
      const initialGroups = this.normalizeList(this.originalAssignments.groups)

      const diff = (next, prev) => {
        const nextSet = new Set(next)
        const prevSet = new Set(prev)
        const added = [...nextSet].filter((val) => !prevSet.has(val))
        const removed = [...prevSet].filter((val) => !nextSet.has(val))
        return { added, removed }
      }

      const roomDiff = diff(currentRooms, initialRooms)
      const teacherDiff = diff(currentTeachers, initialTeachers)
      const studentDiff = diff(currentStudents, initialStudents)
      const groupDiff = diff(currentGroups, initialGroups)

      const tasks = [
        ...roomDiff.added.map((roomId) => this.syncSingleAssignment(courseId, 'classrooms', 'classroomId', roomId, 'POST')),
        ...roomDiff.removed.map((roomId) => this.syncSingleAssignment(courseId, `classrooms/${roomId}`, null, null, 'DELETE')),
        ...teacherDiff.added.map((teacherId) => this.syncSingleAssignment(courseId, 'teacher', 'teacherId', teacherId, 'POST')),
        ...teacherDiff.removed.map((teacherId) => this.syncSingleAssignment(courseId, `teacher/${teacherId}`, null, null, 'DELETE')),
        ...groupDiff.added.map((groupId) => this.syncSingleAssignment(courseId, 'studentGroups', 'groupId', groupId, 'POST')),
        ...groupDiff.removed.map((groupId) => this.syncSingleAssignment(courseId, `studentGroup/${groupId}`, null, null, 'DELETE')),
        ...studentDiff.added.map((studentId) => this.syncSingleAssignment(courseId, 'students', 'studentId', studentId, 'POST')),
        ...studentDiff.removed.map((studentId) => this.syncSingleAssignment(courseId, `student/${studentId}`, null, null, 'DELETE'))
      ]

      if (tasks.length === 0) return
      try {
        await Promise.all(tasks)
        this.originalAssignments = {
          rooms: [...currentRooms],
          teachers: [...currentTeachers],
          students: [...currentStudents],
          groups: [...currentGroups]
        }
      } catch (error) {
        console.warn('Some assignment updates failed', error)
      }
    },
    async syncSingleAssignment(courseId, endpoint, idKey, idValue, method) {
      try {
        const payload = idKey ? { [idKey]: idValue } : undefined
        await request(`/course/${courseId}/${endpoint}`, { method, data: payload })
      } catch (error) {
        console.warn('Unable to sync assignment', { courseId, endpoint, idValue, method, error })
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

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
        <div class="pill-grid" v-if="teacherDisplayEntries.length">
          <article v-for="teacher in teacherDisplayEntries" :key="teacher.id" class="pill-card">
            <div class="pill-name">{{ teacher.name }}</div>
            <button type="button" class="pill-remove" @click="removeTeacher(teacher.id)">
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
        <div class="pill-grid" v-if="studentDisplayEntries.length">
          <article v-for="student in studentDisplayEntries" :key="`${student.type || 'student'}-${student.id}`" class="pill-card">
            <div class="pill-name">{{ student.name }}</div>
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
                    :key="teacher.id"
                    type="button"
                    class="select-pill"
                    :class="{ active: teacherIds.some((id) => String(id) === String(teacher.id)) }"
                    @click="toggleTeacherDraft(teacher)"
                    >
                    <span>{{ teacher.name }}</span>
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
                    v-for="group in filteredGroupOptions"
                    :key="group.id"
                    type="button"
                    class="select-pill"
                    :class="{ active: groupsIds.some((id) => String(id) === String(group.id)) }"
                    @click="toggleGroupSelection(group)"
                    >
                    <span>{{ group.name }}</span>
                    </button>
                </div>
            </div>
            <div class="select-modal__group">
                <p>Etudiants</p>
                <div class="select-modal__pillgrid">
                    <button
                    v-for="student in filteredStudentOptions"
                    :key="student.id"
                    type="button"
                    class="select-pill"
                    :class="{ active: studentIds.some((id) => String(id) === String(student.id)), disabled: isGroupOnlyStudent(student.id) }"
                    :disabled="isGroupOnlyStudent(student.id)"
                    @click="toggleStudentDraft(student)"
                    >
                    <span>{{ student.name }}</span>
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
                    :class="{ active: course.rooms.some((id) => String(id) === String(room.id)) }"
                    @click="toggleRoomDraft(room)"
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
      teacherIds: [],
      studentIds: [],
      courseStudentIdsAll: [],
      groupsIds: [],
      showTeacherModal: false,
      showStudentModal: false,
      showRoomModal: false,
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
        .filter(user => ['teacher', 'Enseignant'].includes(user.role) || ['teacher'].includes(user.roleKey))
        .map(user => ({ id: user.id, name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() }))
        .filter((entry) => entry.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    filteredTeacherOptions() {
      const q = this.teacherSearch.trim().toLowerCase()
      return this.teacherOptions.filter(option => !q || option.name.toLowerCase().includes(q))
    },
    groupOptions() {
      return this.groups
        .filter((g) => !(g.singleStudentGroup === true || (typeof g.name === 'string' && g.name.toLowerCase().startsWith('single-'))))
        .map(g => ({ id: g.id ?? g, name: g.name }))
        .filter((entry) => entry.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    filteredGroupOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.groupOptions.filter(option => !q || option.name.toLowerCase().includes(q))
    },
    studentOptions() {
      return this.users
        .filter(user => ['student', 'Étudiant'].includes(user.role) || ['student'].includes(user.roleKey))
        .map(user => ({ id: user.id, name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() }))
        .filter((entry) => entry.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    filteredStudentOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.studentOptions.filter(option => !q || option.name.toLowerCase().includes(q))
    },
    isGroupOnlyStudent() {
      return (studentId) => {
        const inCourse = this.courseStudentIdsAll.some((id) => String(id) === String(studentId))
        const selectedSolo = this.studentIds.some((id) => String(id) === String(studentId))
        return inCourse && !selectedSolo
      }
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
    teacherDisplayEntries() {
      return this.teacherIds.map((id) => ({ id, name: this.findUserNameById(id, 'teacher') || id }))
    },
    studentDisplayEntries() {
      const groupLabels = this.groupsIds.map((id) => ({ id, type: 'group', name: this.findGroupNameById(id) || id }))
      const soloLabels = this.studentIds.map((id) => ({ id, type: 'student', name: this.findUserNameById(id, 'student') || id }))
      return [...groupLabels, ...soloLabels]
    },
    activeCourseId() {
      return this.originCourseId || this.course?.id || null
    },
    schoolId() {
      return this.currentUser?.schoolId || this.currentUser?.school_id || this.currentUser?.school?.id || null
    },
    saveButtonLabel() {
      return this.originCourseId ? 'Terminer' : 'Créer'
    },
    isFormValid() {
      const { name, date, startTime, endTime } = this.course
      const clean = (val) => String(val ?? '').trim()
      return [name, date, startTime, endTime].every(val => clean(val).length > 0)
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
    ...mapActions(useGroupsStore, ['fetchGroups', 'fetchGroup']),
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
        name: this.course.name,
        date: startEpoch,
        endDate: endEpoch
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
            this.originCourseId = created.id
            this.course.id = created.id
            this.originalCourse = { id: created.id, name: payload.name, date: startEpoch, endDate: endEpoch }
            await this.applyPendingRelations(created.id)
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
      this.teacherSearch = ''
      this.showTeacherModal = true
    },
    closeTeacherModal() {
      this.showTeacherModal = false
    },
    async toggleTeacherDraft(teacher) {
      const exists = this.teacherIds.some((id) => String(id) === String(teacher.id))
      if (!this.activeCourseId) {
        this.teacherIds = exists
          ? this.teacherIds.filter((id) => String(id) !== String(teacher.id))
          : [...this.teacherIds, teacher.id]
        return
      }
      const endpoint = exists ? `teacher/${teacher.id}` : 'teacher'
      const method = exists ? 'DELETE' : 'POST'
      const payload = exists ? undefined : { teacherId: teacher.id }
      try {
        await request(`/course/${this.activeCourseId}/${endpoint}`, { method, data: payload })
        this.teacherIds = exists
          ? this.teacherIds.filter((id) => String(id) !== String(teacher.id))
          : [...this.teacherIds, teacher.id]
      } catch (error) {
        console.warn('Unable to toggle teacher', { teacher, error })
      }
    },
    validateTeacherSelection() {
      this.closeTeacherModal()
    },
    async removeTeacher(id) {
      const teacher = { id }
      await this.toggleTeacherDraft(teacher)
    },
    openStudentModal() {
      this.studentSearch = ''
      this.showStudentModal = true
    },
    closeStudentModal() {
      this.showStudentModal = false
    },
    async toggleGroupSelection(group) {
      const exists = this.groupsIds.some((id) => String(id) === String(group.id))
      const endpoint = exists ? `studentGroup/${group.id}` : 'studentGroups'
      const method = exists ? 'DELETE' : 'POST'
      const payload = exists ? undefined : { groupsIds: [group.id] }
      try {
        const members = await this.resolveGroupMembers(group.id)
        if (!exists && members.length) {
          const toRemove = members.filter((mid) => this.studentIds.some((sid) => String(sid) === String(mid)))
          if (this.activeCourseId) {
            for (const studentId of toRemove) {
              try {
                await request(`/course/${this.activeCourseId}/student/${studentId}`, { method: 'DELETE' })
                this.studentIds = this.studentIds.filter((id) => String(id) !== String(studentId))
              } catch (error) {
                console.warn('Unable to remove solo student before adding group', { group, studentId, error })
              }
            }
          } else {
            this.studentIds = this.studentIds.filter((id) => !toRemove.includes(String(id)))
          }
        }

        if (this.activeCourseId) {
          await request(`/course/${this.activeCourseId}/${endpoint}`, { method, data: payload })
        }
        const nextGroups = exists
          ? this.groupsIds.filter((id) => String(id) !== String(group.id))
          : [...this.groupsIds, group.id]
        this.groupsIds = nextGroups
        await this.refreshCourseStudentRosterFromGroups(nextGroups)
      } catch (error) {
        console.warn('Unable to toggle group', { group, error })
      }
    },
    async toggleStudentDraft(student) {
      if (this.isGroupOnlyStudent(student.id)) {
        return
      }
      const exists = this.studentIds.some((id) => String(id) === String(student.id))
      if (!this.activeCourseId) {
        this.studentIds = exists
          ? this.studentIds.filter((id) => String(id) !== String(student.id))
          : [...this.studentIds, student.id]
        return
      }
      const endpoint = exists ? `student/${student.id}` : 'students'
      const method = exists ? 'DELETE' : 'POST'
      const payload = exists ? undefined : { studentsId: [student.id] }
      try {
        await request(`/course/${this.activeCourseId}/${endpoint}`, { method, data: payload })
        this.studentIds = exists
          ? this.studentIds.filter((id) => String(id) !== String(student.id))
          : [...this.studentIds, student.id]
      } catch (error) {
        console.warn('Unable to toggle student', { student, error })
      }
    },
    validateStudentSelection() {
      this.closeStudentModal()
    },
    async removeStudent(entry) {
      if (entry.type === 'group') {
        await this.toggleGroupSelection({ id: entry.id })
      } else {
        await this.toggleStudentDraft({ id: entry.id })
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
        this.studentIds = [...normalized.studentIds]
        this.groupsIds = [...normalized.groupsIds]
        this.courseStudentIdsAll = [...normalized.studentRosterIds]

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
    openRoomModal() {
      this.roomSearch = ''
      this.showRoomModal = true
    },
    closeRoomModal() {
      this.showRoomModal = false
    },
    async toggleRoomDraft(room) {
      const roomId = room.id
      const exists = this.course.rooms.some((id) => String(id) === String(roomId))
      const endpoint = exists ? `classrooms/${roomId}` : 'classrooms'
      const method = exists ? 'DELETE' : 'POST'
      const payload = exists ? undefined : { classroomId: roomId }
      try {
        if (this.activeCourseId) {
          await request(`/course/${this.activeCourseId}/${endpoint}`, { method, data: payload })
        }
        this.course.rooms = exists
          ? this.course.rooms.filter((id) => String(id) !== String(roomId))
          : [...this.course.rooms, roomId]
      } catch (error) {
        console.warn('Unable to toggle room', { room, error })
      }
    },
    validateRoomSelection() {
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
        studentIds: [],
        groupsIds: []
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

      const hasGroups = Array.isArray(course.studentGroups) && course.studentGroups.length > 0
      const studentIds = Array.isArray(course.soloStudents) && course.soloStudents.length
        ? course.soloStudents.map((s) => s?.id ?? s?.studentId ?? s?.userId ?? s)
        : (!hasGroups && Array.isArray(course.students))
          ? course.students.map((s) => s?.id ?? s?.studentId ?? s?.userId ?? s)
          : []
      const studentRosterIds = Array.isArray(course.students)
        ? course.students.map((s) => s?.id ?? s?.studentId ?? s?.userId ?? s)
        : []
      const groupsIds = Array.isArray(course.studentGroups)
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
        studentIds: normalizeUsers(studentIds),
        studentRosterIds: normalizeUsers(studentRosterIds),
        groupsIds: normalizeUsers(groupsIds)
      }
    },
    normalizeList(list) {
      return Array.isArray(list) ? list.map((item) => String(item)).filter(Boolean) : []
    },
    async applyPendingRelations(courseId) {
      if (!courseId) return
      const tasks = []
      for (const teacherId of this.teacherIds) {
        tasks.push(request(`/course/${courseId}/teacher`, { method: 'POST', data: { teacherId } }))
      }
      for (const groupId of this.groupsIds) {
        tasks.push(request(`/course/${courseId}/studentGroups`, { method: 'POST', data: { groupsIds: [groupId] } }))
      }
      for (const studentId of this.studentIds) {
        tasks.push(request(`/course/${courseId}/students`, { method: 'POST', data: { studentsId: [studentId] } }))
      }
      for (const roomId of this.course.rooms) {
        tasks.push(request(`/course/${courseId}/classrooms`, { method: 'POST', data: { classroomId: roomId } }))
      }

      const results = await Promise.allSettled(tasks)
      const failures = results.filter((res) => res.status === 'rejected')
      if (failures.length) {
        console.warn('Some course relations failed to apply after creation', failures)
      }
    },
    findUserNameById(id, role) {
      const user = this.users.find((u) => String(u.id) === String(id))
      if (!user) return ''
      return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
    },
    findGroupNameById(id) {
      const group = this.groups.find((g) => String(g.id) === String(id))
      return group?.name || ''
    },
    getGroupMemberIds(groupId) {
      const group = this.groups.find((g) => String(g.id) === String(groupId))
      if (!group) return []
      const candidates = group.students || group.members || group.users || group.studentGroupUsers || group.studentIds || []
      const arr = Array.isArray(candidates) ? candidates : [candidates]
      return arr
        .map((stu) => stu?.id ?? stu?.studentId ?? stu?.userId ?? stu)
        .filter(Boolean)
        .map((id) => String(id))
        .filter((val, idx, self) => self.indexOf(val) === idx)
    },
    async resolveGroupMembers(groupId) {
      let members = this.getGroupMemberIds(groupId)
      if (members.length === 0) {
        try {
          await this.fetchGroup(groupId)
          members = this.getGroupMemberIds(groupId)
        } catch (error) {
          console.warn('Unable to fetch group details for member lookup', { groupId, error })
        }
      }
      return members
    },
    async refreshCourseStudentRosterFromGroups(groupIds) {
      const uniqueIds = new Set()
      for (const gid of groupIds) {
        const members = await this.resolveGroupMembers(gid)
        members.forEach((mid) => uniqueIds.add(String(mid)))
      }
      this.courseStudentIdsAll = Array.from(uniqueIds)
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

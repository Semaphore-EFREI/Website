<template>
  <main class="edit-user-page">
    <header class="edit-user-header">
      <div class="edit-user-header-left">
        <button class="edit-back-btn" type="button" @click="goBack">
          <img src="../assets/images/arrow-left.svg" alt="Retour" />
        </button>
        <div>
          <h1 class="edit-title">Nouveau Cours</h1>
        </div>
      </div>
      <button class="save-btn" type="button" @click="createCourse" :disabled="!isFormValid">
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
                :class="{ 'is-empty': !course.room }"
                name="course-room"
                type="text"
                :value="course.room"
                placeholder="Choisir une salle"
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
                    :key="room"
                    type="button"
                    class="select-pill"
                    :class="{ active: roomDraft === room }"
                    @click="toggleRoomDraft(room)"
                    >
                    <span>{{ room }}</span>
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
import roomsData from '../assets/json/salles.json'
import studentsData from '../assets/json/etudiants.json'
import attendanceTeachers from '../assets/json/attendance-teachers.json'
import classesData from '../assets/json/classes.json'

export default {
  name: 'NouveauCours',
  data() {
    return {
      course: {
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        room: ''
      },
      rooms: [],
      teachers: [],
      students: [],
      showTeacherModal: false,
      showStudentModal: false,
      showRoomModal: false,
      teacherDraft: [],
      studentDraft: [],
      roomDraft: '',
      teacherSearch: '',
      studentSearch: '',
      roomSearch: '',
      originCourseId: null,
      sequence: 3
    }
  },
  computed: {
    teacherOptions() {
      const names = attendanceTeachers.map(t => t.teacher)
      return [...new Set(names)].sort()
    },
    filteredTeacherOptions() {
      const q = this.teacherSearch.trim().toLowerCase()
      return this.teacherOptions.filter(name => !q || name.toLowerCase().includes(q))
    },
    groupOptions() {
      const groups = new Set()
      studentsData.forEach(s => {
        if (Array.isArray(s.group)) {
          s.group.forEach(g => groups.add(g))
        } else if (s.group) {
          groups.add(s.group)
        }
      })
      return [...groups].sort()
    },
    filteredGroupOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.groupOptions.filter(name => !q || name.toLowerCase().includes(q))
    },
    studentOptions() {
      const names = studentsData.map(s => `${s.firstName} ${s.lastName}`.trim())
      return [...new Set(names)].sort()
    },
    filteredStudentOptions() {
      const q = this.studentSearch.trim().toLowerCase()
      return this.studentOptions.filter(name => !q || name.toLowerCase().includes(q))
    },
    filteredRoomOptions() {
      const q = this.roomSearch.trim().toLowerCase()
      return this.rooms.filter(name => !q || name.toLowerCase().includes(q))
    },
    isFormValid() {
      const { name, date, startTime, endTime, room } = this.course
      return [name, date, startTime, endTime, room].every(val => (val || '').trim().length > 0)
    }
  },
  created() {
    this.originCourseId = this.$route.query.courseId || null
    this.rooms = roomsData.map(r => r.name)
    this.prefillFromRoute()
  },
  methods: {
    goBack() {
      if (this.originCourseId) {
        this.$router.push({ name: 'CalendrierDetail', params: { id: this.originCourseId } })
        return
      }
      this.$router.push({ name: 'Calendrier' })
    },
    createCourse() {
      this.saveCourse()
    },
    saveCourse() {
      // Placeholder save action; integrate with API or store later
      const payload = {
        ...this.course,
        teachers: this.teachers,
        students: this.students
      }
      console.log('Nouveau cours enregistré', payload)
      this.goBack()
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
    prefillFromRoute() {
      const courseId = this.$route.query.courseId
      if (!courseId) return
      const found = classesData.find(c => `${c.id}` === `${courseId}`)
      if (!found) return

      this.course.name = found.subject || ''
      this.course.date = found.day || ''
      this.course.startTime = found.startTime || ''
      this.course.endTime = found.endTime || ''
      this.course.room = found.room || ''

      this.teachers = found.teacher ? [found.teacher] : []
      this.students = found.group ? [found.group] : []

      this.teacherDraft = [...this.teachers]
      this.studentDraft = [...this.students]
      this.roomDraft = this.course.room
    },
    openRoomModal() {
      this.roomDraft = this.course.room || ''
      this.roomSearch = ''
      this.showRoomModal = true
    },
    closeRoomModal() {
      this.showRoomModal = false
    },
    toggleRoomDraft(room) {
      this.roomDraft = room === this.roomDraft ? '' : room
    },
    validateRoomSelection() {
      this.course.room = this.roomDraft
      this.closeRoomModal()
    }
  }
}
</script>

<style scoped src="../assets/nouveau-cours.css"></style>

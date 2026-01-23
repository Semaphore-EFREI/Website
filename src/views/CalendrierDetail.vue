<template>
  <div class="detail-page" v-if="course">
    <header class="detail-header">
      <div class="header-left">
        <button class="btn ghost" @click="goBack">
            <img class="btn-icon" src="../assets/images/arrow-left.svg" alt="Back" />
        </button>
        <div class="title-block">
            <h1 class="course-title">{{ course.subject }}</h1>
            <p class="course-meta">{{ course.day }} · {{ course.startTime }}-{{ course.endTime }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-modify">
          <img class="btn-icon" src="../assets/images/modify.svg" alt="Modifier" />
          <span>Modifier</span>
        </button>
        <button v-if="!isPlanned" class="btn-allpresent" :class="allPresentStatus" @click="setAllPresent">
          <img class="btn-icon" src="../assets/images/check-white.svg" alt="Tout présent" />
          <span>Tout le monde présent</span>
        </button>
        <button v-if="!isPlanned" class="btn-allabsent" :class="allAbsentStatus" @click="setAllAbsent">
          <img class="btn-icon" src="../assets/images/croix.svg" alt="Tout absent" />
          <span>Tout le monde absent</span>
        </button>
      </div>
    </header>
    <div class="detail-content">
        <section class="info-section">
        <h2>Informations</h2>
        <div class="info-grid">
            <div class="info-1">
                <div class="info-item1 title"><span>{{ course.subject }}</span></div>
                <div class="info-item1"><span>{{ course.day }}</span></div>
                <div class="info-item1"><span>{{ course.startTime }}-{{ course.endTime }}</span></div>
                <div class="info-item1"><span>{{ course.room }}</span></div>
            </div>
            <div class="info-2">
                <div class="info-item2"><span>{{ course.teacher }}</span></div>
                <div class="info-item2"><span>{{ course.group }}</span></div>
            </div>
        </div>
        </section>

        <section v-if="!isPlanned" :class="course.status">
        <div class="status-chip">
          <img v-if="statusLabel.icon" :src="statusLabel.icon" alt="statut" class="status-chip__icon" />
          <span>{{ statusLabel.text }}</span>
        </div>
        </section>

        <section class="teacher-section">
        <h2>Enseignants</h2>
        <div class="card-list-teacher">
            <div class="person-card" :class="teacher?.signatureStatus || 'none'">
              <div class="person-header">
                <div class="name">{{ course.teacher }}</div>
                <div
                  v-if="teacher && teacher.meta"
                  class="signature-status"
                  :class="teacher.meta.class">
                  <span class="status-icon">{{ teacher.meta.icon }}</span>
                  <span class="status-label">{{ teacher.meta.label }}</span>
                </div>
              </div>
              <div class="signature-line">
                <div v-if="teacher && teacher.meta && teacher.meta.class === 'absent'">
                  <img src="../assets/images/absent.svg" alt="Absent" class="signature-image" />
                </div>
                <div v-else-if="teacher && teacher.signatureUrl">
                  <img :src="teacher.signatureUrl" :alt="`Signature de ${course.teacher}`" class="signature-image" />
                </div>
                <div v-else class="signature-none">Aucune signature</div>
              </div>
                <div class="actions" v-if="!isPlanned">
                  <button class="btn-present" :class="teacher?.meta?.class || 'none'" @click="setTeacherStatus('present')">✔</button>
                  <button class="btn-absent" :class="teacher?.meta?.class || 'none'" @click="setTeacherStatus('absent')">✖</button>
                </div>
            </div>
        </div>
        </section>

        <section class="student-section">
        <h2>Étudiants</h2>
        <div class="card-list-student">
            <div v-for="student in students" :key="student.id" class="person-card" :class="student.signatureStatus">
            <div class="person-header">
                <div class="name">{{ student.name }}</div>
                <div
                  v-if="student.meta"
                  class="signature-status"
                  :class="student.meta.class">
                  <span class="status-icon">{{ student.meta.icon }}</span>
                  <span class="status-label">{{ student.meta.label }}</span>
                </div>
            </div>
            <div class="signature-line">
                <div
                v-if="student.meta && student.meta.class === 'absent'">
                    <img src="../assets/images/absent.svg" alt="Absent" class="signature-image" />
                </div>
                <div v-else-if="student.signatureUrl">
                <img :src="student.signatureUrl" :alt="`Signature de ${student.name}`" class="signature-image" />
                </div>
                <div v-else class="signature-none">Aucune signature</div>
            </div>
            <div class="actions" v-if="!isPlanned">
              <button class="btn-present" :class="student.meta?.class || 'none'" @click="setStudentStatus(student.id, 'present')">✔</button>
              <button class="btn-absent" :class="student.meta?.class || 'none'" @click="setStudentStatus(student.id, 'absent')">✖</button>
            </div>
            </div>
        </div>
        </section>
    </div>
  </div>

  <div v-else class="detail-page empty-state">
    <p>Cours introuvable.</p>
    <button class="btn modify" @click="goBack">Retour au calendrier</button>
  </div>
</template>

<script>
import classesData from '../assets/json/classes.json'
import studentsData from '../assets/json/etudiants.json'
import attendanceData from '../assets/json/attendance.json'
import attendanceTeachersData from '../assets/json/attendance-teachers.json'
import clockIcon from '../assets/images/clock.svg'
import checkIcon from '../assets/images/check.svg'

const signatureImages = import.meta.glob('../assets/images/*', {
  eager: true,
  import: 'default'
})
const signatureByName = Object.fromEntries(
  Object.entries(signatureImages).map(([path, url]) => [path.split('/').pop(), url])
)

export default {
  name: 'CalendrierDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      course: null,
      teacher: null,
      students: []
    }
  },
  computed: {
    isPlanned() {
      return this.course && this.course.status === 'planned'
    },
    statusLabel() {
      if (!this.course) return { text: '', icon: null }
      const statusMap = {
        finished: { text: 'Ce cours est terminé', icon: checkIcon },
        'finished-absent': { text: "Ce cours est terminé (présence professeur non validée)", icon: checkIcon },
        started: { text: 'Ce cours a débuté', icon: clockIcon },
        'started-absent': { text: "Ce cours a débuté (présence professeur non validée)", icon: clockIcon },
        planned: { text: "Ce cours n'a pas encore débuté", icon: null }
      }
      return statusMap[this.course.status] || { text: '', icon: null }
    },
    allPresentStatus() {
      if (this.students.length === 0) return ''
      const allPresent = this.students.every(s => s.meta?.class === 'present') && 
                        this.teacher?.meta?.class === 'present'
      return allPresent ? 'present' : ''
    },
    allAbsentStatus() {
      if (this.students.length === 0) return ''
      const allAbsent = this.students.every(s => s.meta?.class === 'absent') && 
                       this.teacher?.meta?.class === 'absent'
      return allAbsent ? 'absent' : ''
    }
  },
  created() {
    this.loadCourse()
  },
  methods: {
    loadCourse() {
      const courseId = Number(this.id)
      this.course = classesData.find(c => Number(c.id) === courseId) || null
      if (!this.course) return
      const roster = studentsData.filter(student => {
        if (Array.isArray(student.group)) {
          return student.group.includes(this.course.group)
        }
        return student.group === this.course.group
      })
      const attendance = attendanceData.filter(a => Number(a.courseId) === courseId)
      const teacherAttendance = attendanceTeachersData.find(
        a => Number(a.courseId) === courseId && a.teacher === this.course.teacher
      )

      if (teacherAttendance) {
        const status = teacherAttendance.status || 'none'
        const meta = this.signatureMeta(status)
        let signatureUrl = null
        if (status === 'signed' && teacherAttendance.signature) {
          const signatureFile = teacherAttendance.signature.split('/').pop()
          signatureUrl = signatureFile && signatureByName[signatureFile] ? signatureByName[signatureFile] : null
        }
        this.teacher = {
          signatureStatus: status,
          signatureUrl,
          meta
        }
      } else {
        this.teacher = {
          signatureStatus: 'none',
          signatureUrl: null,
          meta: null
        }
      }

      this.students = roster.map(student => {
        const entry = attendance.find(a => Number(a.studentId) === Number(student.id))
        const status = entry && entry.status ? entry.status : 'none'
        const meta = this.signatureMeta(status)
        let signatureUrl = null
        if (status === 'signed' && entry && entry.signature) {
          const signatureFile = entry.signature.split('/').pop()
          signatureUrl = signatureFile && signatureByName[signatureFile] ? signatureByName[signatureFile] : null
        }
        return {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          signatureStatus: status,
          signatureUrl,
          meta
        }
      })
    },
    signatureMeta(status) {
      const map = {
        absent: { label: 'Absent', icon: '✖', class: 'absent' },
        signed: { label: 'Signé', icon: '✔', class: 'signed' },
        present: { label: 'Présent', icon: '✔', class: 'present' }
      }
      return map[status] || null
    },
    setTeacherStatus(status) {
      if (!this.teacher) return
      this.teacher.signatureStatus = status
      this.teacher.meta = this.signatureMeta(status)
      // Update display based on status
      if (status === 'absent') {
        this.teacher.signatureUrl = null
      } else if (status === 'present') {
        this.teacher.signatureUrl = null
      }
    },
    setStudentStatus(studentId, status) {
      const student = this.students.find(s => s.id === studentId)
      if (!student) return
      student.signatureStatus = status
      student.meta = this.signatureMeta(status)
      // Update display based on status
      if (status === 'absent') {
        student.signatureUrl = null
      } else if (status === 'present') {
        student.signatureUrl = null
      }
    },
    setAllPresent() {
      // Set all students to present
      this.students.forEach(student => {
        if (student.signatureStatus !== 'signed') {
          this.setStudentStatus(student.id, 'present')
        }
      })
    },
    setAllAbsent() {
      // Set all students to absent
      this.students.forEach(student => {
          this.setStudentStatus(student.id, 'absent')
      })
    },
    goBack() {
      this.$router.push({ 
        name: 'Calendrier', 
        query: { date: this.course?.day }
      })
    }
  }
}
</script>


<style scoped src="../assets/calendrierdetail.css"></style>
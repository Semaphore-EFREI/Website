import studentsData from '../assets/json/etudiants.json'
import attendanceTeachers from '../assets/json/attendance-teachers.json'
import adminsData from '../assets/json/admins.json'
import classesData from '../assets/json/classes.json'

const teacherGroupsByName = classesData.reduce((acc, course) => {
  acc[course.teacher] = acc[course.teacher] || new Set()
  acc[course.teacher].add(course.group)
  return acc
}, {})

const buildTeacherGroups = teacher => {
  const groups = teacherGroupsByName[teacher]
  if (!groups) return []
  return Array.from(groups)
}

const splitName = name => {
  if (!name) return { firstName: '', lastName: '' }
  const parts = name.split(' ')
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  }
}

export const getUsers = () => {
  const students = studentsData.map(student => ({
    key: `student-${student.id}`,
    name: `${student.firstName} ${student.lastName}`.trim(),
    firstName: student.firstName,
    lastName: student.lastName,
    role: 'Étudiant',
    email: student.email || '',
    groups: Array.isArray(student.group)
      ? student.group
      : student.group
        ? [student.group]
        : [],
    profilePicture: student.profilePicture || ''
  }))

  const teachers = Array.from(new Set(attendanceTeachers.map(t => t.teacher))).map((teacher, index) => {
    const { firstName, lastName } = splitName(teacher)
    return {
      key: `teacher-${index}`,
      name: teacher,
      firstName,
      lastName,
      role: 'Enseignant',
      email: '',
      groups: buildTeacherGroups(teacher),
      profilePicture: ''
    }
  })

  const admins = (adminsData?.administrators || []).map((admin, index) => {
    const { firstName, lastName } = splitName(admin)
    return {
      key: `admin-${index}`,
      name: admin,
      firstName,
      lastName,
      role: 'Admin',
      email: '',
      groups: [],
      profilePicture: ''
    }
  })

  return [...students, ...teachers, ...admins]
}

export const findUserByKey = key => {
  if (!key) return null
  return getUsers().find(user => user.key === key) || null
}

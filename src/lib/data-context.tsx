"use client"

import * as React from "react"
import {
  type User,
  type Cohort,
  type UserRole,
  type PracticeSet,
  type PracticeAttempt,
  type AttendanceStatus,
  type AttendanceRecord,
  type AttendanceSession,
  type Assignment,
  type AssignmentSubmission,
  type Exam,
  type ExamAttempt,
  INITIAL_COHORTS,
  INITIAL_USERS,
  INITIAL_PRACTICE_SETS,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_EXAMS,
  INITIAL_EXAM_ATTEMPTS,
} from "./mock-data"

interface DataContextType {
  cohorts: Cohort[]
  users: User[]
  practiceSets: PracticeSet[]
  attempts: PracticeAttempt[]
  attendanceSessions: AttendanceSession[]
  assignments: Assignment[]
  submissions: AssignmentSubmission[]
  exams: Exam[]
  examAttempts: ExamAttempt[]
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  addCohort: (cohort: Omit<Cohort, "id" | "createdAt">) => Cohort
  updateCohort: (id: string, data: Partial<Cohort>) => void
  deleteCohort: (id: string) => void
  addUser: (user: Omit<User, "id" | "joinedDate">) => User
  updateUser: (id: string, data: Partial<User>) => void
  enrollUserInCohort: (userId: string, cohortId: string) => void
  removeUserFromCohort: (userId: string, cohortId: string) => void
  getCohortMembers: (cohortId: string) => {
    students: User[]
    teachers: User[]
    coordinators: User[]
  }
  getUserCohorts: (userId: string) => Cohort[]
  addPracticeSet: (set: Omit<PracticeSet, "id" | "createdAt">) => PracticeSet
  saveAttempt: (
    practiceSetId: string,
    score: number,
    totalQuestions: number,
    answers: Record<string, number>
  ) => PracticeAttempt
  getBestAttempt: (practiceSetId: string, userId?: string) => PracticeAttempt | null
  getPracticeSetAttempts: (practiceSetId: string) => PracticeAttempt[]
  addAttendanceSession: (
    session: Omit<AttendanceSession, "id" | "createdAt" | "records">
  ) => AttendanceSession
  updateAttendanceRecord: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    note?: string
  ) => void
  markAllPresent: (sessionId: string) => void
  deleteAttendanceSession: (sessionId: string) => void
  getSessionAttendanceStats: (sessionId: string) => {
    present: number
    late: number
    absent: number
    excused: number
    total: number
    rate: number
  }
  getStudentAttendanceStats: (
    studentId: string,
    cohortId?: string
  ) => {
    present: number
    late: number
    absent: number
    excused: number
    total: number
    rate: number
    records: Array<{
      session: AttendanceSession
      record: AttendanceRecord
    }>
  }
  getCohortAttendanceSessions: (cohortId: string) => AttendanceSession[]
  getCohortPracticeSets: (cohortId: string) => PracticeSet[]
  getStudentAttendanceSummary: (
    studentId: string,
    cohortId?: string
  ) => {
    present: number
    late: number
    absent: number
    excused: number
    totalRecorded: number
    rate: number
    recentRecords: Array<{
      session: AttendanceSession
      record: AttendanceRecord
    }>
  }
  getStudentPracticeSummary: (studentId: string) => {
    totalAttempts: number
    passedCount: number
    averageScore: number
    recentAttempts: Array<{
      attempt: PracticeAttempt
      set?: PracticeSet
    }>
  }
  createAssignment: (data: Omit<Assignment, "id" | "createdAt">) => Assignment
  deleteAssignment: (id: string) => void
  submitAssignment: (
    assignmentId: string,
    studentId: string,
    content: string
  ) => AssignmentSubmission
  gradeSubmission: (
    submissionId: string,
    score: number,
    feedback: string,
    graderName: string
  ) => void
  getCohortAssignments: (cohortId: string) => Assignment[]
  getAssignmentSubmissions: (assignmentId: string) => AssignmentSubmission[]
  getStudentAssignmentSubmission: (
    assignmentId: string,
    studentId: string
  ) => AssignmentSubmission | null
  getStudentAssignmentSummary: (studentId: string) => {
    totalAssigned: number
    submittedCount: number
    gradedCount: number
    pendingCount: number
    averageScore: number
    submissions: Array<{
      assignment: Assignment
      submission?: AssignmentSubmission
    }>
  }
  addExam: (exam: Omit<Exam, "id" | "createdAt">) => Exam
  deleteExam: (id: string) => void
  submitExamAttempt: (
    examId: string,
    studentId: string,
    answers: Record<string, number>,
    flaggedIds: string[],
    timeSpentSeconds: number
  ) => ExamAttempt
  getExamAttempts: (examId: string) => ExamAttempt[]
  getStudentExamAttempt: (examId: string, studentId: string) => ExamAttempt | null
  getCohortExams: (cohortId: string) => Exam[]
  getStudentExamSummary: (studentId: string) => {
    totalExams: number
    attemptedCount: number
    passedCount: number
    averagePercentage: number
    recentAttempts: Array<{
      exam: Exam
      attempt: ExamAttempt
    }>
  }
  resetToDefaults: () => void
}

const DataContext = React.createContext<DataContextType | null>(null)

const COHORTS_STORAGE_KEY = "genshu_cohorts_v1"
const USERS_STORAGE_KEY = "genshu_users_v1"
const ROLE_STORAGE_KEY = "genshu_current_role_v1"
const PRACTICE_STORAGE_KEY = "genshu_practice_sets_v1"
const ATTEMPTS_STORAGE_KEY = "genshu_attempts_v1"
const ATTENDANCE_STORAGE_KEY = "genshu_attendance_v1"
const ASSIGNMENTS_STORAGE_KEY = "genshu_assignments_v1"
const SUBMISSIONS_STORAGE_KEY = "genshu_submissions_v1"
const EXAMS_STORAGE_KEY = "genshu_exams_v1"
const EXAM_ATTEMPTS_STORAGE_KEY = "genshu_exam_attempts_v1"

const DEFAULT_ROLE: UserRole = "TANTOSHA"
const roleListeners = new Set<() => void>()

function subscribeRole(callback: () => void) {
  roleListeners.add(callback)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === ROLE_STORAGE_KEY) {
      callback()
    }
  }
  window.addEventListener("storage", handleStorage)
  return () => {
    roleListeners.delete(callback)
    window.removeEventListener("storage", handleStorage)
  }
}

function notifyRoleListeners() {
  roleListeners.forEach((listener) => listener())
}

function getRoleSnapshot(): UserRole {
  try {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY)
    if (stored && ["GAKUSEI", "SENSEI", "TANTOSHA"].includes(stored)) {
      return stored as UserRole
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_ROLE
}

function getRoleServerSnapshot(): UserRole {
  return DEFAULT_ROLE
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Use useSyncExternalStore for role state:
  // getRoleServerSnapshot() ensures initial SSR output matches initial client render (avoiding hydration mismatch),
  // while getRoleSnapshot() seamlessly updates to persisted localStorage after hydration.
  const currentRole = React.useSyncExternalStore(
    subscribeRole,
    getRoleSnapshot,
    getRoleServerSnapshot
  )

  const setCurrentRole = React.useCallback((role: UserRole) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role)
    } catch {
      // Ignore storage errors
    }
    notifyRoleListeners()
  }, [])

  const [cohorts, setCohorts] = React.useState<Cohort[]>(INITIAL_COHORTS)
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS)
  const [practiceSets, setPracticeSets] = React.useState<PracticeSet[]>(INITIAL_PRACTICE_SETS)
  const [attempts, setAttempts] = React.useState<PracticeAttempt[]>([])
  const [attendanceSessions, setAttendanceSessions] = React.useState<AttendanceSession[]>(INITIAL_ATTENDANCE_SESSIONS)
  const [assignments, setAssignments] = React.useState<Assignment[]>(INITIAL_ASSIGNMENTS)
  const [submissions, setSubmissions] = React.useState<AssignmentSubmission[]>(INITIAL_SUBMISSIONS)
  const [exams, setExams] = React.useState<Exam[]>(INITIAL_EXAMS)
  const [examAttempts, setExamAttempts] = React.useState<ExamAttempt[]>(INITIAL_EXAM_ATTEMPTS)

  const isHydratedRef = React.useRef(false)

  // Load stored mock data after initial hydration to ensure SSR matches initial client render
  React.useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedCohorts = localStorage.getItem(COHORTS_STORAGE_KEY)
        if (storedCohorts) setCohorts(JSON.parse(storedCohorts))

        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
        if (storedUsers) setUsers(JSON.parse(storedUsers))

        const storedPractice = localStorage.getItem(PRACTICE_STORAGE_KEY)
        if (storedPractice) setPracticeSets(JSON.parse(storedPractice))

        const storedAttempts = localStorage.getItem(ATTEMPTS_STORAGE_KEY)
        if (storedAttempts) setAttempts(JSON.parse(storedAttempts))

        const storedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY)
        if (storedAttendance) setAttendanceSessions(JSON.parse(storedAttendance))

        const storedAssignments = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY)
        if (storedAssignments) setAssignments(JSON.parse(storedAssignments))

        const storedSubmissions = localStorage.getItem(SUBMISSIONS_STORAGE_KEY)
        if (storedSubmissions) setSubmissions(JSON.parse(storedSubmissions))

        const storedExams = localStorage.getItem(EXAMS_STORAGE_KEY)
        if (storedExams) setExams(JSON.parse(storedExams))

        const storedExamAttempts = localStorage.getItem(EXAM_ATTEMPTS_STORAGE_KEY)
        if (storedExamAttempts) setExamAttempts(JSON.parse(storedExamAttempts))
      } catch {
        // Ignore storage errors
      } finally {
        isHydratedRef.current = true
      }
    })
  }, [])

  // Sync state changes to localStorage only after hydration is complete
  React.useEffect(() => {
    if (!isHydratedRef.current) return
    try {
      localStorage.setItem(COHORTS_STORAGE_KEY, JSON.stringify(cohorts))
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      localStorage.setItem(PRACTICE_STORAGE_KEY, JSON.stringify(practiceSets))
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts))
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceSessions))
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments))
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions))
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams))
      localStorage.setItem(EXAM_ATTEMPTS_STORAGE_KEY, JSON.stringify(examAttempts))
    } catch {
      // Ignore storage errors
    }
  }, [cohorts, users, practiceSets, attempts, attendanceSessions, assignments, submissions, exams, examAttempts])

  const addCohort = (cohortData: Omit<Cohort, "id" | "createdAt">): Cohort => {
    const newCohort: Cohort = {
      ...cohortData,
      id: `cohort-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setCohorts((prev) => [newCohort, ...prev])
    return newCohort
  }

  const updateCohort = (id: string, data: Partial<Cohort>) => {
    setCohorts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    )
  }

  const deleteCohort = (id: string) => {
    setCohorts((prev) => prev.filter((c) => c.id !== id))
    // Clean up memberships
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        enrolledCohortIds: u.enrolledCohortIds.filter((cId) => cId !== id),
      }))
    )
  }

  const addUser = (userData: Omit<User, "id" | "joinedDate">): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString().split("T")[0],
    }
    setUsers((prev) => [newUser, ...prev])
    return newUser
  }

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    )
  }

  const enrollUserInCohort = (userId: string, cohortId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId && !u.enrolledCohortIds.includes(cohortId)) {
          return { ...u, enrolledCohortIds: [...u.enrolledCohortIds, cohortId] }
        }
        return u
      })
    )
  }

  const removeUserFromCohort = (userId: string, cohortId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            enrolledCohortIds: u.enrolledCohortIds.filter((id) => id !== cohortId),
          }
        }
        return u
      })
    )
  }

  const getCohortMembers = (cohortId: string) => {
    const members = users.filter((u) => u.enrolledCohortIds.includes(cohortId))
    return {
      students: members.filter((u) => u.role === "GAKUSEI"),
      teachers: members.filter((u) => u.role === "SENSEI"),
      coordinators: members.filter((u) => u.role === "TANTOSHA"),
    }
  }

  const getUserCohorts = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return []
    return cohorts.filter((c) => user.enrolledCohortIds.includes(c.id))
  }

  const addPracticeSet = (
    setData: Omit<PracticeSet, "id" | "createdAt">
  ): PracticeSet => {
    const newSet: PracticeSet = {
      ...setData,
      id: `practice-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setPracticeSets((prev) => [newSet, ...prev])
    return newSet
  }

  const saveAttempt = (
    practiceSetId: string,
    score: number,
    totalQuestions: number,
    answers: Record<string, number>
  ): PracticeAttempt => {
    const newAttempt: PracticeAttempt = {
      id: `attempt-${Date.now()}`,
      practiceSetId,
      userId: "user-g1", // current default active student
      score,
      totalQuestions,
      answers,
      completedAt: new Date().toISOString(),
    }
    setAttempts((prev) => [newAttempt, ...prev])
    return newAttempt
  }

  const getBestAttempt = (practiceSetId: string, userId?: string) => {
    const targetUserId = userId || "user-g1"
    const setAttempts = attempts.filter(
      (a) => a.practiceSetId === practiceSetId && a.userId === targetUserId
    )
    if (setAttempts.length === 0) return null
    return setAttempts.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    )
  }

  const getPracticeSetAttempts = (practiceSetId: string) => {
    return attempts.filter((a) => a.practiceSetId === practiceSetId)
  }

  const addAttendanceSession = (
    sessionData: Omit<AttendanceSession, "id" | "createdAt" | "records">
  ): AttendanceSession => {
    const cohortStudents = users.filter(
      (u) => u.role === "GAKUSEI" && u.enrolledCohortIds.includes(sessionData.cohortId)
    )
    const initialRecords: AttendanceRecord[] = cohortStudents.map((s) => ({
      id: `att-${Date.now()}-${s.id}`,
      studentId: s.id,
      status: "PRESENT" as AttendanceStatus,
    }))

    const newSession: AttendanceSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
      createdAt: new Date().toISOString(),
      records: initialRecords,
    }
    setAttendanceSessions((prev) => [newSession, ...prev])
    return newSession
  }

  const updateAttendanceRecord = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    setAttendanceSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session
        const existingIdx = session.records.findIndex((r) => r.studentId === studentId)
        const newRecords = [...session.records]
        if (existingIdx >= 0) {
          newRecords[existingIdx] = {
            ...newRecords[existingIdx],
            status,
            note: note !== undefined ? note : newRecords[existingIdx].note,
          }
        } else {
          newRecords.push({
            id: `att-${Date.now()}-${studentId}`,
            studentId,
            status,
            note,
          })
        }
        return { ...session, records: newRecords }
      })
    )
  }

  const markAllPresent = (sessionId: string) => {
    setAttendanceSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session
        const cohortStudents = users.filter(
          (u) => u.role === "GAKUSEI" && u.enrolledCohortIds.includes(session.cohortId)
        )
        const newRecords: AttendanceRecord[] = cohortStudents.map((s) => {
          const existing = session.records.find((r) => r.studentId === s.id)
          return {
            id: existing?.id || `att-${Date.now()}-${s.id}`,
            studentId: s.id,
            status: "PRESENT",
            note: existing?.note,
          }
        })
        return { ...session, records: newRecords }
      })
    )
  }

  const deleteAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  const getSessionAttendanceStats = (sessionId: string) => {
    const session = attendanceSessions.find((s) => s.id === sessionId)
    if (!session) return { present: 0, late: 0, absent: 0, excused: 0, total: 0, rate: 0 }

    const cohortStudents = users.filter(
      (u) => u.role === "GAKUSEI" && u.enrolledCohortIds.includes(session.cohortId)
    )
    const total = cohortStudents.length || session.records.length
    let present = 0
    let late = 0
    let absent = 0
    let excused = 0

    session.records.forEach((r) => {
      if (r.status === "PRESENT") present++
      else if (r.status === "LATE") late++
      else if (r.status === "ABSENT") absent++
      else if (r.status === "EXCUSED") excused++
    })

    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100

    return { present, late, absent, excused, total, rate }
  }

  const getStudentAttendanceStats = (studentId: string, cohortId?: string) => {
    const relevantSessions = attendanceSessions.filter(
      (s) => !cohortId || s.cohortId === cohortId
    )
    let present = 0
    let late = 0
    let absent = 0
    let excused = 0
    const records: Array<{ session: AttendanceSession; record: AttendanceRecord }> = []

    relevantSessions.forEach((session) => {
      const rec = session.records.find((r) => r.studentId === studentId)
      if (rec) {
        records.push({ session, record: rec })
        if (rec.status === "PRESENT") present++
        else if (rec.status === "LATE") late++
        else if (rec.status === "ABSENT") absent++
        else if (rec.status === "EXCUSED") excused++
      }
    })

    const total = records.length
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100

    return { present, late, absent, excused, total, rate, records }
  }

  const getCohortAttendanceSessions = (cohortId: string) => {
    return attendanceSessions.filter((s) => s.cohortId === cohortId)
  }

  const getCohortPracticeSets = (cohortId: string) => {
    return practiceSets.filter((p) => p.cohortId === cohortId || p.cohortId === "all")
  }

  const getStudentAttendanceSummary = (studentId: string, cohortId?: string) => {
    const relevantSessions = attendanceSessions.filter(
      (s) => !cohortId || s.cohortId === cohortId
    )
    let present = 0
    let late = 0
    let absent = 0
    let excused = 0
    const records: Array<{ session: AttendanceSession; record: AttendanceRecord }> = []

    relevantSessions.forEach((session) => {
      const rec = session.records.find((r) => r.studentId === studentId)
      if (rec) {
        records.push({ session, record: rec })
        if (rec.status === "PRESENT") present++
        else if (rec.status === "LATE") late++
        else if (rec.status === "ABSENT") absent++
        else if (rec.status === "EXCUSED") excused++
      }
    })

    // Explicit formula: (present + late) / (present + late + absent) * 100
    // Excused is excluded from denominator. If denominator is 0, default rate is 100%.
    const denominator = present + late + absent
    const rate = denominator > 0 ? Math.round(((present + late) / denominator) * 100) : 100

    const recentRecords = [...records]
      .sort((a, b) => b.session.date.localeCompare(a.session.date))
      .slice(0, 5)

    return {
      present,
      late,
      absent,
      excused,
      totalRecorded: records.length,
      rate,
      recentRecords,
    }
  }

  const getStudentPracticeSummary = (studentId: string) => {
    const userAttempts = attempts.filter((a) => a.userId === studentId)
    const totalAttempts = userAttempts.length

    const passedCount = userAttempts.filter((a) => {
      const set = practiceSets.find((p) => p.id === a.practiceSetId)
      const passThreshold = set?.passScore ?? 70
      return a.score >= passThreshold
    }).length

    const averageScore =
      totalAttempts > 0
        ? Math.round(userAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
        : 0

    const recentAttempts = [...userAttempts]
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, 5)
      .map((attempt) => ({
        attempt,
        set: practiceSets.find((p) => p.id === attempt.practiceSetId),
      }))

    return {
      totalAttempts,
      passedCount,
      averageScore,
      recentAttempts,
    }
  }

  const createAssignment = (data: Omit<Assignment, "id" | "createdAt">): Assignment => {
    const newAssignment: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setAssignments((prev) => [newAssignment, ...prev])
    return newAssignment
  }

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id))
  }

  const submitAssignment = (
    assignmentId: string,
    studentId: string,
    content: string
  ): AssignmentSubmission => {
    const existing = submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    )
    const now = new Date().toISOString().replace("T", " ").substring(0, 16)

    if (existing) {
      const updated: AssignmentSubmission = {
        ...existing,
        content,
        submittedAt: now,
        status: existing.status === "GRADED" ? "GRADED" : "SUBMITTED",
      }
      setSubmissions((prev) =>
        prev.map((s) => (s.id === existing.id ? updated : s))
      )
      return updated
    } else {
      const newSub: AssignmentSubmission = {
        id: `sub-${Date.now()}`,
        assignmentId,
        studentId,
        content,
        submittedAt: now,
        status: "SUBMITTED",
      }
      setSubmissions((prev) => [newSub, ...prev])
      return newSub
    }
  }

  const gradeSubmission = (
    submissionId: string,
    score: number,
    feedback: string,
    graderName: string
  ) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 16)
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              score,
              feedback,
              status: "GRADED",
              gradedAt: now,
              gradedBy: graderName,
            }
          : s
      )
    )
  }

  const getCohortAssignments = (cohortId: string): Assignment[] => {
    return assignments.filter((a) => a.cohortId === cohortId || a.cohortId === "all")
  }

  const getAssignmentSubmissions = (assignmentId: string): AssignmentSubmission[] => {
    return submissions.filter((s) => s.assignmentId === assignmentId)
  }

  const getStudentAssignmentSubmission = (
    assignmentId: string,
    studentId: string
  ): AssignmentSubmission | null => {
    return submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === studentId
    ) || null
  }

  const getStudentAssignmentSummary = (studentId: string) => {
    const student = users.find((u) => u.id === studentId)
    const cohortIds = student?.enrolledCohortIds || []
    const targetedAssignments = assignments.filter(
      (a) => cohortIds.includes(a.cohortId) || a.cohortId === "all"
    )

    const studentSubs = submissions.filter((s) => s.studentId === studentId)
    const subMap = new Map<string, AssignmentSubmission>()
    studentSubs.forEach((s) => subMap.set(s.assignmentId, s))

    let submittedCount = 0
    let gradedCount = 0
    let totalScore = 0

    targetedAssignments.forEach((a) => {
      const sub = subMap.get(a.id)
      if (sub && (sub.status === "SUBMITTED" || sub.status === "GRADED")) {
        submittedCount++
        if (sub.status === "GRADED" && sub.score !== undefined) {
          gradedCount++
          totalScore += sub.score
        }
      }
    })

    const pendingCount = Math.max(0, targetedAssignments.length - submittedCount)
    const averageScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0

    const list = targetedAssignments.map((a) => ({
      assignment: a,
      submission: subMap.get(a.id),
    }))

    return {
      totalAssigned: targetedAssignments.length,
      submittedCount,
      gradedCount,
      pendingCount,
      averageScore,
      submissions: list,
    }
  }

  const addExam = (examData: Omit<Exam, "id" | "createdAt">): Exam => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setExams((prev) => [newExam, ...prev])
    return newExam
  }

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id))
    setExamAttempts((prev) => prev.filter((a) => a.examId !== id))
  }

  const submitExamAttempt = (
    examId: string,
    studentId: string,
    answers: Record<string, number>,
    flaggedIds: string[],
    timeSpentSeconds: number
  ): ExamAttempt => {
    const exam = exams.find((e) => e.id === examId)
    const questions = exam ? exam.questions : []
    const totalMax = questions.reduce((sum, q) => sum + (q.points || 20), 0) || 100
    let earned = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswerIndex) {
        earned += q.points || 20
      }
    })
    const percentage = Math.round((earned / totalMax) * 100)
    const passed = percentage >= (exam?.passScore ?? 70)

    const newAttempt: ExamAttempt = {
      id: `att-ex-${Date.now()}`,
      examId,
      studentId,
      answers,
      flaggedQuestionIds: flaggedIds,
      score: earned,
      maxScore: totalMax,
      percentage,
      passed,
      timeSpentSeconds,
      submittedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    }

    setExamAttempts((prev) => {
      const filtered = prev.filter((a) => !(a.examId === examId && a.studentId === studentId))
      return [newAttempt, ...filtered]
    })
    return newAttempt
  }

  const getExamAttempts = React.useCallback(
    (examId: string) => {
      return examAttempts.filter((a) => a.examId === examId)
    },
    [examAttempts]
  )

  const getStudentExamAttempt = React.useCallback(
    (examId: string, studentId: string) => {
      return examAttempts.find((a) => a.examId === examId && a.studentId === studentId) || null
    },
    [examAttempts]
  )

  const getCohortExams = React.useCallback(
    (cohortId: string) => {
      return exams.filter((e) => e.cohortId === cohortId)
    },
    [exams]
  )

  const getStudentExamSummary = React.useCallback(
    (studentId: string) => {
      const student = users.find((u) => u.id === studentId)
      const enrolled = student?.enrolledCohortIds || []
      const relevantExams = exams.filter((e) => enrolled.includes(e.cohortId))
      const studentAttempts = examAttempts.filter((a) => a.studentId === studentId)

      const passedCount = studentAttempts.filter((a) => a.passed).length
      const avgPercentage =
        studentAttempts.length > 0
          ? Math.round(studentAttempts.reduce((sum, a) => sum + a.percentage, 0) / studentAttempts.length)
          : 0

      const recentAttempts = studentAttempts.slice(0, 5).map((att) => ({
        attempt: att,
        exam: exams.find((e) => e.id === att.examId) || exams[0],
      })).filter((item) => Boolean(item.exam))

      return {
        totalExams: relevantExams.length,
        attemptedCount: studentAttempts.length,
        passedCount,
        averagePercentage: avgPercentage,
        recentAttempts,
      }
    },
    [exams, examAttempts, users]
  )

  const resetToDefaults = () => {
    setCohorts(INITIAL_COHORTS)
    setUsers(INITIAL_USERS)
    setPracticeSets(INITIAL_PRACTICE_SETS)
    setAttempts([])
    setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS)
    setAssignments(INITIAL_ASSIGNMENTS)
    setSubmissions(INITIAL_SUBMISSIONS)
    setExams(INITIAL_EXAMS)
    setExamAttempts(INITIAL_EXAM_ATTEMPTS)
    try {
      localStorage.removeItem(COHORTS_STORAGE_KEY)
      localStorage.removeItem(USERS_STORAGE_KEY)
      localStorage.removeItem(ROLE_STORAGE_KEY)
      localStorage.removeItem(PRACTICE_STORAGE_KEY)
      localStorage.removeItem(ATTEMPTS_STORAGE_KEY)
      localStorage.removeItem(ATTENDANCE_STORAGE_KEY)
      localStorage.removeItem(ASSIGNMENTS_STORAGE_KEY)
      localStorage.removeItem(SUBMISSIONS_STORAGE_KEY)
      localStorage.removeItem(EXAMS_STORAGE_KEY)
      localStorage.removeItem(EXAM_ATTEMPTS_STORAGE_KEY)
    } catch {
      // Ignore
    }
    notifyRoleListeners()
  }

  return (
    <DataContext.Provider
      value={{
        cohorts,
        users,
        practiceSets,
        attempts,
        attendanceSessions,
        assignments,
        submissions,
        exams,
        examAttempts,
        currentRole,
        setCurrentRole,
        addCohort,
        updateCohort,
        deleteCohort,
        addUser,
        updateUser,
        enrollUserInCohort,
        removeUserFromCohort,
        getCohortMembers,
        getUserCohorts,
        addPracticeSet,
        saveAttempt,
        getBestAttempt,
        getPracticeSetAttempts,
        addAttendanceSession,
        updateAttendanceRecord,
        markAllPresent,
        deleteAttendanceSession,
        getSessionAttendanceStats,
        getStudentAttendanceStats,
        getCohortAttendanceSessions,
        getCohortPracticeSets,
        getStudentAttendanceSummary,
        getStudentPracticeSummary,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        getCohortAssignments,
        getAssignmentSubmissions,
        getStudentAssignmentSubmission,
        getStudentAssignmentSummary,
        addExam,
        deleteExam,
        submitExamAttempt,
        getExamAttempts,
        getStudentExamAttempt,
        getCohortExams,
        getStudentExamSummary,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = React.useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

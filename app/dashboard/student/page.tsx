"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { BookOpen, CheckCircle, Clock, Calendar } from "lucide-react"
import { useGetCoursesQuery } from "@/app/services/courses-api"
import { useGetTestResultsQuery } from "@/app/services/tests-api"
import { useGetAttendanceQuery } from "@/app/services/attendance-api"
import { useGetGradesQuery } from "@/app/services/grades-api"
import { useAppSelector } from "@/app/hooks"

export default function StudentDashboard() {
  const currentUser = useAppSelector((state) => state.auth.user)

  const { data: courses = [] } = useGetCoursesQuery({})
  const { data: testResults = [] } = useGetTestResultsQuery({ studentId: currentUser?.id })
  const { data: attendance = [] } = useGetAttendanceQuery({ studentId: currentUser?.id })
  const { data: grades = [] } = useGetGradesQuery({ studentId: currentUser?.id })

  const attendancePercentage =
    attendance.length > 0
      ? Math.round((attendance.filter((a: any) => a.status === "present").length / attendance.length) * 100)
      : 0

  const averageGrade =
    grades.length > 0 ? (grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length).toFixed(1) : "0.0"

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">O'quvchi Dashboard</h1>
          <p className="text-muted-foreground">Sizning o'qish harakatlarini ko'rish</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Videokurslar" value={courses.length.toString()} icon={<BookOpen className="w-6 h-6" />} />
          <StatCard
            label="Tugatilgan Testlar"
            value={testResults.length.toString()}
            icon={<CheckCircle className="w-6 h-6" />}
            color="secondary"
          />
          <StatCard
            label="Davomati"
            value={`${attendancePercentage}%`}
            icon={<Calendar className="w-6 h-6" />}
            color="accent"
          />
          <StatCard label="O'rtacha Baho" value={averageGrade} icon={<Clock className="w-6 h-6" />} />
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">O'qish Rejangiz</h2>
          <p className="text-muted-foreground">
            Kurslar, testlar va davomatni ko'rish uchun chap tarafdagi menyudan foydalaning.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

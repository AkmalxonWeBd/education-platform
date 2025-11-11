"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { User, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { useGetGradesQuery } from "@/app/services/grades-api"
import { useGetCoursesQuery } from "@/app/services/courses-api"
import { useGetAttendanceQuery } from "@/app/services/attendance-api"
import { useAppSelector } from "@/app/hooks"

export default function ParentDashboard() {
  const currentUser = useAppSelector((state) => state.auth.user)

  const { data: grades = [] } = useGetGradesQuery({})
  const { data: courses = [] } = useGetCoursesQuery({})
  const { data: attendance = [] } = useGetAttendanceQuery({})

  const averageGrade =
    grades.length > 0 ? (grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length).toFixed(1) : "0.0"

  const attendancePercentage =
    attendance.length > 0
      ? Math.round((attendance.filter((a: any) => a.status === "present").length / attendance.length) * 100)
      : 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ota-ona Dashboard</h1>
          <p className="text-muted-foreground">Farzandingiz holatini monitoring qiling</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Foydalanuvchi" value={currentUser?.name || "N/A"} icon={<User className="w-6 h-6" />} />
          <StatCard
            label="O'rtacha Baho"
            value={averageGrade}
            icon={<TrendingUp className="w-6 h-6" />}
            color="secondary"
          />
          <StatCard
            label="Davomat"
            value={`${attendancePercentage}%`}
            icon={<Calendar className="w-6 h-6" />}
            color="accent"
          />
          <StatCard label="Aktiv Kurslar" value={courses.length.toString()} icon={<BookOpen className="w-6 h-6" />} />
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Farzand Ma'lumotlari</h2>
          <p className="text-muted-foreground">
            Farzandingizning baholar, testlar va davomat ma'lumotlari tizimga yuklanganidan keyin bu yerda ko'rsatiladi.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

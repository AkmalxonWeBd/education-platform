"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, BookOpen, Calendar } from "lucide-react"
import { useGetUsersQuery } from "@/app/services/users-api"
import { useGetLessonsQuery } from "@/app/services/lessons-api"
import { useGetAttendanceQuery } from "@/app/services/attendance-api"

export default function SchoolAdminDashboard() {
  const { data: teachers = [] } = useGetUsersQuery({ role: "teacher" })
  const { data: students = [] } = useGetUsersQuery({ role: "student" })
  const { data: lessons = [] } = useGetLessonsQuery({})
  const { data: attendance = [] } = useGetAttendanceQuery({})

  const attendancePercentage =
    attendance.length > 0
      ? Math.round((attendance.filter((a: any) => a.status === "present").length / attendance.length) * 100)
      : 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Maktab Admini Dashboard</h1>
          <p className="text-muted-foreground">Maktab faoliyatini monitoring qiling</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="O'qituvchilar" value={teachers.length.toString()} icon={<Users className="w-6 h-6" />} />
          <StatCard
            label="O'quvchilar"
            value={students.length.toString()}
            icon={<Users className="w-6 h-6" />}
            color="secondary"
          />
          <StatCard
            label="Darslar"
            value={lessons.length.toString()}
            icon={<BookOpen className="w-6 h-6" />}
            color="accent"
          />
          <StatCard label="Davomati" value={`${attendancePercentage}%`} icon={<Calendar className="w-6 h-6" />} />
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Tizim Ma'lumotlari</h2>
          <p className="text-muted-foreground">
            Maktab ma'lumotlari API orqali yuklangan. Yangi o'qituvchi yoki o'quvchi qo'shish uchun yuqoridagi menyudan
            foydalaning.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

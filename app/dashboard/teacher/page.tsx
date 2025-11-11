"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import { useGetUsersQuery } from "@/app/services/users-api"
import { useGetLessonsQuery } from "@/app/services/lessons-api"
import { useGetGradesQuery } from "@/app/services/grades-api"
import { useGetTestsQuery } from "@/app/services/tests-api"

export default function TeacherDashboard() {
  const { data: students = [] } = useGetUsersQuery({ role: "student" })
  const { data: lessons = [] } = useGetLessonsQuery({})
  const { data: grades = [] } = useGetGradesQuery({})
  const { data: tests = [] } = useGetTestsQuery({})

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">O'qituvchi Dashboard</h1>
          <p className="text-muted-foreground">Darslar va o'quvchilarni boshqaring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Darslar" value={lessons.length.toString()} icon={<BookOpen className="w-6 h-6" />} />
          <StatCard
            label="Aktiv O'quvchilar"
            value={students.length.toString()}
            icon={<Users className="w-6 h-6" />}
            color="secondary"
          />
          <StatCard
            label="Baholar"
            value={grades.length.toString()}
            icon={<CheckCircle className="w-6 h-6" />}
            color="accent"
          />
          <StatCard label="Testlar" value={tests.length.toString()} icon={<AlertCircle className="w-6 h-6" />} />
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Boshqaruv Paneli</h2>
          <p className="text-muted-foreground">
            Yangi dars, test yoki video kurs qo'shish uchun chap tarafdagi menyudan tegishli bo'limga o'ting.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, School, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useGetUsersQuery } from "@/app/services/users-api"

export default function SuperAdminDashboard() {
  const { data: allUsers = [] } = useGetUsersQuery({})
  const { data: schoolAdmins = [] } = useGetUsersQuery({ role: "school-admin" })
  const { data: teachers = [] } = useGetUsersQuery({ role: "teacher" })
  const { data: students = [] } = useGetUsersQuery({ role: "student" })

  const totalSchools = schoolAdmins.length
  const totalTeachers = teachers.length
  const totalStudents = students.length

  const data = []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Butun platformani boshqaring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Maktab Adminlari" value={totalSchools.toString()} icon={<School className="w-6 h-6" />} />
          <StatCard
            label="O'qituvchilar"
            value={totalTeachers.toString()}
            icon={<Users className="w-6 h-6" />}
            color="secondary"
          />
          <StatCard
            label="O'quvchilar"
            value={totalStudents.toString()}
            icon={<Users className="w-6 h-6" />}
            color="accent"
          />
          <StatCard
            label="Jami Foydalanuvchilar"
            value={allUsers.length.toString()}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>

        {data.length > 0 && (
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Faollik Trendu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="maktablar" fill="hsl(var(--chart-1))" />
                <Bar dataKey="o_quvchilar" fill="hsl(var(--chart-2))" />
                <Bar dataKey="o_qituvchilar" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

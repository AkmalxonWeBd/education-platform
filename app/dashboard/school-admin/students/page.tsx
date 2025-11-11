"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { UserFormModal, type UserFormData } from "@/components/modals/user-form-modal"
import { Button } from "@/components/ui/button"
import { useGetUsersQuery, useCreateUserMutation, useDeleteUserMutation } from "@/app/services/users-api"
import { Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const { data: students = [] } = useGetUsersQuery({ role: "student" })
  const [createUser] = useCreateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const handleSubmit = async (data: UserFormData) => {
    try {
      await createUser({ ...data, role: "student" }).unwrap()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving student:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">O'quvchilar</h1>
            <p className="text-muted-foreground">O'quvchilarni boshqaring</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            O'quvchi Qo'shish
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Ismi" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Telefon" },
            { key: "createdAt", label: "Qo'shilgan", render: (date) => new Date(date).toLocaleDateString("uz") },
          ]}
          data={students}
          searchKey="name"
          onDelete={(student) => setDeleteTarget(student)}
        />

        <UserFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />

        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>O'chirish Tasdiq</AlertDialogTitle>
              <AlertDialogDescription>{deleteTarget?.name} o'quvchini o'chirishni xohlaysizmi?</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUser(deleteTarget.id).then(() => setDeleteTarget(null))}
                className="bg-destructive"
              >
                O'chirish
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}

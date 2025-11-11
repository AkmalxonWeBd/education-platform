"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { UserFormModal, type UserFormData } from "@/components/modals/user-form-modal"
import { Button } from "@/components/ui/button"
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/app/services/users-api"
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

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<UserFormData | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const { data: teachers = [] } = useGetUsersQuery({ role: "teacher" })
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const handleOpenModal = (teacher?: UserFormData) => {
    setSelectedTeacher(teacher)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (data.id) {
        await updateUser({ id: data.id, data }).unwrap()
      } else {
        await createUser({ ...data, role: "teacher" }).unwrap()
      }
      setIsModalOpen(false)
      setSelectedTeacher(undefined)
    } catch (error) {
      console.error("Error saving teacher:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">O'qituvchilar</h1>
            <p className="text-muted-foreground">O'qituvchilarni boshqaring</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            O'qituvchi Qo'shish
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Ismi" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Telefon" },
            { key: "createdAt", label: "Qo'shilgan", render: (date) => new Date(date).toLocaleDateString("uz") },
          ]}
          data={teachers}
          searchKey="name"
          onEdit={(teacher) => handleOpenModal(teacher as UserFormData)}
          onDelete={(teacher) => setDeleteTarget(teacher)}
        />

        <UserFormModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTeacher(undefined)
          }}
          onSubmit={handleSubmit}
          initialData={selectedTeacher}
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>O'chirish Tasdiq</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget?.name} o'qituvchini o'chirishni xohlaysizmi?
              </AlertDialogDescription>
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

"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { UserFormModal, type UserFormData } from "@/components/modals/user-form-modal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
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

export default function AdminsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<UserFormData | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const { toast } = useToast()

  const { data: admins = [], isLoading } = useGetUsersQuery({ role: "school_admin" })
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const handleOpenModal = (admin?: UserFormData) => {
    setSelectedAdmin(admin)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (data.id) {
        await updateUser({ id: data.id, data }).unwrap()
        toast({
          title: "Muvaffaqiyatli",
          description: "Admin ma'lumotlari yangilandi",
        })
      } else {
        await createUser({ ...data, role: "school_admin" }).unwrap()
        toast({
          title: "Muvaffaqiyatli",
          description: "Yangi admin yaratildi",
        })
      }
      setIsModalOpen(false)
      setSelectedAdmin(undefined)
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.data?.detail || "Admin saqlashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (deleteTarget?.id) {
      try {
        await deleteUser(deleteTarget.id).unwrap()
        toast({
          title: "Muvaffaqiyatli",
          description: "Admin o'chirildi",
        })
        setDeleteTarget(null)
      } catch (error: any) {
        toast({
          title: "Xatolik",
          description: error?.data?.detail || "Admin o'chirishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maktab Adminlari</h1>
            <p className="text-muted-foreground">Maktab adminlarini boshqaring</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Yangi Admin
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Ismi" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Telefon" },
            { key: "createdAt", label: "Yaratilgan vaqti", render: (date) => new Date(date).toLocaleDateString("uz") },
          ]}
          data={admins}
          searchKey="name"
          onEdit={(admin) => handleOpenModal(admin as UserFormData)}
          onDelete={(admin) => setDeleteTarget(admin)}
        />

        <UserFormModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedAdmin(undefined)
          }}
          onSubmit={handleSubmit}
          initialData={selectedAdmin}
          isLoading={isLoading}
          roleFilter="school_admin"
        />

        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>O'chirish Tasdiq</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget?.name} adminni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                O'chirish
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}

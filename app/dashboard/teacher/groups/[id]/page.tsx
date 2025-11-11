"use client"

import { useParams, useRouter } from "next/navigation"
import { useGetGroupsQuery } from "@/app/services/groups-api"
import { useGetUsersQuery } from "@/app/services/users-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Calendar, Clock, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateUserMutation, useDeleteUserMutation } from "@/app/services/users-api"
import { useToast } from "@/hooks/use-toast"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.id as string

  const { data: groups = [] } = useGetGroupsQuery({})
  const { data: users = [], refetch: refetchUsers } = useGetUsersQuery({})
  const [createUser] = useCreateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const group = groups.find((g: any) => g.id === groupId)
  const groupStudents = users.filter((u: any) => u.group_id === groupId && u.role === "student")

  const handleAddStudent = async () => {
    try {
      await createUser({
        ...studentData,
        role: "student",
        group_id: groupId,
      }).unwrap()

      toast({
        title: "Muvaffaqiyatli",
        description: "O'quvchi qo'shildi",
      })

      setIsAddStudentOpen(false)
      setStudentData({ name: "", email: "", password: "" })
      refetchUsers()
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.data?.detail || "O'quvchi qo'shishda xatolik",
        variant: "destructive",
      })
    }
  }

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await deleteUser(studentId).unwrap()
      toast({
        title: "Muvaffaqiyatli",
        description: "O'quvchi o'chirildi",
      })
      refetchUsers()
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.data?.detail || "O'quvchi o'chirishda xatolik",
        variant: "destructive",
      })
    }
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Guruh topilmadi</CardTitle>
            <CardDescription>Ushbu guruh mavjud emas yoki o'chirilgan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/teacher/groups")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Guruhlar ro'yxatiga qaytish
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dayNames: Record<string, string> = {
    monday: "Dushanba",
    tuesday: "Seshanba",
    wednesday: "Chorshanba",
    thursday: "Payshanba",
    friday: "Juma",
    saturday: "Shanba",
    sunday: "Yakshanba",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/teacher/groups")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
        </div>
        <Button onClick={() => setIsAddStudentOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          O'quvchi qo'shish
        </Button>
      </div>

      {/* Group Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">O'quvchilar soni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStudents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dars kunlari</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">{group.days?.map((d: string) => dayNames[d]).join(", ")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dars vaqtlari</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {group.schedule?.map((s: any, idx: number) => (
                <div key={idx} className="text-sm">
                  {s.day ? dayNames[s.day] + ": " : ""}
                  {s.start_time} - {s.end_time}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>O'quvchilar ro'yxati</CardTitle>
          <CardDescription>Guruhdagi barcha o'quvchilar</CardDescription>
        </CardHeader>
        <CardContent>
          {groupStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Hozircha o'quvchilar yo'q</p>
              <Button className="mt-4" onClick={() => setIsAddStudentOpen(true)}>
                Birinchi o'quvchini qo'shish
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {groupStudents.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{student.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveStudent(student.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi o'quvchi qo'shish</DialogTitle>
            <DialogDescription>
              O'quvchi ma'lumotlarini kiriting. O'quvchi avtomatik ravishda ushbu guruhga qo'shiladi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ism</Label>
              <Input
                id="name"
                value={studentData.name}
                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                placeholder="O'quvchi ismi"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={studentData.email}
                onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={studentData.password}
                onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                placeholder="Parol"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                Bekor qilish
              </Button>
              <Button onClick={handleAddStudent}>Qo'shish</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

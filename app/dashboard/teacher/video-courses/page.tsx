"use client"

import type React from "react"

import { useState } from "react"
import {
  useGetVideoCoursesQuery,
  useCreateVideoCourseMutation,
  useDeleteVideoCourseMutation,
} from "@/app/services/video-courses-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Trash2, Video, Lock, Unlock } from "lucide-react"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useGetGroupsQuery } from "@/app/services/groups-api"

export default function VideoCoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: courses = [], isLoading } = useGetVideoCoursesQuery({})
  const { data: groups = [] } = useGetGroupsQuery({})
  const [createCourse] = useCreateVideoCourseMutation()
  const [deleteCourse] = useDeleteVideoCourseMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_free: true,
    allowed_groups: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCourse({
        title: formData.title,
        description: formData.description,
        is_free: formData.is_free,
        allowed_group_ids: formData.allowed_groups,
      }).unwrap()

      toast({
        title: "Muvaffaqiyat",
        description: "Video kurs yaratildi",
      })

      setIsModalOpen(false)
      setFormData({ title: "", description: "", is_free: true, allowed_groups: [] })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Video kurs yaratishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return

    try {
      await deleteCourse(id).unwrap()
      toast({
        title: "Muvaffaqiyat",
        description: "Video kurs o'chirildi",
      })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Video kurs o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Video Darsliklar</h1>
          <p className="text-muted-foreground">Video darsliklarni boshqaring</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yangi Kurs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course: any) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {course.is_free ? (
                      <Unlock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-600" />
                    )}
                    {course.title}
                  </CardTitle>
                  <CardDescription className="mt-2">{course.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>{course.videos?.length || 0} ta video</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/teacher/video-courses/${course.id}`)}
                  >
                    Batafsil
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Hozircha video darsliklar yo'q. Yangi kurs yarating.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yangi Video Kurs</DialogTitle>
            <DialogDescription>Video darslik yaratish uchun ma'lumotlarni kiriting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Kurs Nomi</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masalan: Python Asoslari"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kurs haqida qisqacha ma'lumot"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Kurs Turi</Label>
              <RadioGroup
                value={formData.is_free ? "free" : "paid"}
                onValueChange={(value) => setFormData({ ...formData, is_free: value === "free", allowed_groups: [] })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="font-normal cursor-pointer">
                    Bepul (Tanlangan guruhlarga ochiq)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="font-normal cursor-pointer">
                    Pullik (Ruxsat olish kerak)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.is_free && (
              <div className="space-y-2">
                <Label>Ruxsat berilgan guruhlar</Label>
                <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                  {groups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Guruhlar mavjud emas</p>
                  ) : (
                    groups.map((group: any) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`group-${group.id}`}
                          checked={formData.allowed_groups.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                allowed_groups: [...formData.allowed_groups, group.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                allowed_groups: formData.allowed_groups.filter((id) => id !== group.id),
                              })
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`group-${group.id}`} className="font-normal cursor-pointer">
                          {group.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {formData.is_free && formData.allowed_groups.length === 0 && (
                  <p className="text-sm text-orange-600">Kamida bitta guruh tanlang</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={formData.is_free && formData.allowed_groups.length === 0}>
                Yaratish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

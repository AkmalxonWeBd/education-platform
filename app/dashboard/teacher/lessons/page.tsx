"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Calendar, BookOpen } from "lucide-react"
import { useGetLessonsQuery, useCreateLessonMutation } from "@/app/services/lessons-api"
import { useAppSelector } from "@/app/hooks"

export default function LessonsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const user = useAppSelector((state) => state.auth.user)

  const { data: lessons = [], isLoading } = useGetLessonsQuery({})
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assessmentElements: [
      { name: "Midterm", weight: 30 },
      { name: "Final", weight: 40 },
      { name: "Topshiriq", weight: 30 },
    ],
  })

  const handleSubmit = async () => {
    if (formData.title) {
      try {
        const lessonData = {
          ...formData,
          subject: formData.title, // Use title as subject for now
          teacherId: user?.id,
        }

        console.log("[v0] Creating lesson with data:", lessonData)

        await createLesson(lessonData).unwrap()

        console.log("[v0] Lesson created successfully")
        setFormData({
          title: "",
          description: "",
          assessmentElements: [
            { name: "Midterm", weight: 30 },
            { name: "Final", weight: 40 },
            { name: "Topshiriq", weight: 30 },
          ],
        })
        setIsModalOpen(false)
      } catch (error: any) {
        console.error("[v0] Error creating lesson:", error)
        console.error("[v0] Error data:", error?.data)
        if (error?.data?.detail) {
          console.error("[v0] Validation errors:", JSON.stringify(error.data.detail, null, 2))
        }
        console.error("[v0] Error status:", error?.status)
        console.error("[v0] Error message:", error?.message)
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Darslar</h1>
            <p className="text-muted-foreground">Darslarni boshqaring</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yangi Dars
          </Button>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">Hozircha darslar yo'q</p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-4" variant="outline">
                Birinchi darsni yaratish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson: any) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {lesson.description || "Tavsif kiritilmagan"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(lesson.createdAt).toLocaleDateString("uz")}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    {lesson.assessmentElements?.map((element: any) => (
                      <div key={element.name} className="flex justify-between">
                        <span className="text-muted-foreground">{element.name}:</span>
                        <span>{element.weight}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi Dars Yaratish</DialogTitle>
              <DialogDescription>Dars ma'lumotlarini kiriting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dars nomi</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Matematika"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tavsif</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Dars haqida qisqacha ma'lumot..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Baholash Elementlari (%)</label>
                <div className="grid grid-cols-3 gap-2">
                  {formData.assessmentElements.map((element, index) => (
                    <div key={element.name} className="space-y-1">
                      <label className="text-xs">{element.name}</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={element.weight}
                        onChange={(e) => {
                          const newElements = [...formData.assessmentElements]
                          newElements[index].weight = Number(e.target.value)
                          setFormData({ ...formData, assessmentElements: newElements })
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Jami: {formData.assessmentElements.reduce((sum, el) => sum + el.weight, 0)}% (100% bo'lishi kerak)
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                  Bekor qilish
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating || formData.assessmentElements.reduce((sum, el) => sum + el.weight, 0) !== 100}
                >
                  {isCreating ? "Yaratilmoqda..." : "Yaratish"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

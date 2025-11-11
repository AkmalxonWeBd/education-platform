"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useGetLessonsQuery } from "@/app/services/lessons-api"
import { useGetUsersQuery } from "@/app/services/users-api"
import { useGetGradesQuery, useCreateGradeMutation, useUpdateGradeMutation } from "@/app/services/grades-api"

export default function GradesPage() {
  const [selectedLesson, setSelectedLesson] = useState<string>("")

  const { data: lessons = [] } = useGetLessonsQuery({})
  const { data: students = [] } = useGetUsersQuery({ role: "student" })
  const { data: grades = [] } = useGetGradesQuery({ lessonId: selectedLesson })
  const [createGrade] = useCreateGradeMutation()
  const [updateGrade] = useUpdateGradeMutation()

  const handleScoreChange = async (studentId: string, lessonId: string, elementType: string, score: number) => {
    const existingGrade = grades.find((g: any) => g.studentId === studentId && g.elementType === elementType)

    try {
      if (existingGrade) {
        await updateGrade({ id: existingGrade.id, data: { score } }).unwrap()
      } else {
        await createGrade({ studentId, lessonId, elementType, score }).unwrap()
      }
    } catch (error) {
      console.error("Error saving grade:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Baholash</h1>
            <p className="text-muted-foreground">O'quvchilarning baholari</p>
          </div>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Hozircha darslar mavjud emas. Avval dars yarating.</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Dars Yaratish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Darsni Tanlang</CardTitle>
                <CardDescription>Baholash uchun darsni tanlang</CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                >
                  <option value="">Darsni tanlang...</option>
                  {lessons.map((lesson: any) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {selectedLesson && students.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>O'quvchi Baholari</CardTitle>
                  <CardDescription>Baholarni kiriting (0-10)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr className="bg-muted">
                          <th className="text-left p-2 font-medium">O'quvchi</th>
                          <th className="text-center p-2 font-medium">Test</th>
                          <th className="text-center p-2 font-medium">Amaliy</th>
                          <th className="text-center p-2 font-medium">Yakuniy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student: any) => (
                          <tr key={student.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{student.name}</td>
                            <td className="text-center p-2">
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                className="w-16 h-8 text-center"
                                onChange={(e) =>
                                  handleScoreChange(
                                    student.id,
                                    selectedLesson,
                                    "test",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                            </td>
                            <td className="text-center p-2">
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                className="w-16 h-8 text-center"
                                onChange={(e) =>
                                  handleScoreChange(
                                    student.id,
                                    selectedLesson,
                                    "practical",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                            </td>
                            <td className="text-center p-2">
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                className="w-16 h-8 text-center"
                                onChange={(e) =>
                                  handleScoreChange(
                                    student.id,
                                    selectedLesson,
                                    "final",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

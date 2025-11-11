"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetTestsQuery, useCreateTestMutation, useDeleteTestMutation } from "@/app/services/tests-api"

export default function TestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    questions: [] as any[],
    currentQuestion: "",
    currentAnswers: ["", "", "", ""],
    correctAnswerIndex: 0,
  })

  const { data: tests = [] } = useGetTestsQuery({})
  const [createTest] = useCreateTestMutation()
  const [deleteTest] = useDeleteTestMutation()

  const handleAddQuestion = () => {
    const newQuestion = {
      question: formData.currentQuestion,
      answers: formData.currentAnswers,
      correctAnswer: formData.currentAnswers[formData.correctAnswerIndex],
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
      currentQuestion: "",
      currentAnswers: ["", "", "", ""],
      correctAnswerIndex: 0,
    })
  }

  const handlePublishTest = async () => {
    try {
      await createTest({
        title: formData.title,
        subject: formData.subject,
        questions: formData.questions,
        status: "published",
      }).unwrap()

      setIsModalOpen(false)
      setFormData({
        title: "",
        subject: "",
        questions: [],
        currentQuestion: "",
        currentAnswers: ["", "", "", ""],
        correctAnswerIndex: 0,
      })
    } catch (error) {
      console.error("Error creating test:", error)
    }
  }

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteTest(testId).unwrap()
    } catch (error) {
      console.error("Error deleting test:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Testlar</h1>
            <p className="text-muted-foreground">Testlarni boshqaring</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yangi Test
          </Button>
        </div>

        {tests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Hozircha testlar mavjud emas. Yangi test yarating.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test: any) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <CardDescription>{test.subject}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Savollar: {test.questions?.length || 0}</p>
                  </div>
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteTest(test.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    O'chirish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yangi Test Yaratish</DialogTitle>
              <DialogDescription>Test ma'lumotlarini kiriting va savollar qo'shing</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test nomi</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Matematika Test 1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fan</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Masalan: Matematika"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Savollarni Qo'shish</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Savol</label>
                  <Input
                    value={formData.currentQuestion}
                    onChange={(e) => setFormData({ ...formData, currentQuestion: e.target.value })}
                    placeholder="Savolingizni kiriting"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Javoblar</label>
                  <div className="space-y-2">
                    {formData.currentAnswers.map((answer, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={formData.correctAnswerIndex === i}
                          onChange={() => setFormData({ ...formData, correctAnswerIndex: i })}
                          className="w-4 h-4"
                        />
                        <Input
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...formData.currentAnswers]
                            newAnswers[i] = e.target.value
                            setFormData({ ...formData, currentAnswers: newAnswers })
                          }}
                          placeholder={`Javob ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  Savolni Qo'shish
                </Button>
              </div>

              {formData.questions.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-medium">Qo'shilgan Savollar ({formData.questions.length})</h3>
                  {formData.questions.map((q, i) => (
                    <div key={i} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-sm">
                        {i + 1}. {q.question}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handlePublishTest} disabled={!formData.title || formData.questions.length === 0}>
                  Nashr Qilish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

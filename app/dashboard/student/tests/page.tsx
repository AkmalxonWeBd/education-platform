"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TestResult {
  id: string
  title: string
  score: number
  maxScore: number
  status: "completed" | "pending" | "failed"
  date: string
}

export default function StudentTestsPage() {
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const [tests, setTests] = useState<TestResult[]>([
    { id: "1", title: "Matematika Test 1", score: 85, maxScore: 100, status: "completed", date: "2025-01-10" },
    { id: "2", title: "Fizika Test 1", score: 72, maxScore: 100, status: "completed", date: "2025-01-12" },
    { id: "3", title: "Kimyo Test 1", score: 0, maxScore: 100, status: "pending", date: "2025-01-15" },
  ])

  const resultData = [
    { name: "Matematika", score: 85 },
    { name: "Fizika", score: 72 },
    { name: "Kimyo", score: 68 },
  ]

  const statusData = [
    { name: "Tugatilgan", value: 2 },
    { name: "Kutilmoqda", value: 1 },
    { name: "Muvaffaqiyatsiz", value: 0 },
  ]

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

  const mockQuestions = [
    {
      id: 1,
      question: "2 + 2 = ?",
      answers: ["3", "4", "5", "6"],
      correctAnswer: "4",
    },
    {
      id: 2,
      question: "Dunyo qaysi sayyora?",
      answers: ["Venera", "Yer", "Mars", "Yupiter"],
      correctAnswer: "Yer",
    },
  ]

  const handleStartTest = (test: TestResult) => {
    if (test.status === "pending") {
      setSelectedTest(test)
      setCurrentQuestion(0)
      setAnswers({})
      setIsTestDialogOpen(true)
    }
  }

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer })
  }

  const handleSubmitTest = () => {
    setTests(
      tests.map((t) =>
        t.id === selectedTest?.id ? { ...t, status: "completed", score: Math.floor(Math.random() * 40) + 60 } : t,
      ),
    )
    setIsTestDialogOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Testlar</h1>
          <p className="text-muted-foreground">Test natijalarini ko'rish</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tugatilgan Testlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-bold">2</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kutilmoqda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-3xl font-bold">1</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">O'rtacha Ball</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="text-3xl font-bold">78.5</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Test Natijalari</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resultData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-bold mb-4">Holati</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Barcha Testlar</h2>
          <div className="space-y-3">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{test.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(test.date).toLocaleDateString("uz")}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {test.status === "completed" ? (
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {test.score}/{test.maxScore}
                          </p>
                          <p className="text-xs text-muted-foreground">Baytildi</p>
                        </div>
                      ) : (
                        <Button onClick={() => handleStartTest(test)}>Boshlash</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTest?.title}</DialogTitle>
              <DialogDescription>
                Savol {currentQuestion + 1} / {mockQuestions.length}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <p className="text-lg font-medium mb-4">{mockQuestions[currentQuestion]?.question}</p>
                <div className="space-y-2">
                  {mockQuestions[currentQuestion]?.answers.map((answer) => (
                    <button
                      key={answer}
                      onClick={() => handleAnswer(answer)}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        answers[currentQuestion] === answer
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                >
                  Orqaga
                </Button>

                {currentQuestion === mockQuestions.length - 1 ? (
                  <Button onClick={handleSubmitTest}>Tugatish</Button>
                ) : (
                  <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>Keyingi</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

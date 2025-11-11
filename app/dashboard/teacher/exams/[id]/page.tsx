"use client"

import { useState, use } from "react"
import { useGetExamsQuery, useAddExamResultMutation } from "@/app/services/exams-api"
import { useGetGroupsQuery } from "@/app/services/groups-api"
import { useGetUsersQuery } from "@/app/services/users-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: exams = [] } = useGetExamsQuery({})
  const { data: groups = [] } = useGetGroupsQuery({})
  const { data: users = [] } = useGetUsersQuery({})
  const [addResult] = useAddExamResultMutation()
  const { toast } = useToast()

  const exam = exams.find((e: any) => e.id === resolvedParams.id)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [options, setOptions] = useState<Array<{ name: string; score: string }>>([{ name: "", score: "" }])

  const examGroups = groups.filter((g: any) => exam?.group_ids?.includes(g.id))
  const students = users.filter(
    (u: any) => u.role === "student" && examGroups.some((g: any) => g.student_ids?.includes(u.id)),
  )

  const handleAddOption = () => {
    setOptions([...options, { name: "", score: "" }])
  }

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleSaveResult = async () => {
    if (!selectedStudent || options.some((o) => !o.name || !o.score)) {
      toast({ title: "Xatolik", description: "Barcha maydonlarni to'ldiring", variant: "destructive" })
      return
    }

    const examOptions = options.map((o) => ({ name: o.name, score: Number.parseFloat(o.score) }))
    const totalScore = examOptions.reduce((sum, o) => sum + o.score, 0)

    try {
      await addResult({
        examId: resolvedParams.id,
        result: {
          student_id: selectedStudent,
          options: examOptions,
          total_score: totalScore,
          exam_date: new Date().toISOString().split("T")[0],
        },
      }).unwrap()

      toast({ title: "Muvaffaqiyatli", description: "Natija saqlandi" })
      setIsModalOpen(false)
      setSelectedStudent("")
      setOptions([{ name: "", score: "" }])
    } catch (error) {
      toast({ title: "Xatolik", description: "Natija saqlashda xatolik", variant: "destructive" })
    }
  }

  if (!exam) return <div className="p-6">Imtihon topilmadi</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{exam.name}</h1>
          <p className="text-muted-foreground">Natijalarni kiriting va statistikalarni ko'ring</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Natija Qo'shish
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Natija Kiritish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>O'quvchi</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Tanlang</option>
                  {students.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Baholash Elementlari</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Nomi (O'qish)"
                      value={option.name}
                      onChange={(e) => {
                        const newOptions = [...options]
                        newOptions[index].name = e.target.value
                        setOptions(newOptions)
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Ball"
                      value={option.score}
                      onChange={(e) => {
                        const newOptions = [...options]
                        newOptions[index].score = e.target.value
                        setOptions(newOptions)
                      }}
                      className="w-24"
                    />
                    {options.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveResult} className="w-full">
                Saqlash
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Imtihon Natijalari</CardTitle>
        </CardHeader>
        <CardContent>
          {exam.results?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Hozircha natijalar yo'q</p>
          ) : (
            <div className="space-y-4">
              {exam.results?.map((result: any, index: number) => {
                const student = users.find((u: any) => u.id === result.student_id)
                return (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{student?.name || "Noma'lum"}</p>
                        <p className="text-sm text-muted-foreground">{result.exam_date}</p>
                      </div>
                      <p className="text-xl font-bold">Jami: {result.total_score}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {result.options?.map((opt: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="text-muted-foreground">{opt.name}:</span>
                          <span className="ml-2 font-medium">{opt.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

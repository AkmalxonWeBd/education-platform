"use client"

import { useState } from "react"
import { useGetExamsQuery, useCreateExamMutation } from "@/app/services/exams-api"
import { useGetGroupsQuery } from "@/app/services/groups-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ClipboardList } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ExamsPage() {
  const { data: exams = [] } = useGetExamsQuery({})
  const { data: groups = [] } = useGetGroupsQuery({})
  const [createExam] = useCreateExamMutation()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [examName, setExamName] = useState("")
  const [frequency, setFrequency] = useState("weekly")
  const [dayOfWeek, setDayOfWeek] = useState("")
  const [dayOfMonth, setDayOfMonth] = useState("")
  const [specificDate, setSpecificDate] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const handleCreateExam = async () => {
    if (!examName || selectedGroups.length === 0) {
      toast({ title: "Xatolik", description: "Barcha maydonlarni to'ldiring", variant: "destructive" })
      return
    }

    try {
      await createExam({
        name: examName,
        frequency,
        day_of_week: frequency === "weekly" ? dayOfWeek : undefined,
        day_of_month: frequency === "monthly" ? Number.parseInt(dayOfMonth) : undefined,
        specific_date: frequency === "yearly" ? specificDate : undefined,
        teacher_id: "",
        group_ids: selectedGroups,
      }).unwrap()

      toast({ title: "Muvaffaqiyatli", description: "Imtihon yaratildi" })
      setIsModalOpen(false)
      setExamName("")
      setSelectedGroups([])
    } catch (error) {
      toast({ title: "Xatolik", description: "Imtihon yaratishda xatolik", variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Imtihonlar</h1>
          <p className="text-muted-foreground">Imtihonlarni boshqarish va natijalarni kiritish</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yangi Imtihon
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi Imtihon Yaratish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Imtihon Nomi</Label>
                <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Masalan: Topik 1" />
              </div>

              <div>
                <Label>Vaqt</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Hafta</SelectItem>
                    <SelectItem value="monthly">Oy</SelectItem>
                    <SelectItem value="yearly">Yil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequency === "weekly" && (
                <div>
                  <Label>Kun</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kunni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Dushanba</SelectItem>
                      <SelectItem value="tuesday">Seshanba</SelectItem>
                      <SelectItem value="wednesday">Chorshanba</SelectItem>
                      <SelectItem value="thursday">Payshanba</SelectItem>
                      <SelectItem value="friday">Juma</SelectItem>
                      <SelectItem value="saturday">Shanba</SelectItem>
                      <SelectItem value="sunday">Yakshanba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === "monthly" && (
                <div>
                  <Label>Oyning Kuni (1-31)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                  />
                </div>
              )}

              {frequency === "yearly" && (
                <div>
                  <Label>Aniq Sana</Label>
                  <Input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} />
                </div>
              )}

              <div>
                <Label>Guruhlar</Label>
                <div className="space-y-2 mt-2">
                  {groups.map((group: any) => (
                    <label key={group.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroups([...selectedGroups, group.id])
                          } else {
                            setSelectedGroups(selectedGroups.filter((id) => id !== group.id))
                          }
                        }}
                      />
                      <span className="text-sm">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleCreateExam} className="w-full">
                Yaratish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Hozircha imtihonlar yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam: any) => (
            <Link key={exam.id} href={`/dashboard/teacher/exams/${exam.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{exam.name}</span>
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Vaqt:{" "}
                      {exam.frequency === "weekly" ? "Haftalik" : exam.frequency === "monthly" ? "Oylik" : "Yillik"}
                    </p>
                    <p>Guruhlar: {exam.group_ids?.length || 0} ta</p>
                    <p>Natijalar: {exam.results?.length || 0} ta</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

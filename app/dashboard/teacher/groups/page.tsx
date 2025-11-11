"use client"

import { useState, useEffect } from "react"
import { useGetGroupsQuery, useCreateGroupMutation, useDeleteGroupMutation } from "@/app/services/groups-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const daysOfWeek = [
  { value: "monday", label: "Dushanba" },
  { value: "tuesday", label: "Seshanba" },
  { value: "wednesday", label: "Chorshanba" },
  { value: "thursday", label: "Payshanba" },
  { value: "friday", label: "Juma" },
  { value: "saturday", label: "Shanba" },
  { value: "sunday", label: "Yakshanba" },
]

export default function GroupsPage() {
  const { data: groups = [], isLoading, refetch } = useGetGroupsQuery({})
  const [createGroup] = useCreateGroupMutation()
  const [deleteGroup] = useDeleteGroupMutation()
  const { toast } = useToast()

  useEffect(() => {
    console.log("[v0] Groups data:", groups)
    console.log("[v0] Groups length:", groups.length)
    console.log("[v0] Is loading:", isLoading)
  }, [groups, isLoading])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [useCustomTimes, setUseCustomTimes] = useState(false)
  const [defaultStartTime, setDefaultStartTime] = useState("14:00")
  const [defaultEndTime, setDefaultEndTime] = useState("16:00")
  const [customTimes, setCustomTimes] = useState<Record<string, { start: string; end: string }>>({})

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleCreateGroup = async () => {
    if (!groupName || selectedDays.length === 0) {
      toast({ title: "Xatolik", description: "Guruh nomi va kunlarni tanlang", variant: "destructive" })
      return
    }

    const schedule = selectedDays.map((day) => ({
      day,
      start_time: useCustomTimes ? customTimes[day]?.start || defaultStartTime : defaultStartTime,
      end_time: useCustomTimes ? customTimes[day]?.end || defaultEndTime : defaultEndTime,
    }))

    console.log("[v0] Creating group:", { name: groupName, description, schedule })

    try {
      const result = await createGroup({
        name: groupName,
        description,
        schedule,
        teacher_id: "",
      }).unwrap()

      console.log("[v0] Group created successfully:", result)

      toast({ title: "Muvaffaqiyatli", description: "Guruh yaratildi" })
      refetch()
      setIsModalOpen(false)
      setGroupName("")
      setDescription("")
      setSelectedDays([])
      setCustomTimes({})
    } catch (error: any) {
      console.error("[v0] Error creating group:", error)
      console.error("[v0] Error data:", error?.data)
      toast({
        title: "Xatolik",
        description: error?.data?.detail || "Guruh yaratishda xatolik",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Guruhni o'chirmoqchimisiz?")) return

    try {
      await deleteGroup(id).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Guruh o'chirildi" })
    } catch (error) {
      toast({ title: "Xatolik", description: "Guruh o'chirishda xatolik", variant: "destructive" })
    }
  }

  if (isLoading) return <div>Yuklanmoqda...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Guruhlar</h1>
          <p className="text-muted-foreground">O'quvchilarni guruhlarga ajrating</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yangi Guruh
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yangi Guruh Yaratish</DialogTitle>
              <DialogDescription>Guruh nomini, dars kunlarini va vaqtlarini belgilang</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Guruh Nomi</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Masalan: Du-Cho-Ju 14:00"
                />
              </div>

              <div>
                <Label>Tavsif</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Guruh haqida qisqacha"
                />
              </div>

              <div>
                <Label>Dars Kunlari</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? "default" : "outline"}
                      onClick={() => handleDayToggle(day.value)}
                      className="w-full"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedDays.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useCustomTimes}
                      onChange={(e) => setUseCustomTimes(e.target.checked)}
                      id="custom-times"
                    />
                    <Label htmlFor="custom-times">Har bir kun uchun alohida vaqt</Label>
                  </div>

                  {!useCustomTimes ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Boshlanish vaqti</Label>
                        <Input
                          type="time"
                          value={defaultStartTime}
                          onChange={(e) => setDefaultStartTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Tugash vaqti</Label>
                        <Input type="time" value={defaultEndTime} onChange={(e) => setDefaultEndTime(e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDays.map((day) => {
                        const dayLabel = daysOfWeek.find((d) => d.value === day)?.label
                        return (
                          <div key={day} className="grid grid-cols-3 gap-2 items-center">
                            <Label>{dayLabel}</Label>
                            <Input
                              type="time"
                              value={customTimes[day]?.start || defaultStartTime}
                              onChange={(e) =>
                                setCustomTimes((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], start: e.target.value },
                                }))
                              }
                            />
                            <Input
                              type="time"
                              value={customTimes[day]?.end || defaultEndTime}
                              onChange={(e) =>
                                setCustomTimes((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], end: e.target.value },
                                }))
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              <Button onClick={handleCreateGroup} className="w-full">
                Guruh Yaratish
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Hozircha guruhlar yo'q</p>
            <p className="text-sm text-muted-foreground">Yangi guruh yarating</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group: any) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{group.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardTitle>
                <CardDescription>{group.description || "Tavsif yo'q"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{group.student_ids?.length || 0} ta o'quvchi</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {group.schedule?.map((s: any, i: number) => (
                      <div key={i}>
                        {daysOfWeek.find((d) => d.value === s.day)?.label}: {s.start_time} - {s.end_time}
                      </div>
                    ))}
                  </div>
                  <Link href={`/dashboard/teacher/groups/${group.id}`}>
                    <Button variant="outline" className="w-full mt-2 bg-transparent">
                      Batafsil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

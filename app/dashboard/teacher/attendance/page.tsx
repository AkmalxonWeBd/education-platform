"use client"

import { useGetAttendancesQuery, useUpdateAttendanceMutation } from "@/app/services/attendances-api"
import { useGetGroupsQuery } from "@/app/services/groups-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TeacherAttendancePage() {
  const { data: attendances = [] } = useGetAttendancesQuery({})
  const { data: groups = [] } = useGetGroupsQuery({})
  const [updateAttendance] = useUpdateAttendanceMutation()
  const { toast } = useToast()

  const handleApprove = async (id: string) => {
    try {
      await updateAttendance({ id, status: "approved" }).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Davomat tasdiqlandi" })
    } catch (error) {
      toast({ title: "Xatolik", description: "Davomat tasdiqlashda xatolik", variant: "destructive" })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await updateAttendance({ id, status: "absent" }).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Davomat rad etildi" })
    } catch (error) {
      toast({ title: "Xatolik", description: "Davomat rad etishda xatolik", variant: "destructive" })
    }
  }

  const pendingAttendances = attendances.filter((a: any) => a.status === "pending")
  const approvedCount = attendances.filter((a: any) => a.status === "approved").length
  const absentCount = attendances.filter((a: any) => a.status === "absent").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Davomat Boshqaruvi</h1>
        <p className="text-muted-foreground">O'quvchilar davomatini tasdiqlang</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kutilmoqda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-3xl font-bold">{pendingAttendances.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasdiqlangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-3xl font-bold">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kelmagan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-3xl font-bold">{absentCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasdiqlanishi Kerak Bo'lganlar</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAttendances.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Tasdiqlanishi kerak bo'lgan davomat yo'q</p>
          ) : (
            <div className="space-y-3">
              {pendingAttendances.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">O'quvchi ID: {record.student_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.lesson_date} - {record.lesson_time}
                      </p>
                      <p className="text-xs text-muted-foreground">Kelgan vaqti: {record.check_in_time}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(record.id)}
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rad etish
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(record.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Tasdiqlash
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

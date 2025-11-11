"use client"
import { useGetGroupsQuery } from "@/app/services/groups-api"
import { useGetAttendancesQuery, useCreateAttendanceMutation } from "@/app/services/attendances-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAppSelector } from "@/app/hooks"
import { useToast } from "@/hooks/use-toast"

export default function AttendancePage() {
  const { user } = useAppSelector((state) => state.auth)
  const { data: groups = [] } = useGetGroupsQuery({})
  const { data: attendances = [] } = useGetAttendancesQuery({})
  const [createAttendance] = useCreateAttendanceMutation()
  const { toast } = useToast()

  const userGroup = groups.find((g: any) => g.student_ids?.includes(user?.id))

  const handleMarkAttendance = async () => {
    if (!userGroup) {
      toast({ title: "Xatolik", description: "Sizda guruh topilmadi", variant: "destructive" })
      return
    }

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().split(" ")[0].substring(0, 5)

    try {
      await createAttendance({
        student_id: user?.id,
        group_id: userGroup.id,
        lesson_date: today,
        lesson_time: currentTime,
        check_in_time: currentTime,
        status: "pending",
      }).unwrap()

      toast({
        title: "Muvaffaqiyatli",
        description: "Davomat so'rovi yuborildi. O'qituvchi tasdiqlashini kuting.",
      })
    } catch (error) {
      toast({ title: "Xatolik", description: "Davomat belgilashda xatolik", variant: "destructive" })
    }
  }

  const approvedCount = attendances.filter((a: any) => a.status === "approved").length
  const pendingCount = attendances.filter((a: any) => a.status === "pending").length
  const absentCount = attendances.filter((a: any) => a.status === "absent").length
  const totalCount = attendances.length || 1
  const percentage = Math.round((approvedCount / totalCount) * 100)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Davomat</h1>
        <p className="text-muted-foreground">Davomatni belgilang va statistikani ko'ring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Davomati</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{percentage}%</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Kutilmoqda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <p className="text-3xl font-bold">{pendingCount}</p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Men Keldim</CardTitle>
              <CardDescription>Darsga kelganingizni belgilang</CardDescription>
            </div>
            <Button onClick={handleMarkAttendance}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Men Keldim
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Davomat Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Hozircha davomat yo'q</p>
          ) : (
            <div className="space-y-3">
              {attendances.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{record.lesson_date}</p>
                      <p className="text-xs text-muted-foreground">{record.lesson_time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {record.status === "approved" && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Tasdiqlangan</span>
                      </>
                    )}
                    {record.status === "pending" && (
                      <>
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-600">Kutilmoqda</span>
                      </>
                    )}
                    {record.status === "absent" && (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Kelmagan</span>
                      </>
                    )}
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

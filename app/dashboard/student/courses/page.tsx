"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CourseProgress {
  id: string
  title: string
  description: string
  videosTotal: number
  videosWatched: number
  progress: number
  videos: Array<{
    id: string
    title: string
    duration: number
    watched: boolean
  }>
}

export default function StudentCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  const [courses] = useState<CourseProgress[]>([
    {
      id: "1",
      title: "Matematika Asoslari",
      description: "Boshlang'ich matematika tushunchalari",
      videosTotal: 5,
      videosWatched: 3,
      progress: 60,
      videos: [
        { id: "1", title: "Sonlar", duration: 15, watched: true },
        { id: "2", title: "Qo'shish", duration: 12, watched: true },
        { id: "3", title: "Ayirish", duration: 14, watched: true },
        { id: "4", title: "Ko'paytirish", duration: 16, watched: false },
        { id: "5", title: "Bo'lish", duration: 13, watched: false },
      ],
    },
    {
      id: "2",
      title: "Ingliz Tili Elementlari",
      description: "Ingliz tilining asosiy qoidalari",
      videosTotal: 8,
      videosWatched: 4,
      progress: 50,
      videos: [
        { id: "1", title: "Alfabet", duration: 10, watched: true },
        { id: "2", title: "Saylovlar", duration: 12, watched: true },
        { id: "3", title: "Sonlar", duration: 11, watched: true },
        { id: "4", title: "Mehnati", duration: 13, watched: true },
        { id: "5", title: "Buyumlar", duration: 12, watched: false },
        { id: "6", title: "Ranglar", duration: 9, watched: false },
        { id: "7", title: "Oila", duration: 14, watched: false },
        { id: "8", title: "Kundalik Gaplar", duration: 15, watched: false },
      ],
    },
    {
      id: "3",
      title: "Biologiya Tahlili",
      description: "Organizmlar va tarqatuvchilar",
      videosTotal: 6,
      videosWatched: 1,
      progress: 16,
      videos: [
        { id: "1", title: "Hujayra Haqida", duration: 18, watched: true },
        { id: "2", title: "Mitoz va Mayoz", duration: 20, watched: false },
        { id: "3", title: "Genetika", duration: 22, watched: false },
        { id: "4", title: "Evolyutsiya", duration: 19, watched: false },
        { id: "5", title: "Ekologiya", duration: 21, watched: false },
        { id: "6", title: "Organizmlar O'rtasidagi Aloqa", duration: 17, watched: false },
      ],
    },
  ])

  const handlePlayVideo = (video: any, course: CourseProgress) => {
    setSelectedVideo(video)
    setSelectedCourse(course)
    setIsPlayerOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mening Kurslarim</h1>
          <p className="text-muted-foreground">O'quv kurslarini ko'rish va o'qish</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {course.videosWatched}/{course.videosTotal}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedCourse(course)}>
                  <Play className="w-4 h-4 mr-2" />
                  Kursni Ko'rish
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCourse && !isPlayerOpen && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>{selectedCourse.title}</CardTitle>
              <CardDescription>
                {selectedCourse.videosWatched} / {selectedCourse.videosTotal} video ko'rildi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedCourse.videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => handlePlayVideo(video, selectedCourse)}
                  >
                    {video.watched ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Play className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${video.watched ? "text-muted-foreground" : ""}`}>
                        {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{video.duration} minut</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
              <DialogDescription>
                {selectedCourse?.title} - {selectedVideo?.duration} minut
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Video Player Placeholder</p>
                  <p className="text-white/60 text-xs mt-1">{selectedVideo?.duration} minut davomiylik</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Video Haqida</h3>
                <p className="text-sm text-muted-foreground">
                  Bu videoda {selectedVideo?.title} mavzusi bo'yicha to'liq ma'lumot olasiz.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Orqaga
                </Button>
                <Button className="flex-1" onClick={() => setIsPlayerOpen(false)}>
                  Yopish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useGetVideoCourseByIdQuery,
  useAddVideoToCourseMutation,
  useDeleteVideoFromCourseMutation,
  useAddQuizToVideoMutation,
  useDeleteQuizFromVideoMutation,
} from "@/app/services/video-courses-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Quiz {
  question: string
  answers: { text: string; is_correct: boolean }[]
}

interface Video {
  id: string
  title: string
  description: string
  url: string
  quizzes: Quiz[]
}

export default function VideoCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string

  const { data: course, isLoading, refetch } = useGetVideoCourseByIdQuery(courseId)
  const [addVideo] = useAddVideoToCourseMutation()
  const [deleteVideo] = useDeleteVideoFromCourseMutation()
  const [addQuiz] = useAddQuizToVideoMutation()
  const [deleteQuiz] = useDeleteQuizFromVideoMutation()

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [videoForm, setVideoForm] = useState({ title: "", description: "", url: "" })
  const [quizForm, setQuizForm] = useState<Quiz>({ question: "", answers: [{ text: "", is_correct: false }] })

  if (isLoading) {
    return <div className="p-6">Yuklanmoqda...</div>
  }

  if (!course) {
    return <div className="p-6">Kurs topilmadi</div>
  }

  const videos: Video[] = course.videos || []

  const handleAddVideo = () => {
    setVideoForm({ title: "", description: "", url: "" })
    setCurrentVideo(null)
    setIsVideoModalOpen(true)
  }

  const handleSaveVideo = async () => {
    if (!videoForm.title || !videoForm.url) {
      toast({ title: "Xatolik", description: "Barcha maydonlarni to'ldiring", variant: "destructive" })
      return
    }

    const newVideo = {
      title: videoForm.title,
      description: videoForm.description,
      video_url: videoForm.url,
    }

    try {
      await addVideo({ courseId, video: newVideo }).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Video saqlandi" })
      setIsVideoModalOpen(false)
      refetch()
    } catch (error) {
      toast({ title: "Xatolik", description: "Video saqlanmadi", variant: "destructive" })
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideo({ courseId, videoId }).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Video o'chirildi" })
      refetch()
    } catch (error) {
      toast({ title: "Xatolik", description: "Video o'chirilmadi", variant: "destructive" })
    }
  }

  const handleAddQuiz = (video: Video) => {
    setCurrentVideo(video)
    setQuizForm({ question: "", answers: [{ text: "", is_correct: false }] })
    setIsQuizModalOpen(true)
  }

  const handleSaveQuiz = async () => {
    if (!currentVideo || !quizForm.question || quizForm.answers.length === 0) {
      toast({ title: "Xatolik", description: "Savol va javoblarni kiriting", variant: "destructive" })
      return
    }

    const hasCorrectAnswer = quizForm.answers.some((a) => a.is_correct)
    if (!hasCorrectAnswer) {
      toast({ title: "Xatolik", description: "Kamida bitta to'g'ri javob belgilang", variant: "destructive" })
      return
    }

    const hasEmptyAnswers = quizForm.answers.some((a) => !a.text.trim())
    if (hasEmptyAnswers) {
      toast({ title: "Xatolik", description: "Barcha javoblarni to'ldiring", variant: "destructive" })
      return
    }

    try {
      await addQuiz({
        courseId,
        videoId: currentVideo.id,
        quiz: quizForm,
      }).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Test saqlandi" })
      setIsQuizModalOpen(false)
      setQuizForm({ question: "", answers: [{ text: "", is_correct: false }] })
      refetch()
    } catch (error) {
      toast({ title: "Xatolik", description: "Test saqlanmadi", variant: "destructive" })
    }
  }

  const handleAddAnswer = () => {
    setQuizForm({
      ...quizForm,
      answers: [...quizForm.answers, { text: "", is_correct: false }],
    })
  }

  const handleRemoveAnswer = (index: number) => {
    setQuizForm({
      ...quizForm,
      answers: quizForm.answers.filter((_, i) => i !== index),
    })
  }

  const handleAnswerChange = (index: number, field: "text" | "is_correct", value: string | boolean) => {
    const updatedAnswers = quizForm.answers.map((answer, i) => {
      if (i === index) {
        return { ...answer, [field]: value }
      }
      // If setting this answer as correct, uncheck others
      if (field === "is_correct" && value === true) {
        return { ...answer, is_correct: false }
      }
      return answer
    })
    setQuizForm({ ...quizForm, answers: updatedAnswers })
  }

  const handleDeleteQuiz = async (video: Video, quizIndex: number) => {
    try {
      await deleteQuiz({ courseId, videoId: video.id, quizIndex }).unwrap()
      toast({ title: "Muvaffaqiyatli", description: "Test o'chirildi" })
      refetch()
    } catch (error) {
      toast({ title: "Xatolik", description: "Test o'chirilmadi", variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Videolar</CardTitle>
              <CardDescription>Kursga videolar qo'shing va testlar yarating</CardDescription>
            </div>
            <Button onClick={handleAddVideo}>
              <Plus className="h-4 w-4 mr-2" />
              Video Qo'shish
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Hali videolar yo'q</p>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <Card key={video.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{video.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                        <p className="text-xs text-muted-foreground">URL: {video.url}</p>
                        <p className="text-xs text-muted-foreground mt-2">Testlar: {video.quizzes?.length || 0}</p>
                        {video.quizzes && video.quizzes.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {video.quizzes.map((quiz, idx) => (
                              <div key={idx} className="bg-muted p-2 rounded text-xs flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{quiz.question}</p>
                                  <p className="text-muted-foreground mt-1">{quiz.answers.length} javob</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteQuiz(video, idx)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAddQuiz(video)}>
                          Test Qo'shish
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(video.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentVideo ? "Videoni Tahrirlash" : "Yangi Video"}</DialogTitle>
            <DialogDescription>Video ma'lumotlarini kiriting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Video Nomi</Label>
              <Input
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="Video nomi"
              />
            </div>
            <div>
              <Label>Tavsifi</Label>
              <Textarea
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                placeholder="Video tavsifi"
              />
            </div>
            <div>
              <Label>Video URL (YouTube, Server link va boshqalar)</Label>
              <Input
                value={videoForm.url}
                onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveVideo} className="flex-1">
                Saqlash
              </Button>
              <Button variant="outline" onClick={() => setIsVideoModalOpen(false)} className="flex-1">
                Bekor Qilish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQuizModalOpen} onOpenChange={setIsQuizModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Qo'shish</DialogTitle>
            <DialogDescription>Video uchun viktorina yarating</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Savol</Label>
              <Textarea
                value={quizForm.question}
                onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                placeholder="Savolni kiriting"
              />
            </div>
            <div className="space-y-3">
              <Label>Javoblar</Label>
              {quizForm.answers.map((answer, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="checkbox"
                    checked={answer.is_correct}
                    onChange={(e) => handleAnswerChange(index, "is_correct", e.target.checked)}
                    className="mt-2"
                  />
                  <Input
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, "text", e.target.value)}
                    placeholder={`Javob ${index + 1}`}
                    className="flex-1"
                  />
                  {quizForm.answers.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAnswer(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={handleAddAnswer} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Javob Qo'shish
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveQuiz} className="flex-1">
                Testni Saqlash
              </Button>
              <Button variant="outline" onClick={() => setIsQuizModalOpen(false)} className="flex-1">
                Bekor Qilish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Video {
  id: string
  title: string
  description: string
  url: string
  duration: number
  testId?: string
}

export interface Course {
  id: string
  title: string
  description: string
  isPaid: boolean
  groupIds: string[]
  videos: Video[]
  createdAt: string
}

export interface CourseProgress {
  id: string
  courseId: string
  studentId: string
  videosWatched: string[]
  testsCompleted: string[]
  progress: number
}

export const coursesApi = createApi({
  reducerPath: "coursesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Course", "CourseProgress"],
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => "/courses",
      providesTags: ["Course"],
    }),
    createCourse: builder.mutation<Course, Partial<Course>>({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    getCourseProgress: builder.query<CourseProgress, { courseId: string; studentId: string }>({
      query: ({ courseId, studentId }) => `/courses/${courseId}/progress/${studentId}`,
      providesTags: ["CourseProgress"],
    }),
    updateCourseProgress: builder.mutation<
      CourseProgress,
      { courseId: string; studentId: string; data: Partial<CourseProgress> }
    >({
      query: ({ courseId, studentId, data }) => ({
        url: `/courses/${courseId}/progress/${studentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CourseProgress"],
    }),
  }),
})

export const {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useGetCourseProgressQuery,
  useUpdateCourseProgressMutation,
} = coursesApi

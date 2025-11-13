import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "http://64.227.77.236:8000/api"

export interface Lesson {
  id: string
  title: string
  groupId: string
  date: string
  time: string
  subject: string
  teacherId: string
  createdAt: string
}

export const lessonsApi = createApi({
  reducerPath: "lessonsApi",
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
  tagTypes: ["Lesson"],
  endpoints: (builder) => ({
    getLessons: builder.query<Lesson[], { groupId?: string; teacherId?: string }>({
      query: (params) => ({
        url: "/lessons",
        params,
      }),
      providesTags: ["Lesson"],
    }),
    createLesson: builder.mutation<Lesson, Partial<Lesson>>({
      query: (data) => ({
        url: "/lessons",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lesson"],
    }),
    updateLesson: builder.mutation<Lesson, { id: string; data: Partial<Lesson> }>({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Lesson"],
    }),
    deleteLesson: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lesson"],
    }),
  }),
})

export const { useGetLessonsQuery, useCreateLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation } =
  lessonsApi

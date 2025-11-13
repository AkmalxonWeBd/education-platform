import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "http://64.227.77.236:8000/api"

export interface Grade {
  id: string
  studentId: string
  lessonId: string
  score: number
  element: string
  status: "graded" | "pending"
  createdAt: string
}

export const gradesApi = createApi({
  reducerPath: "gradesApi",
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
  tagTypes: ["Grade"],
  endpoints: (builder) => ({
    getGrades: builder.query<Grade[], { studentId?: string; lessonId?: string }>({
      query: (params) => ({
        url: "/grades",
        params,
      }),
      providesTags: ["Grade"],
    }),
    createGrade: builder.mutation<Grade, Partial<Grade>>({
      query: (data) => ({
        url: "/grades",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Grade"],
    }),
    updateGrade: builder.mutation<Grade, { id: string; data: Partial<Grade> }>({
      query: ({ id, data }) => ({
        url: `/grades/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Grade"],
    }),
  }),
})

export const { useGetGradesQuery, useCreateGradeMutation, useUpdateGradeMutation } = gradesApi

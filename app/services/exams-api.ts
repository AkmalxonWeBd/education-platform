import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "http://64.227.77.236:8000/api"

export const examsApi = createApi({
  reducerPath: "examsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token")
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ["Exams"],
  endpoints: (builder) => ({
    getExams: builder.query({
      query: () => "/exams",
      providesTags: ["Exams"],
    }),
    createExam: builder.mutation({
      query: (exam) => ({
        url: "/exams",
        method: "POST",
        body: exam,
      }),
      invalidatesTags: ["Exams"],
    }),
    addExamResult: builder.mutation({
      query: ({ examId, result }) => ({
        url: `/exams/${examId}/results`,
        method: "POST",
        body: result,
      }),
      invalidatesTags: ["Exams"],
    }),
  }),
})

export const { useGetExamsQuery, useCreateExamMutation, useAddExamResultMutation } = examsApi

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "http://64.227.77.236:8000/api"

export interface Question {
  id: string
  question: string
  answers: string[]
  correctAnswer: string
  points: number
}

export interface Test {
  id: string
  title: string
  groupId: string
  subject: string
  questions: Question[]
  scheduledDate?: string
  status: "draft" | "published"
  createdAt: string
}

export interface TestResult {
  id: string
  testId: string
  studentId: string
  score: number
  totalPoints: number
  status: "completed" | "pending"
  createdAt: string
}

export const testsApi = createApi({
  reducerPath: "testsApi",
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
  tagTypes: ["Test", "TestResult"],
  endpoints: (builder) => ({
    getTests: builder.query<Test[], { groupId?: string }>({
      query: (params) => ({
        url: "/tests",
        params,
      }),
      providesTags: ["Test"],
    }),
    createTest: builder.mutation<Test, Partial<Test>>({
      query: (data) => ({
        url: "/tests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Test"],
    }),
    updateTest: builder.mutation<Test, { id: string; data: Partial<Test> }>({
      query: ({ id, data }) => ({
        url: `/tests/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Test"],
    }),
    getTestResults: builder.query<TestResult[], { testId?: string; studentId?: string }>({
      query: (params) => ({
        url: "/tests/results",
        params,
      }),
      providesTags: ["TestResult"],
    }),
    submitTestResult: builder.mutation<TestResult, Partial<TestResult>>({
      query: (data) => ({
        url: "/tests/results",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TestResult"],
    }),
    deleteTest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Test"],
    }),
  }),
})

export const {
  useGetTestsQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useGetTestResultsQuery,
  useSubmitTestResultMutation,
  useDeleteTestMutation,
} = testsApi

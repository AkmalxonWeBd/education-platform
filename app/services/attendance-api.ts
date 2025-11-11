import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Attendance {
  id: string
  studentId: string
  date: string
  status: "present" | "absent"
  photo?: string
  similarity?: number
  createdAt: string
}

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
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
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAttendance: builder.query<Attendance[], { studentId?: string; date?: string }>({
      query: (params) => ({
        url: "/attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),
    recordAttendance: builder.mutation<Attendance, Partial<Attendance>>({
      query: (data) => ({
        url: "/attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
})

export const { useGetAttendanceQuery, useRecordAttendanceMutation } = attendanceApi

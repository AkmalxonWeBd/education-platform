import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "http://64.227.77.236:8000/api"

export const attendancesApi = createApi({
  reducerPath: "attendancesApi",
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
  tagTypes: ["Attendances"],
  endpoints: (builder) => ({
    getAttendances: builder.query({
      query: () => "/attendances",
      providesTags: ["Attendances"],
    }),
    createAttendance: builder.mutation({
      query: (attendance) => ({
        url: "/attendances",
        method: "POST",
        body: attendance,
      }),
      invalidatesTags: ["Attendances"],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, ...update }) => ({
        url: `/attendances/${id}`,
        method: "PUT",
        body: update,
      }),
      invalidatesTags: ["Attendances"],
    }),
  }),
})

export const { useGetAttendancesQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation } = attendancesApi

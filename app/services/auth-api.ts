import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" || "http://64.227.77.236:8000/api"

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export const authApi = createApi({
  reducerPath: "authApi",
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
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation<{ success: boolean }, { email: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const { useLoginMutation, useResetPasswordMutation } = authApi

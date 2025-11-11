import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const chatsApi = createApi({
  reducerPath: "chatsApi",
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
  tagTypes: ["Chats"],
  endpoints: (builder) => ({
    getConversation: builder.query({
      query: (userId) => `/chats/conversations/${userId}`,
      providesTags: ["Chats"],
    }),
    sendMessage: builder.mutation({
      query: (message) => ({
        url: "/chats",
        method: "POST",
        body: message,
      }),
      invalidatesTags: ["Chats"],
    }),
    getUnreadCount: builder.query({
      query: () => "/chats/unread",
    }),
  }),
})

export const { useGetConversationQuery, useSendMessageMutation, useGetUnreadCountQuery } = chatsApi

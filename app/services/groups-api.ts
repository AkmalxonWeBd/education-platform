import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const groupsApi = createApi({
  reducerPath: "groupsApi",
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
  tagTypes: ["Groups"],
  endpoints: (builder) => ({
    getGroups: builder.query({
      query: () => "/groups",
      providesTags: ["Groups"],
    }),
    createGroup: builder.mutation({
      query: (group) => ({
        url: "/groups",
        method: "POST",
        body: group,
      }),
      invalidatesTags: ["Groups"],
    }),
    updateGroup: builder.mutation({
      query: ({ id, ...group }) => ({
        url: `/groups/${id}`,
        method: "PUT",
        body: group,
      }),
      invalidatesTags: ["Groups"],
    }),
    deleteGroup: builder.mutation({
      query: (id) => ({
        url: `/groups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Groups"],
    }),
    addStudentToGroup: builder.mutation({
      query: ({ groupId, studentId }) => ({
        url: `/groups/${groupId}/students/${studentId}`,
        method: "POST",
      }),
      invalidatesTags: ["Groups"],
    }),
    removeStudentFromGroup: builder.mutation({
      query: ({ groupId, studentId }) => ({
        url: `/groups/${groupId}/students/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Groups"],
    }),
  }),
})

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useAddStudentToGroupMutation,
  useRemoveStudentFromGroupMutation,
} = groupsApi

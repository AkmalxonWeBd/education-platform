import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export const videoCoursesApi = createApi({
  reducerPath: "videoCoursesApi",
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
  tagTypes: ["VideoCourses"],
  endpoints: (builder) => ({
    getVideoCourses: builder.query({
      query: () => "/video-courses",
      providesTags: ["VideoCourses"],
    }),
    getVideoCourseById: builder.query({
      query: (id) => `/video-courses/${id}`,
      providesTags: ["VideoCourses"],
    }),
    createVideoCourse: builder.mutation({
      query: (course) => ({
        url: "/video-courses",
        method: "POST",
        body: course,
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    updateVideoCourse: builder.mutation({
      query: ({ id, ...course }) => ({
        url: `/video-courses/${id}`,
        method: "PUT",
        body: course,
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    deleteVideoCourse: builder.mutation({
      query: (id) => ({
        url: `/video-courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    addVideoToCourse: builder.mutation({
      query: ({ courseId, video }) => ({
        url: `/video-courses/${courseId}/videos`,
        method: "POST",
        body: video,
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    deleteVideoFromCourse: builder.mutation({
      query: ({ courseId, videoId }) => ({
        url: `/video-courses/${courseId}/videos/${videoId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    addQuizToVideo: builder.mutation({
      query: ({ courseId, videoId, quiz }) => ({
        url: `/video-courses/${courseId}/videos/${videoId}/quizzes`,
        method: "POST",
        body: quiz,
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    deleteQuizFromVideo: builder.mutation({
      query: ({ courseId, videoId, quizIndex }) => ({
        url: `/video-courses/${courseId}/videos/${videoId}/quizzes/${quizIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VideoCourses"],
    }),
    requestCourseAccess: builder.mutation({
      query: (courseId) => ({
        url: `/video-courses/${courseId}/request-access`,
        method: "POST",
      }),
    }),
  }),
})

export const {
  useGetVideoCoursesQuery,
  useGetVideoCourseByIdQuery,
  useCreateVideoCourseMutation,
  useUpdateVideoCourseMutation,
  useDeleteVideoCourseMutation,
  useAddVideoToCourseMutation,
  useDeleteVideoFromCourseMutation,
  useAddQuizToVideoMutation,
  useDeleteQuizFromVideoMutation,
  useRequestCourseAccessMutation,
} = videoCoursesApi

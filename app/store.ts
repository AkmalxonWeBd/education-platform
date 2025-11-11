import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/auth-slice"
import usersReducer from "./slices/users-slice"
import { usersApi } from "./services/users-api"
import { authApi } from "./services/auth-api"
import { lessonsApi } from "./services/lessons-api"
import { gradesApi } from "./services/grades-api"
import { testsApi } from "./services/tests-api"
import { coursesApi } from "./services/courses-api"
import { attendanceApi } from "./services/attendance-api"
import { groupsApi } from "./services/groups-api"
import { videoCoursesApi } from "./services/video-courses-api"
import { examsApi } from "./services/exams-api"
import { chatsApi } from "./services/chats-api"
import { attendancesApi } from "./services/attendances-api"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [lessonsApi.reducerPath]: lessonsApi.reducer,
    [gradesApi.reducerPath]: gradesApi.reducer,
    [testsApi.reducerPath]: testsApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [groupsApi.reducerPath]: groupsApi.reducer,
    [videoCoursesApi.reducerPath]: videoCoursesApi.reducer,
    [examsApi.reducerPath]: examsApi.reducer,
    [chatsApi.reducerPath]: chatsApi.reducer,
    [attendancesApi.reducerPath]: attendancesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApi.middleware,
      authApi.middleware,
      lessonsApi.middleware,
      gradesApi.middleware,
      testsApi.middleware,
      coursesApi.middleware,
      attendanceApi.middleware,
      groupsApi.middleware,
      videoCoursesApi.middleware,
      examsApi.middleware,
      chatsApi.middleware,
      attendancesApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

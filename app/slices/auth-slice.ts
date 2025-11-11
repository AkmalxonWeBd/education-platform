import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface AuthState {
  token: string | null
  user: {
    id: string
    email: string
    name: string
    role: "super-admin" | "school-admin" | "teacher" | "student" | "parent"
  } | null
  isLoading: boolean
  error: string | null
}

const loadInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        return {
          token,
          user,
          isLoading: false,
          error: null,
        }
      } catch (e) {
        console.error("[v0] Failed to parse user from localStorage:", e)
      }
    }
  }

  return {
    token: null,
    user: null,
    isLoading: false,
    error: null,
  }
}

const initialState: AuthState = loadInitialState()

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload
      if (typeof window !== "undefined" && action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload))
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload)
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setUser, setToken, logout, setLoading, setError } = authSlice.actions
export default authSlice.reducer

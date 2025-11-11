"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "./store"

export default function Home() {
  const router = useRouter()
  const { user, token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (token && user) {
      // Redirect based on role
      router.push(`/dashboard/${user.role}`)
    } else {
      router.push("/auth/login")
    }
  }, [token, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <p className="mt-4 text-foreground">Yuklanmoqda...</p>
      </div>
    </div>
  )
}

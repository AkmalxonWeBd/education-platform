"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { useLoginMutation } from "@/app/services/auth-api"
import { setUser, setToken } from "@/app/slices/auth-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [login, { isLoading }] = useLoginMutation()

  const getRolePath = (role: string) => {
    return role.replace(/_/g, "-")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await login({ email, password }).unwrap()

      dispatch(setToken(response.token))
      dispatch(setUser(response.user as any))

      const rolePath = getRolePath(response.user.role)
      router.push(`/dashboard/${rolePath}`)
    } catch (err: any) {
      setError(err?.data?.message || "Kirish muvaffaqiyatsiz. Tekshiring emailingiz va parolingiz.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">O'quv Platformasi</h1>
          <p className="text-muted-foreground">Ta'lim va rivojlanishning yo'li</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Hisobingizga kirish</CardTitle>
            <CardDescription>Email va parolingizni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Parol
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Parolingiz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Yuklanmoqda..." : "Kirish"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Default login:</p>
              <div className="text-xs space-y-1 font-mono">
                <p>
                  <strong>Email:</strong> admin@education.uz
                </p>
                <p>
                  <strong>Parol:</strong> admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

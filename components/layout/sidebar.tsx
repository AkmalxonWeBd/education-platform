"use client"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { logout } from "@/app/slices/auth-slice"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Video,
  Calendar,
  LogOut,
  Menu,
  GraduationCap,
  ClipboardList,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"

const menuItems = {
  super_admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/super-admin" },
    { label: "Maktab Adminlar", icon: Users, href: "/dashboard/super-admin/admins" },
  ],
  school_admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/school-admin" },
    { label: "O'qituvchilar", icon: GraduationCap, href: "/dashboard/school-admin/teachers" },
  ],
  teacher: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/teacher" },
    { label: "Guruhlar", icon: Users, href: "/dashboard/teacher/groups" },
    { label: "Video Darsliklar", icon: Video, href: "/dashboard/teacher/video-courses" },
    { label: "Imtihonlar", icon: ClipboardList, href: "/dashboard/teacher/exams" },
    { label: "Davomat", icon: Calendar, href: "/dashboard/teacher/attendance" },
    { label: "Xabarlar", icon: MessageSquare, href: "/dashboard/teacher/chats" },
  ],
  student: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/student" },
    { label: "Video Darsliklar", icon: Video, href: "/dashboard/student/video-courses" },
    { label: "Imtihonlar", icon: ClipboardList, href: "/dashboard/student/exams" },
    { label: "Davomat", icon: Calendar, href: "/dashboard/student/attendance" },
    { label: "Xabarlar", icon: MessageSquare, href: "/dashboard/student/chats" },
  ],
  parent: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/parent" },
    { label: "Xabarlar", icon: MessageSquare, href: "/dashboard/parent/chats" },
  ],
}

export function Sidebar() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    router.push("/auth/login")
  }

  if (!mounted || !user) {
    return null
  }

  const items = menuItems[user.role as keyof typeof menuItems] || []

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-primary">O'quv</h1>
          <p className="text-xs text-muted-foreground">Platform</p>
        </div>

        <nav className="px-4 space-y-2">
          {items.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">Menu yuklanmoqda...</div>
          ) : (
            items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="mb-4 p-3 bg-sidebar-accent rounded-lg">
            <p className="text-xs font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Chiqish
          </Button>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}

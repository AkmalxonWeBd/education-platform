"use client"

import { Sidebar } from "./sidebar"
import type { ReactNode } from "react"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

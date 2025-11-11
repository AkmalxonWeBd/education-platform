import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: number
  color?: "primary" | "secondary" | "accent"
}

export function StatCard({ label, value, icon, trend, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "bg-blue-500/10 text-blue-600",
    secondary: "bg-green-500/10 text-green-600",
    accent: "bg-purple-500/10 text-purple-600",
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trend >= 0 ? "+" : ""}
                {trend}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

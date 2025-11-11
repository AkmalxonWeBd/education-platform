"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface UserFormData {
  id?: string
  name: string
  email: string
  role: string
  phone?: string
  password?: string
}

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => void
  initialData?: UserFormData
  isLoading?: boolean
  roleFilter?: string
}

export function UserFormModal({ open, onClose, onSubmit, initialData, isLoading, roleFilter }: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: roleFilter || "teacher",
    phone: "",
    password: "",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: "" })
    } else {
      setFormData({
        name: "",
        email: "",
        role: roleFilter || "teacher",
        phone: "",
        password: "",
      })
    }
  }, [initialData, roleFilter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Foydalanuvchini Tahrir qilish" : "Yangi Foydalanuvchi Qo'shish"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Foydalanuvchi ma'lumotlarini yangilang" : "Yangi foydalanuvchi uchun ma'lumot kiriting"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ismi</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="To'liq ismi"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
              disabled={isLoading}
            />
          </div>

          {!initialData && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Parol</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Kamida 6 ta belgi"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
          )}

          {!roleFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_admin">Maktab Admin</SelectItem>
                  <SelectItem value="teacher">O'qituvchi</SelectItem>
                  <SelectItem value="student">O'quvchi</SelectItem>
                  <SelectItem value="parent">Ota-ona</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Telefon (ixtiyoriy)</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 XX XXX XX XX"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Yuklanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

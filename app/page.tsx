"use client"

import { useState } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import LoginPage from "@/components/login-page"

export default function RobloxWhitelistSystem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
}
